# Plinqy Setup Guide

## Current Status

✅ **Admin Dashboard** - Running on [http://localhost:3004](http://localhost:3004)
✅ **Marketing Website** - Running on [http://localhost:3005](http://localhost:3005)
✅ **Search Engine** - Ready on port 3003
✅ **Backend API** - Ready on port 3000
⏸️ **Database** - Needs to be started
⏸️ **Redis** - Needs to be started
⏸️ **Elasticsearch** - Needs to be started

## Quick Start (Docker Required)

### Step 1: Start Docker Desktop

Make sure Docker Desktop is running on your Windows machine.

### Step 2: Start All Services

```bash
# From the project root (f:\plinqy)
docker-compose up -d
```

This will start:
- **PostgreSQL** with PostGIS (Port 5432)
- **Redis** (Port 6379)
- **Elasticsearch** (Port 9200)
- **RabbitMQ** (Ports 5672, 15672)
- **AI Service** (Port 5001)
- **Adminer** (Port 8080 - Database admin tool)

### Step 3: Wait for Services to Start

```bash
# Check service status
docker-compose ps

# Watch logs
docker-compose logs -f postgres
```

Wait until you see:
```
plinqy-postgres | database system is ready to accept connections
```

### Step 4: Run Database Migrations

```bash
cd backend
npm run migration:run
```

Expected output:
```
🚀 Plinqy Database Migration Tool

Checking required PostgreSQL extensions...
Extension 'uuid-ossp' is installed ✓
Extension 'citext' is installed ✓
Extension 'postgis' is installed ✓
Extension 'vector' is installed ✓

Starting database migrations...
Running migration: 001_initial_schema.sql
Migration 001_initial_schema.sql completed successfully
All migrations completed successfully

✅ Database migration completed successfully!
```

### Step 5: Start Backend API

```bash
# In backend directory
npm run start:dev
```

The backend will start on [http://localhost:3000](http://localhost:3000)

### Step 6: Start Search Engine (if not running)

```bash
# In apps/search-engine directory
cd ../apps/search-engine
npm run dev
```

## Verify Everything is Working

### Check All Services

```bash
# PostgreSQL
docker exec -it plinqy-postgres psql -U dev -d plinqy_db -c "SELECT COUNT(*) FROM app_user;"

# Redis
docker exec -it plinqy-redis redis-cli ping
# Should return: PONG

# Elasticsearch
curl http://localhost:9200
# Should return JSON with cluster info

# Backend API
curl http://localhost:3000/health
# Should return health status

# Admin Dashboard
# Open http://localhost:3004 in browser

# Marketing Website
# Open http://localhost:3005 in browser

# Search Engine
# Open http://localhost:3003 in browser
```

### Access Database Admin (Adminer)

1. Open [http://localhost:8080](http://localhost:8080)
2. Login with:
   - **System**: PostgreSQL
   - **Server**: postgres
   - **Username**: dev
   - **Password**: devpass123
   - **Database**: plinqy_db

## Troubleshooting

### Docker Not Starting

```bash
# Check if Docker is running
docker ps

# If not, start Docker Desktop application
```

### PostgreSQL Connection Error

```bash
# Check if postgres container is running
docker ps | grep postgres

# View logs
docker logs plinqy-postgres

# Restart container
docker-compose restart postgres
```

### pgvector Extension Missing

The current PostGIS image (`postgis/postgis:15-3.3-alpine`) might not include pgvector. If you get an error about pgvector:

**Option 1: Use pgvector-enabled image**
```yaml
# Edit docker-compose.yml, change line 6:
image: pgvector/pgvector:pg15
```

Then restart:
```bash
docker-compose down
docker-compose up -d postgres
```

**Option 2: Install pgvector manually**
```bash
docker exec -it plinqy-postgres sh
apk add --no-cache git build-base postgresql-dev
git clone https://github.com/pgvector/pgvector.git
cd pgvector
make
make install
exit

# Restart container
docker-compose restart postgres
```

### Migration Fails

```bash
# Check database connection
cd backend
node -e "const {Pool}=require('pg'); const pool=new Pool({host:'localhost',port:5432,database:'plinqy_db',user:'dev',password:'devpass123'}); pool.query('SELECT NOW()').then(r=>console.log('Connected:',r.rows[0])).catch(e=>console.error('Error:',e.message));"

# Reset migrations (CAUTION: This drops all data)
docker exec -it plinqy-postgres psql -U dev -d plinqy_db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Re-run migrations
npm run migration:run
```

### Port Already in Use

If you get "port already in use" errors:

```bash
# Find what's using the port (example for port 5432)
netstat -ano | findstr :5432

# Kill the process (replace PID with actual process ID)
taskkill /PID <pid> /F

# Or change the port in docker-compose.yml
```

## Database Schema Overview

The migration creates 16 tables:

1. **app_user** - Users with roles (admin, store_owner, customer, etc.)
2. **store** - Store information with geographic location
3. **product_master** - Global product catalog with AI embeddings
4. **category** - Hierarchical product categories
5. **store_product** - Store-specific product listings
6. **product_variant** - Product variations (size, color, etc.)
7. **product_image** - Product images
8. **import_batch** - POS integration batches
9. **imported_product_raw** - Raw POS data
10. **history_store_product** - Audit trail
11. **ai_task** - AI processing queue
12. **search_index_queue** - Elasticsearch sync queue
13. **inventory_event** - Inventory change tracking
14. **store_webhook** - Webhook configurations
15. **feature_flag** - Feature toggles
16. **system_log** - System logs

See [`DATABASE_SCHEMA.md`](DATABASE_SCHEMA.md) for complete documentation.

## Next Steps

After everything is running:

1. **Create Admin User**
   ```bash
   # Run seed script (to be created)
   cd backend
   npm run seed
   ```

2. **Test POS Integration**
   - Configure webhook endpoints
   - Test import from Shopify/Lightspeed/Vend

3. **Configure AI Service**
   - Set up OpenAI API key in `.env`
   - Test product enhancement

4. **Deploy to Production**
   - See [`DEPLOYMENT.md`](DEPLOYMENT.md)

## Development Workflow

```bash
# Terminal 1: Backend API
cd backend
npm run start:dev

# Terminal 2: Admin Dashboard
cd apps/admin-dashboard
npm run dev

# Terminal 3: Marketing Website
cd apps/marketing-web
npm run dev

# Terminal 4: Search Engine
cd apps/search-engine
npm run dev

# Terminal 5: Docker services
docker-compose logs -f
```

## Useful Commands

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (CAUTION: Deletes data)
docker-compose down -v

# View logs
docker-compose logs -f [service_name]

# Rebuild a service
docker-compose up -d --build [service_name]

# Database backup
docker exec plinqy-postgres pg_dump -U dev plinqy_db > backup.sql

# Database restore
docker exec -i plinqy-postgres psql -U dev plinqy_db < backup.sql
```

## Support

- Database Schema: [`DATABASE_SCHEMA.md`](DATABASE_SCHEMA.md)
- Deployment Guide: [`DEPLOYMENT.md`](DEPLOYMENT.md)
- Migration README: [`backend/src/migrations/README.md`](backend/src/migrations/README.md)
