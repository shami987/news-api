import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/response';
import { UserRole } from '../types';

// Extended Request with user authentication data
export interface AuthRequest extends Request {
  userId?: string;
  userRole?: UserRole;
}

interface JwtPayload {
  sub?: string;
  userId?: string;
  role?: UserRole;
}

// Verify JWT token and attach user data to request
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json(errorResponse('Authentication required', ['No token provided']));
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.userId = decoded.sub || decoded.userId;
    req.userRole = decoded.role;
    if (!req.userId || !req.userRole) {
      return res.status(401).json(errorResponse('Invalid token', ['Token payload is invalid']));
    }
    next();
  } catch (error) {
    return res.status(401).json(errorResponse('Invalid token', ['Token verification failed']));
  }
};

// Parses token if present, but allows unauthenticated requests.
export const authenticateOptional = (req: AuthRequest, _res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.userId = decoded.sub || decoded.userId;
    req.userRole = decoded.role;
  } catch (error) {
    // Ignore invalid optional auth token; request continues as guest.
  }

  return next();
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
