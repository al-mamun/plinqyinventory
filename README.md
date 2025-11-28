# Plinqy

A modern local business discovery and e-commerce platform with geospatial search capabilities.

## Overview

Plinqy is a monorepo application that enables users to discover local stores and products based on their location. The platform features real-time search, vector-based product recommendations, and a comprehensive admin dashboard for store management.

## Architecture

This project uses a monorepo structure with the following components:

- Backend API (NestJS)
- Admin Dashboard (React + Vite)
- Marketing Website (Next.js)
- Search Engine (React + Vite)

## Tech Stack

### Backend
- NestJS 11.1.9
- PostgreSQL 15 with PostGIS and pgvector extensions
- Prisma ORM 6.19.0
- Redis for caching
- Elasticsearch for full-text search
- RabbitMQ for message queuing
- JWT authentication with refresh tokens

### Frontend
- React 19
- TypeScript 5.9
- Vite 7.2 / Next.js 16.0
- TailwindCSS
- Shadcn UI components
- Recharts for analytics
- Framer Motion for animations

### Infrastructure
- Docker and Docker Compose
- PostgreSQL with PostGIS for geospatial queries
- Redis for session management
- Elasticsearch for search indexing

## Features

- Geospatial store and product search
- Vector-based product recommendations
- User authentication with JWT
- Role-based access control (Admin, Store Owner, Customer)
- Real-time inventory tracking
- Analytics dashboard
- Responsive design

## Prerequisites

- Node.js 18 or higher
- Docker and Docker Compose
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/plinqy.git
cd plinqy
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit the `.env` file with your configuration.

4. Start Docker services:
```bash
docker-compose up -d
```

5. Run database migrations:
```bash
cd backend
npm run migration:run
```

6. Start development servers:
```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start all services in development mode
- `npm run build` - Build all applications for production
- `npm run test` - Run tests across all packages
- `npm run lint` - Lint all packages

## Project Structure

```
plinqy/
├── apps/
│   ├── admin-dashboard/    # Admin panel for store management
│   ├── marketing-web/      # Public-facing marketing website
│   └── search-engine/      # Product and store search interface
├── backend/                # NestJS API server
│   ├── prisma/            # Database schema and migrations
│   └── src/               # Source code
├── packages/              # Shared packages
├── docker/                # Docker configurations
└── scripts/               # Utility scripts
```

## Database Schema

The application uses a comprehensive database schema with 34 tables including:

- User management (app_user, user_preferences)
- Store management (store, store_hours, store_settings)
- Product catalog (store_product, product_variant, product_image)
- Orders and transactions (order_header, order_item, payment)
- Reviews and ratings (product_review, store_review)
- Analytics and tracking (product_view, search_query, user_activity)

## API Documentation

Once the backend is running, API documentation is available at:
- Swagger UI: http://localhost:3000/api/docs

## Development

### Backend Development
```bash
cd backend
npm run start:dev
```

### Frontend Development
```bash
# Admin Dashboard
cd apps/admin-dashboard
npm run dev

# Marketing Website
cd apps/marketing-web
npm run dev

# Search Engine
cd apps/search-engine
npm run dev
```

## Environment Variables

Key environment variables required:

```
DATABASE_URL=postgresql://user:password@localhost:5432/plinqy_db
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
ELASTICSEARCH_NODE=http://localhost:9200
```

## Security

- Passwords are hashed using bcrypt
- JWT tokens with HTTP-only cookies
- Refresh token rotation
- Role-based access control
- SQL injection prevention with Prisma
- XSS protection

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- PostGIS for geospatial capabilities
- Prisma for type-safe database access
- NestJS for backend framework
- React and Next.js for frontend frameworks
