import { Router } from 'express';
import { ArticleController } from '../controllers/ArticleController';
import { authenticate, authorizeRole } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

router.get('/dashboard', authenticate, authorizeRole(UserRole.AUTHOR), ArticleController.getDashboard);

export default router;
