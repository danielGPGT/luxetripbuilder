-- Fix RLS policies for team_members table
-- This allows team members to see other members in their team

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view their own team membership" ON public.team_members;
DROP POLICY IF EXISTS "Team owners can view all team members" ON public.team_members;
DROP POLICY IF EXISTS "Team owners can manage team members" ON public.team_members;

-- Create new policies that work with team_id
-- Policy 1: Users can view their own team membership
CREATE POLICY "Users can view their own team membership" ON public.team_members
  FOR SELECT USING (auth.uid() = user_id);

-- Policy 2: Team members can view other members in their team
CREATE POLICY "Team members can view team members" ON public.team_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm2 
      WHERE tm2.user_id = auth.uid() 
      AND tm2.status = 'active'
      AND tm2.team_id = team_members.team_id
    )
  );

-- Policy 3: Team owners/admins can manage team members
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

-- Also fix team_invitations policies
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