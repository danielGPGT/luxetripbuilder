-- Team Management System Setup
-- Run these commands in your Supabase SQL Editor

-- 1. Add missing columns to team_members table
ALTER TABLE public.team_members 
ADD COLUMN IF NOT EXISTS invited_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS invitation_token text UNIQUE,
ADD COLUMN IF NOT EXISTS invitation_expires_at timestamp with time zone;

-- 2. Create team_invitations table for better invitation management
CREATE TABLE IF NOT EXISTS public.team_invitations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  invited_by uuid NOT NULL REFERENCES auth.users(id),
  token text UNIQUE NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT team_invitations_pkey PRIMARY KEY (id)
);

-- 3. Create teams table for better organization
CREATE TABLE IF NOT EXISTS public.teams (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  name text NOT NULL,
  owner_id uuid NOT NULL REFERENCES auth.users(id),
  max_members integer DEFAULT 10,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT teams_pkey PRIMARY KEY (id),
  CONSTRAINT teams_subscription_id_unique UNIQUE (subscription_id)
);

-- 4. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_team_members_subscription_id ON public.team_members(subscription_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_email ON public.team_members(email);
CREATE INDEX IF NOT EXISTS idx_team_invitations_subscription_id ON public.team_invitations(subscription_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON public.team_invitations(token);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON public.team_invitations(email);

-- 5. Add RLS policies for team management
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- 6. Team members policies
CREATE POLICY "Users can view their own team membership" ON public.team_members
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Team owners can view all team members" ON public.team_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.subscriptions s 
      WHERE s.id = team_members.subscription_id 
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Team owners can manage team members" ON public.team_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.subscriptions s 
      WHERE s.id = team_members.subscription_id 
      AND s.user_id = auth.uid()
    )
  );

-- 7. Team invitations policies
CREATE POLICY "Team owners can manage invitations" ON public.team_invitations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.subscriptions s 
      WHERE s.id = team_invitations.subscription_id 
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view invitations sent to them" ON public.team_invitations
  FOR SELECT USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- 8. Teams policies
CREATE POLICY "Team owners can manage their team" ON public.teams
  FOR ALL USING (owner_id = auth.uid());

CREATE POLICY "Team members can view their team" ON public.teams
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm 
      WHERE tm.subscription_id = teams.subscription_id 
      AND tm.user_id = auth.uid()
    )
  );

-- 9. Function to generate invitation tokens
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS text AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- 10. Function to create team invitation
CREATE OR REPLACE FUNCTION create_team_invitation(
  p_subscription_id uuid,
  p_email text,
  p_role text DEFAULT 'member',
  p_expires_in_hours integer DEFAULT 168 -- 7 days
)
RETURNS uuid AS $$
DECLARE
  v_invitation_id uuid;
  v_token text;
BEGIN
  -- Generate unique token
  v_token := generate_invitation_token();
  
  -- Create invitation
  INSERT INTO public.team_invitations (
    subscription_id, email, role, invited_by, token, expires_at
  ) VALUES (
    p_subscription_id, p_email, p_role, auth.uid(), v_token, 
    now() + (p_expires_in_hours || ' hours')::interval
  ) RETURNING id INTO v_invitation_id;
  
  RETURN v_invitation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Function to accept team invitation
CREATE OR REPLACE FUNCTION accept_team_invitation(p_token text)
RETURNS boolean AS $$
DECLARE
  v_invitation public.team_invitations;
  v_team_member_id uuid;
BEGIN
  -- Get invitation
  SELECT * INTO v_invitation 
  FROM public.team_invitations 
  WHERE token = p_token 
  AND status = 'pending' 
  AND expires_at > now();
  
  IF v_invitation IS NULL THEN
    RETURN false;
  END IF;
  
  -- Create team member record
  INSERT INTO public.team_members (
    subscription_id, user_id, email, name, role, status, 
    invited_by, invitation_token, joined_at
  ) VALUES (
    v_invitation.subscription_id, auth.uid(), v_invitation.email,
    (SELECT name FROM auth.users WHERE id = auth.uid()),
    v_invitation.role, 'active', v_invitation.invited_by,
    v_invitation.token, now()
  ) RETURNING id INTO v_team_member_id;
  
  -- Mark invitation as accepted
  UPDATE public.team_invitations 
  SET status = 'accepted', updated_at = now()
  WHERE id = v_invitation.id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Verify setup
