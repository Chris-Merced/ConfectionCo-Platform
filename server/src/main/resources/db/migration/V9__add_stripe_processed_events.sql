CREATE TABLE stripe_processed_events (
    event_id    VARCHAR(255) PRIMARY KEY,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
