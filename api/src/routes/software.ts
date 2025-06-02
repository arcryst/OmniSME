import express, { Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';
import { CreateSoftwareRequest, PaginationParams } from '../types';

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

// Get all software (with search and filtering)
router.get('/', 
  authenticate,
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().trim(),
    query('category').optional().trim(),
  ],
  handleValidationErrors,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { 
        page = '1', 
        limit = '20', 
        search = '', 
        category = '' 
      } = req.query as Record<string, string>;
      
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      // Build where clause
      const where: Prisma.SoftwareWhereInput = {
        organizationId: req.user!.organizationId,
      };

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { vendor: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (category) {
        where.category = category;
      }

      // Get total count
      const total = await prisma.software.count({ where });

      // Get software with user's license status
      const software = await prisma.software.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { name: 'asc' },
        include: {
          licenses: {
            where: { userId: req.user!.userId },
            select: {
              id: true,
              status: true,
              assignedAt: true,
              expiresAt: true,
            }
          },
          _count: {
            select: {
              licenses: true,
              requests: { where: { status: 'PENDING' } }
            }
          }
        }
      });

      // Check if user has pending requests
      const pendingRequests = await prisma.request.findMany({
        where: {
          userId: req.user!.userId,
          status: 'PENDING',
        },
        select: { softwareId: true }
      });

      const pendingRequestSoftwareIds = new Set(pendingRequests.map(r => r.softwareId));

      // Format response
      const formattedSoftware = software.map(item => ({
        ...item,
        userLicense: item.licenses[0] || null,
        hasPendingRequest: pendingRequestSoftwareIds.has(item.id),
        licenses: undefined, // Remove from response
      }));

      res.json({
        items: formattedSoftware,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      });
    } catch (error) {
      console.error('Get software error:', error);
      res.status(500).json({ error: 'Failed to fetch software' });
    }
  }
);

// Get software by ID
router.get('/:id',
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const software = await prisma.software.findFirst({
        where: {
          id: req.params.id,
          organizationId: req.user!.organizationId,
        },
        include: {
          licenses: {
            where: { userId: req.user!.userId },
            select: {
              id: true,
              status: true,
              assignedAt: true,
              expiresAt: true,
              lastUsedAt: true,
            }
          },
          _count: {
            select: {
              licenses: { where: { status: 'ACTIVE' } },
              requests: { where: { status: 'PENDING' } }
            }
          }
        }
      });

      if (!software) {
        res.status(404).json({ error: 'Software not found' });
        return;
      }

      // Check for pending request
      const pendingRequest = await prisma.request.findFirst({
        where: {
          userId: req.user!.userId,
          softwareId: software.id,
          status: 'PENDING',
        }
      });

      res.json({
        ...software,
        userLicense: software.licenses[0] || null,
        hasPendingRequest: !!pendingRequest,
        licenses: undefined,
      });
    } catch (error) {
      console.error('Get software by ID error:', error);
      res.status(500).json({ error: 'Failed to fetch software' });
    }
  }
);

// Create new software (admin only)
router.post('/',
  authenticate,
  authorize('ADMIN'),
  [
    body('name').notEmpty().trim(),
    body('category').notEmpty().trim(),
    body('description').optional().trim(),
    body('vendor').optional().trim(),
    body('costPerLicense').optional().isFloat({ min: 0 }),
    body('billingCycle').optional().isIn(['MONTHLY', 'YEARLY', 'ONE_TIME']),
    body('logoUrl').optional().isURL(),
    body('websiteUrl').optional().isURL(),
    body('requiresApproval').optional().isBoolean(),
    body('autoProvision').optional().isBoolean(),
  ],
  handleValidationErrors,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const data: CreateSoftwareRequest = req.body;

      const software = await prisma.software.create({
        data: {
          ...data,
          organizationId: req.user!.organizationId,
        }
      });

      res.status(201).json(software);
    } catch (error) {
      console.error('Create software error:', error);
      res.status(500).json({ error: 'Failed to create software' });
    }
  }
);

// Update software (admin only)
router.put('/:id',
  authenticate,
  authorize('ADMIN'),
  [
    body('name').optional().trim(),
    body('category').optional().trim(),
    body('description').optional().trim(),
    body('vendor').optional().trim(),
    body('costPerLicense').optional().isFloat({ min: 0 }),
    body('billingCycle').optional().isIn(['MONTHLY', 'YEARLY', 'ONE_TIME']),
    body('logoUrl').optional().isURL(),
    body('websiteUrl').optional().isURL(),
    body('requiresApproval').optional().isBoolean(),
    body('autoProvision').optional().isBoolean(),
  ],
  handleValidationErrors,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const software = await prisma.software.findFirst({
        where: {
          id: req.params.id,
          organizationId: req.user!.organizationId,
        }
      });

      if (!software) {
        res.status(404).json({ error: 'Software not found' });
        return;
      }

      const updated = await prisma.software.update({
        where: { id: req.params.id },
        data: req.body,
      });

      res.json(updated);
    } catch (error) {
      console.error('Update software error:', error);
      res.status(500).json({ error: 'Failed to update software' });
    }
  }
);

// Delete software (admin only)
router.delete('/:id',
  authenticate,
  authorize('ADMIN'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const software = await prisma.software.findFirst({
        where: {
          id: req.params.id,
          organizationId: req.user!.organizationId,
        },
        include: {
          _count: {
            select: {
              licenses: true,
              requests: true,
            }
          }
        }
      });

      if (!software) {
        res.status(404).json({ error: 'Software not found' });
        return;
      }

      // Check if software has licenses or requests
      if (software._count.licenses > 0 || software._count.requests > 0) {
        res.status(400).json({ 
          error: 'Cannot delete software with existing licenses or requests' 
        });
        return;
      }

      await prisma.software.delete({
        where: { id: req.params.id }
      });

      res.json({ message: 'Software deleted successfully' });
    } catch (error) {
      console.error('Delete software error:', error);
      res.status(500).json({ error: 'Failed to delete software' });
    }
  }
);

// Get software categories
router.get('/meta/categories',
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const categories = await prisma.software.findMany({
        where: { organizationId: req.user!.organizationId },
        select: { category: true },
        distinct: ['category'],
        orderBy: { category: 'asc' }
      });

      res.json(categories.map(c => c.category));
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  }
);

export default router;