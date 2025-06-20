-- Migration to add Stripe columns to existing subscriptions table
-- Run this in your Supabase SQL Editor

-- Add missing columns to existing subscriptions table
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Create customers table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    stripe_customer_id TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create billing_history table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.billing_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    stripe_invoice_id TEXT,
    amount INTEGER NOT NULL, -- Amount in cents
    currency TEXT DEFAULT 'usd',
    status TEXT NOT NULL CHECK (status IN ('paid', 'open', 'void', 'uncollectible')),
    billing_reason TEXT CHECK (billing_reason IN ('subscription_cycle', 'subscription_create', 'subscription_update', 'subscription_threshold', 'manual')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_stripe_customer_id ON public.customers(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_user_id ON public.billing_history(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_subscription_id ON public.billing_history(subscription_id);

-- Create RLS policies for customers table
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own customer data" ON public.customers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own customer data" ON public.customers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customer data" ON public.customers
    FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for billing_history table
ALTER TABLE public.billing_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own billing history" ON public.billing_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own billing history" ON public.billing_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp (if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at (if they don't exist)
DROP TRIGGER IF EXISTS update_customers_updated_at ON public.customers;
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle subscription status changes
CREATE OR REPLACE FUNCTION handle_subscription_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- If subscription is canceled, update user tier to starter
    IF NEW.status = 'canceled' AND OLD.status != 'canceled' THEN
        -- Update user profile to starter tier (if user_profiles table exists)
        -- This will be handled by the tier manager instead
        NULL;
    END IF;
    
    -- If subscription becomes active, update user tier
    IF NEW.status = 'active' AND OLD.status != 'active' THEN
        -- Update user profile to match plan type (if user_profiles table exists)
        -- This will be handled by the tier manager instead
        NULL;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for subscription status changes (if it doesn't exist)
DROP TRIGGER IF EXISTS handle_subscription_status_change_trigger ON public.subscriptions;
CREATE TRIGGER handle_subscription_status_change_trigger
    AFTER UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION handle_subscription_status_change();

-- Create function to get current subscription for a user
CREATE OR REPLACE FUNCTION get_current_subscription(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    plan_type TEXT,
    status TEXT,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN,
    stripe_subscription_id TEXT,
    stripe_customer_id TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.plan_type,
        s.status,
        s.current_period_start,
        s.current_period_end,
        s.cancel_at_period_end,
        s.stripe_subscription_id,
        s.stripe_customer_id
    FROM public.subscriptions s
    WHERE s.user_id = user_uuid 
    AND s.status = 'active'
    ORDER BY s.created_at DESC
    LIMIT 1;
END;
$$ language 'plpgsql';

-- Create function to get subscription usage stats
CREATE OR REPLACE FUNCTION get_subscription_usage_stats(user_uuid UUID)
RETURNS TABLE (
    total_paid INTEGER,
    total_invoices INTEGER,
    last_payment_date TIMESTAMP WITH TIME ZONE,
    subscription_duration_days INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(bh.amount), 0) as total_paid,
        COUNT(bh.id) as total_invoices,
        MAX(bh.created_at) as last_payment_date,
        EXTRACT(DAY FROM (NOW() - MIN(s.created_at)))::INTEGER as subscription_duration_days
    FROM public.subscriptions s
    LEFT JOIN public.billing_history bh ON s.id = bh.subscription_id AND bh.status = 'paid'
    WHERE s.user_id = user_uuid;
END;
$$ language 'plpgsql';

-- Verify the changes
SELECT 
    'subscriptions' as table_name,
    COUNT(*) as row_count,
    'Has stripe_subscription_id: ' || 
    CASE WHEN column_name IS NOT NULL THEN 'YES' ELSE 'NO' END as stripe_columns
FROM public.subscriptions 
LEFT JOIN information_schema.columns 
    ON table_name = 'subscriptions' 
    AND column_name = 'stripe_subscription_id'
GROUP BY column_name

UNION ALL

SELECT 'customers' as table_name, COUNT(*) as row_count, 'Created' as stripe_columns 
FROM public.customers

UNION ALL

SELECT 'billing_history' as table_name, COUNT(*) as row_count, 'Created' as stripe_columns 
FROM public.billing_history; 