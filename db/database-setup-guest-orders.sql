-- eStore Database Setup Script for Supabase with Guest Order Support
-- Run this in your Supabase SQL Editor

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table with guest order support
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id), -- Optional for guest orders
  customer_info JSONB, -- For guest orders: {fullName, email, phone}
  products JSONB NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'shipped', 'delivered')),
  shipping_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policies for products
CREATE POLICY "Anyone can view products" ON products
  FOR SELECT USING (true);

CREATE POLICY "Only admins can insert products" ON products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can update products" ON products
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete products" ON products
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policies for orders (supporting both authenticated and guest orders)
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (
    user_id = auth.uid() OR 
    (user_id IS NULL AND customer_info->>'email' IS NOT NULL)
  );

CREATE POLICY "Anyone can insert orders" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Only admins can update order status" ON orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Only admins can upload product images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images' AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert sample products
INSERT INTO products (name, description, price, stock, image_url, category) VALUES
('Wireless Bluetooth Headphones', 'High-quality wireless headphones with noise cancellation', 99.99, 50, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', 'Electronics'),
('Smart Fitness Watch', 'Track your fitness goals with this advanced smartwatch', 199.99, 30, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', 'Electronics'),
('Organic Cotton T-Shirt', 'Comfortable and eco-friendly cotton t-shirt', 29.99, 100, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', 'Fashion'),
('Stainless Steel Water Bottle', 'Keep your drinks cold for hours with this insulated bottle', 24.99, 75, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400', 'Home & Garden'),
('Wireless Charging Pad', 'Convenient wireless charging for your devices', 39.99, 60, 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400', 'Electronics'),
('Yoga Mat', 'Premium non-slip yoga mat for your practice', 49.99, 40, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400', 'Fitness'),
('Ceramic Coffee Mug Set', 'Beautiful handcrafted ceramic mugs, set of 4', 34.99, 80, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400', 'Home & Garden'),
('Portable Bluetooth Speaker', 'Take your music anywhere with this portable speaker', 79.99, 45, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400', 'Electronics');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders((customer_info->>'email')); 