-- Test Database Connection and Subscription Queries
-- Run this in your Supabase SQL Editor

-- ========================================
-- STEP 1: Test basic subscription query
-- ========================================

-- Test the exact query that's failing
SELECT 
    'Testing subscription query' as test_name,
    COUNT(*) as total_subscriptions
FROM public.subscriptions;

-- ========================================
-- STEP 2: Test user-specific query
-- ========================================

-- Test query for a specific user (replace with actual user ID)
SELECT 
    'Testing user subscription query' as test_name,
    user_id,
    status,
    plan_type,
    current_period_start,
    current_period_end
FROM public.subscriptions 
WHERE user_id = '9583966e-0dbf-4199-a2c8-27478bb3d185'
LIMIT 1;

-- ========================================
-- STEP 3: Test all users and their subscriptions
-- ========================================

SELECT 
    'User subscription overview' as test_name,
    au.id as user_id,
    au.email,
    ps.status,
    ps.plan_type,
    ps.current_period_end
FROM auth.users au
LEFT JOIN public.subscriptions ps ON au.id = ps.user_id
ORDER BY au.created_at DESC
LIMIT 10;

-- ========================================
-- STEP 4: Check table structure
-- ========================================

SELECT 
    'Table structure' as test_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'subscriptions'
ORDER BY ordinal_position;

-- ========================================
-- STEP 5: Check constraints
-- ========================================

SELECT 
    'Table constraints' as test_name,
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_schema = 'public' 
AND table_name = 'subscriptions'; 