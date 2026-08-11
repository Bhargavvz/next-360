-- ============================================================
-- Next360 — V2: Create All Tables
-- ============================================================

-- 1. Users
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone           VARCHAR(15)  NOT NULL UNIQUE,
    email           VARCHAR(255),
    name            VARCHAR(100),
    avatar_url      VARCHAR(500),
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    is_phone_verified BOOLEAN    NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ,
    created_by      VARCHAR(100),
    updated_by      VARCHAR(100),
    version         BIGINT       NOT NULL DEFAULT 0
);

-- 2. User Roles
CREATE TABLE user_roles (
    id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role    VARCHAR(30) NOT NULL,
    UNIQUE (user_id, role)
);

-- 3. Addresses
CREATE TABLE addresses (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type                   VARCHAR(10)  NOT NULL,
    name                   VARCHAR(100) NOT NULL,
    phone                  VARCHAR(15)  NOT NULL,
    address_line_1         VARCHAR(255) NOT NULL,
    address_line_2         VARCHAR(255),
    landmark               VARCHAR(255),
    city                   VARCHAR(100) NOT NULL,
    state                  VARCHAR(100) NOT NULL,
    pincode                VARCHAR(6)   NOT NULL,
    is_default             BOOLEAN      NOT NULL DEFAULT FALSE,
    delivery_instructions  VARCHAR(500),
    created_at             TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ,
    created_by             VARCHAR(100),
    updated_by             VARCHAR(100),
    version                BIGINT       NOT NULL DEFAULT 0
);

-- 4. Sellers
CREATE TABLE sellers (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                UUID           NOT NULL UNIQUE REFERENCES users(id),
    business_name          VARCHAR(200)   NOT NULL,
    business_description   VARCHAR(2000),
    business_address       VARCHAR(500),
    gstin                  VARCHAR(15),
    pan_number             VARCHAR(10),
    phone                  VARCHAR(15)    NOT NULL,
    email                  VARCHAR(255)   NOT NULL,
    logo_url               VARCHAR(500),
    banner_url             VARCHAR(500),
    status                 VARCHAR(20)    NOT NULL DEFAULT 'PENDING',
    kyc_status             VARCHAR(20)    NOT NULL DEFAULT 'NOT_SUBMITTED',
    rating                 NUMERIC(3,2),
    total_orders           INT            NOT NULL DEFAULT 0,
    total_products         INT            NOT NULL DEFAULT 0,
    commission_percentage  NUMERIC(5,2)   NOT NULL DEFAULT 15.00,
    location               VARCHAR(200),
    created_at             TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ,
    created_by             VARCHAR(100),
    updated_by             VARCHAR(100),
    version                BIGINT         NOT NULL DEFAULT 0
);

-- 5. Seller KYC Documents
CREATE TABLE seller_kycs (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id        UUID         NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
    document_type    VARCHAR(50)  NOT NULL,
    document_url     VARCHAR(500) NOT NULL,
    status           VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    rejection_reason VARCHAR(500),
    uploaded_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    verified_at      TIMESTAMPTZ,
    verified_by      VARCHAR(100)
);

-- 6. Categories
CREATE TABLE categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL,
    slug        VARCHAR(120) NOT NULL UNIQUE,
    description VARCHAR(500),
    image_url   VARCHAR(500),
    parent_id   UUID REFERENCES categories(id),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ,
    created_by  VARCHAR(100),
    updated_by  VARCHAR(100),
    version     BIGINT       NOT NULL DEFAULT 0
);

-- 7. Products
CREATE TABLE products (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug                 VARCHAR(250)   NOT NULL UNIQUE,
    name                 VARCHAR(200)   NOT NULL,
    description          TEXT           NOT NULL,
    price                NUMERIC(12,2)  NOT NULL,
    mrp                  NUMERIC(12,2),
    category_id          UUID           NOT NULL REFERENCES categories(id),
    seller_id            UUID           NOT NULL REFERENCES sellers(id),
    product_type         VARCHAR(20)    NOT NULL,
    status               VARCHAR(20)    NOT NULL DEFAULT 'DRAFT',
    rating               NUMERIC(3,2),
    review_count         INT            NOT NULL DEFAULT 0,
    stock                INT            NOT NULL DEFAULT 0,
    sku                  VARCHAR(50),
    weight               VARCHAR(50),
    dimensions           VARCHAR(100),
    ingredients          TEXT,
    nutritional_info     TEXT,
    origin               VARCHAR(200),
    storage_instructions VARCHAR(500),
    is_verified_organic  BOOLEAN        NOT NULL DEFAULT FALSE,
    verification_id      UUID           UNIQUE DEFAULT gen_random_uuid(),
    created_at           TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ,
    created_by           VARCHAR(100),
    updated_by           VARCHAR(100),
    version              BIGINT         NOT NULL DEFAULT 0
);

-- 8. Product Images
CREATE TABLE product_images (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID         NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url        VARCHAR(500) NOT NULL,
    alt_text   VARCHAR(200),
    sort_order INT          NOT NULL DEFAULT 0,
    is_primary BOOLEAN      NOT NULL DEFAULT FALSE
);

