-- Comprehensive Production RLS Fix for all HubSpot tables
-- This ensures all HubSpot integration tables work properly with proper security

-- ========================================
-- 1. FIX HUBSPOT_SYNC_LOGS TABLE
-- ========================================

-- Drop all existing policies
DROP POLICY IF EXISTS "hubspot_sync_logs_all" ON public.hubspot_sync_logs;
DROP POLICY IF EXISTS "hubspot_sync_logs_permissive" ON public.hubspot_sync_logs;
DROP POLICY IF EXISTS "hubspot_sync_logs_read_all" ON public.hubspot_sync_logs;
DROP POLICY IF EXISTS "Team members can view sync logs" ON public.hubspot_sync_logs;
DROP POLICY IF EXISTS "Users can view their team's sync logs" ON public.hubspot_sync_logs;
DROP POLICY IF EXISTS "hubspot_sync_logs_select_policy" ON public.hubspot_sync_logs;
DROP POLICY IF EXISTS "hubspot_sync_logs_insert_policy" ON public.hubspot_sync_logs;

-- Create proper policies for hubspot_sync_logs
CREATE POLICY "hubspot_sync_logs_team_owners" ON public.hubspot_sync_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.teams t 
      WHERE t.id = hubspot_sync_logs.team_id 
      AND t.owner_id = auth.uid()
    )
  );

CREATE POLICY "hubspot_sync_logs_team_members" ON public.hubspot_sync_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm 
      WHERE tm.team_id = hubspot_sync_logs.team_id 
      AND tm.user_id = auth.uid() 
      AND tm.status = 'active'
    )
  );

CREATE POLICY "hubspot_sync_logs_team_members_insert" ON public.hubspot_sync_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members tm 
      WHERE tm.team_id = hubspot_sync_logs.team_id 
      AND tm.user_id = auth.uid() 
      AND tm.status = 'active'
    )
  );

-- ========================================
-- 2. FIX HUBSPOT_CONNECTIONS TABLE
-- ========================================

-- Drop existing policies
DROP POLICY IF EXISTS "hubspot_connections_all" ON public.hubspot_connections;
DROP POLICY IF EXISTS "Team owners can manage their HubSpot connections" ON public.hubspot_connections;
DROP POLICY IF EXISTS "Team admins can view HubSpot connections" ON public.hubspot_connections;
DROP POLICY IF EXISTS "Users can view their team's HubSpot connections" ON public.hubspot_connections;

-- Create proper policies for hubspot_connections
CREATE POLICY "hubspot_connections_team_owners" ON public.hubspot_connections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.teams t 
      WHERE t.id = hubspot_connections.team_id 
      AND t.owner_id = auth.uid()
    )
  );

CREATE POLICY "hubspot_connections_team_members" ON public.hubspot_connections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm 
      WHERE tm.team_id = hubspot_connections.team_id 
      AND tm.user_id = auth.uid() 
      AND tm.status = 'active'
    )
  );

-- ========================================
-- 3. FIX HUBSPOT_SYNC_SETTINGS TABLE
-- ========================================

-- Drop existing policies
DROP POLICY IF EXISTS "hubspot_sync_settings_all" ON public.hubspot_sync_settings;
DROP POLICY IF EXISTS "Team owners can manage sync settings" ON public.hubspot_sync_settings;
DROP POLICY IF EXISTS "Team admins can view sync settings" ON public.hubspot_sync_settings;

-- Create proper policies for hubspot_sync_settings
CREATE POLICY "hubspot_sync_settings_team_owners" ON public.hubspot_sync_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.teams t 
      WHERE t.id = hubspot_sync_settings.team_id 
      AND t.owner_id = auth.uid()
    )
  );

CREATE POLICY "hubspot_sync_settings_team_members" ON public.hubspot_sync_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm 
      WHERE tm.team_id = hubspot_sync_settings.team_id 
      AND tm.user_id = auth.uid() 
      AND tm.status = 'active'
    )
  );

-- ========================================
-- 4. FIX HUBSPOT_CONTACT_MAPPINGS TABLE
-- ========================================

-- Drop existing policies
DROP POLICY IF EXISTS "hubspot_contact_mappings_all" ON public.hubspot_contact_mappings;
DROP POLICY IF EXISTS "Team members can view contact mappings" ON public.hubspot_contact_mappings;
DROP POLICY IF EXISTS "Team owners can manage contact mappings" ON public.hubspot_contact_mappings;

-- Create proper policies for hubspot_contact_mappings
CREATE POLICY "hubspot_contact_mappings_team_owners" ON public.hubspot_contact_mappings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.teams t 
      WHERE t.id = hubspot_contact_mappings.team_id 
      AND t.owner_id = auth.uid()
    )
  );

CREATE POLICY "hubspot_contact_mappings_team_members" ON public.hubspot_contact_mappings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm 
      WHERE tm.team_id = hubspot_contact_mappings.team_id 
      AND tm.user_id = auth.uid() 
      AND tm.status = 'active'
    )
  );

-- ========================================
-- 5. FIX HUBSPOT_DEAL_MAPPINGS TABLE
-- ========================================

-- Drop existing policies
DROP POLICY IF EXISTS "hubspot_deal_mappings_all" ON public.hubspot_deal_mappings;
DROP POLICY IF EXISTS "Team members can view deal mappings" ON public.hubspot_deal_mappings;
DROP POLICY IF EXISTS "Team owners can manage deal mappings" ON public.hubspot_deal_mappings;

-- Create proper policies for hubspot_deal_mappings
CREATE POLICY "hubspot_deal_mappings_team_owners" ON public.hubspot_deal_mappings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.teams t 
      WHERE t.id = hubspot_deal_mappings.team_id 
      AND t.owner_id = auth.uid()
    )
  );

CREATE POLICY "hubspot_deal_mappings_team_members" ON public.hubspot_deal_mappings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm 
      WHERE tm.team_id = hubspot_deal_mappings.team_id 
      AND tm.user_id = auth.uid() 
      AND tm.status = 'active'
    )
  );

-- ========================================
-- 6. VERIFICATION
-- ========================================

-- Show all HubSpot policies
SELECT 'All HubSpot RLS policies:' as info;
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  CASE 
    WHEN cmd = 'SELECT' THEN 'READ'
    WHEN cmd = 'INSERT' THEN 'CREATE'
    WHEN cmd = 'UPDATE' THEN 'UPDATE'
    WHEN cmd = 'DELETE' THEN 'DELETE'
    WHEN cmd = 'ALL' THEN 'ALL'
    ELSE cmd
  END as permission
FROM pg_policies 
WHERE tablename LIKE 'hubspot_%' 
  AND schemaname = 'public'
ORDER BY tablename, policyname;

-- Verify RLS is enabled on all tables
SELECT 'RLS status on HubSpot tables:' as info;
SELECT 
  schemaname,
  tablename,
  CASE 
    WHEN rowsecurity THEN 'ENABLED'
    ELSE 'DISABLED'
  END as rls_status
FROM pg_tables 
WHERE tablename LIKE 'hubspot_%' 
  AND schemaname = 'public'
ORDER BY tablename; 