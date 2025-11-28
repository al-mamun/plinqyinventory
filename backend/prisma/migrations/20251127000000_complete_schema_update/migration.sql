-- Drop existing tables from old schema to ensure clean slate
DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS "Store" CASCADE;
DROP TABLE IF EXISTS "Product" CASCADE;
DROP TABLE IF EXISTS "SystemSettings" CASCADE;
DROP TABLE IF EXISTS "QueryCache" CASCADE;
DROP TABLE IF EXISTS "RefreshToken" CASCADE;
DROP TABLE IF EXISTS "_UserAssignments" CASCADE;

-- =====================================================
-- PLINQY COMPLETE DATABASE SCHEMA
-- Version: 1.0.0
-- Description: Complete database structure for AI-powered local product search
-- =====================================================

-- =====================================================
-- EXTENSIONS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "citext";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- SECTION 1: USER MANAGEMENT & AUTHENTICATION
-- =====================================================

-- Users table for all system users
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

CREATE INDEX idx_app_user_email ON app_user(email);
CREATE INDEX idx_app_user_role ON app_user(role);

-- =====================================================
-- SECTION 2: STORE MANAGEMENT
-- =====================================================

-- Main stores table
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
    business_hours          JSONB, -- {"mon": {"open": "09:00", "close": "18:00"}}
    delivery_zones          GEOGRAPHY(Polygon,4326)[],
    delivery_available      BOOLEAN DEFAULT false,
    pickup_available        BOOLEAN DEFAULT true,
    
    -- Subscription & Status
    status                  TEXT CHECK (status IN ('pending','verified','suspended','inactive')) DEFAULT 'pending',
    subscription_tier       TEXT CHECK (subscription_tier IN ('free','basic','premium','enterprise')) DEFAULT 'free',
    subscription_expires_at TIMESTAMP,
    max_products            INTEGER DEFAULT 100,
    max_images_per_product  INTEGER DEFAULT 5,
    
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

CREATE INDEX idx_store_owner ON store(owner_id);
CREATE INDEX idx_store_slug ON store(slug);
CREATE INDEX idx_store_location ON store USING gist(location);
CREATE INDEX idx_store_status ON store(status) WHERE status = 'verified';
CREATE INDEX idx_store_active ON store(is_active) WHERE is_active = true;

