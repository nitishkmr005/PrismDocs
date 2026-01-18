# Supabase Database Setup

This directory contains the database schema and migration scripts for PrismDocs.

## Files

- **`schema.sql`**: Main schema file - **IDEMPOTENT** (safe to run multiple times)
- **`rollback.sql`**: Drops all tables (⚠️ DESTRUCTIVE - deletes all data)

## Quick Start

### First Time Setup

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `schema.sql`
4. Click **Run** or press `Ctrl/Cmd + Enter`

That's it! Your database is ready.

### Updating Existing Database

The `schema.sql` file is **idempotent**, meaning you can run it multiple times safely:

```sql
-- Just run schema.sql again!
-- It will:
-- ✅ Create missing tables
-- ✅ Add missing indexes
-- ✅ Update policies
-- ✅ Preserve existing data
```

**What happens when you re-run it:**

- Existing tables are **NOT** dropped
- Existing data is **PRESERVED**
- Missing tables/indexes are created
- Policies are recreated (old ones dropped first)
- Functions and views are updated to latest version

### Complete Reset (⚠️ Deletes All Data)

If you need to start completely fresh:

1. **First**, run `rollback.sql` to drop everything:

   ```sql
   -- Paste contents of rollback.sql
   -- This will delete ALL your data!
   ```

2. **Then**, run `schema.sql` to recreate:
   ```sql
   -- Paste contents of schema.sql
   -- Fresh database created
   ```

## Database Structure

### Tables

- **`llm_logs`**: LLM API call logs for observability
- **`app_events`**: Application events and errors
- **`user_profiles`**: Extended user data with usage tracking
- **`content_feedback`**: User feedback on generated content

### Views

- **`llm_usage_stats`**: Aggregated LLM usage per user/day
- **`content_feedback_summary`**: Feedback statistics by content type

### Functions

- **`handle_new_user()`**: Auto-creates profile when user signs up
- **`update_user_stats(user_id, tokens)`**: Updates usage statistics

## Troubleshooting

### Error: "relation already exists"

No problem! The script uses `CREATE TABLE IF NOT EXISTS`, so this shouldn't happen. But if it does, the script will skip that table and continue.

### Error: "policy already exists"

The script drops policies before recreating them, so this shouldn't happen. But if it does:

```sql
-- Manually drop the policy
DROP POLICY "policy_name" ON table_name;

-- Then re-run schema.sql
```

### Want to add a new column?

Just add it to `schema.sql` with `ALTER TABLE`:

```sql
-- Add after the CREATE TABLE section
ALTER TABLE table_name
ADD COLUMN IF NOT EXISTS new_column TEXT;
```

Then re-run the whole `schema.sql` file.

## Migration History

To track what's been applied, check the comments in `schema.sql`. Each major change should be documented there.

## Row Level Security (RLS)

All tables have RLS enabled:

- **Users** can view their own data
- **Service role** has full access (for backend operations)
- **Anonymous** users have no access (must sign in)

## Need Help?

Check the [Supabase Documentation](https://supabase.com/docs/guides/database) for more information on:

- SQL Editor
- Row Level Security
- Database Functions
- Triggers