-- 9. Product Variants
CREATE TABLE product_variants (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID          NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name       VARCHAR(100)  NOT NULL,
    value      VARCHAR(100)  NOT NULL,
    sku        VARCHAR(50),
    price      NUMERIC(12,2) NOT NULL,
    mrp        NUMERIC(12,2),
    stock      INT           NOT NULL DEFAULT 0,
    weight     VARCHAR(50)
);

-- 10. Certificates
CREATE TABLE certificates (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_number  VARCHAR(100) NOT NULL,
    certification_body  VARCHAR(200) NOT NULL,
    seller_id           UUID         NOT NULL REFERENCES sellers(id),
    product_id          UUID         NOT NULL REFERENCES products(id),
    issue_date          DATE         NOT NULL,
    expiry_date         DATE         NOT NULL,
    document_url        VARCHAR(500) NOT NULL,
    status              VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    verified_at         TIMESTAMPTZ,
    verified_by         VARCHAR(100),
    rejection_reason    VARCHAR(500),
    revocation_reason   VARCHAR(500),
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ,
    created_by          VARCHAR(100),
    updated_by          VARCHAR(100),
    version             BIGINT       NOT NULL DEFAULT 0
);

-- 11. Reviews
CREATE TABLE reviews (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id           UUID    NOT NULL REFERENCES products(id),
    user_id              UUID    NOT NULL REFERENCES users(id),
    order_id             UUID    NOT NULL,
    rating               INT     NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title                VARCHAR(200),
    comment              TEXT    NOT NULL,
    images               JSONB,
    is_verified_purchase BOOLEAN NOT NULL DEFAULT TRUE,
    seller_response      TEXT,
    seller_responded_at  TIMESTAMPTZ,
    helpful_count        INT     NOT NULL DEFAULT 0,
    is_reported          BOOLEAN NOT NULL DEFAULT FALSE,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ,
    created_by           VARCHAR(100),
    updated_by           VARCHAR(100),
    version              BIGINT  NOT NULL DEFAULT 0,
    UNIQUE (product_id, user_id, order_id)
);

-- 12. Wishlists
CREATE TABLE wishlists (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    added_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, product_id)
);

-- 13. Cart Items
CREATE TABLE cart_items (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID        REFERENCES product_variants(id) ON DELETE SET NULL,
    quantity   INT         NOT NULL DEFAULT 1 CHECK (quantity >= 1 AND quantity <= 10),
    added_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, product_id, variant_id)
);

-- 14. Orders
CREATE TABLE orders (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number        VARCHAR(20)   NOT NULL UNIQUE,
    user_id             UUID          NOT NULL REFERENCES users(id),
    total_amount        NUMERIC(12,2) NOT NULL,
    discount_amount     NUMERIC(12,2) NOT NULL DEFAULT 0,
    shipping_amount     NUMERIC(12,2) NOT NULL DEFAULT 0,
    final_amount        NUMERIC(12,2) NOT NULL,
    status              VARCHAR(25)   NOT NULL DEFAULT 'PLACED',
    payment_status      VARCHAR(25)   NOT NULL DEFAULT 'PENDING',
    shipping_address_id UUID          NOT NULL REFERENCES addresses(id),
    coupon_code         VARCHAR(50),
    delivery_notes      VARCHAR(500),
    created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ,
    created_by          VARCHAR(100),
    updated_by          VARCHAR(100),
    version             BIGINT        NOT NULL DEFAULT 0
);

-- 15. Order Items
CREATE TABLE order_items (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id          UUID          NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id        UUID          NOT NULL REFERENCES products(id),
    variant_id        UUID          REFERENCES product_variants(id),
    seller_id         UUID          NOT NULL REFERENCES sellers(id),
    quantity          INT           NOT NULL,
    unit_price        NUMERIC(12,2) NOT NULL,
    total_price       NUMERIC(12,2) NOT NULL,
    product_name      VARCHAR(200)  NOT NULL,
    product_image_url VARCHAR(500),
    variant_name      VARCHAR(100)
);

-- 16. Seller Orders
CREATE TABLE seller_orders (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id              UUID          NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    seller_id             UUID          NOT NULL REFERENCES sellers(id),
    status                VARCHAR(25)   NOT NULL DEFAULT 'PLACED',
    subtotal              NUMERIC(12,2) NOT NULL,
    commission_percentage NUMERIC(5,2)  NOT NULL,
    commission_amount     NUMERIC(12,2) NOT NULL,
    net_amount            NUMERIC(12,2) NOT NULL,
    tracking_number       VARCHAR(100),
    courier_name          VARCHAR(100),
    shipped_at            TIMESTAMPTZ,
    delivered_at          TIMESTAMPTZ,
    created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ,
    created_by            VARCHAR(100),
    updated_by            VARCHAR(100),
    version               BIGINT        NOT NULL DEFAULT 0
);

