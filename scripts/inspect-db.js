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

async function inspectDatabase() {
  console.log('🔍 Inspecting existing database structure...\n');
  
  try {
    // Try different possible table names for survey/health data
    const possibleTableNames = [
      'symptom_questions', 'survey_responses', 'questions', 'responses',
      'health_questions', 'user_responses', 'survey_questions', 'form_responses',
      'questionnaire', 'answers', 'profiles', 'users', 'meal_plans', 'orders'
    ];
    
    console.log('🔍 Checking for existing tables...');
    const foundTables = [];
    
    for (const tableName of possibleTableNames) {
      const { data, error } = await supabase.from(tableName).select('*').limit(1);
      if (!error) {
        foundTables.push({ name: tableName, sampleData: data });
        console.log(`✅ Found table: ${tableName}`);
        if (data && data.length > 0) {
          console.log(`   Columns:`, Object.keys(data[0]).join(', '));
          console.log(`   Row count: checking...`);
          
          // Get row count
          const { count } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });
          console.log(`   Total rows: ${count}`);
        } else {
          console.log(`   Table is empty`);
        }
        console.log('');
      }
    }
    
    if (foundTables.length > 0) {
      console.log(`\n📊 Summary: Found ${foundTables.length} tables`);
      console.log('\n🎯 Next steps:');
      console.log('1. Create missing tables for meal plans, profiles, and orders');
      console.log('2. Set up Row Level Security (RLS) policies');
      console.log('3. Create proper relationships between tables');
    } else {
      console.log('\n❌ No tables found. You may need to:');
      console.log('1. Check if you\'re connected to the right Supabase project');
      console.log('2. Verify your service role key has the right permissions');
      console.log('3. Create the initial tables');
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Alternative method to check table structure using direct SQL
async function getTableStructure(tableName) {
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = '${tableName}'
      ORDER BY ordinal_position;
    `
  });
  
  return { data, error };
}

inspectDatabase();
