import { pool } from '../config/database';
import { ReadLog, DailyAnalytics } from '../types';

// Analytics database operations for tracking article views
export class AnalyticsModel {
  // Log a read event (readerId can be null for anonymous users)
  static async logRead(articleId: string, readerId: string | null): Promise<ReadLog> {
    const result = await pool.query(
      'INSERT INTO read_logs (article_id, reader_id) VALUES ($1, $2) RETURNING *',
      [articleId, readerId]
    );
    return result.rows[0];
  }

  // Aggregate read logs into daily analytics using GMT timezone
  static async aggregateDailyViews(date: Date): Promise<void> {
    await pool.query(`
      INSERT INTO daily_analytics (article_id, view_count, date)
      SELECT article_id, COUNT(*) as view_count, DATE($1 AT TIME ZONE 'GMT') as date
      FROM read_logs
      WHERE DATE(read_at AT TIME ZONE 'GMT') = DATE($1 AT TIME ZONE 'GMT')
      GROUP BY article_id
      ON CONFLICT (article_id, date) 
      DO UPDATE SET view_count = EXCLUDED.view_count
    `, [date]);
  }

  // Get analytics with optional date range filter
  static async getArticleAnalytics(articleId: string, startDate?: Date, endDate?: Date): Promise<DailyAnalytics[]> {
    let query = 'SELECT * FROM daily_analytics WHERE article_id = $1';
    const params: any[] = [articleId];
    
    if (startDate) {
      query += ' AND date >= $2';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND date <= $' + (params.length + 1);
      params.push(endDate);
    }
    
    query += ' ORDER BY date DESC';
    const result = await pool.query(query, params);
    return result.rows;
  }
}
