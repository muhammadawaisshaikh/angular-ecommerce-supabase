-- Check Database Status Script
-- Run this in your Supabase SQL Editor to see what's already set up

-- Check existing tables
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname IN ('public', 'auth', 'storage')
ORDER BY schemaname, tablename;

-- Check existing policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname IN ('public', 'auth', 'storage')
ORDER BY schemaname, tablename, policyname;

-- Check storage buckets
SELECT * FROM storage.buckets;

-- Check if sample products exist
SELECT COUNT(*) as product_count FROM products;

-- Check if any users exist
SELECT COUNT(*) as user_count FROM auth.users;

-- Check RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('user_profiles', 'products', 'orders'); 