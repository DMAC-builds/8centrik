-- Fix for user_activities RLS policy
-- Problem: Current policy has type mismatch between auth.uid() and user_id
-- Solution: Use explicit UUID casting as recommended by Supabase

-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Users can insert own activities" ON public.user_activities;

-- Create the corrected policy with explicit UUID casting
CREATE POLICY "Users can insert own activities"
ON public.user_activities
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid())::uuid = user_id);

-- Also update the SELECT policy for consistency (though it might not be causing issues)
DROP POLICY IF EXISTS "Users can view own activities" ON public.user_activities;

CREATE POLICY "Users can view own activities" 
ON public.user_activities
FOR SELECT 
TO authenticated
USING ((SELECT auth.uid())::uuid = user_id);

-- Verify the policies were created
SELECT 
    schemaname,
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual,
    with_check 
FROM pg_policies 
WHERE tablename = 'user_activities'
ORDER BY policyname;