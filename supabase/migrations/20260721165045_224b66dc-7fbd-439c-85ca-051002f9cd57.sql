-- Revoke EXECUTE from signed-in and anonymous roles on SECURITY DEFINER
-- functions that must not be directly callable via the Data API. They are
-- still invoked internally by RLS policies (has_role) or by edge functions
-- running with the service role (admin_run_sql via the admin-sql function).
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;

REVOKE EXECUTE ON FUNCTION public.admin_run_sql(text) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.admin_run_sql(text) TO service_role;
