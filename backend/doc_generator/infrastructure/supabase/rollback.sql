-- ============================================
-- PrismDocs Database Rollback Script
-- ============================================
-- ⚠️  WARNING: This will DELETE ALL DATA! ⚠️
-- Use this only if you want to completely reset the database
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '⚠️  Starting rollback - this will delete all PrismDocs data!';
END $$;

-- ============================================
-- Drop Views
-- ============================================
DROP VIEW IF EXISTS content_feedback_summary CASCADE;
DROP VIEW IF EXISTS feature_feedback_summary CASCADE;  -- Old view name
DROP VIEW IF EXISTS llm_usage_stats CASCADE;

-- ============================================
-- Drop Triggers
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- ============================================
-- Drop Functions
-- ============================================
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_user_stats(UUID, INTEGER) CASCADE;

-- ============================================
-- Drop Tables (in reverse dependency order)
-- ============================================
DROP TABLE IF EXISTS content_feedback CASCADE;
DROP TABLE IF EXISTS feature_feedback CASCADE;  -- Old table name
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS app_events CASCADE;
DROP TABLE IF EXISTS llm_logs CASCADE;

-- ============================================
-- Rollback Complete
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ Rollback completed - all PrismDocs tables dropped';
    RAISE NOTICE '💡 You can now run schema.sql to recreate the database';
END $$;
