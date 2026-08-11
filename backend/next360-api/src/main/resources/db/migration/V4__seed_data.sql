-- ============================================================
-- Next360 — V4: Seed Data
-- ============================================================

-- ============================
-- Categories (Root Level)
-- ============================
INSERT INTO categories (id, name, slug, description) VALUES
    ('a1000000-0000-0000-0000-000000000001', 'Grains & Cereals', 'grains-cereals', 'Organic rice, wheat, millets, oats, and other grains'),
    ('a1000000-0000-0000-0000-000000000002', 'Pulses & Lentils', 'pulses-lentils', 'Organic dal, beans, chickpeas, and legumes'),
    ('a1000000-0000-0000-0000-000000000003', 'Cooking Oils & Ghee', 'cooking-oils-ghee', 'Cold-pressed oils, organic ghee, and cooking fats'),
    ('a1000000-0000-0000-0000-000000000004', 'Spices & Masalas', 'spices-masalas', 'Single origin spices, ground masalas, and seasonings'),
    ('a1000000-0000-0000-0000-000000000005', 'Dairy & Alternatives', 'dairy-alternatives', 'Organic milk, paneer, curd, and plant-based alternatives'),
    ('a1000000-0000-0000-0000-000000000006', 'Fresh Fruits', 'fresh-fruits', 'Seasonal and exotic organic fruits'),
    ('a1000000-0000-0000-0000-000000000007', 'Fresh Vegetables', 'fresh-vegetables', 'Farm-fresh organic vegetables'),
    ('a1000000-0000-0000-0000-000000000008', 'Snacks & Dry Fruits', 'snacks-dry-fruits', 'Healthy snacks, nuts, seeds, and dried fruits'),
    ('a1000000-0000-0000-0000-000000000009', 'Beverages', 'beverages', 'Organic tea, coffee, juices, and health drinks'),
    ('a1000000-0000-0000-0000-000000000010', 'Personal Care', 'personal-care', 'Natural skincare, haircare, and hygiene products'),
    ('a1000000-0000-0000-0000-000000000011', 'Home Care', 'home-care', 'Eco-friendly cleaning and household products'),
    ('a1000000-0000-0000-0000-000000000012', 'Baby & Kids', 'baby-kids', 'Organic baby food, skincare, and kids products'),
    ('a1000000-0000-0000-0000-000000000013', 'Honey & Sweeteners', 'honey-sweeteners', 'Raw honey, jaggery, and natural sweeteners'),
    ('a1000000-0000-0000-0000-000000000014', 'Flours & Atta', 'flours-atta', 'Stone-ground flour, multigrain atta, and baking mixes');

-- ============================
-- Sub-categories (Example for Grains)
-- ============================
INSERT INTO categories (name, slug, description, parent_id) VALUES
    ('Rice', 'rice', 'Basmati, brown, and specialty rice varieties', 'a1000000-0000-0000-0000-000000000001'),
    ('Millets', 'millets', 'Ragi, jowar, bajra, foxtail, and other millets', 'a1000000-0000-0000-0000-000000000001'),
    ('Wheat', 'wheat', 'Whole wheat and wheat products', 'a1000000-0000-0000-0000-000000000001'),
    ('Oats', 'oats', 'Rolled oats, steel-cut oats, and oat products', 'a1000000-0000-0000-0000-000000000001');

-- ============================
-- Super Admin User
-- ============================
INSERT INTO users (id, phone, email, name, is_active, is_phone_verified) VALUES
    ('b1000000-0000-0000-0000-000000000001', '+919999999999', 'admin@next360.com', 'Next360 Admin', TRUE, TRUE);

INSERT INTO user_roles (user_id, role) VALUES
    ('b1000000-0000-0000-0000-000000000001', 'SUPER_ADMIN'),
    ('b1000000-0000-0000-0000-000000000001', 'BUYER');

-- ============================
-- Sample Coupons (Development)
-- ============================
INSERT INTO coupons (code, description, type, value, min_order_amount, max_discount_amount, usage_limit, per_user_limit, starts_at, expires_at) VALUES
    ('WELCOME10', 'Get 10% off on your first order', 'PERCENTAGE', 10.00, 299.00, 200.00, 10000, 1, NOW(), NOW() + INTERVAL '1 year'),
    ('ORGANIC50', 'Flat ₹50 off on orders above ₹500', 'FLAT', 50.00, 500.00, NULL, 5000, 3, NOW(), NOW() + INTERVAL '6 months'),
    ('TRUST20', 'Get 20% off on verified organic products', 'PERCENTAGE', 20.00, 399.00, 500.00, 2000, 2, NOW(), NOW() + INTERVAL '3 months');
