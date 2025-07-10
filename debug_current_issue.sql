-- Debug current signup issue
-- Run this in your Supabase SQL Editor

-- 1. Check if there are any triggers causing issues again
SELECT 'Current triggers on auth.users:' as info;
SELECT trigger_name, event_manipulation, action_statement 
FROM information_schema.triggers 
WHERE event_object_schema = 'auth' AND event_object_table = 'users' 
AND trigger_name NOT LIKE 'pg_%';

-- 2. Check RLS status on users table
SELECT 'RLS Status:' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'users';

-- 3. Check current policies
SELECT 'Current policies:' as info;
SELECT policyname, cmd, permissive, roles 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'users';

-- 4. Test if we can query users table
SELECT 'Users table test:' as info;
SELECT COUNT(*) as total_users FROM public.users;

-- 5. Check recent auth users
SELECT 'Recent auth users:' as info;
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 6. Quick fix: Temporarily disable everything again
SELECT 'Applying quick fix...' as action;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Disable RLS temporarily
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

SELECT '✅ Quick fix applied - try signup now' as status;