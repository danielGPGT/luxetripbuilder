-- Fix missing subscriptions and check trigger status
-- Run this in your Supabase SQL editor

-- First, let's check if triggers exist
SELECT 'Checking triggers...' as info;
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'auth' 
   OR (trigger_schema = 'public' AND trigger_name LIKE '%auth%')
ORDER BY trigger_name;

-- Check if the functions exist
SELECT 'Checking functions...' as info;
SELECT 
    routine_name,
    routine_type,
    routine_schema
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('handle_user_profile_creation', 'handle_new_user')
ORDER BY routine_name;

-- Check current users and their subscriptions
SELECT 'User vs Subscription count:' as info;
SELECT 
    'Auth Users' as source,
    COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
    'Public Users' as source,
    COUNT(*) as count
FROM public.users
UNION ALL
SELECT 
    'Subscriptions' as source,
    COUNT(*) as count
FROM public.subscriptions;

-- Show users without subscriptions
SELECT 'Users without subscriptions:' as info;
SELECT 
    au.id,
    au.email,
    au.created_at as auth_created,
    pu.id as profile_id,
    pu.created_at as profile_created,
    s.id as subscription_id,
    s.status as subscription_status
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
LEFT JOIN public.subscriptions s ON au.id = s.user_id
WHERE s.id IS NULL
ORDER BY au.created_at DESC;

-- Manually create missing subscriptions for users who don't have them
INSERT INTO public.subscriptions (
    user_id, 
    plan_type, 
    status, 
    current_period_start, 
    current_period_end, 
    cancel_at_period_end, 
    stripe_subscription_id, 
    stripe_customer_id
)
SELECT 
    au.id, 
    'starter', 
    'trialing', 
    NOW(), 
    NOW() + INTERVAL '7 days', -- 7-day trial
    false, 
    null, 
    null
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM public.subscriptions WHERE user_id = au.id);

-- Show the results after fixing
SELECT 'After fix - User vs Subscription count:' as info;
SELECT 
    'Auth Users' as source,
    COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
    'Public Users' as source,
    COUNT(*) as count
FROM public.users
UNION ALL
SELECT 
    'Subscriptions' as source,
    COUNT(*) as count
FROM public.subscriptions;

-- Show recent subscriptions
SELECT 'Recent subscriptions:' as info;
SELECT 
    s.id,
    s.user_id,
    s.plan_type,
    s.status,
    s.current_period_start,
    s.current_period_end,
    s.created_at
FROM public.subscriptions s
ORDER BY s.created_at DESC
LIMIT 10; 