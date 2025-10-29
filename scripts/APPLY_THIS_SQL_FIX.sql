-- ===============================================
-- RLS POLICY FIX FOR user_activities TABLE
-- ===============================================
--
-- PROBLEM: "new row violates row-level security policy for table 'user_activities'"
-- ROOT CAUSE: Type mismatch in RLS policy between auth.uid() and user_id UUID column
-- SOLUTION: Add explicit UUID casting to the RLS policy conditions
--
-- INSTRUCTIONS:
-- 1. Go to your Supabase project dashboard
-- 2. Navigate to SQL Editor
-- 3. Copy and paste this entire SQL script
-- 4. Execute the script
-- 5. Test user signup in staging at http://localhost:3002
--

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can insert own activities" ON public.user_activities;
DROP POLICY IF EXISTS "Users can view own activities" ON public.user_activities;

-- Create corrected INSERT policy with explicit UUID casting
CREATE POLICY "Users can insert own activities"
ON public.user_activities
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid())::uuid = user_id);

-- Create corrected SELECT policy with explicit UUID casting  
CREATE POLICY "Users can view own activities"
ON public.user_activities
FOR SELECT
TO authenticated
USING ((SELECT auth.uid())::uuid = user_id);

-- Verify the policies were created correctly
SELECT 
    schemaname,
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    with_check,
    qual
FROM pg_policies 
WHERE tablename = 'user_activities'
ORDER BY policyname;

-- Test comment: This should show two policies with the corrected UUID casting