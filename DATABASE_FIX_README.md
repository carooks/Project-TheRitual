# Database Fix for 406 Errors

## Problem
You're seeing 406 (Not Acceptable) errors when querying the `game_states` table:
```
GET .../game_states?select=*&room_id=eq.xxx 406 (Not Acceptable)
```

## Solution

### Step 1: Run the Fix SQL in Supabase

1. Go to your Supabase project: https://supabase.com/dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Copy and paste the contents of `database-fix.sql` (in this folder)
4. Click **Run** to execute the SQL

This will:
- Drop old restrictive RLS policies
- Create new policies that allow ALL operations (SELECT, INSERT, UPDATE, DELETE)
- Fix the 406 errors by ensuring proper access

### Step 2: Verify Tables Exist

In the Supabase dashboard, go to **Table Editor** and verify these tables exist:
- `rooms`
- `players`  
- `game_states`

If they don't exist, run the full schema from `multiplayer-package/database/schema.sql`

### Step 3: Test

1. Rebuild the app: `npm run build`
2. Host a game and check the browser console
3. You should see "No game state found yet" or "Game state found" instead of 406 errors

## Code Changes Made

Also fixed the code to use `.maybeSingle()` instead of `.single()` when querying game states, which handles the case where no game state exists yet without throwing errors.

## Security Note

The current policies allow **public access** to all operations. This is fine for a game prototype, but for production you might want to restrict:
- Only room members can see their room's data
- Only the host can delete rooms
- Only players can update their own player records

See the commented section in `database-fix.sql` for more granular policy examples.
