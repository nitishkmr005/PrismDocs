-- ============================================
-- Supabase Database Schema for PrismDocs
-- ============================================
-- This script is IDEMPOTENT - safe to run multiple times
-- It will update existing tables and create missing ones
-- Run this in the Supabase SQL Editor
--
-- MIGRATIONS HANDLED:
-- - Drops old 'feature_feedback' table if exists
-- - Creates new 'content_feedback' table
-- - Updates all policies, functions, and views
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Helper function to drop policies if they exist
-- ============================================
CREATE OR REPLACE FUNCTION drop_policy_if_exists(
    p_policy_name text,
    p_table_name text
) RETURNS void AS $$
BEGIN
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', p_policy_name, p_table_name);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- LLM Logs Table
-- ============================================
CREATE TABLE IF NOT EXISTS llm_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Call identification
    purpose TEXT NOT NULL,
    session_id TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- LLM details
    provider TEXT,
    model TEXT NOT NULL DEFAULT '',
    
    -- Content (truncated for storage efficiency)
    prompt TEXT NOT NULL DEFAULT '',
    response TEXT NOT NULL DEFAULT '',
    
    -- Metrics
    input_tokens INTEGER,
    output_tokens INTEGER,
    latency_seconds DOUBLE PRECISION,
    
    -- Additional metadata
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_llm_logs_created_at ON llm_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_llm_logs_user_id ON llm_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_llm_logs_session_id ON llm_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_llm_logs_model ON llm_logs(model);
CREATE INDEX IF NOT EXISTS idx_llm_logs_purpose ON llm_logs(purpose);

-- RLS
ALTER TABLE llm_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
SELECT drop_policy_if_exists('Users can view own logs', 'llm_logs');
SELECT drop_policy_if_exists('Service role can insert logs', 'llm_logs');
SELECT drop_policy_if_exists('Service role full access', 'llm_logs');

-- Recreate policies
CREATE POLICY "Users can view own logs" ON llm_logs
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert logs" ON llm_logs
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Service role full access" ON llm_logs
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- Application Events Table
-- ============================================
CREATE TABLE IF NOT EXISTS app_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Event details
    event_type TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('debug', 'info', 'warning', 'error')),
    
    -- Context
    session_id TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    timestamp TIMESTAMPTZ,
    
    -- Event data
    event_data JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_app_events_created_at ON app_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_events_event_type ON app_events(event_type);
CREATE INDEX IF NOT EXISTS idx_app_events_severity ON app_events(severity);
CREATE INDEX IF NOT EXISTS idx_app_events_user_id ON app_events(user_id);

-- RLS
ALTER TABLE app_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
SELECT drop_policy_if_exists('Users can view own events', 'app_events');
SELECT drop_policy_if_exists('Service role can manage events', 'app_events');

-- Recreate policies
CREATE POLICY "Users can view own events" ON app_events
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage events" ON app_events
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- User Profiles Table
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Profile details
    display_name TEXT,
    avatar_url TEXT,
    
    -- Usage tracking
    total_documents_generated INTEGER NOT NULL DEFAULT 0,
    total_tokens_used BIGINT NOT NULL DEFAULT 0,
    
    -- Preferences
    preferences JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_display_name ON user_profiles(display_name);

-- RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
SELECT drop_policy_if_exists('Users can view own profile', 'user_profiles');
SELECT drop_policy_if_exists('Users can update own profile', 'user_profiles');

-- Recreate policies
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE
    USING (auth.uid() = id);

