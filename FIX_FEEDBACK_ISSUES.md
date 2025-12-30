# Fix Remaining Feedback Issues

## Issues to Fix
1. ✅ **Delete Protection**: FIXED - Users can only delete their own posts
2. ⚠️ **Upvote Count**: Showing 0 instead of actual count
3. ⚠️ **Comment Username**: Showing "Użytkownik" instead of actual username
4. ⚠️ **Developer Badge**: Not showing on comments

## Root Causes

### 1. Missing Profiles
Users who created feedback/comments don't have profiles in `shared_schema.profiles`.

### 2. Upvote Count Not Syncing
The database trigger might not be firing correctly.

## QUICK FIX (Run These SQL Queries)

Open **Supabase Dashboard → SQL Editor** and run these queries:

### Step 1: Create Missing Profiles

```sql
-- This creates profiles for any users who don't have one
INSERT INTO shared_schema.profiles (id, email, first_name, last_name)
SELECT DISTINCT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'first_name', u.raw_user_meta_data->>'firstName'),
  COALESCE(u.raw_user_meta_data->>'last_name', u.raw_user_meta_data->>'lastName')
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM shared_schema.profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;
```

### Step 2: Fix Upvote Counts

```sql
-- This synchronizes stored upvote_count with actual upvotes
UPDATE calcreno_schema.feedback_posts fp
SET upvote_count = (
  SELECT COUNT(*)
  FROM calcreno_schema.feedback_upvotes fu
  WHERE fu.post_id = fp.id
);
```

### Step 3: Verify the Fix

```sql
-- Check that all posts have correct counts
SELECT
  id,
  title,
  upvote_count as stored_count,
  (SELECT COUNT(*) FROM calcreno_schema.feedback_upvotes WHERE post_id = feedback_posts.id) as actual_count,
  CASE
    WHEN upvote_count = (SELECT COUNT(*) FROM calcreno_schema.feedback_upvotes WHERE post_id = feedback_posts.id)
    THEN '✓ MATCH'
    ELSE '✗ MISMATCH'
  END as status
FROM calcreno_schema.feedback_posts
ORDER BY created_at DESC;
```

### Step 4: Check Profiles Exist

```sql
-- Verify all feedback users have profiles
SELECT
  fp.id,
  fp.title,
  fp.user_id,
  sp.email,
  sp.first_name,
  sp.last_name,
  CASE WHEN sp.id IS NULL THEN '✗ NO PROFILE' ELSE '✓ HAS PROFILE' END as status
FROM calcreno_schema.feedback_posts fp
LEFT JOIN shared_schema.profiles sp ON sp.id = fp.user_id;
```

### Step 5: Check Comment Profiles

```sql
-- Verify all comment users have profiles
SELECT
  fc.id,
  fc.content,
  fc.user_id,
  sp.email,
  sp.first_name,
  sp.last_name,
  CASE
    WHEN sp.id IS NULL THEN '✗ NO PROFILE'
    WHEN sp.email = 'airize.technologies@gmail.com' THEN '✓ DEVELOPER'
    ELSE '✓ HAS PROFILE'
  END as status
FROM calcreno_schema.feedback_comments fc
LEFT JOIN shared_schema.profiles sp ON sp.id = fc.user_id;
```

## After Running Queries

1. **Restart the app** or **pull-to-refresh** the feedback screen
2. Check the console logs for:
   - `[useFeedbackComments] Profile data for comment:` - Should show profile data
   - `[useFeedbackComments] Comment enriched:` - Should show displayName and isDeveloper
   - `[useFeedback] Upvote count mismatch detected:` - Should NOT appear if counts are synced

## Expected Results

After fixes:
- ✅ Comments show actual username (from profile email)
- ✅ Developer comments show "DEV" badge
- ✅ Upvote counts show correct number (1, not 0)
- ✅ Only post authors can delete their posts

## Debug Queries

If issues persist, run the comprehensive debug queries in:
```
DEBUG_FEEDBACK_QUERY.sql
```

This file contains queries to:
- Check trigger definitions
- Verify RLS policies
- List all profiles and their associations
- Identify any data inconsistencies

## Code Changes Applied

I've already updated the code to:
1. ✅ Handle null profiles more gracefully
2. ✅ Add extensive logging for debugging
3. ✅ Query actual upvote counts and sync them
4. ✅ Block unauthorized deletes at client level
5. ✅ Use `.maybeSingle()` to avoid query errors

The remaining issues are **data-level** and require the SQL fixes above.
