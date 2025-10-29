-- Update survey_responses table to ensure proper foreign key relationship
-- First, drop the existing foreign key constraint if it exists
ALTER TABLE survey_responses 
DROP CONSTRAINT IF EXISTS survey_responses_question_id_fkey;

-- Add the foreign key constraint referencing questionnumber from symptom_questions
ALTER TABLE survey_responses 
ADD CONSTRAINT survey_responses_question_id_fkey 
FOREIGN KEY (question_id) REFERENCES symptom_questions(questionnumber) ON DELETE CASCADE;

-- Update the comment to clarify the relationship
COMMENT ON COLUMN survey_responses.question_id IS 'References questionnumber in symptom_questions table';
COMMENT ON COLUMN survey_responses.userid IS 'User identifier for tracking responses';
