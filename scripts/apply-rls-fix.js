// scripts/apply-rls-fix.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Applying RLS Policy Fix for user_activities table...\n');

console.log('Environment check:');
console.log('SUPABASE_URL:', SUPABASE_URL ? 'Set' : 'Missing');
console.log('SUPABASE_SERVICE_KEY:', SUPABASE_SERVICE_KEY ? 'Set' : 'Missing');

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function applyRLSFix() {
  try {
    console.log('\n1. Dropping existing problematic policy...');
    
    // Drop the existing INSERT policy
    const { data: dropInsertData, error: dropInsertError } = await supabaseAdmin.rpc('exec_sql', {
      sql: 'DROP POLICY IF EXISTS "Users can insert own activities" ON public.user_activities;'
    });
    
    if (dropInsertError) {
      console.log('   ⚠️  Error dropping insert policy:', dropInsertError.message);
    } else {
      console.log('   ✅ Dropped existing INSERT policy');
    }

    // Drop the existing SELECT policy for consistency
    const { data: dropSelectData, error: dropSelectError } = await supabaseAdmin.rpc('exec_sql', {
      sql: 'DROP POLICY IF EXISTS "Users can view own activities" ON public.user_activities;'
    });
    
    if (dropSelectError) {
      console.log('   ⚠️  Error dropping select policy:', dropSelectError.message);
    } else {
      console.log('   ✅ Dropped existing SELECT policy');
    }

    console.log('\n2. Creating corrected INSERT policy with UUID casting...');
    
    const insertPolicySQL = `
      CREATE POLICY "Users can insert own activities"
      ON public.user_activities
      FOR INSERT
      TO authenticated
      WITH CHECK ((SELECT auth.uid())::uuid = user_id);
    `;
    
    const { data: insertPolicyData, error: insertPolicyError } = await supabaseAdmin.rpc('exec_sql', {
      sql: insertPolicySQL
    });
    
    if (insertPolicyError) {
      console.log('   ❌ Error creating INSERT policy:', insertPolicyError.message);
      throw insertPolicyError;
    } else {
      console.log('   ✅ Created corrected INSERT policy');
    }

    console.log('\n3. Creating corrected SELECT policy with UUID casting...');
    
    const selectPolicySQL = `
      CREATE POLICY "Users can view own activities" 
      ON public.user_activities
      FOR SELECT 
      TO authenticated
      USING ((SELECT auth.uid())::uuid = user_id);
    `;
    
    const { data: selectPolicyData, error: selectPolicyError } = await supabaseAdmin.rpc('exec_sql', {
      sql: selectPolicySQL
    });
    
    if (selectPolicyError) {
      console.log('   ❌ Error creating SELECT policy:', selectPolicyError.message);
      throw selectPolicyError;
    } else {
      console.log('   ✅ Created corrected SELECT policy');
    }

    console.log('\n4. Verifying policies were created correctly...');
    
    const verifySQL = `
      SELECT 
          schemaname,
          tablename, 
          policyname, 
          permissive, 
          roles, 
          cmd, 
          with_check 
      FROM pg_policies 
      WHERE tablename = 'user_activities'
      ORDER BY policyname;
    `;
    
    const { data: verifyData, error: verifyError } = await supabaseAdmin.rpc('exec_sql', {
      sql: verifySQL
    });
    
    if (verifyError) {
      console.log('   ❌ Error verifying policies:', verifyError.message);
    } else {
      console.log('   ✅ Policy verification:');
      if (verifyData && verifyData.length > 0) {
        verifyData.forEach(policy => {
          console.log(`      Policy: ${policy.policyname}`);
          console.log(`      Command: ${policy.cmd}`);
          console.log(`      Roles: ${policy.roles}`);
          console.log(`      Check: ${policy.with_check || policy.qual}`);
          console.log('');
        });
      } else {
        console.log('      No policies found (unexpected)');
      }
    }

    console.log('\n🎉 RLS Policy fix applied successfully!');
    console.log('The user_activities table should now accept inserts from authenticated users.');
    console.log('Test the signup flow in staging (http://localhost:3002) to verify the fix.');

  } catch (error) {
    console.error('❌ Failed to apply RLS fix:', error);
    process.exit(1);
  }
}

applyRLSFix().catch(console.error);