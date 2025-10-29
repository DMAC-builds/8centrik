const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

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

async function checkSymptomQuestions() {
  console.log('🔍 Checking for symptom_questions table...\n');
  
  try {
    // Check specifically for symptom_questions
    const { data, error } = await supabase
      .from('symptom_questions')
      .select('*')
      .limit(5);

    if (error) {
      console.log('❌ Error accessing symptom_questions:', error.message);
      
      // Try alternative names
      const alternatives = ['questions', 'survey_questions', 'health_questions'];
      for (const alt of alternatives) {
        console.log(`Trying ${alt}...`);
        const { data: altData, error: altError } = await supabase
          .from(alt)
          .select('*')
          .limit(1);
        
        if (!altError) {
          console.log(`✅ Found alternative: ${alt}`);
          if (altData && altData.length > 0) {
            console.log('   Structure:', Object.keys(altData[0]));
          }
        }
      }
    } else {
      console.log('✅ Found symptom_questions table!');
      console.log(`   Records found: ${data?.length || 0}`);
      
      if (data && data.length > 0) {
        console.log('   Table structure:', Object.keys(data[0]));
        console.log('   Sample record:', data[0]);
        
        // Get total count
        const { count } = await supabase
          .from('symptom_questions')
          .select('*', { count: 'exact', head: true });
        console.log(`   Total questions: ${count}`);
      }
    }

    // Also check for survey_responses
    console.log('\n🔍 Checking for survey_responses table...');
    const { data: responses, error: responseError } = await supabase
      .from('survey_responses')
      .select('*')
      .limit(1);

    if (!responseError) {
      console.log('✅ Found survey_responses table!');
      if (responses && responses.length > 0) {
        console.log('   Structure:', Object.keys(responses[0]));
      }
      
      const { count: responseCount } = await supabase
        .from('survey_responses')
        .select('*', { count: 'exact', head: true });
      console.log(`   Total responses: ${responseCount}`);
    } else {
      console.log('❌ survey_responses not found:', responseError.message);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkSymptomQuestions();
