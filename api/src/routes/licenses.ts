import express, { Request, Response } from 'express';
import { query, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';
import { Prisma, LicenseStatus } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req: Request, res: Response, next: express.NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};

// Get user's licenses
router.get('/my-licenses',
  authenticate,
  [
    query('status').optional().isIn(['ACTIVE', 'INACTIVE']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  handleValidationErrors,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { status, page = 1, limit = 20 } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const where: Prisma.LicenseWhereInput = {
        userId: req.user!.userId,
      };

      if (status) {
        where.status = status as LicenseStatus;
      }

      const total = await prisma.license.count({ where });

      const licenses = await prisma.license.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { assignedAt: 'desc' },
        include: {
          software: true,
        }
      });

      // Add mock last used dates for demo
      const licensesWithUsage = licenses.map(license => ({
        ...license,
        lastUsedAt: license.lastUsedAt || new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
      }));

      res.json({
        items: licensesWithUsage,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      });
    } catch (error) {
      console.error('Get user licenses error:', error);
      res.status(500).json({ error: 'Failed to fetch licenses' });
    }
  }
);

// Get all licenses (admin only)
router.get('/all',
  authenticate,
  authorize('ADMIN'),
  [
    query('userId').optional().isString(),
    query('softwareId').optional().isString(),
    query('status').optional().isIn(['ACTIVE', 'SUSPENDED', 'EXPIRED', 'REVOKED']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  handleValidationErrors,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, softwareId, status, page = 1, limit = 20 } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const where: Prisma.LicenseWhereInput = {
        organizationId: req.user!.organizationId,
      };

      if (userId) where.userId = userId as string;
      if (softwareId) where.softwareId = softwareId as string;
      if (status) where.status = status as 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'REVOKED';

      const total = await prisma.license.count({ where });

      const licenses = await prisma.license.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { assignedAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            }
          },
          software: true,
        }
      });

      res.json({
        items: licenses,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      });
    } catch (error) {
      console.error('Get all licenses error:', error);
      res.status(500).json({ error: 'Failed to fetch licenses' });
    }
  }
);

// Revoke license (admin only)
router.put('/:id/revoke',
  authenticate,
  authorize('ADMIN'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const license = await prisma.license.findFirst({
        where: {
          id: req.params.id,
          organizationId: req.user!.organizationId,
        },
        include: {
          user: true,
          software: true,
        }
      });

      if (!license) {
        res.status(404).json({ error: 'License not found' });
        return;
      }

      if (license.status !== LicenseStatus.ACTIVE) {
        res.status(400).json({ error: 'License is not active' });
        return;
      }

      const updated = await prisma.license.update({
        where: { id: license.id },
        data: { status: LicenseStatus.INACTIVE },
      });

      // TODO: Send notification to user
      console.log(`License revoked for ${license.user.email} - ${license.software.name}`);

      res.json({
        message: 'License revoked successfully',
        license: updated,
      });
    } catch (error) {
      console.error('Revoke license error:', error);
      res.status(500).json({ error: 'Failed to revoke license' });
    }
  }
);

// Return license (by user)
router.put('/:id/return',
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const license = await prisma.license.findFirst({
        where: {
          id: req.params.id,
          userId: req.user!.userId,
          status: LicenseStatus.ACTIVE,
        },
        include: {
          software: true,
        }
      });

      if (!license) {
        res.status(404).json({ error: 'Active license not found' });
        return;
      }

      const updated = await prisma.license.update({
        where: { id: license.id },
        data: { 
          status: LicenseStatus.INACTIVE,
          notes: 'Returned by user',
        },
      });

      res.json({
        message: 'License returned successfully',
        license: updated,
      });
    } catch (error) {
      console.error('Return license error:', error);
      res.status(500).json({ error: 'Failed to return license' });
    }
  }
);

// Get license statistics (admin only)
router.get('/stats',
  authenticate,
  authorize('ADMIN'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const [
        totalLicenses,
        activeLicenses,
        totalCost,
        licensesBySoftware,
        recentActivity
      ] = await Promise.all([
        // Total licenses
        prisma.license.count({
          where: { organizationId: req.user!.organizationId }
        }),
        
        // Active licenses
        prisma.license.count({
          where: { 
            organizationId: req.user!.organizationId,
            status: 'ACTIVE'
          }
        }),
        
        // Total monthly cost
        prisma.license.findMany({
          where: { 
            organizationId: req.user!.organizationId,
            status: 'ACTIVE'
          },
          include: { software: true }
        }).then(licenses => {
          return licenses.reduce((total, license) => {
            const cost = license.software.costPerLicense || 0;
            const multiplier = license.software.billingCycle === 'YEARLY' ? 1/12 : 1;
            return total + (cost * multiplier);
          }, 0);
        }),
        
        // Licenses by software
        prisma.license.groupBy({
          by: ['softwareId'],
          where: { 
            organizationId: req.user!.organizationId,
            status: 'ACTIVE'
          },
          _count: true,
        }),
        
        // Recent activity
        prisma.license.findMany({
          where: { organizationId: req.user!.organizationId },
          orderBy: { assignedAt: 'desc' },
          take: 10,
          include: {
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
              }
            },
            software: {
              select: {
                name: true,
              }
            }
          }
        })
      ]);

      // Get software names for the grouped data
      const softwareIds = licensesBySoftware.map(item => item.softwareId);
      const software = await prisma.software.findMany({
        where: { id: { in: softwareIds } },
        select: { id: true, name: true }
      });
      
      const softwareMap = new Map(software.map(s => [s.id, s.name]));
      const licensesBySoftwareWithNames = licensesBySoftware.map(item => ({
        softwareId: item.softwareId,
        softwareName: softwareMap.get(item.softwareId) || 'Unknown',
        count: item._count,
      }));

      res.json({
        totalLicenses,
        activeLicenses,
        monthlyTotalCost: Math.round(totalCost * 100) / 100,
        licensesBySoftware: licensesBySoftwareWithNames,
        recentActivity,
      });
    } catch (error) {
      console.error('Get license stats error:', error);
      res.status(500).json({ error: 'Failed to fetch license statistics' });
    }
  }
);

export default router;