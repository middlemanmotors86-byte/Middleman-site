-- Re-enable RLS on rate_limit_tracking
ALTER TABLE public.rate_limit_tracking ENABLE ROW LEVEL SECURITY;

-- Add explicit deny-all policy for public access
-- Service role bypasses RLS, so edge functions will still work
-- This policy explicitly blocks anon and authenticated users
CREATE POLICY "Deny all public access to rate limit tracking"
ON public.rate_limit_tracking
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);