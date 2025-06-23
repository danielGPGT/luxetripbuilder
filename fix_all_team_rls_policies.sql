-- Fix ALL RLS policies for team-related tables
-- This fixes the 406 error when team members try to access team data

-- 1. Fix team_members policies - Drop ALL existing policies first
DROP POLICY IF EXISTS "Users can view their own team membership" ON public.team_members;
DROP POLICY IF EXISTS "Team owners can view all team members" ON public.team_members;
DROP POLICY IF EXISTS "Team owners can manage team members" ON public.team_members;
DROP POLICY IF EXISTS "Team members can view team members" ON public.team_members;

CREATE POLICY "Users can view their own team membership" ON public.team_members
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Team members can view team members" ON public.team_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm2 
      WHERE tm2.user_id = auth.uid() 
      AND tm2.status = 'active'
      AND tm2.team_id = team_members.team_id
    )
  );

CREATE POLICY "Team owners can manage team members" ON public.team_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm2 
      WHERE tm2.user_id = auth.uid() 
      AND tm2.status = 'active'
      AND tm2.role IN ('owner', 'admin')
      AND tm2.team_id = team_members.team_id
    )
  );

-- 2. Fix teams policies - Drop ALL existing policies first
DROP POLICY IF EXISTS "Team owners can manage their team" ON public.teams;
DROP POLICY IF EXISTS "Team members can view their team" ON public.teams;

CREATE POLICY "Team owners can manage their team" ON public.teams
  FOR ALL USING (owner_id = auth.uid());

CREATE POLICY "Team members can view their team" ON public.teams
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm 
      WHERE tm.user_id = auth.uid()
      AND tm.status = 'active'
      AND tm.team_id = teams.id
    )
  );

-- 3. Fix team_invitations policies - Drop ALL existing policies first
DROP POLICY IF EXISTS "Team owners can manage invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Users can view invitations sent to them" ON public.team_invitations;

CREATE POLICY "Team owners can manage invitations" ON public.team_invitations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm 
      WHERE tm.user_id = auth.uid() 
      AND tm.status = 'active'
      AND tm.role IN ('owner', 'admin')
      AND tm.team_id = team_invitations.team_id
    )
  );

CREATE POLICY "Users can view invitations sent to them" ON public.team_invitations
  FOR SELECT USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- 4. Also fix subscriptions policies to allow team members to view their team's subscription
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Team members can view team subscription" ON public.subscriptions;

CREATE POLICY "Users can view their own subscription" ON public.subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Team members can view team subscription" ON public.subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm 
      WHERE tm.user_id = auth.uid()
      AND tm.status = 'active'
      AND tm.team_id IN (
        SELECT id FROM public.teams WHERE subscription_id = subscriptions.id
      )
    )
  ); 