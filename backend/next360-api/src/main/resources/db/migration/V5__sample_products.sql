-- ============================================================
-- Next360 — V5: Sample Seller + 5 Products
-- ============================================================

-- ============================
-- Sample Seller User
-- ============================
INSERT INTO users (id, phone, email, name, is_active, is_phone_verified) VALUES
    ('c1000000-0000-0000-0000-000000000001', '+918800000001', 'seller@organicfarm.in', 'Rajan Mehta', TRUE, TRUE);

INSERT INTO user_roles (user_id, role) VALUES
    ('c1000000-0000-0000-0000-000000000001', 'BUYER'),
    ('c1000000-0000-0000-0000-000000000001', 'SELLER');

INSERT INTO sellers (id, user_id, business_name, business_description, business_address, gstin, phone, email, status, kyc_status, rating, commission_percentage, location) VALUES
    ('d1000000-0000-0000-0000-000000000001',
     'c1000000-0000-0000-0000-000000000001',
     'Organic Farm Direct',
     'We are a certified organic farm in Karnataka, supplying directly to consumers. NPOP certified since 2018, zero pesticides, zero chemicals.',
     '45, Hebbal Kempapura, Bangalore, Karnataka - 560024',
     '29ABCDE1234F1Z5',
     '+918800000001',
     'seller@organicfarm.in',
     'APPROVED',
     'APPROVED',
     4.7,
     12.00,
     'Bangalore, Karnataka');

-- ============================
-- 5 Sample Products (APPROVED)
-- ============================

-- Product 1: Organic Basmati Rice
INSERT INTO products (id, slug, name, description, price, mrp, category_id, seller_id, product_type, status, stock, sku, weight, origin, storage_instructions, is_verified_organic, verification_id) VALUES
    ('e1000000-0000-0000-0000-000000000001',
     'organic-basmati-rice-1kg',
     'Organic Basmati Rice — 1 kg',
     'Premium long-grain organic basmati rice grown in the foothills of the Himalayas. NPOP certified, no pesticides, no synthetic fertilizers. Aged for 12 months for superior aroma and texture. Each grain is hand-sorted and stone-milled to preserve natural nutrients.',
     249.00, 320.00,
     'a1000000-0000-0000-0000-000000000001',
     'd1000000-0000-0000-0000-000000000001',
     'ORGANIC', 'APPROVED', 150,
     'OFD-RICE-001', '1 kg', 'Uttarakhand, India',
     'Store in a cool, dry place. Keep away from moisture. Use within 12 months of purchase.',
     TRUE,
     'f1000000-0000-0000-0000-000000000001');

-- Product 2: Cold-Pressed Groundnut Oil
INSERT INTO products (id, slug, name, description, price, mrp, category_id, seller_id, product_type, status, stock, sku, weight, origin, storage_instructions, is_verified_organic, verification_id) VALUES
    ('e1000000-0000-0000-0000-000000000002',
     'cold-pressed-groundnut-oil-1l',
     'Cold-Pressed Groundnut Oil — 1 L',
     'Traditionally wood-pressed (chekku) groundnut oil with no heat treatment, no chemicals, and no preservatives. Rich in natural antioxidants and Vitamin E. Ideal for cooking, frying, and salad dressings. Deep golden colour with authentic nutty aroma.',
     389.00, 450.00,
     'a1000000-0000-0000-0000-000000000003',
     'd1000000-0000-0000-0000-000000000001',
     'NATURAL', 'APPROVED', 80,
     'OFD-OIL-001', '1 L', 'Rajkot, Gujarat',
     'Store away from direct sunlight. Use within 6 months of opening.',
     FALSE,
     'f1000000-0000-0000-0000-000000000002');

