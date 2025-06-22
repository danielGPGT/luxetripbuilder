-- Manual Fix for Stuck Trial Subscriptions
-- Run this in your Supabase SQL Editor

-- ========================================
-- STEP 1: Check current subscription status
-- ========================================

-- Replace 'YOUR_USER_ID' with your actual user ID
-- Example: '9583966e-0dbf-4199-a2c8-27478bb3d185'

SELECT 
    'Current subscription status' as info,
    user_id,
    status,
    plan_type,
    stripe_subscription_id,
    current_period_start,
    current_period_end,
    created_at,
    updated_at
FROM public.subscriptions 
WHERE user_id = '9583966e-0dbf-4199-a2c8-27478bb3d185';

-- ========================================
-- STEP 2: Find all trialing subscriptions with Stripe IDs
-- ========================================

SELECT 
    'Trialing subscriptions with Stripe IDs' as info,
    user_id,
    status,
    plan_type,
    stripe_subscription_id,
    current_period_end
FROM public.subscriptions 
WHERE status = 'trialing' 
AND stripe_subscription_id IS NOT NULL;

-- ========================================
-- STEP 3: Manually fix a specific user's trial
-- ========================================

-- UNCOMMENT AND MODIFY THE BELOW LINES TO FIX YOUR SUBSCRIPTION
-- Replace 'YOUR_USER_ID' with your actual user ID

/*
UPDATE public.subscriptions 
SET 
    status = 'active',
    updated_at = NOW()
WHERE user_id = '9583966e-0dbf-4199-a2c8-27478bb3d185'
AND status = 'trialing'
AND stripe_subscription_id IS NOT NULL;
*/

-- ========================================
-- STEP 4: Verify the fix
-- ========================================

-- UNCOMMENT TO VERIFY THE FIX
/*
SELECT 
    'After fix - subscription status' as info,
    user_id,
    status,
    plan_type,
    stripe_subscription_id,
    updated_at
FROM public.subscriptions 
WHERE user_id = '9583966e-0dbf-4199-a2c8-27478bb3d185';
*/

-- ========================================
-- STEP 5: Check all subscription statuses
-- ========================================

SELECT 
    'All subscription statuses' as info,
    status,
    COUNT(*) as count
FROM public.subscriptions 
GROUP BY status
ORDER BY count DESC; 