-- Fix RLS Policies for Survey Feature
-- This allows:
-- 1. All authenticated users to READ survey questions
-- 2. Users to create/read/update their OWN sessions and responses
-- 3. No access to other users' data

-- ============================================
-- SURVEY QUESTIONS: Public read for authenticated users
-- ============================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow authenticated users to read survey questions" ON survey_questions;
DROP POLICY IF EXISTS "Public can read active survey questions" ON survey_questions;

-- Create policy: All authenticated users can read questions
CREATE POLICY "Authenticated users can read survey questions"
ON survey_questions
FOR SELECT
TO authenticated
USING (is_active = true);

-- ============================================
-- SURVEY SESSIONS: Users manage their own sessions
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create their own sessions" ON survey_sessions;
DROP POLICY IF EXISTS "Users can read their own sessions" ON survey_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON survey_sessions;

-- Create policies
CREATE POLICY "Users can insert their own sessions"
ON survey_sessions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own sessions"
ON survey_sessions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
ON survey_sessions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- SURVEY RESPONSES: Users manage their own responses
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create their own responses" ON survey_responses;
DROP POLICY IF EXISTS "Users can read their own responses" ON survey_responses;
DROP POLICY IF EXISTS "Users can update their own responses" ON survey_responses;

-- Create policies
CREATE POLICY "Users can insert their own responses"
ON survey_responses
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own responses"
ON survey_responses
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own responses"
ON survey_responses
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- AI REPORTS: Users can read their own reports
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read their own reports" ON ai_reports;
DROP POLICY IF EXISTS "Users can view their own reports" ON ai_reports;

-- Create policies
CREATE POLICY "Users can view their own ai reports"
ON ai_reports
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Service role can insert/update reports (for backend processing)
CREATE POLICY "Service role can manage ai reports"
ON ai_reports
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ============================================
-- VERIFY RLS IS ENABLED
-- ============================================

-- Ensure RLS is enabled on all tables
ALTER TABLE survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_reports ENABLE ROW LEVEL SECURITY;

-- ============================================
-- GRANT USAGE TO AUTHENTICATED USERS
-- ============================================

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON survey_questions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON survey_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON survey_responses TO authenticated;
GRANT SELECT ON ai_reports TO authenticated;

-- Grant sequence usage for ID generation
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