-- Store staff management
CREATE TABLE store_staff (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id        UUID REFERENCES store(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES app_user(id) ON DELETE CASCADE,
    role            TEXT CHECK (role IN ('manager', 'assistant', 'viewer')) DEFAULT 'assistant',
    permissions     JSONB DEFAULT '{}',
    added_by        UUID REFERENCES app_user(id),
    created_at      TIMESTAMP DEFAULT now(),
    updated_at      TIMESTAMP DEFAULT now(),
    UNIQUE(store_id, user_id)
);

CREATE INDEX idx_store_staff_store ON store_staff(store_id);
CREATE INDEX idx_store_staff_user ON store_staff(user_id);

-- =====================================================
-- SECTION 3: PRODUCT MANAGEMENT
-- =====================================================

-- Global product master (optional - for matching products across stores)
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

CREATE INDEX idx_product_master_sku ON product_master(global_sku);
CREATE INDEX idx_product_master_barcode ON product_master(barcode);

-- Category hierarchy
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
    path            TEXT, -- 'Electronics/Phones/Smartphones'
    level           INTEGER DEFAULT 0,
    created_at      TIMESTAMP DEFAULT now(),
    updated_at      TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_category_parent ON category(parent_id);
CREATE INDEX idx_category_slug ON category(slug);
CREATE INDEX idx_category_active ON category(is_active) WHERE is_active = true;

-- Store-specific products
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
    dimensions              JSONB, -- {length, width, height, unit}
    
    -- Categorization
    brand                   TEXT,
    tags                    TEXT[],
    attributes              JSONB DEFAULT '{}', -- Custom key-value pairs
    
    -- Search & AI
    embedding               VECTOR(384),
    search_text             TEXT,
    ai_enhanced_data        JSONB,
    
    -- External sync
    external_id             TEXT, -- ID from POS system
    sync_source             TEXT, -- 'manual', 'api', 'csv', 'webhook'
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

CREATE INDEX idx_store_product_store ON store_product(store_id);
CREATE INDEX idx_store_product_category ON store_product(category_id);
CREATE INDEX idx_store_product_sku ON store_product(store_id, sku);
CREATE INDEX idx_store_product_barcode ON store_product(barcode);
CREATE INDEX idx_store_product_quantity ON store_product(quantity) WHERE quantity > 0;
CREATE INDEX idx_store_product_search ON store_product USING gin(to_tsvector('english', search_text));
CREATE INDEX idx_store_product_embedding ON store_product USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_store_product_visible ON store_product(is_visible) WHERE is_visible = true;

-- Product variants (sizes, colors, etc.)
CREATE TABLE product_variant (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_product_id    UUID REFERENCES store_product(id) ON DELETE CASCADE,
    variant_name        TEXT NOT NULL,
    variant_type        TEXT, -- 'size', 'color', 'material', etc.
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

CREATE INDEX idx_product_variant_product ON product_variant(store_product_id);
CREATE INDEX idx_product_variant_sku ON product_variant(sku);

-- Product images
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

CREATE INDEX idx_product_image_product ON product_image(store_product_id);

-- =====================================================
-- SECTION 4: VISITOR & SEARCH ANALYTICS
-- =====================================================

-- Visitor sessions tracking
CREATE TABLE visitor_session (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visitor_id      TEXT NOT NULL, -- Anonymous ID from cookie/fingerprint
    user_id         UUID REFERENCES app_user(id),
    
    -- Device & Browser
    ip_address      INET,
    user_agent      TEXT,
    device_type     TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet', 'unknown')),
    device_model    TEXT,
    browser         TEXT,
    browser_version TEXT,
    os              TEXT,
    os_version      TEXT,
    
    -- Location
    country         TEXT,
    country_code    CHAR(2),
    region          TEXT,
    city            TEXT,
    postal_code     TEXT,
    timezone        TEXT,
    location        GEOGRAPHY(Point,4326),
    
    -- Traffic source
    referrer_url    TEXT,
    referrer_domain TEXT,
    utm_source      TEXT,
    utm_medium      TEXT,
    utm_campaign    TEXT,
    utm_term        TEXT,
    utm_content     TEXT,
    landing_page    TEXT,
    
    -- Session metrics
    session_start   TIMESTAMP DEFAULT now(),
    session_end     TIMESTAMP,
    duration_seconds INTEGER,
    page_views      INTEGER DEFAULT 0,
    searches_made   INTEGER DEFAULT 0,
    products_viewed INTEGER DEFAULT 0,
    bounce          BOOLEAN DEFAULT false,
    
    created_at      TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_visitor_session_visitor ON visitor_session(visitor_id);
CREATE INDEX idx_visitor_session_user ON visitor_session(user_id);
CREATE INDEX idx_visitor_session_date ON visitor_session(created_at);
CREATE INDEX idx_visitor_session_location ON visitor_session USING gist(location);

-- Search queries tracking
CREATE TABLE search_analytics (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id          UUID REFERENCES visitor_session(id),
    visitor_id          TEXT NOT NULL,
    user_id             UUID REFERENCES app_user(id),
    
    -- Query details
    query_text          TEXT NOT NULL,
    query_normalized    TEXT,
    query_vector        VECTOR(384),
    query_language      TEXT,
    search_type         TEXT CHECK (search_type IN ('text', 'voice', 'category', 'filter', 'barcode')),
    
    -- Location context
    search_location     GEOGRAPHY(Point,4326),
    search_radius_km    INTEGER,
    user_city           TEXT,
    user_country        TEXT,
    
    -- Filters applied
    filters             JSONB, -- {category, price_range, brand, etc}
    sort_by             TEXT,
    
    -- Results
    results_count       INTEGER DEFAULT 0,
    results_returned    INTEGER DEFAULT 0,
    results_clicked     INTEGER DEFAULT 0,
    first_result_clicked_position INTEGER,
    
    -- Performance
    response_time_ms    INTEGER,
    used_cache          BOOLEAN DEFAULT false,
    used_ai             BOOLEAN DEFAULT true,
    
    -- Context
    device_type         TEXT,
    search_page         TEXT, -- 'homepage', 'search_results', 'category'
    is_refined_search   BOOLEAN DEFAULT false,
    previous_search_id  UUID REFERENCES search_analytics(id),
    
    created_at          TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_search_analytics_visitor ON search_analytics(visitor_id);
CREATE INDEX idx_search_analytics_query ON search_analytics USING gin(to_tsvector('english', query_text));
CREATE INDEX idx_search_analytics_date ON search_analytics(created_at);
CREATE INDEX idx_search_analytics_location ON search_analytics USING gist(search_location);

-- Product view tracking
CREATE TABLE product_view (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id          UUID REFERENCES visitor_session(id),
    search_id           UUID REFERENCES search_analytics(id),
    visitor_id          TEXT NOT NULL,
    user_id             UUID REFERENCES app_user(id),
    
    -- Product info
    store_product_id    UUID REFERENCES store_product(id),
    store_id            UUID REFERENCES store(id),
    
    -- Context
    view_source         TEXT CHECK (view_source IN ('search', 'direct', 'category', 'recommendation', 'external')),
    position_in_results INTEGER,
    
    -- Engagement
    view_duration_seconds INTEGER,
    interaction_type    TEXT[], -- ['image_view', 'description_expand', 'variant_select']
    clicked_store_info  BOOLEAN DEFAULT false,
    clicked_directions  BOOLEAN DEFAULT false,
    clicked_contact     BOOLEAN DEFAULT false,
    
    -- Location
    viewer_location     GEOGRAPHY(Point,4326),
    distance_to_store_km FLOAT,
    
    created_at          TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_product_view_product ON product_view(store_product_id);
CREATE INDEX idx_product_view_store ON product_view(store_id);
CREATE INDEX idx_product_view_session ON product_view(session_id);
CREATE INDEX idx_product_view_date ON product_view(created_at);

-- =====================================================
-- SECTION 5: SEARCH OPTIMIZATION
-- =====================================================

-- Query cache for performance
CREATE TABLE query_cache (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_hash      TEXT UNIQUE NOT NULL,
    query_text      TEXT NOT NULL,
    query_normalized TEXT,
    embedding       VECTOR(384),
    results         JSONB,
    result_count    INTEGER,
    cache_hit_count INTEGER DEFAULT 0,
    expires_at      TIMESTAMP,
    created_at      TIMESTAMP DEFAULT now(),
    updated_at      TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_query_cache_hash ON query_cache(query_hash);
CREATE INDEX idx_query_cache_expires ON query_cache(expires_at);

-- Search keywords extraction and tracking
CREATE TABLE search_keywords (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    keyword             CITEXT NOT NULL UNIQUE,
    keyword_type        TEXT CHECK (keyword_type IN ('product', 'brand', 'category', 'attribute', 'location', 'unknown')),
    
    -- Statistics
    search_count        INTEGER DEFAULT 0,
    unique_searchers    INTEGER DEFAULT 0,
    avg_results_count   FLOAT,
    click_through_rate  FLOAT,
    conversion_rate     FLOAT,
    
    -- Associations
    related_keywords    TEXT[],
    related_categories  UUID[],
    related_products    UUID[],
    
    -- AI analysis
    sentiment           TEXT CHECK (sentiment IN ('positive', 'negative', 'neutral')),
    intent              TEXT CHECK (intent IN ('buy', 'research', 'compare', 'locate')),
    
    last_searched       TIMESTAMP,
    trending_score      FLOAT DEFAULT 0,
    created_at          TIMESTAMP DEFAULT now(),
    updated_at          TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_search_keywords_keyword ON search_keywords(keyword);
CREATE INDEX idx_search_keywords_trending ON search_keywords(trending_score DESC);

-- Search suggestions
CREATE TABLE search_suggestions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    suggestion      TEXT NOT NULL UNIQUE,
    display_text    TEXT,
    suggestion_type TEXT CHECK (suggestion_type IN ('popular', 'trending', 'personalized', 'promotional')),
    score           FLOAT DEFAULT 0,
    click_count     INTEGER DEFAULT 0,
    is_active       BOOLEAN DEFAULT true,
    metadata        JSONB,
    created_at      TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_search_suggestions_suggestion ON search_suggestions USING gin(to_tsvector('english', suggestion));

-- =====================================================
-- SECTION 6: INVENTORY & SYNC MANAGEMENT
-- =====================================================

-- Import batches for external data
CREATE TABLE import_batch (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id        UUID REFERENCES store(id),
    import_type     TEXT CHECK (import_type IN ('full', 'incremental', 'update')),
    source_system   TEXT, -- 'lightspeed', 'square', 'shopify', 'csv', 'api'
    file_url        TEXT,
    
    -- Status
    status          TEXT CHECK (status IN ('pending','processing','completed','failed')) DEFAULT 'pending',
    total_records   INTEGER,
    processed_records INTEGER DEFAULT 0,
    success_count   INTEGER DEFAULT 0,
    error_count     INTEGER DEFAULT 0,
    error_details   JSONB,
    
    -- Timing
    started_at      TIMESTAMP,
    completed_at    TIMESTAMP,
    created_by      UUID REFERENCES app_user(id),
    created_at      TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_import_batch_store ON import_batch(store_id);
CREATE INDEX idx_import_batch_status ON import_batch(status);

-- Raw imported data
CREATE TABLE imported_product_raw (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    import_batch_id UUID REFERENCES import_batch(id),
    external_id     TEXT,
    raw_data        JSONB NOT NULL,
    processed       BOOLEAN DEFAULT false,
    error_message   TEXT,
    created_at      TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_imported_product_batch ON imported_product_raw(import_batch_id);

-- POS Integration Configuration
CREATE TABLE pos_integration (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id        UUID REFERENCES store(id),
    provider        TEXT NOT NULL, -- 'lightspeed', 'square', 'shopify_pos', etc
    
    -- Credentials (encrypted in application)
    api_endpoint    TEXT,
    api_credentials JSONB, -- Encrypted
    webhook_secret  TEXT,
    
    -- Configuration
    sync_enabled    BOOLEAN DEFAULT true,
    sync_frequency  INTEGER DEFAULT 300, -- seconds
    sync_inventory  BOOLEAN DEFAULT true,
    sync_products   BOOLEAN DEFAULT true,
    sync_categories BOOLEAN DEFAULT true,
    
    -- Mapping
    field_mapping   JSONB, -- How to map external fields to our schema
    category_mapping JSONB,
    
    -- Status
    last_sync_at    TIMESTAMP,
    last_error      TEXT,
    total_syncs     INTEGER DEFAULT 0,
    
    created_at      TIMESTAMP DEFAULT now(),
    updated_at      TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_pos_integration_store ON pos_integration(store_id);

-- Sync events log
CREATE TABLE sync_event (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_id  UUID REFERENCES pos_integration(id),
    sync_type       TEXT CHECK (sync_type IN ('manual', 'scheduled', 'webhook', 'realtime')),
    status          TEXT CHECK (status IN ('started', 'completed', 'failed')),
    
    -- Metrics
    items_processed INTEGER DEFAULT 0,
    items_created   INTEGER DEFAULT 0,
    items_updated   INTEGER DEFAULT 0,
    items_deleted   INTEGER DEFAULT 0,
    
    -- Details
    error_details   JSONB,
    duration_ms     INTEGER,
    
    started_at      TIMESTAMP DEFAULT now(),
    completed_at    TIMESTAMP
);

CREATE INDEX idx_sync_event_integration ON sync_event(integration_id);
CREATE INDEX idx_sync_event_date ON sync_event(started_at);

-- Inventory events tracking
CREATE TABLE inventory_event (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_product_id    UUID REFERENCES store_product(id),
    event_type          TEXT CHECK (event_type IN ('stock_in', 'stock_out', 'adjustment', 'sale', 'return', 'damage', 'loss')),
    quantity_before     INTEGER,
    quantity_change     INTEGER,
    quantity_after      INTEGER,
    
    -- Source
    source              TEXT, -- 'manual', 'api', 'webhook', 'pos_sync'
    source_reference    TEXT, -- Order ID, adjustment ID, etc
    
    -- Context
    reason              TEXT,
    notes               TEXT,
    performed_by        UUID REFERENCES app_user(id),
    
    created_at          TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_inventory_event_product ON inventory_event(store_product_id);
CREATE INDEX idx_inventory_event_date ON inventory_event(created_at);

-- =====================================================
-- SECTION 7: AI PROCESSING
-- =====================================================

-- AI processing tasks
CREATE TABLE ai_task (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_type           TEXT CHECK (task_type IN ('categorize', 'generate_description', 'extract_attributes', 'generate_tags', 'generate_embedding', 'image_recognition')),
    
    -- Target
    entity_type         TEXT, -- 'product', 'store', 'category'
    entity_id           UUID,
    
    -- Status
    status              TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
    priority            INTEGER DEFAULT 5,
    retry_count         INTEGER DEFAULT 0,
    
    -- Data
    input_data          JSONB,
    output_data         JSONB,
    error_message       TEXT,
    
    -- Timing
    processing_time_ms  INTEGER,
    scheduled_for       TIMESTAMP,
    started_at          TIMESTAMP,
    completed_at        TIMESTAMP,
    created_at          TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_ai_task_status ON ai_task(status) WHERE status IN ('pending', 'processing');
CREATE INDEX idx_ai_task_entity ON ai_task(entity_type, entity_id);

-- =====================================================
-- SECTION 8: ANALYTICS AGGREGATIONS
-- =====================================================

-- Category analytics
CREATE TABLE category_analytics (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date            DATE NOT NULL,
    category_id     UUID REFERENCES category(id),
    
    -- Metrics
    search_count    INTEGER DEFAULT 0,
    view_count      INTEGER DEFAULT 0,
    click_count     INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    
    -- Geographic
    top_cities      JSONB,
    top_countries   JSONB,
    
    -- Time distribution
    hourly_distribution JSONB,
    
    created_at      TIMESTAMP DEFAULT now(),
    UNIQUE(date, category_id)
);

CREATE INDEX idx_category_analytics_date ON category_analytics(date);
CREATE INDEX idx_category_analytics_category ON category_analytics(category_id);

-- Store analytics
CREATE TABLE store_analytics (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id            UUID REFERENCES store(id),
    date                DATE NOT NULL,
    
    -- Visibility
    search_appearances  INTEGER DEFAULT 0,
    listing_views       INTEGER DEFAULT 0,
    profile_views       INTEGER DEFAULT 0,
    
    -- Engagement
    product_views       INTEGER DEFAULT 0,
    direction_clicks    INTEGER DEFAULT 0,
    contact_clicks      INTEGER DEFAULT 0,
    website_clicks      INTEGER DEFAULT 0,
    
    -- Performance
    avg_position        FLOAT,
    click_through_rate  FLOAT,
    
    -- Visitors
    unique_visitors     INTEGER DEFAULT 0,
    returning_visitors  INTEGER DEFAULT 0,
    
    created_at          TIMESTAMP DEFAULT now(),
    UNIQUE(store_id, date)
);

CREATE INDEX idx_store_analytics_store ON store_analytics(store_id);
CREATE INDEX idx_store_analytics_date ON store_analytics(date);

-- Geographic analytics
CREATE TABLE geographic_analytics (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date            DATE NOT NULL,
    geohash         TEXT NOT NULL, -- Geohash for grid aggregation
    location        GEOGRAPHY(Point,4326),
    city            TEXT,
    region          TEXT,
    country         TEXT,
    
    -- Metrics
    total_searches  INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    avg_search_radius FLOAT,
    
    -- Popular items
    top_categories  JSONB,
    top_products    JSONB,
    top_keywords    JSONB,
    
    created_at      TIMESTAMP DEFAULT now(),
    UNIQUE(date, geohash)
);

CREATE INDEX idx_geographic_analytics_location ON geographic_analytics USING gist(location);
CREATE INDEX idx_geographic_analytics_date ON geographic_analytics(date);

-- Search trends
CREATE TABLE search_trends (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    period_type         TEXT CHECK (period_type IN ('hour', 'day', 'week', 'month')),
    period_start        TIMESTAMP NOT NULL,
    period_end          TIMESTAMP NOT NULL,
    
    -- Trending data
    trending_keywords   JSONB,
    rising_keywords     JSONB,
    declining_keywords  JSONB,
    new_keywords        JSONB,
    
    -- Categories
    trending_categories JSONB,
    
    -- Products
    trending_products   JSONB,
    
    -- Geographic
    trending_locations  JSONB,
    
    created_at          TIMESTAMP DEFAULT now(),
    UNIQUE(period_type, period_start)
);

CREATE INDEX idx_search_trends_period ON search_trends(period_type, period_start);

-- Daily summary
CREATE TABLE analytics_daily_summary (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date            DATE NOT NULL UNIQUE,
    
    -- Users
    total_visitors      INTEGER,
    unique_visitors     INTEGER,
    returning_visitors  INTEGER,
    new_visitors        INTEGER,
    
    -- Sessions
    total_sessions      INTEGER,
    avg_session_duration INTEGER,
    bounce_rate         FLOAT,
    pages_per_session   FLOAT,
    
    -- Searches
    total_searches      INTEGER,
    unique_queries      INTEGER,
    searches_per_visitor FLOAT,
    zero_result_searches INTEGER,
    
    -- Products
    products_viewed     INTEGER,
    unique_products_viewed INTEGER,
    
    -- Performance
    avg_search_response_time_ms INTEGER,
    cache_hit_rate      FLOAT,
    ai_usage_rate       FLOAT,
    
    -- Geographic
    countries_count     INTEGER,
    cities_count        INTEGER,
    top_locations       JSONB,
    
    -- Technology
    device_breakdown    JSONB,
    browser_breakdown   JSONB,
    os_breakdown        JSONB,
    
    created_at          TIMESTAMP DEFAULT now()
);

-- =====================================================
-- SECTION 9: NOTIFICATIONS & COMMUNICATIONS
-- =====================================================

-- User notifications
CREATE TABLE notification (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES app_user(id),
    type            TEXT CHECK (type IN ('info', 'success', 'warning', 'error', 'promotional')),
    category        TEXT, -- 'inventory', 'order', 'system', etc
    
    -- Content
    title           TEXT NOT NULL,
    message         TEXT,
    action_url      TEXT,
    icon            TEXT,
    
    -- Status
    is_read         BOOLEAN DEFAULT false,
    is_archived     BOOLEAN DEFAULT false,
    read_at         TIMESTAMP,
    
    -- Metadata
    data            JSONB,
    expires_at      TIMESTAMP,
    
    created_at      TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_notification_user ON notification(user_id);
CREATE INDEX idx_notification_unread ON notification(user_id, is_read) WHERE is_read = false;

-- =====================================================
-- SECTION 10: SYSTEM CONFIGURATION
-- =====================================================

-- System settings
CREATE TABLE system_settings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key             TEXT UNIQUE NOT NULL,
    value           TEXT,
    value_type      TEXT CHECK (value_type IN ('string', 'number', 'boolean', 'json')),
    category        TEXT,
    description     TEXT,
    is_public       BOOLEAN DEFAULT false,
    updated_by      UUID REFERENCES app_user(id),
    updated_at      TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_system_settings_key ON system_settings(key);

-- Feature flags
CREATE TABLE feature_flag (
    key             TEXT PRIMARY KEY,
    enabled         BOOLEAN DEFAULT false,
    rollout_percentage INTEGER DEFAULT 0,
    target_users    UUID[],
    target_roles    TEXT[],
    metadata        JSONB,
    description     TEXT,
    updated_at      TIMESTAMP DEFAULT now()
);

-- API rate limiting
CREATE TABLE rate_limit (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier      TEXT NOT NULL, -- IP or user_id
    endpoint        TEXT NOT NULL,
    window_start    TIMESTAMP NOT NULL,
    request_count   INTEGER DEFAULT 1,
    created_at      TIMESTAMP DEFAULT now(),
    UNIQUE(identifier, endpoint, window_start)
);

CREATE INDEX idx_rate_limit_identifier ON rate_limit(identifier, window_start);

-- Webhooks
CREATE TABLE webhook_endpoint (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id        UUID REFERENCES store(id),
    url             TEXT NOT NULL,
    events          TEXT[], -- ['product.created', 'inventory.updated']
    secret          TEXT,
    is_active       BOOLEAN DEFAULT true,
    
    -- Stats
    total_deliveries INTEGER DEFAULT 0,
    failed_deliveries INTEGER DEFAULT 0,
    last_delivery_at TIMESTAMP,
    
    created_at      TIMESTAMP DEFAULT now(),
    updated_at      TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_webhook_endpoint_store ON webhook_endpoint(store_id);

-- System logs
CREATE TABLE system_log (
    id              BIGSERIAL PRIMARY KEY,
    level           TEXT CHECK (level IN ('debug', 'info', 'warn', 'error', 'critical')),
    category        TEXT,
    message         TEXT,
    context         JSONB,
    user_id         UUID REFERENCES app_user(id),
    ip_address      INET,
    user_agent      TEXT,
    created_at      TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_system_log_level ON system_log(level);
CREATE INDEX idx_system_log_date ON system_log(created_at);

-- =====================================================
-- SECTION 11: MATERIALIZED VIEWS FOR PERFORMANCE
-- =====================================================

-- Fast product search view
CREATE MATERIALIZED VIEW search_products AS
SELECT 
    sp.id,
    sp.store_id,
    sp.name,
    sp.description,
    sp.price_cents,
    sp.quantity,
    sp.embedding,
    sp.tags,
    sp.brand,
    sp.category_id,
    c.name as category_name,
    c.path as category_path,
    s.name as store_name,
    s.location,
    s.city,
    s.status as store_status,
    s.rating as store_rating
FROM store_product sp
JOIN store s ON s.id = sp.store_id
LEFT JOIN category c ON c.id = sp.category_id
WHERE s.status = 'verified' 
    AND s.is_active = true
    AND sp.is_visible = true
    AND sp.quantity > 0;

CREATE INDEX idx_search_products_embedding ON search_products USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_search_products_location ON search_products USING gist(location);
CREATE INDEX idx_search_products_category ON search_products(category_id);

-- Popular searches
CREATE MATERIALIZED VIEW popular_searches AS
SELECT 
    query_normalized,
    COUNT(*) as search_count,
    COUNT(DISTINCT visitor_id) as unique_searchers,
    AVG(results_count) as avg_results,
    MAX(created_at) as last_searched
FROM search_analytics
WHERE created_at > now() - INTERVAL '30 days'
GROUP BY query_normalized
ORDER BY search_count DESC
LIMIT 1000;

-- Store rankings
CREATE MATERIALIZED VIEW store_rankings AS
SELECT 
    s.id,
    s.name,
    s.location,
    COUNT(DISTINCT p.id) as product_count,
    AVG(sa.search_appearances) as avg_search_appearances,
    AVG(sa.click_through_rate) as avg_ctr,
    s.rating,
    s.review_count
FROM store s
LEFT JOIN store_product p ON p.store_id = s.id
LEFT JOIN store_analytics sa ON sa.store_id = s.id
WHERE s.status = 'verified' AND s.is_active = true
GROUP BY s.id;

-- =====================================================
-- SECTION 12: FUNCTIONS AND TRIGGERS
-- =====================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to update search_text for store_product
CREATE OR REPLACE FUNCTION update_store_product_search_text()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_text = NEW.name || ' ' || COALESCE(NEW.description, '') || ' ' || COALESCE(NEW.brand, '') || ' ' || COALESCE(array_to_string(NEW.tags, ' '), '');
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update trigger to all tables with updated_at
CREATE TRIGGER update_app_user_updated_at BEFORE UPDATE ON app_user FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_store_updated_at BEFORE UPDATE ON store FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_store_product_updated_at BEFORE UPDATE ON store_product FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply search_text trigger to store_product
CREATE TRIGGER update_store_product_search_text_trigger BEFORE INSERT OR UPDATE ON store_product FOR EACH ROW EXECUTE FUNCTION update_store_product_search_text();

-- Function to calculate distance between two points
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 FLOAT, lon1 FLOAT,
    lat2 FLOAT, lon2 FLOAT
) RETURNS FLOAT AS $$
BEGIN
    RETURN ST_Distance(
        ST_MakePoint(lon1, lat1)::geography,
        ST_MakePoint(lon2, lat2)::geography
    ) / 1000; -- Return in kilometers
END;
$$ LANGUAGE plpgsql;

-- Function to get nearby stores
CREATE OR REPLACE FUNCTION get_nearby_stores(
    user_lat FLOAT,
    user_lon FLOAT,
    radius_km FLOAT
) RETURNS TABLE (
    store_id UUID,
    store_name TEXT,
    distance_km FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.name,
        calculate_distance(user_lat, user_lon, s.latitude, s.longitude) as distance
    FROM store s
    WHERE s.status = 'verified'
        AND s.is_active = true
        AND ST_DWithin(
            s.location,
            ST_MakePoint(user_lon, user_lat)::geography,
            radius_km * 1000
        )
    ORDER BY distance;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SECTION 13: INITIAL DATA SEEDING
-- =====================================================

-- Insert default categories
INSERT INTO category (name, slug, parent_id, display_order) VALUES
('Electronics', 'electronics', NULL, 1),
('Clothing', 'clothing', NULL, 2),
('Food & Beverages', 'food-beverages', NULL, 3),
('Home & Garden', 'home-garden', NULL, 4),
('Sports & Outdoors', 'sports-outdoors', NULL, 5);

-- Insert system settings
INSERT INTO system_settings (key, value, value_type, category) VALUES
('search.default_radius_km', '10', 'number', 'search'),
('search.max_results', '100', 'number', 'search'),
('search.cache_ttl_seconds', '3600', 'number', 'search'),
('ai.provider', 'openai', 'string', 'ai'),
('ai.model', 'gpt-4', 'string', 'ai');

-- Insert feature flags
INSERT INTO feature_flag (key, enabled, description) VALUES
('voice_search', true, 'Enable voice search functionality'),
('ai_recommendations', true, 'Enable AI-powered product recommendations'),
('real_time_inventory', true, 'Enable real-time inventory updates');

-- =====================================================
-- PERMISSIONS (Optional - for Row Level Security)
-- =====================================================

-- Enable RLS on sensitive tables
ALTER TABLE app_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE store ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_product ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- END OF SCHEMA
-- =====================================================
