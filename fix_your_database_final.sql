-- Fix Your Database - Final Version
-- This version properly handles constraints and conflicts

-- ========================================
-- STEP 1: Add missing constraints and indexes
-- ========================================

-- Add unique constraint to usage_tracking to prevent 409 conflicts
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'usage_tracking_user_month_unique'
    ) THEN
        ALTER TABLE public.usage_tracking 
        ADD CONSTRAINT usage_tracking_user_month_unique 
        UNIQUE (user_id, month);
    END IF;
END $$;

-- Add unique constraint to subscriptions if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'subscriptions_user_id_unique'
    ) THEN
        ALTER TABLE public.subscriptions 
        ADD CONSTRAINT subscriptions_user_id_unique 
        UNIQUE (user_id);
    END IF;
END $$;

-- Add indexes for better performance (IF NOT EXISTS handles duplicates)
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON public.usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_month ON public.usage_tracking(month);
CREATE INDEX IF NOT EXISTS idx_itineraries_user_id ON public.itineraries(user_id);
CREATE INDEX IF NOT EXISTS idx_itineraries_generated_by ON public.itineraries(generated_by);
CREATE INDEX IF NOT EXISTS idx_itineraries_created_at ON public.itineraries(created_at);

-- ========================================
-- STEP 2: Enable RLS on all tables
-- ========================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;

-- ========================================
-- STEP 3: Create RLS policies
-- ========================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view their own usage" ON public.usage_tracking;
DROP POLICY IF EXISTS "Users can insert their own usage" ON public.usage_tracking;
DROP POLICY IF EXISTS "Users can update their own usage" ON public.usage_tracking;
DROP POLICY IF EXISTS "Users can view their own itineraries" ON public.itineraries;
DROP POLICY IF EXISTS "Users can insert their own itineraries" ON public.itineraries;
DROP POLICY IF EXISTS "Users can update their own itineraries" ON public.itineraries;
DROP POLICY IF EXISTS "Users can delete their own itineraries" ON public.itineraries;

-- Users table policies
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Subscriptions table policies
CREATE POLICY "Users can view their own subscriptions"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions"
  ON public.subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON public.subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Usage tracking table policies
CREATE POLICY "Users can view their own usage"
  ON public.usage_tracking FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage"
  ON public.usage_tracking FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage"
  ON public.usage_tracking FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Itineraries table policies (using both user_id and generated_by)
CREATE POLICY "Users can view their own itineraries"
  ON public.itineraries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid()::text = generated_by);

CREATE POLICY "Users can insert their own itineraries"
  ON public.itineraries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND auth.uid()::text = generated_by);

CREATE POLICY "Users can update their own itineraries"
  ON public.itineraries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid()::text = generated_by)
  WITH CHECK (auth.uid() = user_id AND auth.uid()::text = generated_by);

CREATE POLICY "Users can delete their own itineraries"
  ON public.itineraries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid()::text = generated_by);

-- ========================================
-- STEP 4: Create functions and triggers (safe version)
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle user profile creation
CREATE OR REPLACE FUNCTION public.handle_user_profile_creation()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user profile already exists
  IF EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
    -- Update existing profile
    UPDATE public.users 
    SET 
      email = NEW.email,
      name = COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
      updated_at = NOW()
    WHERE id = NEW.id;
  ELSE
    -- Create new profile
    INSERT INTO public.users (id, email, name, created_at, updated_at)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
      NOW(),
      NOW()
    );
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth operation
    RAISE WARNING 'Error creating user profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle subscription creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create a trial subscription for new users
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
    VALUES (
        NEW.id, 
        'starter', 
        'trialing', 
        NOW(), 
        NOW() + INTERVAL '7 days', -- 7-day trial
        false, 
        null, 
        null
    );
    
    RAISE NOTICE 'Created trial subscription for user %', NEW.id;
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error creating subscription for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers (only if they don't exist)
DO $$
BEGIN
    -- Users table trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at
            BEFORE UPDATE ON public.users
            FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    
    -- Subscriptions table trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_subscriptions_updated_at') THEN
        CREATE TRIGGER update_subscriptions_updated_at
            BEFORE UPDATE ON public.subscriptions
            FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    
    -- Usage tracking table trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_usage_tracking_updated_at') THEN
        CREATE TRIGGER update_usage_tracking_updated_at
            BEFORE UPDATE ON public.usage_tracking
            FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    
    -- Itineraries table trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_itineraries_updated_at') THEN
        CREATE TRIGGER update_itineraries_updated_at
            BEFORE UPDATE ON public.itineraries
            FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
    
    -- Auth user profile creation trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created_profile') THEN
        CREATE TRIGGER on_auth_user_created_profile
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION public.handle_user_profile_creation();
    END IF;
    
    -- Auth user subscription creation trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
        CREATE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;
END $$;

-- ========================================
-- STEP 5: Grant permissions
-- ========================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.subscriptions TO authenticated;
GRANT ALL ON public.usage_tracking TO authenticated;
GRANT ALL ON public.itineraries TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ========================================
-- STEP 6: Create profiles for existing users (without ON CONFLICT)
-- ========================================

-- Insert profiles for users who don't have them
INSERT INTO public.users (id, email, name, created_at, updated_at)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)) as name,
    au.created_at,
    NOW()
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM public.users WHERE id = au.id);

-- ========================================
-- STEP 7: Create starter subscriptions for existing users (without ON CONFLICT)
-- ========================================

-- Insert starter subscriptions for users who don't have them
INSERT INTO public.subscriptions (user_id, plan_type, status)
SELECT id, 'starter', 'active' 
FROM auth.users 
WHERE NOT EXISTS (SELECT 1 FROM public.subscriptions WHERE user_id = auth.users.id);

-- ========================================
-- STEP 8: Verify setup
-- ========================================

-- Show all tables
SELECT 'Tables verified:' as info;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Show all policies
SELECT 'Policies created:' as info;
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Show RLS status
SELECT 'RLS Status:' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Show triggers
SELECT 'Triggers:' as info;
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY trigger_name;

-- Show constraints
SELECT 'Constraints:' as info;
SELECT 
    conname,
    tablename,
    contype
FROM pg_constraint 
WHERE schemaname = 'public'
ORDER BY tablename, conname;

-- Show user count comparison
SELECT 'User Counts:' as info;
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

SELECT 'Database fix completed successfully!' as status; 