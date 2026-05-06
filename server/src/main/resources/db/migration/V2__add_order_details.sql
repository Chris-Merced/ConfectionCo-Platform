ALTER TABLE orders ADD COLUMN serving_count INT;
ALTER TABLE orders ADD COLUMN comments TEXT;

CREATE TABLE order_photo_urls (
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL
);
