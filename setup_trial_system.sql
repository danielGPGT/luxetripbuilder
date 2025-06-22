-- Setup Free Trial System
-- Run this in your Supabase SQL Editor

-- ========================================
-- STEP 1: Update the subscription creation trigger
-- ========================================

-- Drop existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop existing function
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Recreate the function to create trial subscriptions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create a 7-day trial subscription
    INSERT INTO public.subscriptions (
        user_id, 
        plan_type, 
        status, 
        current_period_start, 
        current_period_end, 
        cancel_at_period_end
    )
    VALUES (
        NEW.id, 
        'starter', 
        'trialing', 
        NOW(), 
        NOW() + INTERVAL '7 days', 
        false
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error creating trial subscription for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================
-- STEP 2: Add trial status to subscription status check
-- ========================================

-- Update the subscription status check constraint to include 'trialing'
ALTER TABLE public.subscriptions 
DROP CONSTRAINT IF EXISTS subscriptions_status_check;

ALTER TABLE public.subscriptions 
ADD CONSTRAINT subscriptions_status_check 
CHECK (status IN ('active', 'canceled', 'past_due', 'trialing', 'incomplete', 'incomplete_expired'));

-- ========================================
-- STEP 3: Create function to check trial status
-- ========================================

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

-- ========================================
-- STEP 4: Create function to check subscription access
-- ========================================

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

-- ========================================
-- STEP 5: Create function to get trial days remaining
-- ========================================

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
-- STEP 6: Update existing users to have trial subscriptions
-- ========================================

-- For users who don't have any subscription, create a trial
INSERT INTO public.subscriptions (
    user_id, 
    plan_type, 
    status, 
    current_period_start, 
    current_period_end, 
    cancel_at_period_end
)
SELECT 
    au.id, 
    'starter', 
    'trialing', 
    NOW(), 
    NOW() + INTERVAL '7 days', 
    false
FROM auth.users au
LEFT JOIN public.subscriptions ps ON au.id = ps.user_id
WHERE ps.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- ========================================
-- STEP 7: Verify the setup
-- ========================================

-- Check trial subscriptions
SELECT 
    'Trial subscriptions created' as status,
    COUNT(*) as count
FROM public.subscriptions 
WHERE status = 'trialing'

UNION ALL

-- Check total subscriptions
SELECT 
    'Total subscriptions' as status,
    COUNT(*) as count
FROM public.subscriptions

UNION ALL

-- Check users without subscriptions
SELECT 
    'Users without subscriptions' as status,
    COUNT(*) as count
FROM auth.users au
LEFT JOIN public.subscriptions ps ON au.id = ps.user_id
WHERE ps.user_id IS NULL; 