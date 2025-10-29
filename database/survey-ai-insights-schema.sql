-- ============================================
-- Survey → AI Insights Schema
-- POC Phase: Using 1-5 scale (migrating to 1-3 post-POC)
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- TABLE: survey_questions
-- ============================================
CREATE TABLE IF NOT EXISTS public.survey_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE, -- Stable identifier (e.g., "G2_Q14")
  question_text TEXT NOT NULL,
  "group" TEXT, -- Category grouping (optional)
  tags TEXT[], -- Flexible tagging
  scale_min INTEGER NOT NULL DEFAULT 1,
  scale_max INTEGER NOT NULL DEFAULT 5, -- POC: 1-5 scale
  scale_labels JSONB DEFAULT '["Never", "Rarely", "Sometimes", "Often", "Always"]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- TABLE: survey_sessions
-- ============================================
CREATE TABLE IF NOT EXISTS public.survey_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'in_progress'
    CHECK (status IN ('in_progress', 'submitted', 'abandoned'))
);

-- ============================================
-- TABLE: survey_responses
-- ============================================
CREATE TABLE IF NOT EXISTS public.survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.survey_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.survey_questions(id),
  answer_value INTEGER, -- POC: 1-5 (will map to 1-3 for AI)
  answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (session_id, question_id),
  CHECK (answer_value BETWEEN 1 AND 5 OR answer_value IS NULL)
);

-- ============================================
-- TABLE: ai_reports
-- ============================================
CREATE TABLE IF NOT EXISTS public.ai_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.survey_sessions(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('queued', 'processing', 'succeeded', 'failed')),
  model TEXT,
  prompt_hash TEXT, -- For idempotency (TODO P2)
  input_items_count INTEGER,
  result_json JSONB,
  result_text TEXT,
  latency_ms INTEGER,
  error_code TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_survey_questions_code ON public.survey_questions(code);
CREATE INDEX IF NOT EXISTS idx_survey_questions_active ON public.survey_questions(is_active, version);
CREATE INDEX IF NOT EXISTS idx_survey_sessions_user_id ON public.survey_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_survey_sessions_status ON public.survey_sessions(status);
CREATE INDEX IF NOT EXISTS idx_survey_responses_session_id ON public.survey_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_user_id ON public.survey_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_reports_user_id ON public.ai_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_reports_status ON public.ai_reports(status);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE public.survey_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_reports ENABLE ROW LEVEL SECURITY;

-- Survey Sessions Policies
CREATE POLICY "sessions_select_own"
  ON public.survey_sessions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "sessions_insert_own"
  ON public.survey_sessions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "sessions_update_own"
  ON public.survey_sessions FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Survey Responses Policies
CREATE POLICY "responses_select_own"
  ON public.survey_responses FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "responses_insert_own"
  ON public.survey_responses FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "responses_update_own"
  ON public.survey_responses FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- AI Reports Policies
CREATE POLICY "ai_reports_select_own"
  ON public.ai_reports FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "ai_reports_insert_own"
  ON public.ai_reports FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_survey_questions_updated_at 
  BEFORE UPDATE ON public.survey_questions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_reports_updated_at 
  BEFORE UPDATE ON public.ai_reports 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- MIGRATION NOTES
-- ============================================
-- TODO P2: Migrate to 1-3 scale post-POC
-- See: /docs/scale-migration-plan.md
-- 
-- Migration path:
-- 1. Create survey_questions_v2 with 1-3 scale
-- 2. Update UI components to RadioGroup (1-3)
-- 3. Migrate existing responses: mapToThreeScale()
-- 4. Apply strict CHECK (answer_value IN (1,2,3) OR NULL)
