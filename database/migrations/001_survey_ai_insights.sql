-- ============================================
-- Survey → AI Insights Migration
-- Handles existing tables by renaming to _old
-- ============================================

-- Step 1: Backup/Rename existing tables if they exist
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'survey_questions') THEN
    ALTER TABLE public.survey_questions RENAME TO survey_questions_old;
    RAISE NOTICE 'Renamed survey_questions to survey_questions_old';
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'survey_sessions') THEN
    ALTER TABLE public.survey_sessions RENAME TO survey_sessions_old;
    RAISE NOTICE 'Renamed survey_sessions to survey_sessions_old';
  END IF;
  
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'survey_responses') THEN
    ALTER TABLE public.survey_responses RENAME TO survey_responses_old;
    RAISE NOTICE 'Renamed survey_responses to survey_responses_old';
  END IF;
END $$;

-- Step 2: Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Step 3: Create survey_questions table
CREATE TABLE public.survey_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  question_text TEXT NOT NULL,
  "group" TEXT,
  tags TEXT[],
  scale_min INTEGER NOT NULL DEFAULT 1,
  scale_max INTEGER NOT NULL DEFAULT 5,
  scale_labels JSONB DEFAULT '["Never", "Rarely", "Sometimes", "Often", "Always"]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 4: Create survey_sessions table
CREATE TABLE public.survey_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'in_progress'
    CHECK (status IN ('in_progress', 'submitted', 'abandoned'))
);

-- Step 5: Create survey_responses table
CREATE TABLE public.survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.survey_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.survey_questions(id),
  answer_value INTEGER,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (session_id, question_id),
  CHECK (answer_value BETWEEN 1 AND 5 OR answer_value IS NULL)
);

-- Step 6: Create ai_reports table
CREATE TABLE public.ai_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.survey_sessions(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('queued', 'processing', 'succeeded', 'failed')),
  model TEXT,
  prompt_hash TEXT,
  input_items_count INTEGER,
  result_json JSONB,
  result_text TEXT,
  latency_ms INTEGER,
  error_code TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 7: Create indexes
CREATE INDEX idx_survey_questions_code ON public.survey_questions(code);
CREATE INDEX idx_survey_questions_active ON public.survey_questions(is_active, version);
CREATE INDEX idx_survey_sessions_user_id ON public.survey_sessions(user_id);
CREATE INDEX idx_survey_sessions_status ON public.survey_sessions(status);
CREATE INDEX idx_survey_responses_session_id ON public.survey_responses(session_id);
CREATE INDEX idx_survey_responses_user_id ON public.survey_responses(user_id);
CREATE INDEX idx_ai_reports_user_id ON public.ai_reports(user_id);
CREATE INDEX idx_ai_reports_status ON public.ai_reports(status);

-- Step 8: Enable RLS
ALTER TABLE public.survey_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_reports ENABLE ROW LEVEL SECURITY;

-- Step 9: Create RLS policies
CREATE POLICY "sessions_select_own" ON public.survey_sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "sessions_insert_own" ON public.survey_sessions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "sessions_update_own" ON public.survey_sessions
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "responses_select_own" ON public.survey_responses
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "responses_insert_own" ON public.survey_responses
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "responses_update_own" ON public.survey_responses
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "ai_reports_select_own" ON public.ai_reports
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "ai_reports_insert_own" ON public.ai_reports
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Step 10: Create triggers
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

-- Step 11: Success message
DO $$ 
BEGIN
  RAISE NOTICE '✅ Survey AI Insights schema created successfully!';
  RAISE NOTICE '📝 Run seed-survey-questions.js to populate questions';
  RAISE NOTICE '⚠️  Old tables renamed with _old suffix (can be dropped after verification)';
END $$;
