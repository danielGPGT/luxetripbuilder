-- Fix team_id in subscriptions table
-- This script links existing subscriptions to their teams

-- First, let's see what we have
SELECT 'Current subscriptions:' as info;
SELECT id, user_id, team_id, plan_type, status FROM subscriptions;

SELECT 'Current teams:' as info;
SELECT id, owner_id, subscription_id, name FROM teams;

SELECT 'Current team_members:' as info;
SELECT team_id, user_id, email FROM team_members;

-- Step 1: Update subscriptions to link to teams where user is owner
UPDATE subscriptions 
SET team_id = teams.id
FROM teams 
WHERE subscriptions.user_id = teams.owner_id 
AND subscriptions.team_id IS NULL;

-- Step 2: Update teams to link to subscriptions where subscription_id is missing
UPDATE teams 
SET subscription_id = subscriptions.id
FROM subscriptions 
WHERE teams.owner_id = subscriptions.user_id 
AND teams.subscription_id IS NULL;

-- Step 3: For team members, ensure their team has the subscription linked
-- This handles cases where a user is a team member but the team doesn't have subscription_id set
UPDATE teams 
SET subscription_id = subscriptions.id
FROM subscriptions 
JOIN team_members ON team_members.team_id = teams.id
WHERE team_members.user_id = subscriptions.user_id 
AND teams.subscription_id IS NULL;

-- Step 4: For any remaining subscriptions without team_id, create a team if needed
INSERT INTO teams (id, name, owner_id, subscription_id, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    COALESCE(users.name, 'Team ' || users.email) as team_name,
    subscriptions.user_id as owner_id,
    subscriptions.id as subscription_id,
    NOW(),
    NOW()
FROM subscriptions 
LEFT JOIN teams ON teams.owner_id = subscriptions.user_id
LEFT JOIN auth.users ON auth.users.id = subscriptions.user_id
WHERE subscriptions.team_id IS NULL 
AND teams.id IS NULL;

-- Step 5: Update any remaining subscriptions to link to the newly created teams
UPDATE subscriptions 
SET team_id = teams.id
FROM teams 
WHERE subscriptions.user_id = teams.owner_id 
AND subscriptions.team_id IS NULL;

-- Verify the fix
SELECT 'After fix - subscriptions:' as info;
SELECT id, user_id, team_id, plan_type, status FROM subscriptions;

SELECT 'After fix - teams:' as info;
SELECT id, owner_id, subscription_id, name FROM teams;

-- Check for any remaining issues
SELECT 'Subscriptions without team_id:' as issue;
SELECT id, user_id, plan_type FROM subscriptions WHERE team_id IS NULL;

SELECT 'Teams without subscription_id:' as issue;
SELECT id, owner_id, name FROM teams WHERE subscription_id IS NULL; 