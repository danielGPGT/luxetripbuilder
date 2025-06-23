-- Diagnostic script to check constraints and data
-- Run this to understand what's causing the constraint violation

-- Check all constraints on the subscriptions table
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.subscriptions'::regclass 
AND contype = 'c';

-- Check current plan types in the table
SELECT DISTINCT plan_type, COUNT(*) as count 
FROM public.subscriptions 
GROUP BY plan_type;

-- Check if there are any rows with invalid plan types
SELECT plan_type, COUNT(*) as count
FROM public.subscriptions 
WHERE plan_type NOT IN ('free', 'pro', 'agency', 'enterprise', 'starter', 'professional')
GROUP BY plan_type;

-- Show the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'subscriptions' 
AND table_schema = 'public'
ORDER BY ordinal_position; 