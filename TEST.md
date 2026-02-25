# News API Testing Guide

Complete step-by-step testing guide for all endpoints.

## Prerequisites

1. Server running: `npm run dev`
2. Database setup complete
3. Postman installed

---

## Test Flow Overview

1. User Registration & Authentication
2. Article Management (Author)
3. Public Article Access (Reader)
4. Analytics & Dashboard
5. Edge Cases & Security

---

## 1. USER AUTHENTICATION

### 1.1 Register Author
**Endpoint:** `POST http://localhost:3000/api/auth/signup`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123!",
  "role": "author"
}
```

**Expected Response:** `201 Created`
```json
{
  "Success": true,
  "Message": "User created successfully",
  "Object": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "author"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "Errors": null
}
```

**Save the token as:** `AUTHOR_TOKEN`

---

### 1.2 Register Reader
**Endpoint:** `POST http://localhost:3000/api/auth/signup`

**Body:**
```json
{
  "name": "Jane Reader",
  "email": "jane@example.com",
  "password": "Password123!",
  "role": "reader"
}
```

**Expected Response:** `201 Created`

**Save the token as:** `READER_TOKEN`

---

### 1.3 Login
**Endpoint:** `POST http://localhost:3000/api/auth/login`

**Body:**
```json
{
  "email": "john@example.com",
  "password": "Password123!"
}
```

**Expected Response:** `200 OK`

---

### 1.4 Test Validation Errors

**Invalid Email:**
```json
{
  "name": "Test",
  "email": "invalid-email",
  "password": "Password123!",
  "role": "author"
}
```
**Expected:** `400 Bad Request` - "Invalid email format"

**Weak Password:**
```json
{
  "name": "Test",
  "email": "test@example.com",
  "password": "weak",
  "role": "author"
}
```
**Expected:** `400 Bad Request` - Password validation error

**Duplicate Email:**
Register with same email twice.
**Expected:** `409 Conflict` - "Email is already registered"

---

## 2. ARTICLE MANAGEMENT (AUTHOR ONLY)

### 2.1 Create Article (Draft)
**Endpoint:** `POST http://localhost:3000/api/articles`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {AUTHOR_TOKEN}
```

**Body:**
```json
{
  "title": "Introduction to TypeScript",
  "content": "TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale. This article covers the basics and advanced features.",
  "category": "Tech"
}
```

**Expected Response:** `201 Created`

**Save article ID as:** `ARTICLE_ID`

---

### 2.2 Get My Articles
**Endpoint:** `GET http://localhost:3000/api/articles/me?page=1&pageSize=10`

**Headers:**
```
Authorization: Bearer {AUTHOR_TOKEN}
```

**Expected Response:** `200 OK` - Paginated list of author's articles

---

### 2.3 Get My Articles (Include Deleted)
**Endpoint:** `GET http://localhost:3000/api/articles/me?includeDeleted=true`

**Headers:**
```
Authorization: Bearer {AUTHOR_TOKEN}
```

**Expected Response:** `200 OK` - Includes soft-deleted articles with status "Deleted"

---

### 2.4 Update Article to Published
**Endpoint:** `PUT http://localhost:3000/api/articles/{ARTICLE_ID}`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {AUTHOR_TOKEN}
```

**Body:**
```json
{
  "status": "Published"
}
```

**Expected Response:** `200 OK`

---

### 2.5 Update Article Content
**Endpoint:** `PUT http://localhost:3000/api/articles/{ARTICLE_ID}`

**Body:**
```json
{
  "title": "Advanced TypeScript Guide",
  "content": "Updated content with more details about TypeScript features including generics, decorators, and advanced types."
}
```

**Expected Response:** `200 OK`

---

### 2.6 Create More Articles
Create 3-5 more articles with different categories:

**Article 2:**
```json
{
  "title": "Healthy Living Tips",
  "content": "Discover essential tips for maintaining a healthy lifestyle including nutrition, exercise, and mental wellness practices.",
  "category": "Health"
}
```

**Article 3:**
```json
{
  "title": "Breaking News in Politics",
  "content": "Latest updates on political developments and their impact on society and economy.",
  "category": "Politics"
}
```

Publish at least 2 of them by updating status to "Published".

---

### 2.7 Soft Delete Article
**Endpoint:** `DELETE http://localhost:3000/api/articles/{ARTICLE_ID}`

**Headers:**
```
Authorization: Bearer {AUTHOR_TOKEN}
```

**Expected Response:** `200 OK`

**Verify:** Article should not appear in public listings but visible with `includeDeleted=true`

---

## 3. PUBLIC ARTICLE ACCESS

### 3.1 Get All Published Articles
**Endpoint:** `GET http://localhost:3000/api/articles?page=1&pageSize=10`

