-- Fix 406 error for hubspot_sync_logs
-- Drop existing policies first
DROP POLICY IF EXISTS "hubspot_sync_logs_all" ON public.hubspot_sync_logs;
DROP POLICY IF EXISTS "Team members can view sync logs" ON public.hubspot_sync_logs;
DROP POLICY IF EXISTS "Users can view their team's sync logs" ON public.hubspot_sync_logs;
DROP POLICY IF EXISTS "hubspot_sync_logs_select_policy" ON public.hubspot_sync_logs;
DROP POLICY IF EXISTS "hubspot_sync_logs_insert_policy" ON public.hubspot_sync_logs;

-- Create a more permissive policy for hubspot_sync_logs
CREATE POLICY "hubspot_sync_logs_permissive" ON public.hubspot_sync_logs
  FOR ALL USING (
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

-- Also create a fallback policy that allows all authenticated users to read
CREATE POLICY "hubspot_sync_logs_read_all" ON public.hubspot_sync_logs
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Verify the policies were created
SELECT 'HubSpot sync logs policies created:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'hubspot_sync_logs' AND schemaname = 'public'
ORDER BY policyname; 