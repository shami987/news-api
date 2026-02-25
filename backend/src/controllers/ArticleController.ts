import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ArticleModel } from '../models/Article';
import { AnalyticsModel } from '../models/Analytics';
import { enqueueReadLog } from '../jobs/analyticsQueue';
import { validateTitle, validateContent } from '../utils/validation';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';
import { ArticleStatus } from '../types';

export class ArticleController {
  // Create article (Author only)
  static async create(req: AuthRequest, res: Response) {
    const { title, content, category } = req.body;
    const errors: string[] = [];

    if (!title || !validateTitle(title)) {
      errors.push('Title must be between 1 and 150 characters');
    }
    if (!content || !validateContent(content)) {
      errors.push('Content must be at least 50 characters');
    }
    if (!category) {
      errors.push('Category is required');
    }

    if (errors.length > 0) {
      return res.status(400).json(errorResponse('Validation failed', errors));
    }

    try {
      const article = await ArticleModel.create(title, content, category, req.userId!);
      return res.status(201).json(successResponse('Article created successfully', article));
    } catch (error) {
      return res.status(500).json(errorResponse('Server error', ['Failed to create article']));
    }
  }

  // Get author's own articles (Draft + Published, optionally include deleted)
  static async getMyArticles(req: AuthRequest, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const includeDeleted = req.query.includeDeleted === 'true';
    const offset = (page - 1) * pageSize;

    try {
      const { articles, total } = await ArticleModel.findByAuthor(req.userId!, pageSize, offset, includeDeleted);
      return res.status(200).json(paginatedResponse('Articles retrieved successfully', articles, page, pageSize, total));
    } catch (error) {
      return res.status(500).json(errorResponse('Server error', ['Failed to retrieve articles']));
    }
  }

  // Get author dashboard with engagement metrics
  static async getDashboard(req: AuthRequest, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const offset = (page - 1) * pageSize;

    try {
      const { articles, total } = await ArticleModel.getAuthorDashboard(req.userId!, pageSize, offset);
      return res.status(200).json(paginatedResponse('Dashboard data retrieved successfully', articles, page, pageSize, total));
    } catch (error) {
      return res.status(500).json(errorResponse('Server error', ['Failed to retrieve dashboard']));
    }
  }

  // Get published articles with filters: category, author, keyword
  static async getPublished(req: AuthRequest, res: Response) {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const category = req.query.category as string;
    const author = req.query.author as string;
    const keyword = req.query.q as string;
    const offset = (page - 1) * pageSize;

    try {
      const { articles, total } = await ArticleModel.findPublished(pageSize, offset, category, author, keyword);
      return res.status(200).json(paginatedResponse('Articles retrieved successfully', articles, page, pageSize, total));
    } catch (error) {
      return res.status(500).json(errorResponse('Server error', ['Failed to retrieve articles']));
    }
  }

  // Get article by ID and log read (non-blocking analytics)
  static async getById(req: AuthRequest, res: Response) {
    const { id } = req.params;

    try {
      const article = await ArticleModel.findByIdIncludingDeleted(id);
      
      if (!article) {
        return res.status(404).json(errorResponse('Not found', ['Article not found']));
      }

      if (article.deletedAt) {
        return res.status(410).json(errorResponse('News article no longer available', ['News article no longer available']));
      }

      // Non-blocking: enqueue read tracking and return the article immediately.
      enqueueReadLog(id, req.userId || null);

      return res.status(200).json(successResponse('Article retrieved successfully', article));
    } catch (error) {
      return res.status(500).json(errorResponse('Server error', ['Failed to retrieve article']));
    }
  }

  // Update article (must be owner)
  static async update(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { title, content, category, status } = req.body;
    const errors: string[] = [];

    if (title && !validateTitle(title)) {
      errors.push('Title must be between 1 and 150 characters');
    }
    if (content && !validateContent(content)) {
      errors.push('Content must be at least 50 characters');
    }
    if (status && !Object.values(ArticleStatus).includes(status)) {
      errors.push('Invalid status');
    }

    if (errors.length > 0) {
      return res.status(400).json(errorResponse('Validation failed', errors));
    }

    try {
      const article = await ArticleModel.findById(id);
      if (!article) {
        return res.status(404).json(errorResponse('Not found', ['Article not found']));
      }
      if (article.authorId !== req.userId) {
        return res.status(403).json(errorResponse('Forbidden', ['Forbidden']));
      }

      const updates: any = {};
      if (title) updates.title = title;
      if (content) updates.content = content;
      if (category) updates.category = category;
      if (status) updates.status = status;

      const updated = await ArticleModel.update(id, updates);
      return res.status(200).json(successResponse('Article updated successfully', updated));
    } catch (error) {
      return res.status(500).json(errorResponse('Server error', ['Failed to update article']));
    }
  }

  // Soft delete article (must be owner)
  static async delete(req: AuthRequest, res: Response) {
    const { id } = req.params;

    try {
      const article = await ArticleModel.findById(id);
      if (!article) {
        return res.status(404).json(errorResponse('Not found', ['Article not found']));
      }
      if (article.authorId !== req.userId) {
        return res.status(403).json(errorResponse('Forbidden', ['Forbidden']));
      }

      await ArticleModel.softDelete(id);
      return res.status(200).json(successResponse('Article deleted successfully', null));
    } catch (error) {
      return res.status(500).json(errorResponse('Server error', ['Failed to delete article']));
    }
  }

  // Get article analytics (must be owner)
  static async getAnalytics(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    try {
      const article = await ArticleModel.findById(id);
      if (!article) {
        return res.status(404).json(errorResponse('Not found', ['Article not found']));
      }
      if (article.authorId !== req.userId) {
        return res.status(403).json(errorResponse('Forbidden', ['Forbidden']));
      }

      const analytics = await AnalyticsModel.getArticleAnalytics(id, startDate, endDate);
      return res.status(200).json(successResponse('Analytics retrieved successfully', analytics));
    } catch (error) {
      return res.status(500).json(errorResponse('Server error', ['Failed to retrieve analytics']));
    }
  }
}