**Headers:**
```
Authorization: Bearer {READER_TOKEN}
```

**Expected Response:** `200 OK` - Only published, non-deleted articles

---

### 3.2 Filter by Category
**Endpoint:** `GET http://localhost:3000/api/articles?category=Tech`

**Headers:**
```
Authorization: Bearer {READER_TOKEN}
```

**Expected Response:** `200 OK` - Only Tech articles

---

### 3.3 Search by Author Name
**Endpoint:** `GET http://localhost:3000/api/articles?author=John`

**Headers:**
```
Authorization: Bearer {READER_TOKEN}
```

**Expected Response:** `200 OK` - Articles by authors with "John" in name

---

### 3.4 Search by Keyword
**Endpoint:** `GET http://localhost:3000/api/articles?q=TypeScript`

**Headers:**
```
Authorization: Bearer {READER_TOKEN}
```

**Expected Response:** `200 OK` - Articles with "TypeScript" in title

---

### 3.5 Combined Filters
**Endpoint:** `GET http://localhost:3000/api/articles?category=Tech&author=John&q=Type&page=1&pageSize=5`

**Expected Response:** `200 OK` - Filtered and paginated results

---

### 3.6 Read Article (Logs View)
**Endpoint:** `GET http://localhost:3000/api/articles/{PUBLISHED_ARTICLE_ID}`

**Headers:**
```
Authorization: Bearer {READER_TOKEN}
```

**Expected Response:** `200 OK` - Full article content

**Note:** This logs a read event for analytics

---

### 3.7 Read Article as Guest (Anonymous)
**Endpoint:** `GET http://localhost:3000/api/articles/{PUBLISHED_ARTICLE_ID}`

**Headers:**
```
Authorization: Bearer {READER_TOKEN}
```

**Expected Response:** `200 OK`

**Note:** Logs read with null reader_id

---

### 3.8 Try to Read Deleted Article
**Endpoint:** `GET http://localhost:3000/api/articles/{DELETED_ARTICLE_ID}`

**Expected Response:** `410 Gone`
```json
{
  "Success": false,
  "Message": "News article no longer available",
  "Object": null,
  "Errors": ["News article no longer available"]
}
```

---

## 4. ANALYTICS & DASHBOARD

### 4.1 Get Author Dashboard
**Endpoint:** `GET http://localhost:3000/api/articles/dashboard?page=1&pageSize=10`

**Headers:**
```
Authorization: Bearer {AUTHOR_TOKEN}
```

**Expected Response:** `200 OK`
```json
{
  "Success": true,
  "Message": "Dashboard data retrieved successfully",
  "Object": [
    {
      "id": "uuid",
      "title": "Article Title",
      "created_at": "2024-01-01T00:00:00Z",
      "total_views": 15
    }
  ],
  "PageNumber": 1,
  "PageSize": 10,
  "TotalSize": 5
}
```

---

### 4.2 Get Article Analytics
**Endpoint:** `GET http://localhost:3000/api/articles/{ARTICLE_ID}/analytics`

**Headers:**
```
Authorization: Bearer {AUTHOR_TOKEN}
```

**Expected Response:** `200 OK` - Daily analytics data

---

### 4.3 Get Analytics with Date Range
**Endpoint:** `GET http://localhost:3000/api/articles/{ARTICLE_ID}/analytics?startDate=2024-01-01&endDate=2024-12-31`

**Expected Response:** `200 OK` - Filtered analytics

---

## 5. SECURITY & AUTHORIZATION TESTS

### 5.1 Reader Cannot Create Article
**Endpoint:** `POST http://localhost:3000/api/articles`

**Headers:**
```
Authorization: Bearer {READER_TOKEN}
```

**Body:**
```json
{
  "title": "Test",
  "content": "This should fail because reader cannot create articles",
  "category": "Test"
}
```

**Expected Response:** `403 Forbidden`
```json
{
  "Success": false,
  "Message": "Access denied",
  "Errors": ["Insufficient permissions"]
}
```

---

### 5.2 Reader Cannot Access Dashboard
**Endpoint:** `GET http://localhost:3000/api/articles/dashboard`

**Headers:**
```
Authorization: Bearer {READER_TOKEN}
```

**Expected Response:** `403 Forbidden`

---

### 5.3 No Token Provided
**Endpoint:** `GET http://localhost:3000/api/articles`

**Headers:** (No Authorization header)

**Expected Response:** `401 Unauthorized`
```json
{
  "Success": false,
  "Message": "Authentication required",
  "Errors": ["No token provided"]
}
```

---

### 5.4 Invalid Token
**Endpoint:** `GET http://localhost:3000/api/articles`

**Headers:**
```
Authorization: Bearer invalid_token_here
```

