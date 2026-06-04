-- Remove cake-specific fields from orders; these move to order_custom_items
ALTER TABLE orders
    DROP COLUMN flavor,
    DROP COLUMN filling,
    DROP COLUMN buttercream,
    DROP COLUMN serving_count;

-- Add is_active to existing option tables so the baker can soft-delete
-- entries that are still referenced by historical orders
ALTER TABLE flavor_options      ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE filling_options     ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE buttercream_options ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE;

-- Expand flavor_options to cover all item types.
-- Drop the name-only unique constraint first; the new one is (name, item_type)
-- so the same name (e.g. "Chocolate") can exist for multiple item types.
ALTER TABLE flavor_options ADD COLUMN item_type TEXT NOT NULL DEFAULT 'CAKE';
ALTER TABLE flavor_options DROP CONSTRAINT flavor_options_name_key;
ALTER TABLE flavor_options ADD CONSTRAINT flavor_options_name_item_type_key UNIQUE (name, item_type);

-- ── New option tables ──────────────────────────────────────────────────────

CREATE TABLE pie_style_options (
    id        BIGSERIAL PRIMARY KEY,
    pie_type  TEXT    NOT NULL,   -- 'CLASSIC' or 'CUSTARD'
    name      TEXT    NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (pie_type, name)
);

CREATE TABLE cheesecake_crust_options (
    id          BIGSERIAL PRIMARY KEY,
    name        TEXT    NOT NULL UNIQUE,
    gluten_free BOOLEAN NOT NULL DEFAULT FALSE,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE
);

-- Sizes carry pricing; soft-delete via is_active preserves references from
-- existing orders. Cake prices are 0.00 placeholders until pricing is set.
CREATE TABLE sizes (
    id          BIGSERIAL PRIMARY KEY,
    item_type   TEXT          NOT NULL,  -- 'CAKE', 'CHEESECAKE', 'PIE_CLASSIC', 'PIE_CUSTARD', 'MACARON', 'SURPRISE_ME'
    label       TEXT          NOT NULL,
    description TEXT,
    price       DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    is_active   BOOLEAN       NOT NULL DEFAULT TRUE,
    UNIQUE (item_type, label)
);

-- Fixed items (no customisation); baker toggles availability via is_active
CREATE TABLE fixed_products (
    id               BIGSERIAL PRIMARY KEY,
    name             TEXT          NOT NULL UNIQUE,
    description      TEXT,
    price            DECIMAL(10,2) NOT NULL,
    unit_description TEXT,           -- e.g. 'per roll', '4 per order'
    is_active        BOOLEAN       NOT NULL DEFAULT TRUE
);

-- ── Core order structure ───────────────────────────────────────────────────

