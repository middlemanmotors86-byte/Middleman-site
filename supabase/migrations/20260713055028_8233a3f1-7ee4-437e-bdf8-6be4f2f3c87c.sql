
CREATE OR REPLACE FUNCTION public.admin_run_sql(query text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  lowered text;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  lowered := lower(query);
  IF lowered ~ '\y(insert|update|delete|drop|alter|truncate|grant|revoke|create|comment|vacuum|analyze|reindex|copy|call|do)\y' THEN
    RAISE EXCEPTION 'Only read-only SELECT queries are allowed';
  END IF;

  SET LOCAL statement_timeout = '15s';
  SET LOCAL transaction_read_only = on;

  EXECUTE format('SELECT COALESCE(jsonb_agg(t), ''[]''::jsonb) FROM ( %s ) t', query) INTO result;
  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_run_sql(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_run_sql(text) TO authenticated;
