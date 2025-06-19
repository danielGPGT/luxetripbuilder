-- Check if tables exist and reset if needed
-- Run this in your Supabase SQL Editor

-- Check if tables exist
DO $$
DECLARE
    table_exists BOOLEAN;
BEGIN
    -- Check if itineraries table exists
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'itineraries'
    ) INTO table_exists;
    
    IF NOT table_exists THEN
        RAISE NOTICE 'Tables do not exist. Please run the reset_database.sql script first.';
        RAISE EXCEPTION 'Database tables not found. Run reset_database.sql to set up the database.';
    ELSE
        RAISE NOTICE 'Tables exist. Checking for usage_tracking table...';
        
        -- Check if usage_tracking table exists
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'usage_tracking'
        ) INTO table_exists;
        
        IF NOT table_exists THEN
            RAISE NOTICE 'Usage tracking table missing. Please run the reset_database.sql script.';
            RAISE EXCEPTION 'Usage tracking table not found. Run reset_database.sql to set up the database.';
        ELSE
            RAISE NOTICE 'All tables exist. Database appears to be properly set up.';
        END IF;
    END IF;
END $$;

-- Show current table status
SELECT 
    t.table_name,
    CASE 
        WHEN it.table_name IS NOT NULL THEN 'EXISTS'
        ELSE 'MISSING'
    END as status
FROM (
    SELECT 'users' as table_name
    UNION SELECT 'subscriptions'
    UNION SELECT 'usage_tracking'
    UNION SELECT 'itineraries'
) t
LEFT JOIN information_schema.tables it 
    ON it.table_name = t.table_name 
    AND it.table_schema = 'public'
ORDER BY t.table_name; 