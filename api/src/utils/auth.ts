import jwt, { Secret } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Define UserRole enum to match Prisma schema
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER'
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-this';

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export interface TokenPayload {
  userId: string;
  email: string;
  organizationId: string;
  role: UserRole;
}

// Define the user shape we expect
interface UserForToken {
  id: string;
  email: string;
  organizationId: string;
  role: UserRole;
}

export const generateToken = (user: UserForToken): string => {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    organizationId: user.organizationId,
    role: user.role,
  };
  
  return jwt.sign(payload, JWT_SECRET as Secret, { expiresIn: '7d' });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET as Secret) as TokenPayload;
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId, type: 'refresh' }, JWT_SECRET as Secret, { expiresIn: '30d' });
};