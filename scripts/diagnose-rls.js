// scripts/diagnose-rls.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log('🔍 Diagnosing RLS policies for user_activities table...\n');

async function runDiagnostics() {
  try {
    console.log('1. Checking if RLS is enabled on user_activities:');
    const { data: rlsCheck, error: rlsError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        SELECT relname, relrowsecurity
        FROM pg_class
        WHERE relname = 'user_activities';
      `
    });
    
    if (rlsError) {
      console.log('   Using alternative query method...');
      // Try direct query
      const { data, error } = await supabaseAdmin
        .from('information_schema.tables')
        .select('*')
        .eq('table_name', 'user_activities')
        .eq('table_schema', 'public');
      
      if (error) {
        console.error('   ❌ Error checking RLS:', error);
      } else {
        console.log('   ✅ Table exists:', data.length > 0);
      }
    } else {
      console.log('   RLS Result:', rlsCheck);
    }

    console.log('\n2. Checking existing policies:');
    const { data: policies, error: policyError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        SELECT polname, polcmd, polroles::text, polqual::text, polwithcheck::text
        FROM pg_policies
        WHERE tablename = 'user_activities';
      `
    });
    
    if (policyError) {
      console.log('   ❌ Error checking policies:', policyError);
    } else {
      console.log('   Policies:', policies);
    }

    console.log('\n3. Checking column types:');
    const { data: columns, error: columnError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema='public' AND table_name='user_activities';
      `
    });
    
    if (columnError) {
      console.log('   ❌ Error checking columns:', columnError);
      
      // Try alternative approach
      const { data: tableInfo, error: tableError } = await supabaseAdmin
        .from('user_activities')
        .select('*')
        .limit(1);
      
      if (tableError) {
        console.log('   ❌ Cannot access table:', tableError.message);
        
        // This tells us about the RLS policy issue
        if (tableError.message.includes('row-level security')) {
          console.log('   🔍 RLS is definitely enabled and blocking access');
        }
      } else {
        console.log('   ✅ Table accessible, sample structure:', tableInfo);
      }
    } else {
      console.log('   Columns:', columns);
    }

    console.log('\n4. Testing auth context:');
    const { data: authTest, error: authError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `SELECT auth.uid() as current_user_id;`
    });
    
    if (authError) {
      console.log('   ❌ Error checking auth:', authError);
    } else {
      console.log('   Auth context:', authTest);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

runDiagnostics().catch(console.error);