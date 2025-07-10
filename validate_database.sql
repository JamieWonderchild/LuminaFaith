-- Validate database setup for LuminaFaith
-- Run this in your Supabase SQL Editor to check what's missing

-- 1. Check if all required tables exist
SELECT 'Table exists: ' || table_name as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'religions', 'learning_paths', 'lessons', 'user_progress', 'lesson_completions', 'achievements', 'user_achievements')
ORDER BY table_name;

-- 2. Check users table structure specifically
SELECT 'users table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- 3. Check RLS status
SELECT 'RLS Status:' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'religions', 'learning_paths', 'lessons');

-- 4. Check if we can query the users table
SELECT 'Users table test:' as info;
SELECT COUNT(*) as user_count FROM users;

-- 5. Check if auth trigger exists
SELECT 'Auth trigger check:' as info;
SELECT trigger_name, event_manipulation, action_statement 
FROM information_schema.triggers 
WHERE trigger_schema = 'public' OR trigger_schema = 'auth';

-- 6. Check auth.users table (should exist by default)
SELECT 'Auth users count:' as info;
SELECT COUNT(*) as auth_users_count FROM auth.users;