**Expected Response:** `401 Unauthorized`

---

### 5.5 Author Cannot Edit Another Author's Article
1. Create second author account
2. Try to update first author's article with second author's token

**Expected Response:** `404 Not Found` - "Article not found or unauthorized"

---

## 6. VALIDATION TESTS

### 6.1 Title Too Long
**Endpoint:** `POST http://localhost:3000/api/articles`

**Body:**
```json
{
  "title": "A".repeat(151),
  "content": "Valid content with more than 50 characters here...",
  "category": "Test"
}
```

**Expected Response:** `400 Bad Request` - "Title must be between 1 and 150 characters"

---

### 6.2 Content Too Short
**Body:**
```json
{
  "title": "Valid Title",
  "content": "Short",
  "category": "Test"
}
```

**Expected Response:** `400 Bad Request` - "Content must be at least 50 characters"

---

### 6.3 Missing Required Fields
**Body:**
```json
{
  "title": "Valid Title"
}
```

**Expected Response:** `400 Bad Request` - Multiple validation errors

---

## 7. PAGINATION TESTS

### 7.1 First Page
**Endpoint:** `GET http://localhost:3000/api/articles?page=1&pageSize=2`

**Expected Response:** First 2 articles

---

### 7.2 Second Page
**Endpoint:** `GET http://localhost:3000/api/articles?page=2&pageSize=2`

**Expected Response:** Next 2 articles

---

### 7.3 Default Pagination
**Endpoint:** `GET http://localhost:3000/api/articles`

**Expected Response:** Page 1, Size 10 (defaults)

---

## 8. EDGE CASES

### 8.1 Non-existent Article
**Endpoint:** `GET http://localhost:3000/api/articles/00000000-0000-0000-0000-000000000000`

**Expected Response:** `404 Not Found`

---

### 8.2 Invalid UUID Format
**Endpoint:** `GET http://localhost:3000/api/articles/invalid-id`

**Expected Response:** `500 Server Error` or `400 Bad Request`

---

### 8.3 Empty Search Results
**Endpoint:** `GET http://localhost:3000/api/articles?q=NonExistentKeyword123456`

**Expected Response:** `200 OK` with empty array

---

## 9. ANALYTICS JOB VERIFICATION

### 9.1 Check Read Logs
In Neon SQL Editor:
```sql
SELECT * FROM read_logs ORDER BY read_at DESC LIMIT 10;
```

**Expected:** See logged reads from your tests

---

### 9.2 Manually Trigger Analytics Aggregation
In Neon SQL Editor:
```sql
INSERT INTO daily_analytics (article_id, view_count, date)
SELECT article_id, COUNT(*) as view_count, CURRENT_DATE as date
FROM read_logs
WHERE DATE(read_at AT TIME ZONE 'GMT') = CURRENT_DATE
GROUP BY article_id
ON CONFLICT (article_id, date) 
DO UPDATE SET view_count = EXCLUDED.view_count;
```

---

### 9.3 Verify Daily Analytics
```sql
SELECT * FROM daily_analytics ORDER BY date DESC;
```

**Expected:** Aggregated view counts per article per day

---

## 10. HEALTH CHECK

### 10.1 Server Health
**Endpoint:** `GET http://localhost:3000/health`

**Expected Response:** `200 OK`
```json
{
  "status": "OK"
}
```

---

## Test Checklist

- [ ] Author signup and login
- [ ] Reader signup and login
- [ ] Create draft article
- [ ] Update article to published
- [ ] Get my articles
- [ ] Get published articles (all filters)
- [ ] Read article (logs view)
- [ ] Soft delete article
- [ ] Access deleted article (should fail)
- [ ] Author dashboard with view counts
- [ ] Article analytics
- [ ] Reader cannot create article (403)
- [ ] Reader cannot access dashboard (403)
- [ ] No token returns 401
- [ ] Invalid token returns 401
- [ ] Cannot edit other author's article
- [ ] Validation errors work
- [ ] Pagination works
- [ ] Search and filters work
- [ ] Analytics job runs daily

---

## Expected Database State After Tests

**Users Table:**
- 1 Author (John Doe)
- 1 Reader (Jane Reader)

**Articles Table:**
- 3-5 articles (mix of Draft/Published)
- 1 soft-deleted article (deleted_at != null)

**Read Logs Table:**
- Multiple read entries from testing

**Daily Analytics Table:**
- Aggregated view counts (after running job)

---

## Notes

- Replace `{AUTHOR_TOKEN}`, `{READER_TOKEN}`, `{ARTICLE_ID}` with actual values
- JWT tokens expire in 24 hours
- Analytics job runs daily at midnight GMT
- All timestamps are in GMT
- Soft-deleted articles are excluded from public endpoints
