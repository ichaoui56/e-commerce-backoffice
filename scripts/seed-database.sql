-- Insert demo admin user (password: admin123)
INSERT INTO users (name, email, password_hash) VALUES 
('Admin User', 'admin@shahinestore.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm');

-- Insert demo categories
INSERT INTO categories (name, slug) VALUES 
('Clothing', 'clothing'),
('Electronics', 'electronics'),
('Accessories', 'accessories'),
('Footwear', 'footwear'),
('Home & Garden', 'home-garden');

-- Insert demo colors
INSERT INTO colors (name, hex) VALUES 
('Red', '#ef4444'),
('Blue', '#3b82f6'),
('Green', '#10b981'),
('Black', '#000000'),
('White', '#ffffff'),
('Gray', '#6b7280'),
('Pink', '#ec4899'),
('Purple', '#8b5cf6'),
('Yellow', '#eab308'),
('Orange', '#f97316');

-- Insert demo sizes
INSERT INTO sizes (label) VALUES 
('XS'),
('S'),
('M'),
('L'),
('XL'),
('XXL'),
('36'),
('37'),
('38'),
('39'),
('40'),
('41'),
('42'),
('43'),
('44'),
('45');