-- ============================================
-- Content Feedback Table
-- ============================================
-- Migrate old feature_feedback table if it exists
DO $$
BEGIN
    -- Check if old feature_feedback table exists
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'feature_feedback') THEN
        -- Drop the old table (we'll recreate with new structure)
        DROP TABLE IF EXISTS feature_feedback CASCADE;
        RAISE NOTICE 'Dropped old feature_feedback table';
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS content_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Content details
    content_type TEXT NOT NULL CHECK (content_type IN ('document', 'image', 'mindmap')),
    output_format TEXT,
    feedback_type TEXT NOT NULL CHECK (feedback_type IN ('like', 'dislike', 'comment')),
    
    -- User context
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Generation metadata
    generation_metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_content_feedback_created_at ON content_feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_feedback_content_type ON content_feedback(content_type);
CREATE INDEX IF NOT EXISTS idx_content_feedback_user_id ON content_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_content_feedback_type ON content_feedback(feedback_type);

-- RLS
ALTER TABLE content_feedback ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
SELECT drop_policy_if_exists('Users can view own feedback', 'content_feedback');
SELECT drop_policy_if_exists('Authenticated users can submit feedback', 'content_feedback');
SELECT drop_policy_if_exists('Service role can manage feedback', 'content_feedback');

-- Recreate policies
CREATE POLICY "Users can view own feedback" ON content_feedback
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can submit feedback" ON content_feedback
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Service role can manage feedback" ON content_feedback
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- Triggers and Functions
-- ============================================

-- Function: Create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, display_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
    )
    ON CONFLICT (id) DO NOTHING; -- Safe re-run
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Function: Update user stats after generation
CREATE OR REPLACE FUNCTION public.update_user_stats(
    p_user_id UUID,
    p_tokens_used INTEGER
)
RETURNS VOID AS $$
BEGIN
    UPDATE user_profiles
    SET 
        total_documents_generated = total_documents_generated + 1,
        total_tokens_used = total_tokens_used + COALESCE(p_tokens_used, 0),
        updated_at = NOW()
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Views
-- ============================================

-- View: LLM usage stats
CREATE OR REPLACE VIEW llm_usage_stats AS
SELECT
    user_id,
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) as total_calls,
    SUM(input_tokens) as total_input_tokens,
    SUM(output_tokens) as total_output_tokens,
    AVG(latency_seconds) as avg_latency_seconds,
    COUNT(DISTINCT model) as models_used
FROM llm_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY user_id, DATE_TRUNC('day', created_at);

-- View: Content feedback summary
CREATE OR REPLACE VIEW content_feedback_summary AS
SELECT
    content_type,
    output_format,
    COUNT(*) FILTER (WHERE feedback_type = 'like') as likes,
    COUNT(*) FILTER (WHERE feedback_type = 'dislike') as dislikes,
    COUNT(*) FILTER (WHERE feedback_type = 'comment') as comments,
    COUNT(*) as total_feedback,
    ROUND(
        100.0 * COUNT(*) FILTER (WHERE feedback_type = 'like') / NULLIF(COUNT(*), 0),
        2
    ) as like_percentage
FROM content_feedback
GROUP BY content_type, output_format;

-- Grant view access
GRANT SELECT ON llm_usage_stats TO authenticated;
GRANT SELECT ON content_feedback_summary TO authenticated;

-- ============================================
-- Comments
-- ============================================
COMMENT ON TABLE llm_logs IS 'Stores LLM API call logs for observability and debugging';
COMMENT ON TABLE app_events IS 'Stores application events including errors and generation events';
COMMENT ON TABLE user_profiles IS 'Extended user profile data with usage tracking';
COMMENT ON TABLE content_feedback IS 'Stores user feedback on generated content (PDFs, images, etc.)';
COMMENT ON VIEW llm_usage_stats IS 'Aggregated LLM usage statistics per user per day';
COMMENT ON VIEW content_feedback_summary IS 'Summary of likes/dislikes/comments per content type';

-- ============================================
-- Cleanup helper function
-- ============================================
DROP FUNCTION IF EXISTS drop_policy_if_exists(text, text);

-- ============================================
-- Migration Complete
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ Schema migration completed successfully!';
    RAISE NOTICE '📊 Tables: llm_logs, app_events, user_profiles, content_feedback';
    RAISE NOTICE '👁️  Views: llm_usage_stats, content_feedback_summary';
END $$;
