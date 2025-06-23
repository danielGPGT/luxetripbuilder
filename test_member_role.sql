-- Test script to temporarily change user role to 'member' for testing
-- Replace 'YOUR_USER_ID' with your actual user ID

-- First, check your current role
SELECT user_id, role, status FROM team_members WHERE user_id = 'YOUR_USER_ID';

-- Temporarily change to member role
UPDATE team_members SET role = 'member' WHERE user_id = 'YOUR_USER_ID';

-- Verify the change
SELECT user_id, role, status FROM team_members WHERE user_id = 'YOUR_USER_ID';

-- To restore admin role later, run:
-- UPDATE team_members SET role = 'admin' WHERE user_id = 'YOUR_USER_ID'; 