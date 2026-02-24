// User roles and article status enums
export enum UserRole {
  AUTHOR = 'author',
  READER = 'reader'
}

export enum ArticleStatus {
  DRAFT = 'Draft',
  PUBLISHED = 'Published'
}

// Database models
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  status: ArticleStatus;
  authorId: string;
  createdAt: Date;
  deletedAt: Date | null;
}

export interface ReadLog {
  id: string;
  articleId: string;
  readerId: string | null;
  readAt: Date;
}

export interface DailyAnalytics {
  id: string;
  articleId: string;
  viewCount: number;
  date: Date;
}

// API response formats
export interface BaseResponse<T = any> {
  Success: boolean;
  Message: string;
  Object: T | null;
  Errors: string[] | null;
}

export interface PaginatedResponse<T = any> {
  Success: boolean;
  Message: string;
  Object: T[];
  PageNumber: number;
  PageSize: number;
  TotalSize: number;
  Errors: null;
}
