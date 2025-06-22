-- Fix Trial Database Issues
-- Run this in your Supabase SQL Editor

-- ========================================
-- STEP 1: Check and fix subscription table structure
-- ========================================

-- Make sure the status column accepts 'trialing'
ALTER TABLE public.subscriptions 
DROP CONSTRAINT IF EXISTS subscriptions_status_check;

ALTER TABLE public.subscriptions 
ADD CONSTRAINT subscriptions_status_check 
CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired'));

-- ========================================
-- STEP 2: Ensure all users have a subscription record
-- ========================================

-- Insert trial subscriptions for users who don't have any subscription
INSERT INTO public.subscriptions (
    user_id, 
    plan_type, 
    status, 
    current_period_start, 
    current_period_end, 
    cancel_at_period_end,
    created_at,
    updated_at
)
SELECT 
    au.id, 
    'starter', 
    'trialing', 
    NOW(), 
    NOW() + INTERVAL '7 days', 
    false,
    NOW(),
    NOW()
FROM auth.users au
LEFT JOIN public.subscriptions ps ON au.id = ps.user_id
WHERE ps.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- ========================================
-- STEP 3: Update existing subscriptions to have proper trial data
-- ========================================

-- Update subscriptions that don't have proper trial end dates
UPDATE public.subscriptions 
SET 
    current_period_start = COALESCE(current_period_start, NOW()),
    current_period_end = COALESCE(current_period_end, NOW() + INTERVAL '7 days'),
    updated_at = NOW()
WHERE status = 'trialing' 
AND (current_period_start IS NULL OR current_period_end IS NULL);

-- ========================================
-- STEP 4: Verify the setup
-- ========================================

-- Check subscription statuses
SELECT 
    'Subscription statuses' as info,
    status,
    COUNT(*) as count
FROM public.subscriptions 
GROUP BY status
ORDER BY count DESC;

-- Check users without subscriptions
SELECT 
    'Users without subscriptions' as info,
    COUNT(*) as count
FROM auth.users au
LEFT JOIN public.subscriptions ps ON au.id = ps.user_id
WHERE ps.user_id IS NULL;

-- Check trial subscriptions
SELECT 
    'Trial subscriptions' as info,
    COUNT(*) as count
FROM public.subscriptions 
WHERE status = 'trialing';

-- ========================================
-- STEP 5: Test the database functions
-- ========================================

-- Test the has_subscription_access function
SELECT 
    'Testing access function' as info,
    user_id,
    status,
    current_period_end,
    public.has_subscription_access(user_id) as has_access
FROM public.subscriptions 
LIMIT 5;

-- Test the trial days remaining function
SELECT 
    'Testing trial days function' as info,
    user_id,
    status,
    current_period_end,
    public.get_trial_days_remaining(user_id) as days_remaining
FROM public.subscriptions 
WHERE status = 'trialing'
LIMIT 5; 