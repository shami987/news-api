# News API

A robust RESTful API for Authors to publish content and Readers to consume it, with an Analytics Engine for tracking engagement.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. Run database migrations (setup your PostgreSQL database first)

4. Start development server:
```bash
npm run dev
```

## Scripts

- `npm run dev` - Run in development mode
- `npm run build` - Build for production
- `npm start` - Run production build

## API Documentation

See `/backend/src` for implementation details.
