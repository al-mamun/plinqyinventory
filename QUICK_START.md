# Plinqy Quick Start Guide

## ✅ Current Status

All Docker services are running and database is migrated!

### 🐘 PostgreSQL Connection Info

#### For Adminer (Database Admin UI)
Access Adminer at: [http://localhost:8080](http://localhost:8080)

**Login Credentials:**
- **System**: PostgreSQL
- **Server**: `postgres` ← **Use this, NOT localhost!**
- **Username**: `dev`
- **Password**: `devpass123`
- **Database**: `plinqy_db`

> **Why "postgres" not "localhost"?** Adminer runs inside Docker and needs to use the Docker service name to connect to PostgreSQL.

#### For Local Applications (Backend, Scripts)
- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `plinqy_db`
- **Username**: `dev`
- **Password**: `devpass123`

Connection string:
```
postgresql://dev:devpass123@localhost:5432/plinqy_db
```

### 🎯 Running Services

| Service | Port | URL | Status |
|---------|------|-----|--------|
| PostgreSQL | 5432 | localhost:5432 | ✅ Running |
| Redis | 6379 | localhost:6379 | ✅ Running |
| Elasticsearch | 9200 | http://localhost:9200 | ✅ Running |
| RabbitMQ | 5672, 15672 | http://localhost:15672 | ✅ Running |
| AI Service | 5001 | http://localhost:5001 | ✅ Running |
| Adminer | 8080 | http://localhost:8080 | ✅ Running |
| Admin Dashboard | 3004 | http://localhost:3004 | ✅ Running |
| Marketing Web | 3005 | http://localhost:3005 | ✅ Running |

### 📊 Database Schema

**16 Tables Created:**
1. `app_user` - Users with roles (admin, store_owner, customer, etc.)
2. `store` - Store locations with PostGIS geography
3. `product_master` - Global product catalog with AI embeddings
4. `category` - 8 default categories (Electronics, Fashion, Books, etc.)
5. `store_product` - Store-specific product listings
6. `product_variant` - Product variations (size, color, SKU)
7. `product_image` - Product images
8. `import_batch` - POS integration batches
9. `imported_product_raw` - Raw POS data storage
10. `history_store_product` - Audit trail for changes
11. `ai_task` - AI processing task queue
12. `search_index_queue` - Elasticsearch sync queue
13. `inventory_event` - Real-time inventory tracking
14. `store_webhook` - Webhook configurations
15. `feature_flag` - Feature toggles (5 defaults enabled)
16. `system_log` - System logging

**Extensions Enabled:**
- ✅ uuid-ossp (UUID generation)
- ✅ citext (Case-insensitive text)
- ✅ PostGIS (Geographic queries)
- ✅ pgvector (AI embeddings for semantic search)

## 🚀 Next: Start Backend API

### Option 1: Start in Development Mode

```bash
cd backend
npm run start:dev
```

The backend will start on [http://localhost:3000](http://localhost:3000)

### Option 2: Test Connection First

Create a test script to verify database connection:

**backend/test-db-connection.js:**
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'plinqy_db',
  user: 'dev',
  password: 'devpass123',
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Connection failed:', err.message);
  } else {
    console.log('✅ Connected! Server time:', res.rows[0].now);
  }
  pool.end();
});
```

Run it:
```bash
cd backend
node test-db-connection.js
```

## 🔍 Verify Services

### PostgreSQL
```bash
docker exec plinqy-postgres psql -U dev -d plinqy_db -c "SELECT COUNT(*) FROM category;"
```
Expected output: `8` (8 default categories)

### Redis
```bash
docker exec plinqy-redis redis-cli ping
```
Expected output: `PONG`

### Elasticsearch
```bash
curl http://localhost:9200
```
Should return JSON with cluster info

### RabbitMQ Management
Open [http://localhost:15672](http://localhost:15672)
- **Username**: `admin`
- **Password**: `admin123`

## 📝 Common Tasks

### View Database Tables
```bash
docker exec plinqy-postgres psql -U dev -d plinqy_db -c "\dt"
```

### View Categories
```bash
docker exec plinqy-postgres psql -U dev -d plinqy_db -c "SELECT * FROM category;"
```

### View Feature Flags
```bash
docker exec plinqy-postgres psql -U dev -d plinqy_db -c "SELECT * FROM feature_flag;"
```

### Check Migration Status
```bash
docker exec plinqy-postgres psql -U dev -d plinqy_db -c "SELECT * FROM migrations;"
```

### Restart All Services
```bash
docker-compose restart
```

### Stop All Services
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker logs -f plinqy-postgres
docker logs -f plinqy-redis
docker logs -f plinqy-elasticsearch
```

## 🐛 Troubleshoği

### Can't Connect to PostgreSQL from Local App

**Problem**: `connection refused` error

**Solution 1**: Wait a moment - PostgreSQL might still be starting
```bash
docker logs plinqy-postgres | tail -5
```
Look for: `database system is ready to accept connections`

**Solution 2**: Try IPv4 explicitly
```bash
# In your .env file, use:
DB_HOST=127.0.0.1
# instead of:
DB_HOST=localhost
```

**Solution 3**: Check if another PostgreSQL is running
```bash
netstat -ano | findstr :5432
```

### Adminer Can't Connect

**Remember**: Use server name `postgres`, NOT `localhost`!

Adminer runs inside Docker, so it uses Docker network names.

### Port Already in Use

If you get "port already in use":
```bash
# Find what's using the port (example for 5432)
netstat -ano | findstr :5432

# Kill the process
taskkill /PID <process_id> /F
```

## 📚 Documentation

- **Database Schema**: [`DATABASE_SCHEMA.md`](DATABASE_SCHEMA.md)
- **Setup Guide**: [`SETUP_GUIDE.md`](SETUP_GUIDE.md)
- **Deployment**: [`DEPLOYMENT.md`](DEPLOYMENT.md)
- **Migration README**: [`backend/src/migrations/README.md`](backend/src/migrations/README.md)

## 🎉 What's Working

✅ All Docker services running
✅ PostgreSQL with PostGIS & pgvector
✅ Database fully migrated
✅ 8 default categories seeded
✅ 5 feature flags configured
✅ Admin Dashboard live
✅ Marketing Website live
✅ Redis cache ready
✅ Elasticsearch ready
✅ AI Service ready

## 🔜 What's Next

1. **Start Backend API** (port 3000)
2. **Start Search Engine** (port 3003)
3. **Create admin user** (via API or seed script)
4. **Test POS integration** webhooks
5. **Configure AI enhancements**
6. **Deploy to production**

---

Need help? Check the troubleshooting section above or see the full guides in the documentation!
