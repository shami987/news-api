import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { validateEmail, validateName, validatePassword } from '../utils/validation';
import { successResponse, errorResponse } from '../utils/response';
import { UserRole } from '../types';

export class AuthController {
  // User registration: validates input, checks duplicate email, creates user, returns JWT
  static async signup(req: Request, res: Response) {
    const { name, email, password, role } = req.body;
    const errors: string[] = [];

    if (!name || !validateName(name)) {
      errors.push('Name must contain only alphabets and spaces');
    }
    if (!email || !validateEmail(email)) {
      errors.push('Invalid email format');
    }
    if (!password || !validatePassword(password)) {
      errors.push('Password must be at least 8 characters with uppercase, lowercase, number, and special character');
    }
    if (!role || !Object.values(UserRole).includes(role)) {
      errors.push('Role must be either author or reader');
    }

    if (errors.length > 0) {
      return res.status(400).json(errorResponse('Validation failed', errors));
    }

    try {
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json(errorResponse('User already exists', ['Email is already registered']));
      }

      const user = await UserModel.create(name, email, password, role);
      const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '24h' });

      return res.status(201).json(successResponse('User created successfully', { user: { id: user.id, name: user.name, email: user.email, role: user.role }, token }));
    } catch (error) {
      return res.status(500).json(errorResponse('Server error', ['Failed to create user']));
    }
  }

  // User login: validates credentials, returns JWT
  static async login(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json(errorResponse('Validation failed', ['Email and password are required']));
    }

    try {
      const user = await UserModel.findByEmail(email);
      if (!user || !(await UserModel.verifyPassword(password, user.password))) {
        return res.status(401).json(errorResponse('Authentication failed', ['Invalid credentials']));
      }

      const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '24h' });
      return res.status(200).json(successResponse('Login successful', { user: { id: user.id, name: user.name, email: user.email, role: user.role }, token }));
    } catch (error) {
      return res.status(500).json(errorResponse('Server error', ['Failed to login']));
    }
  }
}
