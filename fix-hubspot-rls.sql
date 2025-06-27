-- Fix HubSpot RLS Policies
-- This script updates the RLS policies to be more permissive and handle edge cases

-- Drop existing policies first
DROP POLICY IF EXISTS "Team owners can manage their HubSpot connections" ON public.hubspot_connections;
DROP POLICY IF EXISTS "Team admins can view HubSpot connections" ON public.hubspot_connections;
DROP POLICY IF EXISTS "Team members can view contact mappings" ON public.hubspot_contact_mappings;
DROP POLICY IF EXISTS "Team owners can manage contact mappings" ON public.hubspot_contact_mappings;
DROP POLICY IF EXISTS "Team members can view deal mappings" ON public.hubspot_deal_mappings;
DROP POLICY IF EXISTS "Team owners can manage deal mappings" ON public.hubspot_deal_mappings;
DROP POLICY IF EXISTS "Team members can view sync logs" ON public.hubspot_sync_logs;
DROP POLICY IF EXISTS "Team owners can manage sync settings" ON public.hubspot_sync_settings;
DROP POLICY IF EXISTS "Team admins can view sync settings" ON public.hubspot_sync_settings;

-- Create more permissive policies for HubSpot connections
CREATE POLICY "Users can view their team's HubSpot connections" ON public.hubspot_connections
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

CREATE POLICY "Team owners can manage HubSpot connections" ON public.hubspot_connections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.teams t 
      WHERE t.id = hubspot_connections.team_id 
      AND t.owner_id = auth.uid()
    )
  );

-- Create more permissive policies for HubSpot contact mappings
CREATE POLICY "Users can view their team's contact mappings" ON public.hubspot_contact_mappings
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

CREATE POLICY "Team owners can manage contact mappings" ON public.hubspot_contact_mappings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.teams t 
      WHERE t.id = hubspot_contact_mappings.team_id 
      AND t.owner_id = auth.uid()
    )
  );

-- Create more permissive policies for HubSpot deal mappings
CREATE POLICY "Users can view their team's deal mappings" ON public.hubspot_deal_mappings
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

CREATE POLICY "Team owners can manage deal mappings" ON public.hubspot_deal_mappings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.teams t 
      WHERE t.id = hubspot_deal_mappings.team_id 
      AND t.owner_id = auth.uid()
    )
  );

-- Create more permissive policies for HubSpot sync logs
CREATE POLICY "Users can view their team's sync logs" ON public.hubspot_sync_logs
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

-- Create more permissive policies for HubSpot sync settings
CREATE POLICY "Users can view their team's sync settings" ON public.hubspot_sync_settings
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

CREATE POLICY "Team owners can manage sync settings" ON public.hubspot_sync_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.teams t 
      WHERE t.id = hubspot_sync_settings.team_id 
      AND t.owner_id = auth.uid()
    )
  );

-- Create default sync settings for existing teams that don't have them
INSERT INTO public.hubspot_sync_settings (team_id)
SELECT t.id
FROM public.teams t
WHERE NOT EXISTS (
  SELECT 1 FROM public.hubspot_sync_settings hss 
  WHERE hss.team_id = t.id
)
ON CONFLICT (team_id) DO NOTHING; 