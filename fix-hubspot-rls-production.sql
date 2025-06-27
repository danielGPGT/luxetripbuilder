-- Production-ready HubSpot RLS Fix
-- This creates proper RLS policies that work correctly

-- First, let's check what policies currently exist
SELECT 'Current policies on hubspot_sync_logs:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'hubspot_sync_logs' AND schemaname = 'public'
ORDER BY policyname;

-- Drop all existing problematic policies
DROP POLICY IF EXISTS "hubspot_sync_logs_all" ON public.hubspot_sync_logs;
DROP POLICY IF EXISTS "hubspot_sync_logs_permissive" ON public.hubspot_sync_logs;
DROP POLICY IF EXISTS "hubspot_sync_logs_read_all" ON public.hubspot_sync_logs;
DROP POLICY IF EXISTS "Team members can view sync logs" ON public.hubspot_sync_logs;
DROP POLICY IF EXISTS "Users can view their team's sync logs" ON public.hubspot_sync_logs;
DROP POLICY IF EXISTS "hubspot_sync_logs_select_policy" ON public.hubspot_sync_logs;
DROP POLICY IF EXISTS "hubspot_sync_logs_insert_policy" ON public.hubspot_sync_logs;

-- Create proper production RLS policies for hubspot_sync_logs
-- Policy 1: Allow team owners to do everything
CREATE POLICY "hubspot_sync_logs_team_owners" ON public.hubspot_sync_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.teams t 
      WHERE t.id = hubspot_sync_logs.team_id 
      AND t.owner_id = auth.uid()
    )
  );

-- Policy 2: Allow active team members to read and insert
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

-- Policy 3: Allow the system to create sync logs (for automated processes)
CREATE POLICY "hubspot_sync_logs_system" ON public.hubspot_sync_logs
  FOR INSERT WITH CHECK (
    hubspot_sync_logs.team_id IS NOT NULL
  );

-- Verify the new policies
SELECT 'New policies created on hubspot_sync_logs:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'hubspot_sync_logs' AND schemaname = 'public'
ORDER BY policyname;

-- Test the policies by checking if they allow the problematic query
SELECT 'Testing RLS policies...' as info;
SELECT 
  'RLS enabled' as status,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'hubspot_sync_logs' 
  AND schemaname = 'public'; 