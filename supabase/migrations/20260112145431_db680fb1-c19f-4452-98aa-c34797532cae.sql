-- Disable RLS on rate_limit_tracking since it's only accessed by service role
-- The service role bypasses RLS anyway, so having RLS with no policies is unnecessary
ALTER TABLE public.rate_limit_tracking DISABLE ROW LEVEL SECURITY;