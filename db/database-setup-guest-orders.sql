-- Simple Database Setup for Guest Orders
-- Run this in your Supabase SQL Editor

-- Add customer_info column to existing orders table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'customer_info'
  ) THEN
    ALTER TABLE orders ADD COLUMN customer_info JSONB;
  END IF;
END $$;

-- Make user_id optional in orders table if it's not already
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'user_id' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;
  END IF;
END $$;

-- Update RLS policies for orders to support guest orders
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Anyone can insert orders" ON orders;

-- Create new policies supporting guest orders
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (
    user_id = auth.uid() OR 
    (user_id IS NULL AND customer_info->>'email' IS NOT NULL)
  );

CREATE POLICY "Anyone can insert orders" ON orders
  FOR INSERT WITH CHECK (true);

-- Create index for customer email lookups
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders((customer_info->>'email')); 