import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';
import { authenticate, authorize } from '../middleware/auth';
import { hashPassword } from '../utils/auth';
import { Prisma, LicenseStatus } from '@prisma/client';

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

// Get all users
router.get('/',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const users = await prisma.user.findMany({
        where: {
          organizationId: req.user!.organizationId,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
          manager: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            }
          },
          licenses: {
            where: { status: LicenseStatus.ACTIVE },
            include: {
              software: true
            }
          },
          _count: {
            select: {
              licenses: {
                where: { status: LicenseStatus.ACTIVE }
              },
              managedUsers: true,
            }
          }
        },
        orderBy: { firstName: 'asc' }
      });

      res.json(users);
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }
);

// Get user's licenses
router.get('/:userId/licenses',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;

      // Check if user exists and belongs to the same organization
      const user = await prisma.user.findFirst({
        where: {
          id: userId,
          organizationId: req.user!.organizationId,
        }
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const licenses = await prisma.license.findMany({
        where: {
          userId,
          status: LicenseStatus.ACTIVE,
          organizationId: req.user!.organizationId,
        },
        include: {
          software: true,
        },
        orderBy: { assignedAt: 'desc' }
      });

      res.json(licenses);
    } catch (error) {
      console.error('Get user licenses error:', error);
      res.status(500).json({ error: 'Failed to fetch user licenses' });
    }
  }
);

// Add license to user
router.post('/:userId/licenses',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  [
    body('softwareId').notEmpty().isString(),
  ],
  handleValidationErrors,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const { softwareId } = req.body;

      // Check if user exists and belongs to the same organization
      const user = await prisma.user.findFirst({
        where: {
          id: userId,
          organizationId: req.user!.organizationId,
        }
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Check if software exists and belongs to the same organization
      const software = await prisma.software.findFirst({
        where: {
          id: softwareId,
          organizationId: req.user!.organizationId,
        }
      });

      if (!software) {
        res.status(404).json({ error: 'Software not found' });
        return;
      }

      // Check if user already has an active license
      const existingLicense = await prisma.license.findFirst({
        where: {
          userId,
          softwareId,
          status: LicenseStatus.ACTIVE,
        }
      });

      if (existingLicense) {
        res.status(400).json({ error: 'User already has an active license for this software' });
        return;
      }

      // Create license
      const license = await prisma.license.create({
        data: {
          userId,
          softwareId,
          organizationId: req.user!.organizationId,
          status: LicenseStatus.ACTIVE,
          notes: `Manually assigned by ${req.user!.email}`,
        },
        include: {
          software: true,
        }
      });

      res.status(201).json(license);
    } catch (error) {
      console.error('Add user license error:', error);
      res.status(500).json({ error: 'Failed to add license' });
    }
  }
);

// Remove license from user
router.delete('/:userId/licenses/:licenseId',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, licenseId } = req.params;

      // Check if license exists and belongs to the user and organization
      const license = await prisma.license.findFirst({
        where: {
          id: licenseId,
          userId,
          organizationId: req.user!.organizationId,
          status: LicenseStatus.ACTIVE,
        }
      });

      if (!license) {
        res.status(404).json({ error: 'Active license not found' });
        return;
      }

      // Update license status to INACTIVE
      const updated = await prisma.license.update({
        where: { id: licenseId },
        data: { 
          status: LicenseStatus.INACTIVE,
          notes: `Manually deactivated by ${req.user!.email}`,
        },
        include: {
          software: true,
        }
      });

      res.json(updated);
    } catch (error) {
      console.error('Remove user license error:', error);
      res.status(500).json({ error: 'Failed to remove license' });
    }
  }
);

// Update user
router.put('/:id',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  [
    body('firstName').optional().trim(),
    body('lastName').optional().trim(),
    body('email').optional().isEmail().normalizeEmail(),
    body('role').optional().isIn(['ADMIN', 'MANAGER', 'USER']),
    body('managerId').optional().isString(),
    body('password').optional().isLength({ min: 8 }),
  ],
  handleValidationErrors,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { firstName, lastName, email, role, managerId, password } = req.body;

      // Check if user exists and belongs to the same organization
      const existingUser = await prisma.user.findFirst({
        where: {
          id,
          organizationId: req.user!.organizationId,
        }
      });

      if (!existingUser) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // If email is being changed, check for uniqueness
      if (email && email !== existingUser.email) {
        const emailExists = await prisma.user.findUnique({
          where: { email }
        });

        if (emailExists) {
          res.status(400).json({ error: 'Email already in use' });
          return;
        }
      }

      // If manager is being set, verify manager exists and is in same org
      if (managerId) {
        const manager = await prisma.user.findFirst({
          where: {
            id: managerId,
            organizationId: req.user!.organizationId,
            role: { in: ['ADMIN', 'MANAGER'] }
          }
        });

        if (!manager) {
          res.status(400).json({ error: 'Invalid manager selected' });
          return;
        }
      }

      // Prepare update data
      const updateData: Prisma.UserUpdateInput = {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(email && { email }),
        ...(role && { role }),
        ...(managerId && { manager: { connect: { id: managerId } } }),
        ...(password && { passwordHash: await hashPassword(password) })
      };

      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          }
        }
      });

      res.json(updatedUser);
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  }
);

// Delete user
router.delete('/:id',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      // Check if user exists and belongs to the same organization
      const user = await prisma.user.findFirst({
        where: {
          id,
          organizationId: req.user!.organizationId,
        }
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Check if user has active licenses
      const activeCount = await prisma.license.count({
        where: {
          userId: id,
          status: LicenseStatus.ACTIVE,
        }
      });

      if (activeCount > 0) {
        res.status(400).json({ error: 'Cannot delete user with active licenses' });
        return;
      }

      // Check if user has managed users
      const managedCount = await prisma.user.count({
        where: {
          managerId: id,
        }
      });

      if (managedCount > 0) {
        res.status(400).json({ error: 'Cannot delete user who manages other users' });
        return;
      }

      await prisma.user.delete({
        where: { id }
      });

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }
);

export default router; 