-- 17. Shipments
CREATE TABLE shipments (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_order_id   UUID         NOT NULL UNIQUE REFERENCES seller_orders(id),
    tracking_number   VARCHAR(100) NOT NULL,
    courier_name      VARCHAR(100) NOT NULL,
    status            VARCHAR(25)  NOT NULL,
    estimated_delivery DATE,
    shipped_at        TIMESTAMPTZ,
    delivered_at      TIMESTAMPTZ,
    tracking_url      VARCHAR(500)
);

-- 18. Payments
CREATE TABLE payments (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id           UUID          NOT NULL REFERENCES orders(id),
    amount             NUMERIC(12,2) NOT NULL,
    status             VARCHAR(25)   NOT NULL DEFAULT 'PENDING',
    payment_method     VARCHAR(30)   NOT NULL,
    gateway_payment_id VARCHAR(100),
    gateway_order_id   VARCHAR(100),
    gateway_signature  VARCHAR(255),
    paid_at            TIMESTAMPTZ,
    created_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ,
    created_by         VARCHAR(100),
    updated_by         VARCHAR(100),
    version            BIGINT        NOT NULL DEFAULT 0
);

-- 19. Refunds
CREATE TABLE refunds (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id          UUID          NOT NULL REFERENCES orders(id),
    payment_id        UUID          NOT NULL REFERENCES payments(id),
    amount            NUMERIC(12,2) NOT NULL,
    reason            VARCHAR(500)  NOT NULL,
    status            VARCHAR(20)   NOT NULL DEFAULT 'REQUESTED',
    gateway_refund_id VARCHAR(100),
    processed_at      TIMESTAMPTZ,
    created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ,
    created_by        VARCHAR(100),
    updated_by        VARCHAR(100),
    version           BIGINT        NOT NULL DEFAULT 0
);

-- 20. Coupons
CREATE TABLE coupons (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code               VARCHAR(50)   NOT NULL UNIQUE,
    description        VARCHAR(500)  NOT NULL,
    type               VARCHAR(15)   NOT NULL,
    value              NUMERIC(12,2) NOT NULL,
    min_order_amount   NUMERIC(12,2),
    max_discount_amount NUMERIC(12,2),
    usage_limit        INT,
    usage_count        INT           NOT NULL DEFAULT 0,
    per_user_limit     INT,
    category_id        UUID,
    seller_id          UUID,
    product_id         UUID,
    starts_at          TIMESTAMPTZ   NOT NULL,
    expires_at         TIMESTAMPTZ   NOT NULL,
    is_active          BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ,
    created_by         VARCHAR(100),
    updated_by         VARCHAR(100),
    version            BIGINT        NOT NULL DEFAULT 0
);

-- 21. Payouts
CREATE TABLE payouts (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id             UUID          NOT NULL REFERENCES sellers(id),
    amount                NUMERIC(12,2) NOT NULL,
    commission_deducted   NUMERIC(12,2) NOT NULL,
    refunds_deducted      NUMERIC(12,2) NOT NULL DEFAULT 0,
    net_amount            NUMERIC(12,2) NOT NULL,
    status                VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    period_start          DATE          NOT NULL,
    period_end            DATE          NOT NULL,
    processed_at          TIMESTAMPTZ,
    transaction_reference VARCHAR(200),
    created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ,
    created_by            VARCHAR(100),
    updated_by            VARCHAR(100),
    version               BIGINT        NOT NULL DEFAULT 0
);

-- 22. Notifications
CREATE TABLE notifications (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type       VARCHAR(30)  NOT NULL,
    title      VARCHAR(200) NOT NULL,
    message    VARCHAR(1000) NOT NULL,
    data       JSONB,
    is_read    BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- 23. Disputes
CREATE TABLE disputes (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number    VARCHAR(20) NOT NULL UNIQUE,
    order_id         UUID        NOT NULL REFERENCES orders(id),
    product_id       UUID,
    customer_id      UUID        NOT NULL REFERENCES users(id),
    seller_id        UUID        NOT NULL REFERENCES sellers(id),
    assigned_admin_id UUID,
    status           VARCHAR(25) NOT NULL DEFAULT 'OPEN',
    subject          VARCHAR(200) NOT NULL,
    description      TEXT        NOT NULL,
    resolution       TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ,
    created_by       VARCHAR(100),
    updated_by       VARCHAR(100),
    version          BIGINT      NOT NULL DEFAULT 0
);

-- 24. Dispute Messages
CREATE TABLE dispute_messages (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dispute_id  UUID        NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
    sender_id   UUID        NOT NULL,
    sender_role VARCHAR(30) NOT NULL,
    message     TEXT        NOT NULL,
    attachments JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 25. Audit Logs
CREATE TABLE audit_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id    UUID        NOT NULL,
    actor_name  VARCHAR(100) NOT NULL,
    action      VARCHAR(40) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id   UUID        NOT NULL,
    old_value   TEXT,
    new_value   TEXT,
    reason      VARCHAR(500),
    ip_address  VARCHAR(45),
    metadata    JSONB,
    timestamp   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
