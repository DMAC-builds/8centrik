// scripts/diagnose-rls-simple.js
const { createClient } = require('@supabase/supabase-js');

// Get environment variables directly
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Environment check:');
console.log('SUPABASE_URL:', SUPABASE_URL ? 'Set' : 'Missing');
console.log('SUPABASE_SERVICE_KEY:', SUPABASE_SERVICE_KEY ? 'Set' : 'Missing');

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log('\n🔍 Diagnosing RLS policies for user_activities table...\n');

async function runDiagnostics() {
  try {
    console.log('1. Testing direct table access (will reveal RLS issues):');
    const { data: tableInfo, error: tableError } = await supabaseAdmin
      .from('user_activities')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.log('   ❌ Cannot access table:', tableError.message);
      
      if (tableError.message.includes('row-level security')) {
        console.log('   🔍 RLS is enabled and blocking access');
      }
    } else {
      console.log('   ✅ Table accessible, sample structure:', tableInfo);
    }

    console.log('\n2. Getting column information from schema:');
    const { data: columns, error: columnError } = await supabaseAdmin
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_schema', 'public')
      .eq('table_name', 'user_activities');
    
    if (columnError) {
      console.log('   ❌ Error checking columns:', columnError);
    } else {
      console.log('   ✅ Column information:');
      columns.forEach(col => {
        console.log(`      ${col.column_name}: ${col.data_type}`);
      });
    }

    console.log('\n3. Checking user_profiles for comparison:');
    const { data: profileInfo, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .limit(1);
    
    if (profileError) {
      console.log('   ❌ Cannot access user_profiles:', profileError.message);
    } else {
      console.log('   ✅ user_profiles accessible');
      if (profileInfo.length > 0) {
        console.log('   Sample profile ID type:', typeof profileInfo[0].id);
      }
    }

    // Let's also check the actual schema files that were loaded
    console.log('\n4. Attempting to read existing policies via service role...');
    
    try {
      // Service role should be able to see policy information
      const { data: policyData, error: policyErr } = await supabaseAdmin.rpc('exec_sql', {
        sql: "SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check FROM pg_policies WHERE tablename = 'user_activities';"
      });
      
      if (policyErr) {
        console.log('   ❌ Cannot query policies:', policyErr);
        
        // Try a simpler approach - attempt an insert to see what fails
        console.log('   Attempting test insert to see specific error...');
        const testUserId = '123e4567-e89b-12d3-a456-426614174000'; // sample UUID
        const { data: insertData, error: insertError } = await supabaseAdmin
          .from('user_activities')
          .insert({
            user_id: testUserId,
            activity_type: 'test',
            activity_data: {}
          });
          
        if (insertError) {
          console.log('   ❌ Test insert failed:', insertError.message);
          console.log('   🔍 This confirms the RLS policy issue');
        } else {
          console.log('   ✅ Test insert succeeded (unexpected)');
        }
      } else {
        console.log('   ✅ Policy information:', policyData);
      }
    } catch (err) {
      console.log('   ❌ Error querying policies:', err.message);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

runDiagnostics().catch(console.error);