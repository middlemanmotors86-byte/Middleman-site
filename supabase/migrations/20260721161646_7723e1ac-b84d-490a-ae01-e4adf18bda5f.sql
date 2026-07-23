
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_old_rate_limits() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.audit_user_roles_changes() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.upsert_customer_profile_from_lead() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.upsert_customer_profile_from_credit_app() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_initial_followup_task() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.audit_credit_applications_changes() FROM PUBLIC, anon, authenticated;
