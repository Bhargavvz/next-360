-- ============================================================
-- Next360 — V6
-- Payment method on orders, richer payment records, coupon
-- redemption tracking, and upload ownership.
-- ============================================================

-- 1. Orders carry the chosen payment method so COD and online flows diverge cleanly.
ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) NOT NULL DEFAULT 'RAZORPAY';

-- 2. Payments: failure reasons, refund tracking, and a stable gateway reference.
ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS failure_reason  VARCHAR(500),
    ADD COLUMN IF NOT EXISTS refunded_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS gateway_receipt VARCHAR(100);

-- A gateway order id maps to exactly one payment row; this also makes the
-- "find the payment for this callback" lookup unambiguous.
CREATE UNIQUE INDEX IF NOT EXISTS ux_payments_gateway_order_id
    ON payments (gateway_order_id) WHERE gateway_order_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_payments_gateway_payment_id
    ON payments (gateway_payment_id) WHERE gateway_payment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS ix_payments_order_id ON payments (order_id);

-- 3. Coupon redemptions — enforces per-user usage limits and gives an audit trail.
CREATE TABLE IF NOT EXISTS coupon_redemptions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id       UUID          NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    user_id         UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_id        UUID          REFERENCES orders(id) ON DELETE SET NULL,
    code            VARCHAR(50)   NOT NULL,
    discount_amount NUMERIC(12,2) NOT NULL,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ,
    created_by      VARCHAR(100),
    updated_by      VARCHAR(100),
    version         BIGINT        NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS ix_coupon_redemptions_coupon_user
    ON coupon_redemptions (coupon_id, user_id);

-- 4. Addresses: default lookups and "one default per user".
CREATE INDEX IF NOT EXISTS ix_addresses_user_id ON addresses (user_id);

-- Collapse any pre-existing duplicates (keep the most recently created default)
-- so the unique index below can be created.
UPDATE addresses a
SET is_default = FALSE
WHERE a.is_default
  AND a.id <> (
      SELECT b.id FROM addresses b
      WHERE b.user_id = a.user_id AND b.is_default
      ORDER BY b.created_at DESC, b.id DESC
      LIMIT 1
  );

CREATE UNIQUE INDEX IF NOT EXISTS ux_addresses_one_default_per_user
    ON addresses (user_id) WHERE is_default;

-- 5. Uploads registry — lets the API verify who owns an S3 object before
--    handing out presigned URLs or deleting it.
CREATE TABLE IF NOT EXISTS uploads (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    object_key    VARCHAR(500)  NOT NULL UNIQUE,
    folder        VARCHAR(50)   NOT NULL,
    content_type  VARCHAR(100),
    size_bytes    BIGINT,
    is_public     BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ,
    created_by    VARCHAR(100),
    updated_by    VARCHAR(100),
    version       BIGINT        NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS ix_uploads_user_id ON uploads (user_id);