SELECT 'Team management system setup complete!' as status;

-- 13. Test the functions (optional)
-- SELECT create_team_invitation('your-subscription-id', 'test@example.com', 'member'); 

-- =============================
-- TEAMS-CENTRIC REFACTOR MIGRATION
-- =============================

-- 1. Drop policies that depend on subscription_id
DROP POLICY IF EXISTS "Team members can view their own team data" ON public.team_members;
DROP POLICY IF EXISTS "Subscription owners can manage team members" ON public.team_members;
DROP POLICY IF EXISTS "Team owners can view all team members" ON public.team_members;
DROP POLICY IF EXISTS "Team owners can manage team members" ON public.team_members;
DROP POLICY IF EXISTS "Team members can view their team" ON public.teams;

-- 2. Drop FKs and columns
ALTER TABLE public.team_members
  DROP CONSTRAINT IF EXISTS team_members_subscription_id_fkey,
  DROP COLUMN IF EXISTS subscription_id;

-- Drop policy on team_invitations that depends on subscription_id
DROP POLICY IF EXISTS "Team owners can manage invitations" ON public.team_invitations;

ALTER TABLE public.team_invitations
  DROP CONSTRAINT IF EXISTS team_invitations_subscription_id_fkey,
  DROP COLUMN IF EXISTS subscription_id;

-- 3. Add team_id columns
ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE;

ALTER TABLE public.team_invitations
  ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE;

-- 4. Create teams table if not exists
CREATE TABLE IF NOT EXISTS public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid NOT NULL REFERENCES auth.users(id),
  logo_url text,
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Recreate policies using team_id
CREATE POLICY "Team members can view their own team data" ON public.team_members
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Team owners can view all team members" ON public.team_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = team_members.team_id
      AND t.owner_id = auth.uid()
    )
  );

CREATE POLICY "Team owners can manage team members" ON public.team_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = team_members.team_id
      AND t.owner_id = auth.uid()
    )
  );

CREATE POLICY "Team members can view their team" ON public.teams
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = teams.id
      AND tm.user_id = auth.uid()
    )
  );

-- 6. (Manual) Data migration step required:
--   - For each unique subscription_id in old team_members/team_invitations, create a team in teams table.
--   - Update team_members and team_invitations to set team_id to the new team.
--   - Set team name, owner, etc. as needed.
--   - Remove/ignore orphaned records.
--
-- This step can be done with a script or SQL CTEs if needed.

-- Recreate policy using team_id
CREATE POLICY "Team owners can manage invitations" ON public.team_invitations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = team_invitations.team_id
      AND t.owner_id = auth.uid()
    )
  );

-- =============================
-- END TEAMS-CENTRIC REFACTOR
-- ============================= 

-- =============================
-- AUTO-CREATE TEAM ON USER SIGNUP
-- =============================

-- 1. Function to create a team for a new user (idempotent)
CREATE OR REPLACE FUNCTION public.create_team_for_new_user()
RETURNS trigger AS $$
DECLARE
  v_team_id uuid;
  v_email text;
BEGIN
  -- Check if a team already exists for this user
  IF EXISTS (SELECT 1 FROM public.teams WHERE owner_id = NEW.id) THEN
    RETURN NEW;
  END IF;

  v_email := NEW.email;

  -- Create the team
  INSERT INTO public.teams (name, owner_id, logo_url, created_at, updated_at)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'agency_name', NEW.raw_user_meta_data->>'name', v_email, 'New Team'),
    NEW.id,
    NEW.raw_user_meta_data->>'logo_url',
    now(),
    now()
  ) RETURNING id INTO v_team_id;

  -- Add the user as a team member (owner)
  INSERT INTO public.team_members (team_id, user_id, email, role, status, joined_at)
  VALUES (
    v_team_id,
    NEW.id,
    v_email,
    'owner',
    'active',
    now()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger to run after insert on auth.users
DROP TRIGGER IF EXISTS create_team_after_user_signup ON auth.users;
CREATE TRIGGER create_team_after_user_signup
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.create_team_for_new_user();

-- =============================
-- END AUTO-CREATE TEAM ON USER SIGNUP
-- ============================= 