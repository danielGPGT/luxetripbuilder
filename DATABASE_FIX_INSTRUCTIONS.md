# Database Error Fix Instructions

## Current Issues
You're experiencing these Supabase database errors:
- **406 Error**: "Not Acceptable" - API request format issues
- **403 Error**: "Forbidden" - Row Level Security (RLS) policy violations  
- **409 Error**: "Conflict" - Duplicate record conflicts

## Root Cause
The database tables and RLS policies are not properly set up. The `usage_tracking` table doesn't exist, and the `itineraries` table has incorrect RLS policies.

## Solution

### Step 1: Run the Database Fix Script
1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Copy and paste the entire contents of `fix_database_errors.sql`
4. Click **Run** to execute the script

### Step 2: Verify the Fix
After running the script, you should see output showing:
- ✅ 4 tables created: `users`, `subscriptions`, `usage_tracking`, `itineraries`
- ✅ RLS policies enabled for all tables
- ✅ Triggers created for automatic user profile/subscription creation
- ✅ User counts showing all users have profiles and subscriptions

### Step 3: Test the Application
1. **Refresh your browser** to clear any cached errors
2. **Log out and log back in** to ensure fresh authentication
3. **Try creating a new itinerary** - it should work without errors
4. **Check the Usage & Plans tab** - tier system should work properly

## What the Fix Script Does

The `fix_database_errors.sql` script:

1. **Cleans up** existing broken policies and triggers
2. **Creates missing tables** (`usage_tracking`, `subscriptions`, `itineraries`)
3. **Enables RLS** on all tables with proper security
4. **Creates RLS policies** that allow authenticated users to access their own data
5. **Sets up triggers** for automatic user profile and subscription creation
6. **Creates starter subscriptions** for existing users
7. **Grants proper permissions** to authenticated users

## Expected Results

After running the fix:
- ✅ No more 406 errors (usage_tracking table exists)
- ✅ No more 403 errors (RLS policies work correctly)
- ✅ No more 409 errors (proper conflict handling)
- ✅ Tier system works (usage tracking functional)
- ✅ Itinerary saving works (proper permissions)

## Troubleshooting

### If you still get errors after running the script:

1. **Check Supabase Project**: Make sure you're in the correct Supabase project
2. **Verify Environment Variables**: Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
3. **Clear Browser Cache**: Hard refresh (Ctrl+F5) to clear cached errors
4. **Re-authenticate**: Log out and log back in

### If the script fails:

1. **Check Supabase Status**: Ensure your Supabase project is active
2. **Try in Parts**: Run the script in smaller sections if needed
3. **Contact Support**: If issues persist, the database may need manual intervention

## Prevention

To avoid these issues in the future:
- Always run database migrations when setting up new environments
- Test RLS policies thoroughly
- Use proper error handling in your application code
- Monitor Supabase logs for policy violations

## Next Steps

Once the database is fixed:
1. Test all features (itinerary creation, saving, tier system)
2. Set up proper monitoring for database errors
3. Consider implementing better error handling in your application
4. Document the database setup process for future deployments 