-- Product 3: Organic Turmeric Powder
INSERT INTO products (id, slug, name, description, price, mrp, category_id, seller_id, product_type, status, stock, sku, weight, origin, ingredients, storage_instructions, is_verified_organic, verification_id) VALUES
    ('e1000000-0000-0000-0000-000000000003',
     'organic-turmeric-powder-200g',
     'Organic Turmeric Powder — 200 g',
     'Single-origin turmeric sourced from certified organic farms in Erode, Tamil Nadu — the turmeric capital of India. High curcumin content (5.2%). Stone-ground to preserve essential oils. No artificial colours, no additives, no fillers. NPOP certified.',
     189.00, 240.00,
     'a1000000-0000-0000-0000-000000000004',
     'd1000000-0000-0000-0000-000000000001',
     'ORGANIC', 'APPROVED', 200,
     'OFD-TUR-001', '200 g', 'Erode, Tamil Nadu',
     '100% pure organic turmeric (Curcuma longa)',
     'Store in an airtight container in a cool, dark place.',
     TRUE,
     'f1000000-0000-0000-0000-000000000003');

-- Product 4: Raw Forest Honey
INSERT INTO products (id, slug, name, description, price, mrp, category_id, seller_id, product_type, status, stock, sku, weight, origin, storage_instructions, is_verified_organic, verification_id) VALUES
    ('e1000000-0000-0000-0000-000000000004',
     'raw-forest-honey-500g',
     'Raw Forest Honey — 500 g',
     'Wild harvested multi-floral honey from the forests of Coorg, Karnataka. Unheated, unfiltered, and unpasteurised to preserve all natural enzymes, pollen, and antioxidants. Rich dark amber colour with complex floral notes. No added sugar, no adulteration.',
     599.00, 750.00,
     'a1000000-0000-0000-0000-000000000013',
     'd1000000-0000-0000-0000-000000000001',
     'NATURAL', 'APPROVED', 45,
     'OFD-HON-001', '500 g', 'Coorg, Karnataka',
     'Store at room temperature away from direct sunlight. Do not refrigerate. Natural crystallisation is normal.',
     FALSE,
     'f1000000-0000-0000-0000-000000000004');

-- Product 5: Organic Ragi Flour
INSERT INTO products (id, slug, name, description, price, mrp, category_id, seller_id, product_type, status, stock, sku, weight, origin, ingredients, nutritional_info, storage_instructions, is_verified_organic, verification_id) VALUES
    ('e1000000-0000-0000-0000-000000000005',
     'organic-ragi-flour-1kg',
     'Organic Ragi Flour (Finger Millet) — 1 kg',
     'Stone-ground whole finger millet (ragi) flour from certified organic farms in Karnataka. One of the richest plant sources of calcium. Gluten-free, high in dietary fibre and iron. Perfect for ragi dosas, rotis, porridge, and baked goods. NPOP certified organic.',
     179.00, 220.00,
     'a1000000-0000-0000-0000-000000000014',
     'd1000000-0000-0000-0000-000000000001',
     'ORGANIC', 'APPROVED', 120,
     'OFD-RAG-001', '1 kg', 'Haveri, Karnataka',
     '100% organic finger millet (Eleusine coracana)',
     'Calcium: 364 mg/100g | Iron: 3.9 mg/100g | Fibre: 3.6 g/100g | Protein: 7.3 g/100g',
     'Store in a cool, dry place in an airtight container. Use within 6 months.',
     TRUE,
     'f1000000-0000-0000-0000-000000000005');

-- ============================
-- Product Images (placeholder URLs — replace with real S3 URLs)
-- ============================
INSERT INTO product_images (product_id, url, alt_text, sort_order, is_primary) VALUES
    ('e1000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800', 'Organic Basmati Rice', 0, TRUE),
    ('e1000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800', 'Cold-Pressed Groundnut Oil', 0, TRUE),
    ('e1000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=800', 'Organic Turmeric Powder', 0, TRUE),
    ('e1000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800', 'Raw Forest Honey', 0, TRUE),
    ('e1000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800', 'Organic Ragi Flour', 0, TRUE);

-- ============================
-- Update seller product/order counts
-- ============================
UPDATE sellers SET total_products = 5 WHERE id = 'd1000000-0000-0000-0000-000000000001';
