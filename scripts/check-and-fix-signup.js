// scripts/check-and-fix-signup.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Checking Supabase setup and fixing signup flow...\n');

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables');
  console.log('SUPABASE_URL:', SUPABASE_URL ? 'Set' : 'Missing');
  console.log('SUPABASE_SERVICE_KEY:', SUPABASE_SERVICE_KEY ? 'Set' : 'Missing');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkSupabaseSetup() {
  try {
    console.log('1. Checking user_activities table access with service role...');
    
    // Service role should bypass RLS, so this should work
    const { data: activities, error: activitiesError } = await supabaseAdmin
      .from('user_activities')
      .select('*')
      .limit(3);
    
    if (activitiesError) {
      console.log('   ❌ Error accessing user_activities:', activitiesError.message);
      console.log('   🔍 This might indicate connectivity issues');
    } else {
      console.log('   ✅ user_activities table accessible');
      console.log(`   📊 Found ${activities.length} existing activities`);
      if (activities.length > 0) {
        console.log('   Sample activity types:', activities.map(a => a.activity_type).join(', '));
      }
    }

    console.log('\n2. Checking user_profiles table...');
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, created_at')
      .limit(3);
    
    if (profilesError) {
      console.log('   ❌ Error accessing user_profiles:', profilesError.message);
    } else {
      console.log('   ✅ user_profiles table accessible');
      console.log(`   📊 Found ${profiles.length} existing profiles`);
    }

    console.log('\n3. Testing insert with service role (should bypass RLS)...');
    const testUserId = '00000000-0000-0000-0000-000000000000'; // null UUID for test
    
    const { data: testInsert, error: insertError } = await supabaseAdmin
      .from('user_activities')
      .insert({
        user_id: testUserId,
        activity_type: 'test_service_role',
        activity_data: { test: true }
      })
      .select();
    
    if (insertError) {
      console.log('   ❌ Service role insert failed:', insertError.message);
      console.log('   🔍 This suggests RLS is blocking even service role');
    } else {
      console.log('   ✅ Service role can insert (RLS bypassed)');
      
      // Clean up test data
      if (testInsert && testInsert.length > 0) {
        await supabaseAdmin
          .from('user_activities')
          .delete()
          .eq('id', testInsert[0].id);
        console.log('   🧹 Cleaned up test data');
      }
    }

  } catch (error) {
    console.error('❌ Error checking Supabase setup:', error.message);
  }
}

checkSupabaseSetup().then(() => {
  console.log('\n🎯 ANALYSIS: The issue is that the app tries to log user activities');
  console.log('during signup when the user context is not fully established.');
  console.log('');
  console.log('SOLUTION: Modify AuthContext to:');
  console.log('- Skip activity logging during signup (new users)');
  console.log('- Only log activity for established logins (existing users)');
  console.log('- Differentiate between signup and login events');
  console.log('');
  console.log('Next: I will modify the AuthContext to fix this...');
}).catch(console.error);