-- One row per customisable item in an order (cake, pie, cheesecake, macaron,
-- surprise me). Nullable FKs cover the different option sets per item type;
-- application logic enforces which fields are required for each type.
CREATE TABLE order_custom_items (
    id          BIGSERIAL PRIMARY KEY,
    order_id    BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    item_type   TEXT   NOT NULL,  -- 'CAKE', 'PIE_CLASSIC', 'PIE_CUSTARD', 'CHEESECAKE', 'MACARON', 'SURPRISE_ME'

    size_id     BIGINT REFERENCES sizes(id),
    quantity    INT    NOT NULL DEFAULT 1,

    -- Shared flavor FK; macaron uses both flavor_id and flavor_2_id
    flavor_id   BIGINT REFERENCES flavor_options(id),
    flavor_2_id BIGINT REFERENCES flavor_options(id),  -- second macaron flavor

    -- Cake / Surprise Me
    filling_id       BIGINT REFERENCES filling_options(id),
    buttercream_id   BIGINT REFERENCES buttercream_options(id),
    color_preference TEXT,   -- Surprise Me only

    -- Pie
    pie_style_id BIGINT  REFERENCES pie_style_options(id),
    gluten_free  BOOLEAN NOT NULL DEFAULT FALSE,  -- Key Lime custard pie option

    -- Cheesecake
    cheesecake_crust_id BIGINT REFERENCES cheesecake_crust_options(id),

    comments   TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inspiration photos per item (replaces order-level order_photo_urls for new orders)
CREATE TABLE order_item_photos (
    id                   BIGSERIAL PRIMARY KEY,
    order_custom_item_id BIGINT NOT NULL REFERENCES order_custom_items(id) ON DELETE CASCADE,
    photo_url            TEXT   NOT NULL
);

-- Fixed items added to an order
CREATE TABLE order_fixed_items (
    id               BIGSERIAL PRIMARY KEY,
    order_id         BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    fixed_product_id BIGINT NOT NULL REFERENCES fixed_products(id),
    quantity         INT    NOT NULL DEFAULT 1
);

-- ── Seed data ──────────────────────────────────────────────────────────────

INSERT INTO pie_style_options (pie_type, name) VALUES
    ('CLASSIC', 'Crumble'),
    ('CLASSIC', 'Lattice'),
    ('CUSTARD', 'Meringue'),
    ('CUSTARD', 'Whip');

INSERT INTO cheesecake_crust_options (name, gluten_free) VALUES
    ('Graham',                  FALSE),
    ('Graham (Gluten Free)',    TRUE),
    ('Graham Chocolate',        FALSE),
    ('Cookie - Chocolate Chip', FALSE),
    ('Cookie - Oreo',           FALSE),
    ('Cookie - Sugar',          FALSE),
    ('Brownie',                 FALSE);

-- Cake flavors already exist with item_type defaulting to 'CAKE'.
-- Insert new flavors for remaining item types.
INSERT INTO flavor_options (name, item_type) VALUES
    ('Apple',     'PIE_CLASSIC'),
    ('Pecan',     'PIE_CLASSIC'),
    ('Blueberry', 'PIE_CLASSIC'),
    ('Pumpkin',   'PIE_CLASSIC'),
    ('Cherry',    'PIE_CLASSIC'),

    ('Lemon',      'PIE_CUSTARD'),
    ('Key Lime',   'PIE_CUSTARD'),
    ('Buttermilk', 'PIE_CUSTARD'),
    ('Coconut',    'PIE_CUSTARD'),
    ('Chocolate',  'PIE_CUSTARD'),

    ('Classic Vanilla Bean',      'CHEESECAKE'),
    ('Double Chocolate',          'CHEESECAKE'),
    ('Strawberry Swirl',          'CHEESECAKE'),
    ('Cookies and Cream',         'CHEESECAKE'),
    ($$Reese's$$,                 'CHEESECAKE'),
    ('Coffee Toffee Brownie',     'CHEESECAKE'),
    ('Biscoff Blast',             'CHEESECAKE'),
    ('Banana Pudding',            'CHEESECAKE'),
    ('White Chocolate Raspberry', 'CHEESECAKE'),
    ('Turtle',                    'CHEESECAKE'),
    ('Lemon Blueberry',           'CHEESECAKE'),
    ('Salted Caramel',            'CHEESECAKE'),

    ('Lemon',           'MACARON'),
    ('Wedding',         'MACARON'),
    ('Salted Caramel',  'MACARON'),
    ('Cookies and Cream','MACARON'),
    ('Mint',            'MACARON'),
    ('Peach',           'MACARON'),
    ('Espresso',        'MACARON'),
    ('Fruity Pebble',   'MACARON'),
    ('Red Velvet',      'MACARON'),
    ('Mango',           'MACARON'),
    ('Brownie Batter',  'MACARON'),
    ('Blueberry',       'MACARON'),
    ('Strawberry',      'MACARON'),
    ('Raspberry',       'MACARON'),
    ('Coconut',         'MACARON'),
    ('Pistachio',       'MACARON'),
    ('Earl Grey',       'MACARON'),
    ('Ganache',         'MACARON');

-- Cake sizes: prices are 0.00 placeholders — update once pricing is confirmed
INSERT INTO sizes (item_type, label, description, price) VALUES
    ('CAKE', '6-inch (2 layer)',  'Feeds 8-10 people',  0.00),
    ('CAKE', '6-inch (3 layer)',  'Feeds 10-12 people', 0.00),
    ('CAKE', '8-inch (2 layer)',  'Feeds 12-15 people', 0.00),
    ('CAKE', '8-inch (3 layer)',  'Feeds 15-18 people', 0.00),
    ('CAKE', '10-inch (2 layer)', 'Feeds 18-22 people', 0.00),
    ('CAKE', '10-inch (3 layer)', 'Feeds 22-26 people', 0.00),

    ('SURPRISE_ME', '6-inch (2 layer)', 'Feeds 8-10 people', 0.00),

    ('PIE_CLASSIC', '9-inch', NULL, 35.00),
    ('PIE_CUSTARD', '9-inch', NULL, 35.00),

    ('CHEESECAKE', '4-inch',  'Feeds 2-4 people',   10.00),
    ('CHEESECAKE', '6-inch',  'Feeds 6-8 people',   30.00),
    ('CHEESECAKE', '8-inch',  'Feeds 12-15 people', 50.00),
    ('CHEESECAKE', '10-inch', 'Feeds 15-20 people', 70.00),

    ('MACARON', 'One Dozen', '12 macarons', 36.00);

INSERT INTO fixed_products (name, description, price, unit_description) VALUES
    ('Pumpkin Roll',
     'Warm spiced pumpkin cake rolled up with tangy cream cheese frosting',
     20.00, 'per roll'),
    ('Cinnamon Rolls',
     NULL,
     10.00, '4 per order'),
    ('Apple Fritter Loaf',
     'Country spiced apple fritter bread with a sweet glaze drizzled all over',
     12.00, 'per loaf'),
    ('Brown Butter Choc Chunk Cookies',
     NULL,
     15.00, '8 per order');
