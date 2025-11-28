# Plinqy Database Schema Documentation

## Overview

This document describes the comprehensive database schema for the Plinqy multi-store local search platform with POS integration and real-time inventory synchronization.

## Database: PostgreSQL 14+

### Required Extensions

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";    -- UUID generation
CREATE EXTENSION IF NOT EXISTS "citext";        -- Case-insensitive text
CREATE EXTENSION IF NOT EXISTS "postgis";       -- Geographic/spatial data
CREATE EXTENSION IF NOT EXISTS "vector";        -- pgvector for AI embeddings
CREATE EXTENSION IF NOT EXISTS "pg_trgm";       -- Trigram matching for search
CREATE EXTENSION IF NOT EXISTS "pgcrypto";      -- Cryptographic functions
```

## Tables

### 1️⃣ app_user - User Management

Stores all system users with role-based access control.

```sql
CREATE TABLE app_user (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           CITEXT UNIQUE NOT NULL,
    password_hash   TEXT NOT NULL,
    full_name       TEXT,
    phone           TEXT,
    avatar_url      TEXT,
    role            TEXT CHECK (role IN ('admin', 'moderator', 'store_owner', 'store_assistant', 'customer')) NOT NULL DEFAULT 'customer',
    email_verified  BOOLEAN DEFAULT false,
    is_active       BOOLEAN DEFAULT true,
    last_login_at   TIMESTAMP,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMP DEFAULT now(),
    updated_at      TIMESTAMP DEFAULT now()
);
```

### 2️⃣ store - Store Management

Main stores table with location and business info.

```sql
CREATE TABLE store (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id                UUID REFERENCES app_user(id),
    name                    TEXT NOT NULL,
    slug                    CITEXT UNIQUE NOT NULL,
    description             TEXT,
    logo_url                TEXT,
    cover_image_url         TEXT,
    
    -- Location
    address                 TEXT,
    city                    TEXT,
    state_province          TEXT,
    country                 TEXT,
    postal_code             TEXT,
    latitude                DOUBLE PRECISION,
    longitude               DOUBLE PRECISION,
    location                GEOGRAPHY(Point,4326),
    
    -- Contact
    contact_info            JSONB DEFAULT '{}',
    phone                   TEXT,
    email                   CITEXT,
    website                 TEXT,
    
    -- Business info
    business_hours          JSONB,
    delivery_zones          GEOGRAPHY(Polygon,4326)[],
    delivery_available      BOOLEAN DEFAULT false,
    pickup_available        BOOLEAN DEFAULT true,
    
    -- Subscription & Status
    status                  TEXT CHECK (status IN ('pending','verified','suspended','inactive')) DEFAULT 'pending',
    subscription_tier       TEXT CHECK (subscription_tier IN ('free','basic','premium','enterprise')) DEFAULT 'free',
    subscription_expires_at TIMESTAMP,
    
    -- Settings
    currency                CHAR(3) DEFAULT 'USD',
    timezone                TEXT DEFAULT 'UTC',
    settings                JSONB DEFAULT '{}',
    
    -- Stats
    total_products          INTEGER DEFAULT 0,
    total_views             INTEGER DEFAULT 0,
    rating                  DECIMAL(3,2),
    review_count            INTEGER DEFAULT 0,
    
    is_active               BOOLEAN DEFAULT true,
    featured                BOOLEAN DEFAULT false,
    verified_at             TIMESTAMP,
    created_at              TIMESTAMP DEFAULT now(),
    updated_at              TIMESTAMP DEFAULT now()
);
```

### 3️⃣ product_master - Global Product Catalog

Optional global master for matching products across stores.

```sql
CREATE TABLE product_master (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    global_sku      TEXT UNIQUE,
    barcode         TEXT,
    title           TEXT NOT NULL,
    description     TEXT,
    manufacturer    TEXT,
    brand           TEXT,
    model           TEXT,
    
    -- AI enhanced data
    ai_summary      TEXT,
    ai_tags         TEXT[],
    ai_vector       VECTOR(1536),
    ai_category_suggestions TEXT[],
    
    -- Metadata
    verified        BOOLEAN DEFAULT false,
    created_at      TIMESTAMP DEFAULT now(),
    updated_at      TIMESTAMP DEFAULT now()
);
```

### 4️⃣ category - Category Hierarchy

Hierarchical category system.

```sql
CREATE TABLE category (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    slug            CITEXT UNIQUE NOT NULL,
    parent_id       UUID REFERENCES category(id),
    description     TEXT,
    icon_url        TEXT,
    display_order   INTEGER DEFAULT 0,
    is_active       BOOLEAN DEFAULT true,
    product_count   INTEGER DEFAULT 0,
    path            TEXT,
    level           INTEGER DEFAULT 0,
    created_at      TIMESTAMP DEFAULT now(),
    updated_at      TIMESTAMP DEFAULT now()
);
```

### 5️⃣ store_product - Store-Specific Products

The core product table for store listings.

```sql
CREATE TABLE store_product (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id                UUID REFERENCES store(id) ON DELETE CASCADE,
    product_master_id       UUID REFERENCES product_master(id),
    category_id             UUID REFERENCES category(id),
    
    -- Basic info
    name                    TEXT NOT NULL,
    description             TEXT,
    short_description       TEXT,
    sku                     TEXT,
    barcode                 TEXT,
    
    -- Pricing
    price_cents             INTEGER NOT NULL,
    compare_at_price_cents  INTEGER,
    cost_cents              INTEGER,
    currency                CHAR(3) DEFAULT 'USD',
    tax_rate                DECIMAL(5,2),
    
    -- Inventory
    quantity                INTEGER DEFAULT 0,
    track_inventory         BOOLEAN DEFAULT true,
    low_stock_threshold     INTEGER DEFAULT 10,
    availability_status     TEXT CHECK (availability_status IN ('in_stock','out_of_stock','low_stock','pre_order')) DEFAULT 'in_stock',
    
    -- Physical attributes
    weight_grams            INTEGER,
    dimensions              JSONB,
    
    -- Categorization
    brand                   TEXT,
    tags                    TEXT[],
    attributes              JSONB DEFAULT '{}',
    
    -- Search & AI
    embedding               VECTOR(384),
    search_text             TEXT GENERATED ALWAYS AS (
        name || ' ' || COALESCE(description, '') || ' ' || COALESCE(brand, '') || ' ' || COALESCE(array_to_string(tags, ' '), '')
    ) STORED,
    ai_enhanced_data        JSONB,
    
    -- External sync
    external_id             TEXT,
    sync_source             TEXT,
    last_synced_at          TIMESTAMP,
    
    -- Display
    is_featured             BOOLEAN DEFAULT false,
    is_visible              BOOLEAN DEFAULT true,
    display_order           INTEGER DEFAULT 0,
    
    -- Stats
    view_count              INTEGER DEFAULT 0,
    search_appearances      INTEGER DEFAULT 0,
    click_count             INTEGER DEFAULT 0,
    
    created_at              TIMESTAMP DEFAULT now(),
    updated_at              TIMESTAMP DEFAULT now()
);
```

### 6️⃣ product_variant - Product Variants

SKU-level variations (size, color, etc.).

```sql
CREATE TABLE product_variant (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_product_id    UUID REFERENCES store_product(id) ON DELETE CASCADE,
    variant_name        TEXT NOT NULL,
    variant_type        TEXT,
    sku                 TEXT,
    barcode             TEXT,
    price_cents         INTEGER,
    quantity            INTEGER DEFAULT 0,
    attributes          JSONB DEFAULT '{}',
    display_order       INTEGER DEFAULT 0,
    is_active           BOOLEAN DEFAULT true,
    created_at          TIMESTAMP DEFAULT now(),
    updated_at          TIMESTAMP DEFAULT now()
);
```

### 7️⃣ product_image - Product Images

```sql
CREATE TABLE product_image (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_product_id    UUID REFERENCES store_product(id) ON DELETE CASCADE,
    url                 TEXT NOT NULL,
    thumbnail_url       TEXT,
    alt_text            TEXT,
    position            INTEGER DEFAULT 0,
    is_primary          BOOLEAN DEFAULT false,
    width               INTEGER,
    height              INTEGER,
    file_size           INTEGER,
    created_at          TIMESTAMP DEFAULT now()
);
```

### 8️⃣ visitor_session & Analytics

Tracking for visitor sessions, search analytics, and product views.

- `visitor_session`: Tracks user sessions, device info, and location.
- `search_analytics`: Tracks search queries, filters, and results.
- `product_view`: Tracks product engagement.

### 9️⃣ Inventory & Sync Management

- `import_batch`: Tracks bulk imports.
- `imported_product_raw`: Staging area for raw import data.
- `pos_integration`: Configuration for external POS systems.
- `sync_event`: Logs for sync operations.
- `inventory_event`: Ledger for all inventory changes.

### 🔟 AI Processing

- `ai_task`: Queue for background AI jobs (categorization, embedding generation, etc.).

### 1️⃣1️⃣ Analytics Aggregations

- `category_analytics`
- `store_analytics`
- `geographic_analytics`
- `search_trends`
- `analytics_daily_summary`

### 1️⃣2️⃣ System & Config

- `notification`: User notifications.
- `system_settings`: Global configuration.
- `feature_flag`: Feature toggles.
- `rate_limit`: API rate limiting.
- `webhook_endpoint`: Store-specific webhooks.
- `system_log`: Application logs.

### 1️⃣3️⃣ Materialized Views

- `search_products`: Optimized view for fast product search.
- `popular_searches`: Aggregated search trends.
- `store_rankings`: Store performance metrics.

## Functions & Triggers

- `update_updated_at_column()`: Auto-updates `updated_at` timestamps.
- `calculate_distance()`: PostGIS helper.
- `get_nearby_stores()`: Spatial query helper.

## Initial Data

- Default categories (Electronics, Clothing, etc.)
- System settings (Search radius, AI provider)
- Feature flags (Voice search, AI recommendations)
