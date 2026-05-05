CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,

    user_email TEXT NOT NULL,
    user_phone TEXT,

    status TEXT NOT NULL DEFAULT 'PENDING',

    total_amount NUMERIC(10,2),

    stripe_session_id TEXT,

    deposit_paid BOOLEAN NOT NULL DEFAULT FALSE,
    full_payment_paid BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,

    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

    product_name TEXT NOT NULL,
    quantity INT NOT NULL,
    price NUMERIC(10,2) NOT NULL
);