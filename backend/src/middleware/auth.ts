import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/response';
import { UserRole } from '../types';

// Extended Request with user authentication data
export interface AuthRequest extends Request {
  userId?: string;
  userRole?: UserRole;
}

// Verify JWT token and attach user data to request
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json(errorResponse('Authentication required', ['No token provided']));
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; role: UserRole };
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json(errorResponse('Invalid token', ['Token verification failed']));
  }
};

// Check if user has required role
export const authorizeRole = (role: UserRole) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.userRole !== role) {
      return res.status(403).json(errorResponse('Access denied', ['Insufficient permissions']));
    }
    next();
  };
};
