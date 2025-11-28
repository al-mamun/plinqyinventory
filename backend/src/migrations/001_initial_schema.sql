-- Migration: Initial Plinqy Database Schema
-- Description: Complete database schema for multi-store local search platform with POS integration

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "vector";

-- =============================================================================
-- 1️⃣ SYSTEM USERS & ROLES
-- =============================================================================
CREATE TABLE app_user (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           CITEXT UNIQUE NOT NULL,
    password_hash   TEXT NOT NULL,
    full_name       TEXT,
    role            TEXT CHECK (role IN ('admin', 'moderator', 'store_owner', 'store_assistant', 'customer')) NOT NULL,
    created_at      TIMESTAMP DEFAULT now(),
    updated_at      TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_app_user_email ON app_user(email);
CREATE INDEX idx_app_user_role ON app_user(role);

-- =============================================================================
-- 2️⃣ STORES
-- =============================================================================
CREATE TABLE store (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id        UUID REFERENCES app_user(id),
    name            TEXT NOT NULL,
    slug            CITEXT UNIQUE NOT NULL,
    description     TEXT,
    address         TEXT,
    latitude        DOUBLE PRECISION,
    longitude       DOUBLE PRECISION,
    location        GEOGRAPHY(Point,4326),
    contact_info    JSONB,
    status          TEXT CHECK (status IN ('pending','verified','suspended')) DEFAULT 'pending',
    settings        JSONB,
    created_at      TIMESTAMP DEFAULT now(),
    updated_at      TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_store_owner ON store(owner_id);
CREATE INDEX idx_store_slug ON store(slug);
CREATE INDEX idx_store_status ON store(status);
CREATE INDEX idx_store_location ON store USING GIST(location);

-- =============================================================================
-- 3️⃣ GLOBAL PRODUCT MASTER
-- =============================================================================
CREATE TABLE product_master (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    global_sku      TEXT UNIQUE,
    title           TEXT,
    description     TEXT,
    ai_summary      TEXT,
    ai_tags         TEXT[],
    ai_vector       VECTOR(1536),
    created_at      TIMESTAMP DEFAULT now(),
    updated_at      TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_product_master_sku ON product_master(global_sku);
CREATE INDEX idx_product_master_vector ON product_master USING ivfflat (ai_vector vector_cosine_ops);

-- =============================================================================
-- 4️⃣ CATEGORIES
-- =============================================================================
CREATE TABLE category (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    parent_id       UUID REFERENCES category(id),
    created_at      TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_category_parent ON category(parent_id);

-- =============================================================================
-- 5️⃣ STORE PRODUCTS
-- =============================================================================
CREATE TABLE store_product (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id            UUID REFERENCES store(id) ON DELETE CASCADE,
    product_master_id   UUID REFERENCES product_master(id),
    name                TEXT NOT NULL,
    description         TEXT,
    price_cents         INTEGER,
    currency            CHAR(3) DEFAULT 'USD',
    quantity            INTEGER DEFAULT 0,
    availability_status TEXT CHECK (availability_status IN ('in_stock','out_of_stock','low_stock')),
    category_id         UUID REFERENCES category(id),
    tags                TEXT[],
    barcode             TEXT,
    brand               TEXT,
    weight_grams        INTEGER,
    dimensions          JSONB,
    attributes          JSONB,
    ai_enhanced_data    JSONB,
    is_premium_featured BOOLEAN DEFAULT false,
    created_at          TIMESTAMP DEFAULT now(),
    updated_at          TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_store_product_store ON store_product(store_id);
CREATE INDEX idx_store_product_master ON store_product(product_master_id);
CREATE INDEX idx_store_product_category ON store_product(category_id);
CREATE INDEX idx_store_product_name ON store_product USING gin(to_tsvector('english', name));
CREATE INDEX idx_store_product_tags ON store_product USING gin(tags);
CREATE INDEX idx_store_product_barcode ON store_product(barcode);

-- =============================================================================
-- 6️⃣ PRODUCT VARIANTS
-- =============================================================================
CREATE TABLE product_variant (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_product_id UUID REFERENCES store_product(id) ON DELETE CASCADE,
    variant_name    TEXT,
    sku             TEXT,
    price_cents     INTEGER,
    stock           INTEGER,
    attributes      JSONB,
    created_at      TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_product_variant_product ON product_variant(store_product_id);
CREATE INDEX idx_product_variant_sku ON product_variant(sku);

-- =============================================================================
-- 7️⃣ PRODUCT IMAGES
-- =============================================================================
CREATE TABLE product_image (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_product_id  UUID REFERENCES store_product(id) ON DELETE CASCADE,
    url               TEXT NOT NULL,
    position          INTEGER DEFAULT 0,
    created_at        TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_product_image_product ON product_image(store_product_id);

-- =============================================================================
-- 8️⃣ IMPORT / WEBHOOK SYSTEM FOR EXTERNAL POS INTEGRATION
-- =============================================================================
CREATE TABLE import_batch (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id        UUID REFERENCES store(id),
    source_system   TEXT,
    status          TEXT CHECK (status IN ('pending','processing','completed','failed')),
    error_message   TEXT,
    created_at      TIMESTAMP DEFAULT now(),
    processed_at    TIMESTAMP
);

CREATE INDEX idx_import_batch_store ON import_batch(store_id);
CREATE INDEX idx_import_batch_status ON import_batch(status);

CREATE TABLE imported_product_raw (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    import_batch_id UUID REFERENCES import_batch(id),
    raw_data        JSONB NOT NULL,
    notes           JSONB,
    created_at      TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_imported_product_batch ON imported_product_raw(import_batch_id);

-- =============================================================================
-- 9️⃣ CHANGE HISTORY / AUDIT LOGS
-- =============================================================================
CREATE TABLE history_store_product (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_product_id    UUID REFERENCES store_product(id),
    snapshot            JSONB NOT NULL,
    changed_by          UUID REFERENCES app_user(id),
    changed_at          TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_history_product ON history_store_product(store_product_id);
CREATE INDEX idx_history_changed_at ON history_store_product(changed_at);

-- =============================================================================
-- 🔟 AI PROCESSES & SEARCH INDEXING
-- =============================================================================
CREATE TABLE ai_task (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_product_id  UUID REFERENCES store_product(id),
    type              TEXT,
    status            TEXT CHECK (status IN ('pending','processing','done','failed')),
    result            JSONB,
    created_at        TIMESTAMP DEFAULT now(),
    updated_at        TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_ai_task_product ON ai_task(store_product_id);
CREATE INDEX idx_ai_task_status ON ai_task(status);

CREATE TABLE search_index_queue (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_product_id  UUID REFERENCES store_product(id),
    operation         TEXT CHECK (operation IN ('insert','update','delete')),
    status            TEXT CHECK (status IN ('pending','processing','done','failed')),
    error_message     TEXT,
    created_at        TIMESTAMP DEFAULT now(),
    updated_at        TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_search_queue_status ON search_index_queue(status);
CREATE INDEX idx_search_queue_product ON search_index_queue(store_product_id);

-- =============================================================================
-- 1️⃣1️⃣ INVENTORY EVENTS
-- =============================================================================
CREATE TABLE inventory_event (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_product_id  UUID REFERENCES store_product(id),
    type              TEXT CHECK (type IN ('stock_in','stock_out','correction')),
    quantity_change   INTEGER,
    source            TEXT,
    raw_payload       JSONB,
    created_at        TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_inventory_event_product ON inventory_event(store_product_id);
CREATE INDEX idx_inventory_event_created ON inventory_event(created_at);

-- =============================================================================
-- 1️⃣2️⃣ WEBHOOK REGISTRATION
-- =============================================================================
CREATE TABLE store_webhook (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id        UUID REFERENCES store(id),
    url             TEXT NOT NULL,
    event_type      TEXT NOT NULL,
    secret_token    TEXT,
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_webhook_store ON store_webhook(store_id);
CREATE INDEX idx_webhook_active ON store_webhook(is_active);

-- =============================================================================
-- 1️⃣3️⃣ SETTINGS & FEATURE FLAGS
-- =============================================================================
CREATE TABLE feature_flag (
    key             TEXT PRIMARY KEY,
    value           JSONB,
    description     TEXT,
    updated_at      TIMESTAMP DEFAULT now()
);

-- =============================================================================
-- 1️⃣4️⃣ LOGS
-- =============================================================================
CREATE TABLE system_log (
    id              BIGSERIAL PRIMARY KEY,
    level           TEXT,
    message         TEXT,
    context         JSONB,
    created_at      TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_system_log_level ON system_log(level);
CREATE INDEX idx_system_log_created ON system_log(created_at);

-- =============================================================================
-- TRIGGERS FOR AUTO-UPDATING updated_at
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_app_user_updated_at BEFORE UPDATE ON app_user
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_store_updated_at BEFORE UPDATE ON store
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_master_updated_at BEFORE UPDATE ON product_master
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_store_product_updated_at BEFORE UPDATE ON store_product
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_task_updated_at BEFORE UPDATE ON ai_task
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_search_index_queue_updated_at BEFORE UPDATE ON search_index_queue
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- FUNCTION TO AUTO-UPDATE LOCATION GEOGRAPHY FROM LAT/LNG
-- =============================================================================
CREATE OR REPLACE FUNCTION update_store_location()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_store_location_trigger BEFORE INSERT OR UPDATE ON store
    FOR EACH ROW EXECUTE FUNCTION update_store_location();

-- =============================================================================
-- SEED DATA: Default Categories
-- =============================================================================
INSERT INTO category (name, parent_id) VALUES
('Electronics', NULL),
('Fashion', NULL),
('Books', NULL),
('Home & Garden', NULL),
('Sports & Outdoors', NULL),
('Food & Beverages', NULL),
('Health & Beauty', NULL),
('Toys & Games', NULL);

-- =============================================================================
-- SEED DATA: Feature Flags
-- =============================================================================
INSERT INTO feature_flag (key, value, description) VALUES
('ai_enhanced_search', '{"enabled": true}', 'Enable AI-powered search enhancements'),
('pos_integration', '{"enabled": true}', 'Enable POS system integrations'),
('premium_features', '{"enabled": true}', 'Enable premium store features'),
('realtime_inventory', '{"enabled": true}', 'Enable real-time inventory updates'),
('webhook_notifications', '{"enabled": true}', 'Enable webhook notifications');
