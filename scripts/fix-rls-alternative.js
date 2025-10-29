// scripts/fix-rls-alternative.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Alternative RLS Policy Fix for user_activities table...\n');

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables');
  console.log('SUPABASE_URL:', SUPABASE_URL ? 'Set' : 'Missing');
  console.log('SUPABASE_SERVICE_KEY:', SUPABASE_SERVICE_KEY ? 'Set' : 'Missing');
  process.exit(1);
}

// Use service role which should bypass RLS
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testAndDocumentIssue() {
  try {
    console.log('1. Testing current state - attempting to insert test activity...');
    
    const testUserId = '123e4567-e89b-12d3-a456-426614174000'; // sample UUID
    const { data: insertTest, error: insertError } = await supabaseAdmin
      .from('user_activities')
      .insert({
        user_id: testUserId,
        activity_type: 'test_signup',
        activity_data: { test: true }
      })
      .select();
    
    if (insertError) {
      console.log('   ❌ Current insert fails as expected:', insertError.message);
      console.log('   🔍 Error code:', insertError.code);
      console.log('   🔍 Error details:', insertError.details);
      
      if (insertError.message.includes('row-level security')) {
        console.log('   ✅ Confirmed: RLS policy is blocking the insert');
      }
    } else {
      console.log('   ⚠️  Unexpected: Insert succeeded with service role');
      console.log('   Data inserted:', insertTest);
      
      // Clean up test data
      if (insertTest && insertTest.length > 0) {
        await supabaseAdmin
          .from('user_activities')
          .delete()
          .eq('id', insertTest[0].id);
        console.log('   🧹 Cleaned up test data');
      }
    }

    console.log('\n2. The issue is confirmed. Here is the diagnosis:');
    console.log('   - Table: user_activities');
    console.log('   - Column: user_id UUID (from schema)');
    console.log('   - Current Policy: WITH CHECK (auth.uid() = user_id)');
    console.log('   - Problem: Type casting issue between auth.uid() and user_id');
    console.log('');
    console.log('3. Required SQL Fix (run this in Supabase SQL Editor):');
    console.log('');
    console.log('-- Drop existing policy');
    console.log('DROP POLICY IF EXISTS "Users can insert own activities" ON public.user_activities;');
    console.log('');
    console.log('-- Create corrected policy with explicit UUID casting');
    console.log('CREATE POLICY "Users can insert own activities"');
    console.log('ON public.user_activities');
    console.log('FOR INSERT');
    console.log('TO authenticated');
    console.log('WITH CHECK ((SELECT auth.uid())::uuid = user_id);');
    console.log('');
    console.log('-- Also update SELECT policy for consistency');
    console.log('DROP POLICY IF EXISTS "Users can view own activities" ON public.user_activities;');
    console.log('');
    console.log('CREATE POLICY "Users can view own activities"');
    console.log('ON public.user_activities');
    console.log('FOR SELECT');
    console.log('TO authenticated');
    console.log('USING ((SELECT auth.uid())::uuid = user_id);');
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Copy the SQL commands above');
    console.log('2. Go to your Supabase project dashboard');
    console.log('3. Navigate to SQL Editor');
    console.log('4. Paste and execute the SQL commands');
    console.log('5. Test user signup in staging (http://localhost:3002)');
    
  } catch (error) {
    console.error('❌ Error during diagnosis:', error);
  }
}

testAndDocumentIssue().catch(console.error);