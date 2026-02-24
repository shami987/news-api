import { pool } from '../config/database';
import { Article, ArticleStatus } from '../types';

// Article database operations
export class ArticleModel {
  static async create(title: string, content: string, category: string, authorId: string): Promise<Article> {
    const result = await pool.query(
      'INSERT INTO articles (title, content, category, status, author_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, content, category, ArticleStatus.DRAFT, authorId]
    );
    return result.rows[0];
  }

  static async findById(id: string): Promise<Article | null> {
    const result = await pool.query('SELECT * FROM articles WHERE id = $1 AND deleted_at IS NULL', [id]);
    return result.rows[0] || null;
  }

  // Get articles by author with pagination
  static async findByAuthor(authorId: string, limit: number, offset: number): Promise<{ articles: Article[]; total: number }> {
    const countResult = await pool.query('SELECT COUNT(*) FROM articles WHERE author_id = $1 AND deleted_at IS NULL', [authorId]);
    const result = await pool.query(
      'SELECT * FROM articles WHERE author_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [authorId, limit, offset]
    );
    return { articles: result.rows, total: parseInt(countResult.rows[0].count) };
  }

  // Get published articles with optional category filter and pagination
  static async findPublished(limit: number, offset: number, category?: string): Promise<{ articles: Article[]; total: number }> {
    let query = 'SELECT * FROM articles WHERE status = $1 AND deleted_at IS NULL';
    let countQuery = 'SELECT COUNT(*) FROM articles WHERE status = $1 AND deleted_at IS NULL';
    const params: any[] = [ArticleStatus.PUBLISHED];
    
    if (category) {
      query += ' AND category = $2';
      countQuery += ' AND category = $2';
      params.push(category);
    }
    
    const countResult = await pool.query(countQuery, params);
    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    return { articles: result.rows, total: parseInt(countResult.rows[0].count) };
  }

  static async update(id: string, updates: Partial<Article>): Promise<Article | null> {
    const fields = Object.keys(updates).map((key, i) => `${key} = $${i + 2}`).join(', ');
    const values = Object.values(updates);
    const result = await pool.query(
      `UPDATE articles SET ${fields} WHERE id = $1 AND deleted_at IS NULL RETURNING *`,
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
