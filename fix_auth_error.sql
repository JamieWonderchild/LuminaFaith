-- Fix auth.users database error
-- This error occurs at the Supabase auth level, not our custom tables

-- 1. Check if there are any triggers on auth.users that might be failing
SELECT 'Auth triggers:' as info;
SELECT trigger_name, event_manipulation, action_statement 
FROM information_schema.triggers 
WHERE event_object_schema = 'auth' AND event_object_table = 'users';

-- 2. Check if our trigger function exists and is valid
SELECT 'Our trigger function:' as info;
SELECT routine_name, routine_definition 
FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_name = 'handle_new_user';

-- 3. Drop any problematic triggers temporarily
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 4. Check if we can create auth users without our trigger
SELECT 'Trigger dropped - try signup now' as status;

-- 5. If signup works without trigger, let's create a simpler, safer trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only insert if the user doesn't already exist
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth user creation
    RAISE LOG 'Failed to create user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- 6. Recreate the trigger with better error handling
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 7. Alternative: Disable email confirmation if that's causing issues
-- (You can enable this later in Production)
-- This needs to be done in Supabase Dashboard under Authentication > Settings
-- Set "Enable email confirmations" to OFF

-- 8. Check auth settings that might cause issues
SELECT 'Auth config check:' as info;
SELECT * FROM auth.config;

-- 9. Verify our users table is properly set up
SELECT 'Users table check:' as info;
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;