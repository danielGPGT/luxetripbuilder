-- Fix HubSpot RLS Policies - Version 2
-- This script provides a more robust fix for the 406 errors

-- First, let's check what policies currently exist
SELECT 'Current policies:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename LIKE 'hubspot_%' AND schemaname = 'public';

-- Drop ALL existing HubSpot policies to start fresh
DROP POLICY IF EXISTS "Team owners can manage their HubSpot connections" ON public.hubspot_connections;
DROP POLICY IF EXISTS "Team admins can view HubSpot connections" ON public.hubspot_connections;
DROP POLICY IF EXISTS "Users can view their team's HubSpot connections" ON public.hubspot_connections;
DROP POLICY IF EXISTS "Team owners can manage HubSpot connections" ON public.hubspot_connections;

DROP POLICY IF EXISTS "Team members can view contact mappings" ON public.hubspot_contact_mappings;
DROP POLICY IF EXISTS "Team owners can manage contact mappings" ON public.hubspot_contact_mappings;
DROP POLICY IF EXISTS "Users can view their team's contact mappings" ON public.hubspot_contact_mappings;

DROP POLICY IF EXISTS "Team members can view deal mappings" ON public.hubspot_deal_mappings;
DROP POLICY IF EXISTS "Team owners can manage deal mappings" ON public.hubspot_deal_mappings;
DROP POLICY IF EXISTS "Users can view their team's deal mappings" ON public.hubspot_deal_mappings;

DROP POLICY IF EXISTS "Team members can view sync logs" ON public.hubspot_sync_logs;
DROP POLICY IF EXISTS "Users can view their team's sync logs" ON public.hubspot_sync_logs;

DROP POLICY IF EXISTS "Team owners can manage sync settings" ON public.hubspot_sync_settings;
DROP POLICY IF EXISTS "Team admins can view sync settings" ON public.hubspot_sync_settings;
DROP POLICY IF EXISTS "Users can view their team's sync settings" ON public.hubspot_sync_settings;

-- Create simplified, more permissive policies for HubSpot connections
CREATE POLICY "hubspot_connections_select_policy" ON public.hubspot_connections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.teams t 
      WHERE t.id = hubspot_connections.team_id 
      AND (
        t.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.team_members tm 
          WHERE tm.team_id = t.id 
          AND tm.user_id = auth.uid() 
          AND tm.status = 'active'
        )
      )
    )
  );

CREATE POLICY "hubspot_connections_insert_policy" ON public.hubspot_connections
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teams t 
      WHERE t.id = hubspot_connections.team_id 
      AND t.owner_id = auth.uid()
    )
  );

CREATE POLICY "hubspot_connections_update_policy" ON public.hubspot_connections
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.teams t 
      WHERE t.id = hubspot_connections.team_id 
      AND t.owner_id = auth.uid()
    )
  );

CREATE POLICY "hubspot_connections_delete_policy" ON public.hubspot_connections
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.teams t 
      WHERE t.id = hubspot_connections.team_id 
      AND t.owner_id = auth.uid()
    )
  );

-- Create simplified policies for HubSpot sync settings
CREATE POLICY "hubspot_sync_settings_select_policy" ON public.hubspot_sync_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.teams t 
      WHERE t.id = hubspot_sync_settings.team_id 
      AND (
        t.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.team_members tm 
          WHERE tm.team_id = t.id 
          AND tm.user_id = auth.uid() 
          AND tm.status = 'active'
        )
      )
    )
  );

CREATE POLICY "hubspot_sync_settings_insert_policy" ON public.hubspot_sync_settings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teams t 
      WHERE t.id = hubspot_sync_settings.team_id 
      AND t.owner_id = auth.uid()
    )
  );

CREATE POLICY "hubspot_sync_settings_update_policy" ON public.hubspot_sync_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.teams t 
      WHERE t.id = hubspot_sync_settings.team_id 
      AND t.owner_id = auth.uid()
    )
  );

CREATE POLICY "hubspot_sync_settings_delete_policy" ON public.hubspot_sync_settings
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.teams t 
      WHERE t.id = hubspot_sync_settings.team_id 
      AND t.owner_id = auth.uid()
    )
  );

-- Create simplified policies for HubSpot sync logs
CREATE POLICY "hubspot_sync_logs_select_policy" ON public.hubspot_sync_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.teams t 
      WHERE t.id = hubspot_sync_logs.team_id 
      AND (
        t.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.team_members tm 
          WHERE tm.team_id = t.id 
          AND tm.user_id = auth.uid() 
          AND tm.status = 'active'
        )
      )
    )
  );

CREATE POLICY "hubspot_sync_logs_insert_policy" ON public.hubspot_sync_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teams t 
      WHERE t.id = hubspot_sync_logs.team_id 
      AND (
        t.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.team_members tm 
          WHERE tm.team_id = t.id 
          AND tm.user_id = auth.uid() 
          AND tm.status = 'active'
        )
      )
    )
  );

-- Create simplified policies for HubSpot contact mappings
CREATE POLICY "hubspot_contact_mappings_select_policy" ON public.hubspot_contact_mappings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.teams t 
      WHERE t.id = hubspot_contact_mappings.team_id 
      AND (
        t.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.team_members tm 
          WHERE tm.team_id = t.id 
          AND tm.user_id = auth.uid() 
          AND tm.status = 'active'
        )
      )
    )
  );

CREATE POLICY "hubspot_contact_mappings_insert_policy" ON public.hubspot_contact_mappings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teams t 
      WHERE t.id = hubspot_contact_mappings.team_id 
      AND t.owner_id = auth.uid()
    )
  );

-- Create simplified policies for HubSpot deal mappings
CREATE POLICY "hubspot_deal_mappings_select_policy" ON public.hubspot_deal_mappings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.teams t 
      WHERE t.id = hubspot_deal_mappings.team_id 
      AND (
        t.owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.team_members tm 
          WHERE tm.team_id = t.id 
          AND tm.user_id = auth.uid() 
          AND tm.status = 'active'
        )
      )
    )
  );

CREATE POLICY "hubspot_deal_mappings_insert_policy" ON public.hubspot_deal_mappings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teams t 
      WHERE t.id = hubspot_deal_mappings.team_id 
      AND t.owner_id = auth.uid()
    )
  );

-- Create default sync settings for all teams that don't have them
INSERT INTO public.hubspot_sync_settings (team_id)
SELECT t.id
FROM public.teams t
WHERE NOT EXISTS (
  SELECT 1 FROM public.hubspot_sync_settings hss 
  WHERE hss.team_id = t.id
)
ON CONFLICT (team_id) DO NOTHING;

-- Verify the new policies
SELECT 'New policies created:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename LIKE 'hubspot_%' AND schemaname = 'public'; 