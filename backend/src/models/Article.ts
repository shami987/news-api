import { pool } from '../config/database';
import { Article, ArticleStatus } from '../types';

// Article database operations
export class ArticleModel {
  private static readonly articleSelect = `
    id,
    title,
    content,
    category,
    status,
    author_id AS "authorId",
    created_at AS "createdAt",
    deleted_at AS "deletedAt"
  `;

  static async create(title: string, content: string, category: string, authorId: string): Promise<Article> {
    const result = await pool.query(
      `INSERT INTO articles (title, content, category, status, author_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${ArticleModel.articleSelect}`,
      [title, content, category, ArticleStatus.DRAFT, authorId]
    );
    return result.rows[0];
  }

  static async findById(id: string): Promise<Article | null> {
    const result = await pool.query(
      `SELECT ${ArticleModel.articleSelect} FROM articles WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
    return result.rows[0] || null;
  }

  // Find article including deleted ones (for checking if deleted)
  static async findByIdIncludingDeleted(id: string): Promise<Article | null> {
    const result = await pool.query(
      `SELECT ${ArticleModel.articleSelect} FROM articles WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  // Get articles by author (Draft + Published, optionally include deleted)
  static async findByAuthor(authorId: string, limit: number, offset: number, includeDeleted: boolean = false): Promise<{ articles: Article[]; total: number }> {
    let whereClause = 'WHERE author_id = $1';
    
    if (!includeDeleted) {
      whereClause += ' AND deleted_at IS NULL';
    }
    
    const countResult = await pool.query(`SELECT COUNT(*) FROM articles ${whereClause}`, [authorId]);
    const result = await pool.query(
      `SELECT ${ArticleModel.articleSelect},
        CASE WHEN deleted_at IS NOT NULL THEN 'Deleted' ELSE status END as "displayStatus"
       FROM articles ${whereClause} ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [authorId, limit, offset]
    );
    return { articles: result.rows, total: parseInt(countResult.rows[0].count) };
  }

  // Get author dashboard with total views from DailyAnalytics
  static async getAuthorDashboard(authorId: string, limit: number, offset: number): Promise<{ articles: any[]; total: number }> {
    const countResult = await pool.query('SELECT COUNT(*) FROM articles WHERE author_id = $1 AND deleted_at IS NULL', [authorId]);
    
    const result = await pool.query(`
      SELECT 
        a.id,
        a.title,
        a.created_at AS "createdAt",
        COALESCE(SUM(da.view_count), 0) AS "totalViews"
      FROM articles a
      LEFT JOIN daily_analytics da ON a.id = da.article_id
      WHERE a.author_id = $1 AND a.deleted_at IS NULL
      GROUP BY a.id, a.title, a.created_at
      ORDER BY a.created_at DESC
      LIMIT $2 OFFSET $3
    `, [authorId, limit, offset]);
    
    return { articles: result.rows, total: parseInt(countResult.rows[0].count) };
  }

  // Get published articles with filters: category, author name, keyword search
  static async findPublished(
    limit: number, 
    offset: number, 
    category?: string, 
    authorName?: string, 
    keyword?: string
  ): Promise<{ articles: Article[]; total: number }> {
    let query = `
      SELECT
        a.id,
        a.title,
        a.content,
        a.category,
        a.status,
        a.author_id AS "authorId",
        a.created_at AS "createdAt",
        a.deleted_at AS "deletedAt",
        u.name AS "authorName"
      FROM articles a 
      JOIN users u ON a.author_id = u.id 
      WHERE a.status = $1 AND a.deleted_at IS NULL
    `;
    let countQuery = `
      SELECT COUNT(*) 
      FROM articles a 
      JOIN users u ON a.author_id = u.id 
      WHERE a.status = $1 AND a.deleted_at IS NULL
    `;
    const params: any[] = [ArticleStatus.PUBLISHED];
    let paramIndex = 2;
    
    // Category filter (exact match)
    if (category) {
      query += ` AND a.category = $${paramIndex}`;
      countQuery += ` AND a.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }
    
    // Author name filter (partial match, case-insensitive)
    if (authorName) {
      query += ` AND u.name ILIKE $${paramIndex}`;
      countQuery += ` AND u.name ILIKE $${paramIndex}`;
      params.push(`%${authorName}%`);
      paramIndex++;
    }
    
    // Keyword search in title (case-insensitive)
    if (keyword) {
      query += ` AND a.title ILIKE $${paramIndex}`;
      countQuery += ` AND a.title ILIKE $${paramIndex}`;
      params.push(`%${keyword}%`);
      paramIndex++;
    }
    
    const countResult = await pool.query(countQuery, params);
    query += ` ORDER BY a.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    return { articles: result.rows, total: parseInt(countResult.rows[0].count) };
  }

  static async update(id: string, updates: Partial<Article>): Promise<Article | null> {
    const fields = Object.keys(updates).map((key, i) => `${key} = $${i + 2}`).join(', ');
    const values = Object.values(updates);
    const result = await pool.query(
      `UPDATE articles SET ${fields} WHERE id = $1 AND deleted_at IS NULL RETURNING ${ArticleModel.articleSelect}`,
      [id, ...values]
    );
    return result.rows[0] || null;
  }

  // Soft delete: sets deleted_at timestamp
  static async softDelete(id: string): Promise<boolean> {
    const result = await pool.query('UPDATE articles SET deleted_at = NOW() WHERE id = $1', [id]);
    return result.rowCount! > 0;
  }
}
