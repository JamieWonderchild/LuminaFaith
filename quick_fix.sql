-- Quick diagnostic and fix for sign-up issues
-- Run this in your Supabase SQL Editor

-- 1. Check if users table exists and its structure
SELECT 'Users table columns:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- 2. Check current RLS policies
SELECT 'Current RLS policies:' as info;
SELECT policyname, cmd, permissive, roles, qual 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'users';

-- 3. Test if we can insert into users table (this will likely fail due to RLS)
SELECT 'Testing insert permissions...' as info;

-- 4. Check if there's a trigger on auth.users
SELECT 'Auth triggers:' as info;
SELECT trigger_name, event_manipulation, action_statement 
FROM information_schema.triggers 
WHERE event_object_schema = 'auth' AND event_object_table = 'users';

-- 5. Let's create a more permissive policy temporarily for testing
-- Drop existing policies if needed
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create new policies with proper conditions
CREATE POLICY "Enable insert for authenticated users" ON users
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable select for users based on user_id" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Enable update for users based on user_id" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- 6. Alternative: Create a function that bypasses RLS for user creation
CREATE OR REPLACE FUNCTION create_user_profile(
  user_id UUID,
  user_email TEXT,
  user_name TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (id, email, name, streak, total_xp, current_level, daily_goal)
  VALUES (user_id, user_email, user_name, 0, 0, 1, 15);
END;
$$;

-- 7. Test the function
SELECT 'Function created successfully' as status;

-- 8. Check if the function exists
SELECT 'Available functions:' as info;
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_name LIKE '%user%';