ALTER TABLE orders
    ADD COLUMN fulfillment_type VARCHAR(10) NOT NULL DEFAULT 'PICKUP',
    ADD COLUMN delivery_address TEXT;
