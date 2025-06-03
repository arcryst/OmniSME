import express, { Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';
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

// Create new license request
router.post('/',
  authenticate,
  [
    body('softwareId').notEmpty().isString(),
    body('justification').notEmpty().trim().isLength({ min: 10 }),
    body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  ],
  handleValidationErrors,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { softwareId, justification, priority = 'MEDIUM' } = req.body;

      // Check if software exists
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

      // Check if user already has a license
      const existingLicense = await prisma.license.findFirst({
        where: {
          userId: req.user!.userId,
          softwareId,
          status: 'ACTIVE',
        }
      });

      if (existingLicense) {
        res.status(400).json({ error: 'You already have an active license for this software' });
        return;
      }

      // Check for pending request - only if software requires approval
      if (software.requiresApproval) {
        const pendingRequest = await prisma.request.findFirst({
          where: {
            userId: req.user!.userId,
            softwareId,
            status: 'PENDING',
          }
        });

        if (pendingRequest) {
          res.status(400).json({ error: 'You already have a pending request for this software' });
          return;
        }
      }

      // Create the request
      try {
        const request = await prisma.request.create({
          data: {
            userId: req.user!.userId,
            softwareId,
            organizationId: req.user!.organizationId,
            justification,
            priority,
          },
          include: {
            software: true,
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              }
            }
          }
        });

        // If software doesn't require approval, auto-approve
        if (!software.requiresApproval) {
          await prisma.$transaction(async (tx) => {
            // Update request status
            const updatedRequest = await tx.request.update({
              where: { id: request.id },
              data: { status: 'APPROVED' },
            });

            // Create approval record
            await tx.approval.create({
              data: {
                requestId: request.id,
                approverId: req.user!.userId,
                status: 'APPROVED',
                comments: 'Auto-approved - No approval required',
              }
            });

            // Create license
            const newLicense = await tx.license.create({
              data: {
                userId: req.user!.userId,
                softwareId,
                organizationId: req.user!.organizationId,
                status: 'ACTIVE',
              }
            });

            res.status(201).json({
              ...updatedRequest,
              license: newLicense,
              message: 'Request auto-approved and license granted',
            });
          });
          return;
        }

        res.status(201).json({
          ...request,
          message: 'Request submitted successfully',
        });
      } catch (error) {
        console.error('Create request error:', error);
        res.status(500).json({ error: 'Failed to create request. Please try again.' });
      }
    } catch (error) {
      console.error('Create request error:', error);
      res.status(500).json({ error: 'Failed to create request' });
    }
  }
);

// Get user's requests
router.get('/my-requests',
  authenticate,
  [
    query('status').optional().isIn(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']),
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

      const where: Prisma.RequestWhereInput = {
        userId: req.user!.userId,
      };

      if (status) {
        where.status = status as 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
      }

      const total = await prisma.request.count({ where });

      const requests = await prisma.request.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          software: true,
          approvals: {
            include: {
              approver: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                }
              }
            }
          }
        }
      });

      res.json({
        items: requests,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      });
    } catch (error) {
      console.error('Get user requests error:', error);
      res.status(500).json({ error: 'Failed to fetch requests' });
    }
  }
);

// Get pending approvals (for managers/admins)
router.get('/pending-approvals',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  handleValidationErrors,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const where: Prisma.RequestWhereInput = {
        status: 'PENDING',
        organizationId: req.user!.organizationId,
      };

      const total = await prisma.request.count({ where });

      const requests = await prisma.request.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'asc' }
        ],
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              manager: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                }
              }
            }
          },
          software: true,
        }
      });

      res.json({
        items: requests,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      });
    } catch (error) {
      console.error('Get pending approvals error:', error);
      res.status(500).json({ error: 'Failed to fetch pending approvals' });
    }
  }
);

// Approve request
router.put('/:id/approve',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  [
    body('comments').optional().trim(),
  ],
  handleValidationErrors,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { comments } = req.body;

      // Get the request
      const request = await prisma.request.findFirst({
        where: {
          id: req.params.id,
          organizationId: req.user!.organizationId,
          status: 'PENDING',
        },
        include: {
          software: true,
          user: true,
        }
      });

      if (!request) {
        res.status(404).json({ error: 'Request not found or already processed' });
        return;
      }

      // Process approval in transaction
      const result = await prisma.$transaction(async (tx) => {
        // Update request status
        const updatedRequest = await tx.request.update({
          where: { id: request.id },
          data: { status: 'APPROVED' },
        });

        // Create approval record
        const approval = await tx.approval.create({
          data: {
            requestId: request.id,
            approverId: req.user!.userId,
            status: 'APPROVED',
            comments,
          }
        });

        // Create license
        const license = await tx.license.create({
          data: {
            userId: request.userId,
            softwareId: request.softwareId,
            organizationId: request.organizationId,
            status: 'ACTIVE',
            notes: comments,
          }
        });

        return { request: updatedRequest, approval, license };
      });

      // TODO: Send email notification to user
      console.log(`Request approved for ${request.user.email} - ${request.software.name}`);

      res.json({
        message: 'Request approved successfully',
        request: result.request,
        license: result.license,
      });
    } catch (error) {
      console.error('Approve request error:', error);
      res.status(500).json({ error: 'Failed to approve request' });
    }
  }
);

// Reject request
router.put('/:id/reject',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  [
    body('comments').notEmpty().trim(),
  ],
  handleValidationErrors,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { comments } = req.body;

      // Get the request
      const request = await prisma.request.findFirst({
        where: {
          id: req.params.id,
          organizationId: req.user!.organizationId,
          status: 'PENDING',
        },
        include: {
          software: true,
          user: true,
        }
      });

      if (!request) {
        res.status(404).json({ error: 'Request not found or already processed' });
        return;
      }

      // Process rejection in transaction
      const result = await prisma.$transaction(async (tx) => {
        // Update request status
        const updatedRequest = await tx.request.update({
          where: { id: request.id },
          data: { status: 'REJECTED' },
        });

        // Create approval record
        const approval = await tx.approval.create({
          data: {
            requestId: request.id,
            approverId: req.user!.userId,
            status: 'REJECTED',
            comments,
          }
        });

        return { request: updatedRequest, approval };
      });

      // TODO: Send email notification to user
      console.log(`Request rejected for ${request.user.email} - ${request.software.name}`);

      res.json({
        message: 'Request rejected',
        request: result.request,
      });
    } catch (error) {
      console.error('Reject request error:', error);
      res.status(500).json({ error: 'Failed to reject request' });
    }
  }
);

// Cancel request (by user)
router.put('/:id/cancel',
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const request = await prisma.request.findFirst({
        where: {
          id: req.params.id,
          userId: req.user!.userId,
          status: 'PENDING',
        }
      });

      if (!request) {
        res.status(404).json({ error: 'Request not found or cannot be cancelled' });
        return;
      }

      const updated = await prisma.request.update({
        where: { id: request.id },
        data: { status: 'CANCELLED' },
      });

      res.json({
        message: 'Request cancelled successfully',
        request: updated,
      });
    } catch (error) {
      console.error('Cancel request error:', error);
      res.status(500).json({ error: 'Failed to cancel request' });
    }
  }
);

export default router;