-- Create audit log table for security-sensitive operations
CREATE TABLE public.security_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  user_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT
);

-- Enable RLS and lock down audit log (only service role can access)
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs"
ON public.security_audit_log
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Block all public modifications (service role bypasses for writes)
CREATE POLICY "Deny public modifications to audit logs"
ON public.security_audit_log
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

-- Create trigger function to log all role changes
CREATE OR REPLACE FUNCTION public.audit_user_roles_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.security_audit_log (action, table_name, record_id, user_id, new_data)
    VALUES ('INSERT', 'user_roles', NEW.id, NEW.user_id, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.security_audit_log (action, table_name, record_id, user_id, old_data, new_data)
    VALUES ('UPDATE', 'user_roles', NEW.id, NEW.user_id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.security_audit_log (action, table_name, record_id, user_id, old_data)
    VALUES ('DELETE', 'user_roles', OLD.id, OLD.user_id, to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Attach trigger to user_roles table
CREATE TRIGGER audit_user_roles_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.audit_user_roles_changes();