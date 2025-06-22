-- Fix All Subscription Issues
-- Run this in your Supabase SQL Editor

-- ========================================
-- STEP 1: Clean up duplicate subscriptions
-- ========================================

-- Delete duplicate subscriptions, keeping only the most recent one per user
DELETE FROM public.subscriptions 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id 
  FROM public.subscriptions 
  ORDER BY user_id, created_at DESC
);

-- ========================================
-- STEP 2: Ensure proper table structure
-- ========================================

-- Make sure the status column accepts all required values
ALTER TABLE public.subscriptions 
DROP CONSTRAINT IF EXISTS subscriptions_status_check;

ALTER TABLE public.subscriptions 
ADD CONSTRAINT subscriptions_status_check 
CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired'));

-- ========================================
-- STEP 3: Add missing columns if they don't exist
-- ========================================

-- Add stripe_subscription_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscriptions' AND column_name = 'stripe_subscription_id') THEN
        ALTER TABLE public.subscriptions ADD COLUMN stripe_subscription_id TEXT;
    END IF;
END $$;

-- Add stripe_customer_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subscriptions' AND column_name = 'stripe_customer_id') THEN
        ALTER TABLE public.subscriptions ADD COLUMN stripe_customer_id TEXT;
    END IF;
END $$;

-- ========================================
-- STEP 4: Ensure all users have proper trial subscriptions
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
-- STEP 5: Update existing subscriptions to have proper data
-- ========================================

-- Update subscriptions that don't have proper trial end dates
UPDATE public.subscriptions 
SET 
    current_period_start = COALESCE(current_period_start, NOW()),
    current_period_end = COALESCE(current_period_end, NOW() + INTERVAL '7 days'),
    status = CASE 
        WHEN status IS NULL THEN 'trialing'
        WHEN status NOT IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired') THEN 'trialing'
        ELSE status
    END,
    updated_at = NOW()
WHERE current_period_start IS NULL 
   OR current_period_end IS NULL 
   OR status IS NULL
   OR status NOT IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired');

-- ========================================
-- STEP 6: Create or update database functions
-- ========================================

-- Function to check if trial is active
CREATE OR REPLACE FUNCTION public.is_trial_active(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    subscription_record RECORD;
BEGIN
    -- Get the user's subscription
    SELECT * INTO subscription_record
    FROM public.subscriptions
    WHERE user_id = user_uuid
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Check if trial is active
    IF subscription_record IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Trial is active if status is 'trialing' and current_period_end is in the future
    RETURN subscription_record.status = 'trialing' 
           AND subscription_record.current_period_end > NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check subscription access
CREATE OR REPLACE FUNCTION public.has_subscription_access(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    subscription_record RECORD;
BEGIN
    -- Get the user's subscription
    SELECT * INTO subscription_record
    FROM public.subscriptions
    WHERE user_id = user_uuid
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- No subscription found
    IF subscription_record IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Active subscription
    IF subscription_record.status = 'active' THEN
        RETURN TRUE;
    END IF;
    
    -- Active trial
    IF subscription_record.status = 'trialing' AND subscription_record.current_period_end > NOW() THEN
        RETURN TRUE;
    END IF;
    
    -- Canceled but still within period
    IF subscription_record.cancel_at_period_end = TRUE AND subscription_record.current_period_end > NOW() THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get trial days remaining
CREATE OR REPLACE FUNCTION public.get_trial_days_remaining(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    subscription_record RECORD;
    days_remaining INTEGER;
BEGIN
    -- Get the user's subscription
    SELECT * INTO subscription_record
    FROM public.subscriptions
    WHERE user_id = user_uuid
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- No subscription found
    IF subscription_record IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Not a trial
    IF subscription_record.status != 'trialing' THEN
        RETURN 0;
    END IF;
    
    -- Calculate days remaining
    days_remaining := EXTRACT(DAY FROM (subscription_record.current_period_end - NOW()));
    
    -- Return 0 if trial has expired
    IF days_remaining < 0 THEN
        RETURN 0;
    END IF;
    
    RETURN days_remaining;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- STEP 7: Verify the setup
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

-- Test the functions
SELECT 
    'Testing access function' as info,
    user_id,
    status,
    current_period_end,
    public.has_subscription_access(user_id) as has_access
FROM public.subscriptions 
LIMIT 5;

-- Test the trial days function
SELECT 
    'Testing trial days function' as info,
    user_id,
    status,
    current_period_end,
    public.get_trial_days_remaining(user_id) as days_remaining
FROM public.subscriptions 
WHERE status = 'trialing'
LIMIT 5; 