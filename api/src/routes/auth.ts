import express, { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';
import { hashPassword, verifyPassword, generateToken } from '../utils/auth';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};

// Register a new user and organization
router.post('/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('firstName').notEmpty().trim(),
    body('lastName').notEmpty().trim(),
    body('organizationName').notEmpty().trim(),
  ],
  handleValidationErrors,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, firstName, lastName, organizationName } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        res.status(400).json({ error: 'User already exists' });
        return;
      }

      // Create organization and user in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create organization
        const organization = await tx.organization.create({
          data: {
            name: organizationName,
            domain: email.split('@')[1], // Extract domain from email
          }
        });

        // Create user
        const user = await tx.user.create({
          data: {
            email,
            passwordHash: await hashPassword(password),
            firstName,
            lastName,
            role: 'ADMIN', // First user is admin
            organizationId: organization.id,
          },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            organizationId: true,
          }
        });

        return { user, organization };
      });

      const token = generateToken({
        id: result.user.id,
        email: result.user.email,
        organizationId: result.user.organizationId,
        role: result.user.role,
      });

      res.status(201).json({
        message: 'Registration successful',
        token,
        user: result.user,
        organization: result.organization,
      });
    } catch (error: unknown) {
      console.error('Registration error:', error);
      
      // More specific error handling
      if (error instanceof Error) {
        if (error.message.includes('connect ECONNREFUSED')) {
          res.status(500).json({ error: 'Database connection failed. Please check your database configuration.' });
          return;
        }
        if (error.message.includes('prisma')) {
          res.status(500).json({ error: 'Database error. Please ensure the database is properly set up and migrations are run.' });
          return;
        }
        
        res.status(500).json({ 
          error: 'Registration failed',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      } else {
        res.status(500).json({ error: 'An unexpected error occurred during registration' });
      }
    }
  }
);

// Login
router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  handleValidationErrors,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          organization: true,
        }
      });

      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // Verify password
      const isValid = await verifyPassword(password, user.passwordHash);
      if (!isValid) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const token = generateToken({
        id: user.id,
        email: user.email,
        organizationId: user.organizationId,
        role: user.role,
      });

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          organization: user.organization,
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

// Get current user
router.get('/me', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        organization: {
          select: {
            id: true,
            name: true,
            domain: true,
          }
        },
        licenses: {
          include: {
            software: true,
          }
        }
      }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export default router;