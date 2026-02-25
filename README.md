# News API

A RESTful API for Authors to publish content and Readers to consume it, with an Analytics Engine for tracking engagement.

## Features

- **User Authentication**: Secure signup and login with JWT tokens
- **Role-Based Access**: Author and Reader roles with different permissions
- **Article Management**: CRUD operations for articles with Draft/Published status
- **Analytics Engine**: Track article views and generate daily analytics
- **Soft Deletion**: Articles are soft-deleted for data integrity
- **Pagination**: Efficient data retrieval with pagination support

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt

## Project Structure

```
news-api/
├── README.md
├── .env.example
├── .gitignore
├── package.json
└── backend/
    ├── index.ts
    ├── tsconfig.json
    ├── schema.sql
    ├── src/
    │   ├── config/
    │   │   └── database.ts
    │   ├── models/
    │   │   ├── User.ts
    │   │   ├── Article.ts
    │   │   └── Analytics.ts
    │   ├── controllers/
    │   │   ├── AuthController.ts
    │   │   └── ArticleController.ts
    │   ├── routes/
    │   │   ├── auth.ts
    │   │   └── articles.ts
    │   ├── middleware/
    │   │   └── auth.ts
    │   ├── utils/
    │   │   ├── validation.ts
    │   │   └── response.ts
    │   └── types.ts
    └── tests/
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/newsapi
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

### 3. Setup PostgreSQL Database

**Option 1: Using PostgreSQL locally**

1. Install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/)

2. Create a database:
```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE newsapi;

# Exit
\q
```

3. Run the schema:
```bash
psql -U postgres -d newsapi -f backend/schema.sql
```

4. Update `.env` with your connection:
```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/newsapi
```

**Option 2: Using cloud PostgreSQL (Neon, Supabase, etc.)**

1. Create a free PostgreSQL database at:
   - [Neon](https://neon.tech) (recommended)
   - [Supabase](https://supabase.com)
   - [ElephantSQL](https://www.elephantsql.com)

2. Copy the connection string provided

3. Update `.env`:
```env
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
```

4. Run the schema using their web interface or:
```bash
psql "your_connection_string" -f backend/schema.sql
```

### 4. Verify Database Connection

Test your connection:
```bash
psql "$DATABASE_URL"
```

Or check tables were created:
```sql
\dt
```

You should see: users, articles, read_logs, daily_analytics

### 5. Run the Application

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Authentication

#### Signup
```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123!",
  "role": "author"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123!"
}
```

### Articles

All article endpoints require authentication. Include JWT token in header:
```
Authorization: Bearer <your-token>
```

#### Create Article (Author only)
```http
POST /api/articles
Content-Type: application/json

{
  "title": "My Article Title",
  "content": "Article content with at least 50 characters...",
  "category": "Tech"
}
```

#### Get My Articles (Author only)
```http
GET /api/articles/my-articles
```

#### Get Published Articles
```http
GET /api/articles/published?page=1&pageSize=10&category=Tech
```

#### Get Article by ID
```http
GET /api/articles/:id
```

#### Update Article (Author only, must be owner)
```http
PUT /api/articles/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "status": "Published"
}
```

#### Delete Article (Author only, must be owner)
```http
DELETE /api/articles/:id
```

#### Get Article Analytics (Author only, must be owner)
```http
GET /api/articles/:id/analytics?startDate=2024-01-01&endDate=2024-12-31
```

## Data Models

### User
- **id**: UUID (primary key)
- **name**: String (alphabets and spaces only)
- **email**: String (unique)
- **password**: String (hashed with bcrypt)
- **role**: Enum (author, reader)

### Article
- **id**: UUID (primary key)
- **title**: String (1-150 characters)
- **content**: Text (minimum 50 characters)
- **category**: String
- **status**: Enum (Draft, Published)
- **authorId**: UUID (foreign key to User)
- **createdAt**: Timestamp
- **deletedAt**: Timestamp (null if not deleted)

### ReadLog
- **id**: UUID (primary key)
- **articleId**: UUID (foreign key to Article)
- **readerId**: UUID (foreign key to User, nullable)
- **readAt**: Timestamp

### DailyAnalytics
- **id**: UUID (primary key)
- **articleId**: UUID (foreign key to Article)
- **viewCount**: Integer
- **date**: Date (unique with articleId)

## Validation Rules

### User Registration
- **Name**: Only alphabets and spaces
- **Email**: Valid email format, must be unique
- **Password**: Minimum 8 characters with:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- **Role**: Must be either "author" or "reader"

### Article
- **Title**: 1-150 characters
- **Content**: Minimum 50 characters
- **Category**: Required
- **Status**: Draft or Published

## Response Format

### Success Response
```json
{
  "Success": true,
  "Message": "Operation successful",
  "Object": { ... },
  "Errors": null
}
```

### Error Response
```json
{
  "Success": false,
  "Message": "Operation failed",
  "Object": null,
  "Errors": ["Error message 1", "Error message 2"]
}
```

### Paginated Response
```json
{
  "Success": true,
  "Message": "Data retrieved",
  "Object": [...],
  "PageNumber": 1,
  "PageSize": 10,
  "TotalSize": 100,
  "Errors": null
}
```

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Authorization**: Separate permissions for Authors and Readers
- **SQL Injection Prevention**: Parameterized queries
- **Soft Deletion**: Data preservation for audit trails

## Analytics

The analytics engine tracks article views in two stages:

1. **ReadLog**: Records every view with timestamp and reader ID
2. **DailyAnalytics**: Aggregated daily view counts (run via cron job)

To aggregate daily analytics, call:
```javascript
await AnalyticsModel.aggregateDailyViews(new Date());
```

## Scripts

- `npm run dev` - Run in development mode with ts-node
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run compiled production build

## License

MIT
