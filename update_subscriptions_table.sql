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

-- Migration to update subscriptions table for new pricing structure
-- Run this in your Supabase SQL Editor

-- First, let's check what constraints exist on the subscriptions table
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'public.subscriptions'::regclass 
AND contype = 'c';

-- Drop ALL check constraints on plan_type column (handle different constraint names)
DO $$
DECLARE
    constraint_name text;
BEGIN
    -- Find and drop any check constraints that reference plan_type
    FOR constraint_name IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'public.subscriptions'::regclass 
        AND contype = 'c'
        AND pg_get_constraintdef(oid) LIKE '%plan_type%'
    LOOP
        EXECUTE 'ALTER TABLE public.subscriptions DROP CONSTRAINT ' || constraint_name;
        RAISE NOTICE 'Dropped constraint: %', constraint_name;
    END LOOP;
END $$;

-- First, add the new columns that we'll need for the update
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS seat_count INTEGER DEFAULT 1;

ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS team_name TEXT;

ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS base_price INTEGER DEFAULT 0; -- Amount in pence

ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS seat_price INTEGER DEFAULT 0; -- Amount in pence per seat

-- Now update existing subscriptions to new plan structure
UPDATE public.subscriptions 
SET plan_type = CASE 
    WHEN plan_type = 'starter' THEN 'free'
    WHEN plan_type = 'professional' THEN 'pro'
    WHEN plan_type = 'enterprise' THEN 'enterprise'
    ELSE plan_type
END,
base_price = CASE 
    WHEN plan_type = 'starter' THEN 0
    WHEN plan_type = 'professional' THEN 3900 -- £39.00 in pence
    WHEN plan_type = 'enterprise' THEN 0 -- Custom pricing
    ELSE base_price
END,
seat_price = CASE 
    WHEN plan_type = 'professional' THEN 0 -- No per-seat pricing for Pro
    WHEN plan_type = 'enterprise' THEN 1000 -- £10.00 per seat in pence
    ELSE seat_price
END;

-- Now add the new constraint with updated plan types
ALTER TABLE public.subscriptions 
ADD CONSTRAINT subscriptions_plan_type_check 
CHECK (plan_type IN ('free', 'pro', 'agency', 'enterprise'));

-- Create team_members table for Agency plans
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'invited', 'inactive')),
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    joined_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(subscription_id, user_id)
);

-- Create indexes for team_members
CREATE INDEX IF NOT EXISTS idx_team_members_subscription_id ON public.team_members(subscription_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_email ON public.team_members(email);

-- Enable RLS on team_members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- RLS policies for team_members
CREATE POLICY "Team members can view their own team data" ON public.team_members
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.uid() IN (
            SELECT user_id FROM public.subscriptions 
            WHERE id = subscription_id
        )
    );

CREATE POLICY "Subscription owners can manage team members" ON public.team_members
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM public.subscriptions 
            WHERE id = subscription_id
        )
    );

-- Create function to calculate subscription cost
CREATE OR REPLACE FUNCTION calculate_subscription_cost(
    p_base_price INTEGER,
    p_seat_price INTEGER,
    p_seat_count INTEGER
)
RETURNS INTEGER AS $$
BEGIN
    RETURN p_base_price + (p_seat_price * p_seat_count);
END;
$$ LANGUAGE plpgsql;

-- Create function to get subscription details with cost
CREATE OR REPLACE FUNCTION get_subscription_with_cost(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    plan_type TEXT,
    status TEXT,
    seat_count INTEGER,
    team_name TEXT,
    base_price INTEGER,
    seat_price INTEGER,
    total_cost INTEGER,
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
        s.seat_count,
        s.team_name,
        s.base_price,
        s.seat_price,
        calculate_subscription_cost(s.base_price, s.seat_price, s.seat_count) as total_cost,
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
$$ LANGUAGE plpgsql;

-- Create function to update seat count and recalculate billing
CREATE OR REPLACE FUNCTION update_seat_count(
    p_subscription_id UUID,
    p_new_seat_count INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    v_current_seats INTEGER;
    v_plan_type TEXT;
BEGIN
    -- Get current seat count and plan type
    SELECT seat_count, plan_type INTO v_current_seats, v_plan_type
    FROM public.subscriptions
    WHERE id = p_subscription_id;
    
    -- Only allow seat count changes for Agency and Enterprise plans
    IF v_plan_type NOT IN ('agency', 'enterprise') THEN
        RAISE EXCEPTION 'Seat count can only be changed for Agency and Enterprise plans';
    END IF;
    
    -- Validate seat count limits
    IF p_new_seat_count < 1 THEN
        RAISE EXCEPTION 'Seat count must be at least 1';
    END IF;
    
    IF v_plan_type = 'agency' AND p_new_seat_count > 10 THEN
        RAISE EXCEPTION 'Agency plans are limited to 10 seats';
    END IF;
    
    -- Update seat count
    UPDATE public.subscriptions
    SET seat_count = p_new_seat_count,
        updated_at = NOW()
    WHERE id = p_subscription_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for team_members updated_at
DROP TRIGGER IF EXISTS update_team_members_updated_at ON public.team_members;
CREATE TRIGGER update_team_members_updated_at 
    BEFORE UPDATE ON public.team_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user registration with free plan
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.subscriptions (
        user_id,
        plan_type,
        status,
        seat_count,
        base_price,
        seat_price,
        current_period_start,
        current_period_end,
        cancel_at_period_end
    ) VALUES (
        NEW.id,
        'free',
        'active',
        1,
        0,
        0,
        NOW(),
        NOW() + INTERVAL '1 month',
        FALSE
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new user registration (if not exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Verify the changes
SELECT 
    'subscriptions' as table_name,
    COUNT(*) as row_count,
    'Updated plan types: ' || 
    STRING_AGG(DISTINCT plan_type, ', ') as plan_types
FROM public.subscriptions 
GROUP BY table_name

UNION ALL

SELECT 'team_members' as table_name, COUNT(*) as row_count, 'Created' as plan_types 
FROM public.team_members; 