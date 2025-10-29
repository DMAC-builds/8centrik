-- Create symptom_questions table
CREATE TABLE IF NOT EXISTS symptom_questions (
  id SERIAL PRIMARY KEY,
  question_text TEXT NOT NULL,
  question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('radio', 'slider', 'yes_no')),
  options TEXT[], -- Array of options for radio buttons
  min_value INTEGER, -- For slider questions
  max_value INTEGER, -- For slider questions
  labels TEXT[], -- Labels for slider endpoints
  category VARCHAR(100),
  questionnumber INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_symptom_questions_questionnumber ON symptom_questions(questionnumber, is_active);
