-- Check team_members table structure and permissions
-- Run this in your Supabase SQL editor

-- 1. Check table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'team_members' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'team_members';

-- 3. Check existing RLS policies
SELECT policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'team_members';

-- 4. Check if current user can see team_members data
SELECT COUNT(*) as total_team_members
FROM public.team_members;

-- 5. Check current user's team membership
SELECT tm.*, u.email as user_email
FROM public.team_members tm
LEFT JOIN public.users u ON tm.user_id = u.id
WHERE tm.user_id = auth.uid();

-- 6. Check all team members for debugging
SELECT tm.id, tm.user_id, tm.email, tm.role, tm.status, tm.team_id, tm.subscription_id
FROM public.team_members tm
ORDER BY tm.created_at DESC
LIMIT 10; 