# Database Migrations

## Overview

This directory contains SQL migration files for the Plinqy platform database.

## Required PostgreSQL Extensions

Before running migrations, ensure these extensions are available:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";    -- UUID generation
CREATE EXTENSION IF NOT EXISTS "citext";        -- Case-insensitive text
CREATE EXTENSION IF NOT EXISTS "postgis";       -- Geographic/spatial data
CREATE EXTENSION IF NOT EXISTS "vector";        -- pgvector for AI embeddings
```

## Installation

### PostGIS
```bash
# Ubuntu/Debian
sudo apt-get install postgresql-postgis

# Mac (Homebrew)
brew install postgis
```

### pgvector
```bash
# Clone and install
git clone https://github.com/pgvector/pgvector.git
cd pgvector
make
sudo make install
```

Or use Docker with pre-installed extensions:
```bash
docker run -d \
  --name plinqy-db \
  -e POSTGRES_PASSWORD=yourpassword \
  -p 5432:5432 \
  pgvector/pgvector:pg16
```

## Running Migrations

```bash
# Run all migrations
npm run migration:run

# Create new migration
npm run migration:create --name=add_new_feature
```

## Schema Overview

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
12. **search_index_queue** - Search indexing queue
13. **inventory_event** - Inventory change tracking
14. **store_webhook** - Webhook configurations
15. **feature_flag** - Feature toggles
16. **system_log** - System logs

## Key Features

### Geographic Search
Uses PostGIS for location-based queries:
```sql
SELECT * FROM store
WHERE ST_DWithin(
  location,
  ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
  5000  -- 5km radius
);
```

### AI-Powered Search
Uses pgvector for semantic search:
```sql
SELECT * FROM product_master
ORDER BY ai_vector <-> '[embedding_vector]'
LIMIT 10;
```

### Real-time Inventory
- `inventory_event` tracks all stock changes
- Background jobs process events
- Webhooks notify external systems

### POS Integration
Supports:
- Lightspeed
- Vend
- Erply
- Shopify POS
- CSV import
- Custom webhooks
