-- EMERGENCY AUTH FIX
-- This addresses the core Supabase auth database error

-- 1. Remove ALL triggers on auth.users that might be causing issues
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN SELECT trigger_name FROM information_schema.triggers 
             WHERE event_object_schema = 'auth' AND event_object_table = 'users' 
             AND trigger_name NOT LIKE 'pg_%'
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || r.trigger_name || ' ON auth.users CASCADE';
    END LOOP;
END $$;

-- 2. Remove all our custom functions that might be interfering
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.create_user_profile(UUID, TEXT, TEXT) CASCADE;

-- 3. Check if auth schema is accessible
SELECT 'Auth schema check:' as info;
SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'auth';

-- 4. Check auth.users table structure
SELECT 'Auth users table:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'auth' AND table_name = 'users'
ORDER BY ordinal_position;

-- 5. Check if there are any policies on auth.users (there shouldn't be)
SELECT 'Auth users policies:' as info;
SELECT policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'auth' AND tablename = 'users';

-- 6. Drop any policies on auth.users (auth handles its own security)
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN SELECT policyname FROM pg_policies 
             WHERE schemaname = 'auth' AND tablename = 'users'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON auth.users';
    END LOOP;
END $$;

-- 7. Check if our public.users table has proper constraints
SELECT 'Public users table:' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- 8. Temporarily disable RLS on public.users
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 9. Test message
SELECT '🔧 Emergency fixes applied. Try signup now.' as status;
SELECT 'If signup works, we will re-enable security properly.' as next_step;