-- Drop the old trigger and function if they exist
DROP TRIGGER IF EXISTS on_public_user_created ON public.users;
DROP FUNCTION IF EXISTS create_team_for_new_user;

-- Create the team creation function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION create_team_for_new_user()
RETURNS TRIGGER AS $$
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
    COALESCE(NEW.agency_name, NEW.name, v_email, 'New Team'),
    NEW.id,
    NEW.logo_url,
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

-- Create the trigger on public.users
CREATE TRIGGER on_public_user_created
AFTER INSERT ON public.users
FOR EACH ROW
EXECUTE FUNCTION create_team_for_new_user();

-- Add a permissive RLS policy to teams (for dev/testing)
DROP POLICY IF EXISTS "Allow all for dev" ON public.teams;
CREATE POLICY "Allow all for dev" ON public.teams
FOR ALL
TO public
USING (true);

-- Enable RLS if not already enabled
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY; 