-- Supabase Database Schema for Document Generator
-- Run this in the Supabase SQL Editor to set up the required tables

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- LLM Logs Table
-- Stores all LLM API call logs for observability
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

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_llm_logs_created_at ON llm_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_llm_logs_user_id ON llm_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_llm_logs_session_id ON llm_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_llm_logs_model ON llm_logs(model);
CREATE INDEX IF NOT EXISTS idx_llm_logs_purpose ON llm_logs(purpose);

-- Enable Row Level Security
ALTER TABLE llm_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own logs
CREATE POLICY "Users can view own logs" ON llm_logs
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Service role can insert logs
CREATE POLICY "Service role can insert logs" ON llm_logs
    FOR INSERT
    WITH CHECK (true);

-- Policy: Service role can view all logs
CREATE POLICY "Service role full access" ON llm_logs
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- Application Events Table
-- Stores general application events and errors
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_app_events_created_at ON app_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_events_event_type ON app_events(event_type);
CREATE INDEX IF NOT EXISTS idx_app_events_severity ON app_events(severity);
CREATE INDEX IF NOT EXISTS idx_app_events_user_id ON app_events(user_id);

-- Enable Row Level Security
ALTER TABLE app_events ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view own events
CREATE POLICY "Users can view own events" ON app_events
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Service role full access
CREATE POLICY "Service role can manage events" ON app_events
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- User Profiles Table
-- Extends auth.users with additional profile data
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_display_name ON user_profiles(display_name);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Policy: Users can update own profile
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE
    USING (auth.uid() = id);

-- ============================================
-- Trigger: Create profile on user signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, display_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Function: Update user stats after generation
-- ============================================
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
-- View: Aggregated LLM usage stats
-- ============================================
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

-- Grant access to the view
GRANT SELECT ON llm_usage_stats TO authenticated;

-- ============================================
-- Comments for documentation
-- ============================================
COMMENT ON TABLE llm_logs IS 'Stores LLM API call logs for observability and debugging';
COMMENT ON TABLE app_events IS 'Stores application events including errors and generation events';
COMMENT ON TABLE user_profiles IS 'Extended user profile data with usage tracking';
COMMENT ON VIEW llm_usage_stats IS 'Aggregated LLM usage statistics per user per day';
