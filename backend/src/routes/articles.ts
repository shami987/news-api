// Article routes - all routes require authentication
import { Router } from 'express';
import { ArticleController } from '../controllers/ArticleController';
import { authenticate, authorizeRole } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

// POST /api/articles - Create new article (Author only)
router.post('/', authenticate, authorizeRole(UserRole.AUTHOR), ArticleController.create);

// GET /api/articles/my-articles - Get all articles by authenticated author (Author only)
router.get('/my-articles', authenticate, authorizeRole(UserRole.AUTHOR), ArticleController.getMyArticles);

// GET /api/articles/published - Get all published articles (All authenticated users)
router.get('/published', authenticate, ArticleController.getPublished);

// GET /api/articles/:id - Get single article by ID and log view (All authenticated users)
router.get('/:id', authenticate, ArticleController.getById);

// PUT /api/articles/:id - Update article (Author only, must be article owner)
router.put('/:id', authenticate, authorizeRole(UserRole.AUTHOR), ArticleController.update);

// DELETE /api/articles/:id - Soft delete article (Author only, must be article owner)
router.delete('/:id', authenticate, authorizeRole(UserRole.AUTHOR), ArticleController.delete);

// GET /api/articles/:id/analytics - Get analytics for article (Author only, must be article owner)
router.get('/:id/analytics', authenticate, authorizeRole(UserRole.AUTHOR), ArticleController.getAnalytics);

export default router;
