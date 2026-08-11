-- ============================================================
-- Next360 — V3: Create Indexes
-- ============================================================

-- Enable pg_trgm extension for trigram text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Users
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_email ON users(email) WHERE email IS NOT NULL;

-- User Roles
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);

-- Addresses
CREATE INDEX idx_addresses_user_id ON addresses(user_id);

-- Sellers
CREATE INDEX idx_sellers_user_id ON sellers(user_id);
CREATE INDEX idx_sellers_status ON sellers(status);
CREATE INDEX idx_sellers_kyc_status ON sellers(kyc_status);

-- Seller KYCs
CREATE INDEX idx_seller_kycs_seller_id ON seller_kycs(seller_id);
CREATE INDEX idx_seller_kycs_status ON seller_kycs(status);

-- Categories
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);

-- Products
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_product_type ON products(product_type);
CREATE INDEX idx_products_verification_id ON products(verification_id);
CREATE INDEX idx_products_is_verified_organic ON products(is_verified_organic) WHERE is_verified_organic = TRUE;

-- Full-text search index on product name
CREATE INDEX idx_products_name_trgm ON products USING gin (name gin_trgm_ops);

-- Product Images
CREATE INDEX idx_product_images_product_id ON product_images(product_id);

-- Product Variants
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);

-- Certificates
CREATE INDEX idx_certificates_seller_id ON certificates(seller_id);
CREATE INDEX idx_certificates_product_id ON certificates(product_id);
CREATE INDEX idx_certificates_status ON certificates(status);
CREATE INDEX idx_certificates_expiry_date ON certificates(expiry_date);

-- Reviews
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(product_id, rating);

-- Wishlists
CREATE INDEX idx_wishlists_user_id ON wishlists(user_id);

-- Cart Items
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);

-- Orders
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Order Items
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Seller Orders
CREATE INDEX idx_seller_orders_order_id ON seller_orders(order_id);
CREATE INDEX idx_seller_orders_seller_id ON seller_orders(seller_id);
CREATE INDEX idx_seller_orders_status ON seller_orders(status);

-- Shipments
CREATE INDEX idx_shipments_seller_order_id ON shipments(seller_order_id);
CREATE INDEX idx_shipments_tracking_number ON shipments(tracking_number);

-- Payments
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_gateway_payment_id ON payments(gateway_payment_id);

-- Refunds
CREATE INDEX idx_refunds_order_id ON refunds(order_id);
CREATE INDEX idx_refunds_status ON refunds(status);

-- Coupons
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_is_active ON coupons(is_active) WHERE is_active = TRUE;

-- Payouts
CREATE INDEX idx_payouts_seller_id ON payouts(seller_id);
CREATE INDEX idx_payouts_status ON payouts(status);

-- Notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Disputes
CREATE INDEX idx_disputes_order_id ON disputes(order_id);
CREATE INDEX idx_disputes_customer_id ON disputes(customer_id);
CREATE INDEX idx_disputes_seller_id ON disputes(seller_id);
CREATE INDEX idx_disputes_status ON disputes(status);

-- Dispute Messages
CREATE INDEX idx_dispute_messages_dispute_id ON dispute_messages(dispute_id);

-- Audit Logs
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
