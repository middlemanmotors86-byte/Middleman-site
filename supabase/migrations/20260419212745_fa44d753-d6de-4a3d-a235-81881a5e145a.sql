
DO $$ BEGIN
  CREATE TYPE public.credit_app_status AS ENUM ('new', 'reviewing', 'approved', 'declined', 'needs_info');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.soft_pull_status AS ENUM ('not_run', 'requested', 'completed', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.credit_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status public.credit_app_status NOT NULL DEFAULT 'new',
  channel text NOT NULL DEFAULT 'web',
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  date_of_birth date,
  ssn_last_four text,
  dl_number text,
  dl_state text,
  marital_status text,
  dependents integer,
  address text,
  address_2 text,
  city text,
  state text DEFAULT 'GA',
  zip text,
  housing_status text,
  housing_payment numeric,
  years_at_address integer,
  months_at_address integer,
  previous_address text,
  employment_status text,
  employer_name text,
  employer_phone text,
  job_title text,
  monthly_income numeric,
  years_at_employer integer,
  months_at_employer integer,
  other_income numeric,
  other_income_source text,
  has_co_applicant boolean NOT NULL DEFAULT false,
  co_first_name text,
  co_last_name text,
  co_email text,
  co_phone text,
  co_ssn_last_four text,
  co_relationship text,
  co_monthly_income numeric,
  reference_1_name text,
  reference_1_phone text,
  reference_1_relationship text,
  reference_2_name text,
  reference_2_phone text,
  reference_2_relationship text,
  vehicle_stock_number text,
  vehicle_year text,
  vehicle_make text,
  vehicle_model text,
  vehicle_vin text,
  desired_down_payment numeric,
  desired_monthly_payment numeric,
  trade_in_details text,
  consent_credit_check boolean NOT NULL DEFAULT false,
  consent_terms boolean NOT NULL DEFAULT false,
  signature_name text,
  signature_ip text,
  signed_at timestamptz,
  internal_notes text,
  decline_reason text,
  assigned_to uuid,
  linked_deal_id uuid,
  soft_pull_status public.soft_pull_status NOT NULL DEFAULT 'not_run',
  soft_pull_requested_at timestamptz,
  soft_pull_completed_at timestamptz,
  soft_pull_score integer,
  soft_pull_data jsonb,
  submitted_ip text,
  submitted_user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_credit_apps_status ON public.credit_applications(status);
CREATE INDEX IF NOT EXISTS idx_credit_apps_created ON public.credit_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_apps_email ON public.credit_applications(email);

ALTER TABLE public.credit_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin or finance can view credit apps"
  ON public.credit_applications FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'finance'));

CREATE POLICY "Admin or finance can update credit apps"
  ON public.credit_applications FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'finance'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'finance'));

CREATE POLICY "Only admins can delete credit apps"
  ON public.credit_applications FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin or finance can manually insert credit apps"
  ON public.credit_applications FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'finance'));

CREATE TRIGGER update_credit_applications_updated_at
  BEFORE UPDATE ON public.credit_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.audit_credit_applications_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.security_audit_log (action, table_name, record_id, user_id, new_data)
    VALUES ('INSERT', 'credit_applications', NEW.id, auth.uid(), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.security_audit_log (action, table_name, record_id, user_id, old_data, new_data)
    VALUES ('UPDATE', 'credit_applications', NEW.id, auth.uid(), to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.security_audit_log (action, table_name, record_id, user_id, old_data)
    VALUES ('DELETE', 'credit_applications', OLD.id, auth.uid(), to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER audit_credit_applications
  AFTER INSERT OR UPDATE OR DELETE ON public.credit_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_credit_applications_changes();
