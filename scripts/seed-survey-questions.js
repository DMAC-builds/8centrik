const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// POC Survey Questions (1-5 scale)
const pocQuestions = [
  {
    code: 'FATIGUE_01',
    question_text: 'How often do you feel tired or low energy?',
    group: 'Energy & Fatigue',
    tags: ['fatigue', 'energy', 'vitality'],
    scale_min: 1,
    scale_max: 5,
    scale_labels: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']
  },
  {
    code: 'DIGESTION_01',
    question_text: 'How often do you experience bloating after meals?',
    group: 'Digestive Health',
    tags: ['bloating', 'digestion', 'gut'],
    scale_min: 1,
    scale_max: 5,
    scale_labels: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']
  },
  {
    code: 'MENTAL_01',
    question_text: 'How would you rate your anxiety levels?',
    group: 'Mental Health',
    tags: ['anxiety', 'mental', 'stress'],
    scale_min: 1,
    scale_max: 5,
    scale_labels: ['Very Low', 'Low', 'Moderate', 'High', 'Very High']
  },
  {
    code: 'CRAVINGS_01',
    question_text: 'How often do you crave sugar or processed foods?',
    group: 'Nutrition & Cravings',
    tags: ['cravings', 'sugar', 'nutrition'],
    scale_min: 1,
    scale_max: 5,
    scale_labels: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']
  },
  {
    code: 'SLEEP_01',
    question_text: 'How would you rate your sleep quality?',
    group: 'Sleep & Recovery',
    tags: ['sleep', 'recovery', 'rest'],
    scale_min: 1,
    scale_max: 5,
    scale_labels: ['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent']
  },
  {
    code: 'DIGESTION_02',
    question_text: 'How often do you experience digestive issues?',
    group: 'Digestive Health',
    tags: ['digestion', 'gut', 'discomfort'],
    scale_min: 1,
    scale_max: 5,
    scale_labels: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']
  },
  {
    code: 'MENTAL_02',
    question_text: 'How stable is your mood throughout the day?',
    group: 'Mental Health',
    tags: ['mood', 'stability', 'emotions'],
    scale_min: 1,
    scale_max: 5,
    scale_labels: ['Very Unstable', 'Unstable', 'Moderate', 'Stable', 'Very Stable']
  },
  {
    code: 'FOCUS_01',
    question_text: 'How would you rate your mental clarity and focus?',
    group: 'Cognitive Function',
    tags: ['focus', 'clarity', 'cognition'],
    scale_min: 1,
    scale_max: 5,
    scale_labels: ['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent']
  },
  {
    code: 'ENERGY_01',
    question_text: 'How often do you experience afternoon energy crashes?',
    group: 'Energy & Fatigue',
    tags: ['energy', 'crash', 'afternoon'],
    scale_min: 1,
    scale_max: 5,
    scale_labels: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']
  },
  {
    code: 'PAIN_01',
    question_text: 'How often do you experience muscle or joint pain?',
    group: 'Physical Health',
    tags: ['pain', 'inflammation', 'physical'],
    scale_min: 1,
    scale_max: 5,
    scale_labels: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']
  },
  {
    code: 'HYDRATION_01',
    question_text: 'How would you rate your daily water intake?',
    group: 'Nutrition & Hydration',
    tags: ['hydration', 'water', 'nutrition'],
    scale_min: 1,
    scale_max: 5,
    scale_labels: ['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent']
  },
  {
    code: 'STRESS_01',
    question_text: 'How often do you feel overwhelmed or stressed?',
    group: 'Mental Health',
    tags: ['stress', 'overwhelm', 'mental'],
    scale_min: 1,
    scale_max: 5,
    scale_labels: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']
  }
];

async function seedSurveyQuestions() {
  console.log('🌱 Seeding survey questions...\n');

  try {
    // Check if questions already exist
    const { data: existing, error: checkError } = await supabase
      .from('survey_questions')
      .select('code')
      .in('code', pocQuestions.map(q => q.code));

    if (checkError) {
      console.error('❌ Error checking existing questions:', checkError.message);
      return;
    }

    const existingCodes = new Set(existing?.map(q => q.code) || []);
    const newQuestions = pocQuestions.filter(q => !existingCodes.has(q.code));

    if (newQuestions.length === 0) {
      console.log('✅ All questions already seeded!');
      console.log(`   Total questions: ${pocQuestions.length}`);
      return;
    }

    // Insert new questions
    const { data, error } = await supabase
      .from('survey_questions')
      .insert(newQuestions)
      .select();

    if (error) {
      console.error('❌ Error seeding questions:', error.message);
      return;
    }

    console.log(`✅ Successfully seeded ${data.length} new questions!`);
    console.log(`   Total questions: ${pocQuestions.length}`);
    console.log('\n📋 Seeded questions:');
    data.forEach((q, i) => {
      console.log(`   ${i + 1}. [${q.code}] ${q.question_text}`);
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  seedSurveyQuestions();
}

module.exports = { seedSurveyQuestions, pocQuestions };
