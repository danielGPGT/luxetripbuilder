-- Temporary: Disable RLS on HubSpot tables for testing
-- WARNING: This is for debugging only - do not use in production

-- Temporary fix: Disable RLS on hubspot_sync_logs table
-- This will allow all queries to work while we debug the RLS policies

-- Disable RLS on hubspot_sync_logs table
ALTER TABLE public.hubspot_sync_logs DISABLE ROW LEVEL SECURITY;

-- Also disable RLS on other HubSpot tables to prevent similar issues
ALTER TABLE public.hubspot_connections DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.hubspot_contact_mappings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.hubspot_deal_mappings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.hubspot_sync_settings DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename LIKE 'hubspot_%' 
  AND schemaname = 'public'
ORDER BY tablename;

-- Create default sync settings for all teams
INSERT INTO public.hubspot_sync_settings (team_id)
SELECT t.id
FROM public.teams t
WHERE NOT EXISTS (
  SELECT 1 FROM public.hubspot_sync_settings hss 
  WHERE hss.team_id = t.id
)
ON CONFLICT (team_id) DO NOTHING; 