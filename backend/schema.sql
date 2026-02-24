-- Create UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(10) NOT NULL CHECK (role IN ('author', 'reader')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Articles table
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(150) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  status VARCHAR(10) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Published')),
  author_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

-- ReadLogs table
CREATE TABLE read_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES articles(id),
  reader_id UUID REFERENCES users(id),
  read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DailyAnalytics table
CREATE TABLE daily_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES articles(id),
  view_count INTEGER NOT NULL DEFAULT 0,
  date DATE NOT NULL,
  UNIQUE(article_id, date)
);

-- Indexes
CREATE INDEX idx_articles_author ON articles(author_id);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_category ON articles(category);
CREATE INDEX idx_read_logs_article ON read_logs(article_id);
CREATE INDEX idx_read_logs_date ON read_logs(read_at);
CREATE INDEX idx_daily_analytics_article ON daily_analytics(article_id);
CREATE INDEX idx_daily_analytics_date ON daily_analytics(date);
