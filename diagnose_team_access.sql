-- Diagnose team access issues
-- Run this in your Supabase SQL Editor to see the current state

-- 1. Check current subscriptions and their team_id
SELECT 'SUBSCRIPTIONS:' as section;
SELECT 
    id,
    user_id,
    team_id,
    plan_type,
    status,
    current_period_end,
    created_at
FROM subscriptions
ORDER BY created_at DESC;

-- 2. Check current teams
SELECT 'TEAMS:' as section;
SELECT 
    id,
    name,
    owner_id,
    subscription_id,
    created_at
FROM teams
ORDER BY created_at DESC;

-- 3. Check team members
SELECT 'TEAM MEMBERS:' as section;
SELECT 
    tm.id,
    tm.team_id,
    tm.user_id,
    tm.email,
    tm.role,
    tm.status,
    t.name as team_name,
    t.owner_id as team_owner
FROM team_members tm
LEFT JOIN teams t ON t.id = tm.team_id
ORDER BY tm.created_at DESC;

-- 4. Check for orphaned subscriptions (no team_id)
SELECT 'ORPHANED SUBSCRIPTIONS (no team_id):' as section;
SELECT 
    s.id,
    s.user_id,
    s.plan_type,
    s.status,
    u.email
FROM subscriptions s
LEFT JOIN auth.users u ON u.id = s.user_id
WHERE s.team_id IS NULL;

-- 5. Check for orphaned teams (no subscription_id)
SELECT 'ORPHANED TEAMS (no subscription_id):' as section;
SELECT 
    t.id,
    t.name,
    t.owner_id,
    u.email as owner_email
FROM teams t
LEFT JOIN auth.users u ON u.id = t.owner_id
WHERE t.subscription_id IS NULL;

-- 6. Check specific user's access (replace with actual user ID)
-- Replace 'your-user-id-here' with the actual user ID you're testing
SELECT 'SPECIFIC USER ACCESS:' as section;
SELECT 
    u.id as user_id,
    u.email,
    tm.team_id,
    tm.role as team_role,
    tm.status as team_status,
    t.name as team_name,
    t.subscription_id,
    s.plan_type,
    s.status as subscription_status,
    s.team_id as subscription_team_id
FROM auth.users u
LEFT JOIN team_members tm ON tm.user_id = u.id
LEFT JOIN teams t ON t.id = tm.team_id
LEFT JOIN subscriptions s ON s.id = t.subscription_id
WHERE u.id = 'your-user-id-here'; -- Replace with actual user ID

-- 7. Check all users and their team access
SELECT 'ALL USERS TEAM ACCESS:' as section;
SELECT 
    u.id as user_id,
    u.email,
    CASE 
        WHEN tm.team_id IS NOT NULL THEN 'Team Member'
        WHEN t.owner_id = u.id THEN 'Team Owner'
        ELSE 'No Team Access'
    END as access_type,
    tm.team_id,
    tm.role as team_role,
    t.name as team_name,
    s.plan_type,
    s.status as subscription_status
FROM auth.users u
LEFT JOIN team_members tm ON tm.user_id = u.id
LEFT JOIN teams t ON t.id = tm.team_id
LEFT JOIN subscriptions s ON s.id = t.subscription_id
ORDER BY u.created_at DESC; 