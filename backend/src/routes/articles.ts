// Article API routes
import { Router } from 'express';
import { ArticleController } from '../controllers/ArticleController';
import { authenticate, authorizeRole } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

router.post('/', authenticate, authorizeRole(UserRole.AUTHOR), ArticleController.create);
router.get('/me', authenticate, authorizeRole(UserRole.AUTHOR), ArticleController.getMyArticles);
router.get('/:id/analytics', authenticate, authorizeRole(UserRole.AUTHOR), ArticleController.getAnalytics);
router.get('/:id', authenticate, ArticleController.getById);
router.put('/:id', authenticate, authorizeRole(UserRole.AUTHOR), ArticleController.update);
router.delete('/:id', authenticate, authorizeRole(UserRole.AUTHOR), ArticleController.delete);
router.get('/', authenticate, ArticleController.getPublished);

export default router;
