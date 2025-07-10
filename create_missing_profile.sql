-- Create the missing user profile
-- Run this in your Supabase SQL Editor

-- 1. Check what auth users exist
SELECT 'Auth users:' as info;
SELECT id, email, raw_user_meta_data->>'name' as name, created_at 
FROM auth.users 
ORDER BY created_at DESC;

-- 2. Check what profiles exist
SELECT 'Existing profiles:' as info;
SELECT id, email, name, created_at 
FROM public.users 
ORDER BY created_at DESC;

-- 3. Create profile for the user who doesn't have one
-- Replace the ID with your actual user ID from the auth.users query above
INSERT INTO public.users (id, email, name, streak, total_xp, current_level, daily_goal)
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1)) as name,
    0 as streak,
    0 as total_xp,
    1 as current_level,
    15 as daily_goal
FROM auth.users 
WHERE id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO NOTHING;

-- 4. Verify the profile was created
SELECT 'Profiles after creation:' as info;
SELECT id, email, name, created_at 
FROM public.users 
ORDER BY created_at DESC;

-- 5. Also temporarily disable RLS to make sure inserts work
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

SELECT '✅ Profile created and RLS disabled for testing' as status;