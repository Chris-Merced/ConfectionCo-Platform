ALTER TABLE orders
    ADD COLUMN payment_link_token VARCHAR(8) UNIQUE,
    ADD COLUMN payment_link_url   TEXT;
