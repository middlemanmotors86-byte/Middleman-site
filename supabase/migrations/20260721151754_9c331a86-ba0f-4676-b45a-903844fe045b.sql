
CREATE OR REPLACE FUNCTION public.admin_run_sql(query text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
  lowered text;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  lowered := lower(query);

  -- Block any DML/DDL keywords.
  IF lowered ~ '\y(insert|update|delete|drop|alter|truncate|grant|revoke|create|comment|vacuum|analyze|reindex|copy|call|do)\y' THEN
    RAISE EXCEPTION 'Only read-only SELECT queries are allowed';
  END IF;

  -- Block cross-schema access: only unqualified names or explicit public.* are allowed.
  -- Reject references to internal / sensitive schemas.
  IF lowered ~ '\y(auth|storage|realtime|supabase_functions|vault|pg_catalog|pg_temp|pg_toast|information_schema|extensions|graphql|graphql_public|net|pgsodium|pgsodium_masks|cron)\s*\.' THEN
    RAISE EXCEPTION 'Cross-schema access is not allowed. Only public schema tables may be queried.';
  END IF;

  -- Reject any other schema-qualified reference that isn't public.
  -- Matches "<ident>." patterns and requires them to be "public."
  IF lowered ~ '\y([a-z_][a-z0-9_]*)\s*\.\s*[a-z_]' THEN
    IF lowered !~ '\y(public)\s*\.' OR lowered ~ '\y(?!public\y)[a-z_][a-z0-9_]*\s*\.\s*[a-z_]' THEN
      -- Simplified re-check: any schema-qualified token must start with public.
      IF EXISTS (
        SELECT 1
        FROM regexp_matches(lowered, '\y([a-z_][a-z0-9_]*)\s*\.\s*[a-z_]', 'g') AS m
        WHERE m[1] <> 'public'
      ) THEN
        RAISE EXCEPTION 'Cross-schema access is not allowed. Only public.* references are permitted.';
      END IF;
    END IF;
  END IF;

  SET LOCAL statement_timeout = '15s';
  SET LOCAL transaction_read_only = on;

  EXECUTE format('SELECT COALESCE(jsonb_agg(t), ''[]''::jsonb) FROM ( %s ) t', query) INTO result;
  RETURN result;
END;
$function$;
