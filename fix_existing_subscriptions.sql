-- Fix existing subscriptions data before running the main migration
-- Run this FIRST in your Supabase SQL Editor

-- Check what plan types currently exist
SELECT DISTINCT plan_type, COUNT(*) as count 
FROM public.subscriptions 
GROUP BY plan_type;

-- Update existing subscriptions to new plan structure
UPDATE public.subscriptions 
SET plan_type = CASE 
    WHEN plan_type = 'starter' THEN 'free'
    WHEN plan_type = 'professional' THEN 'pro'
    WHEN plan_type = 'enterprise' THEN 'enterprise'
    ELSE plan_type
END;

-- Verify the update worked
SELECT DISTINCT plan_type, COUNT(*) as count 
FROM public.subscriptions 
GROUP BY plan_type;

-- Now you can run the main migration (update_subscriptions_table.sql) 