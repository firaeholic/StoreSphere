-- Create sample categories
INSERT INTO categories (name, slug, description) VALUES
('Electronics', 'electronics', 'Electronic devices and gadgets'),
('Clothing', 'clothing', 'Fashion and apparel'),
('Home & Garden', 'home-garden', 'Home improvement and gardening'),
('Books', 'books', 'Books and literature'),
('Sports', 'sports', 'Sports and fitness equipment');

-- Create sample admin user
INSERT INTO users (clerk_id, email, first_name, last_name, role) VALUES
('admin_123', 'admin@storesphere.com', 'Admin', 'User', 'ADMIN');

-- Create sample vendor users
INSERT INTO users (clerk_id, email, first_name, last_name, role) VALUES
('vendor_123', 'vendor1@example.com', 'John', 'Doe', 'VENDOR'),
('vendor_456', 'vendor2@example.com', 'Jane', 'Smith', 'VENDOR');

-- Create sample stores
INSERT INTO stores (name, slug, description, currency, status, owner_id) VALUES
('TechHub', 'techhub', 'Your one-stop shop for the latest technology', 'USD', 'ACTIVE', 
  (SELECT id FROM users WHERE clerk_id = 'vendor_123')),
('Fashion Forward', 'fashionforward', 'Trendy clothing for modern lifestyle', 'USD', 'ACTIVE',
  (SELECT id FROM users WHERE clerk_id = 'vendor_456'));

-- Create sample products
INSERT INTO products (name, slug, description, price, compare_price, images, stock, status, store_id, category_id) VALUES
('Wireless Headphones', 'wireless-headphones', 'High-quality wireless headphones with noise cancellation', 199.99, 249.99, 
  ARRAY['/placeholder.svg?height=400&width=400'], 50, 'ACTIVE',
  (SELECT id FROM stores WHERE slug = 'techhub'),
  (SELECT id FROM categories WHERE slug = 'electronics')),
  
('Smart Watch', 'smart-watch', 'Feature-rich smartwatch with health tracking', 299.99, NULL,
  ARRAY['/placeholder.svg?height=400&width=400'], 25, 'ACTIVE',
  (SELECT id FROM stores WHERE slug = 'techhub'),
  (SELECT id FROM categories WHERE slug = 'electronics')),
  
('Designer T-Shirt', 'designer-t-shirt', 'Premium cotton t-shirt with unique design', 49.99, 69.99,
  ARRAY['/placeholder.svg?height=400&width=400'], 100, 'ACTIVE',
  (SELECT id FROM stores WHERE slug = 'fashionforward'),
  (SELECT id FROM categories WHERE slug = 'clothing'));
