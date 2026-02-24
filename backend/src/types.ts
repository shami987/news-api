// TypeScript type definitions for the application

// Enum for user roles - determines what actions a user can perform
export enum UserRole {
  AUTHOR = 'author', // Can create, edit, delete articles and view analytics
  READER = 'reader'  // Can only read published articles
}

// Enum for article status - determines if article is visible to readers
export enum ArticleStatus {
  DRAFT = 'Draft',         // Not visible to readers, only to author
  PUBLISHED = 'Published'  // Visible to all authenticated users
}

// User database model
export interface User {
  id: string;           // UUID primary key
  name: string;         // User's full name (alphabets and spaces only)
  email: string;        // Unique email address
  password: string;     // Hashed password (never store plain text)
  role: UserRole;       // Either 'author' or 'reader'
}

// Article database model
export interface Article {
  id: string;              // UUID primary key
  title: string;           // Article title (1-150 characters)
  content: string;         // Article content (minimum 50 characters)
  category: string;        // Category like "Tech", "Politics", etc.
  status: ArticleStatus;   // Draft or Published
  authorId: string;        // Foreign key to User.id
  createdAt: Date;         // Timestamp when article was created
  deletedAt: Date | null;  // Timestamp for soft deletion (null if not deleted)
}

// ReadLog database model - tracks every article view for analytics
export interface ReadLog {
  id: string;              // UUID primary key
  articleId: string;       // Foreign key to Article.id
  readerId: string | null; // Foreign key to User.id (null for anonymous readers)
  readAt: Date;            // Timestamp when article was read
}

// DailyAnalytics database model - aggregated view counts per day
export interface DailyAnalytics {
  id: string;         // UUID primary key
  articleId: string;  // Foreign key to Article.id
  viewCount: number;  // Total views for this article on this date
  date: Date;         // The date for this analytics record
}

// Standard API response format for single operations
export interface BaseResponse<T = any> {
  Success: boolean;        // true if operation succeeded, false otherwise
  Message: string;         // Human-readable message
  Object: T | null;        // The data being returned (null on error)
  Errors: string[] | null; // Array of error messages (null on success)
}

// API response format for paginated list operations
export interface PaginatedResponse<T = any> {
  Success: boolean;   // Always true for paginated responses
  Message: string;    // Human-readable message
  Object: T[];        // Array of items for current page
  PageNumber: number; // Current page number (1-indexed)
  PageSize: number;   // Number of items per page
  TotalSize: number;  // Total number of items across all pages
  Errors: null;       // Always null for paginated responses
}
