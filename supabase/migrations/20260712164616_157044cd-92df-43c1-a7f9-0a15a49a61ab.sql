
-- =========================================================
-- 1. LOGIN EVENTS
-- =========================================================
CREATE TABLE public.login_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  email TEXT,
  provider TEXT,
  ip_address TEXT,
  user_agent TEXT,
  session_id TEXT,
  success BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.login_events TO authenticated;
GRANT INSERT ON public.login_events TO anon;
GRANT ALL ON public.login_events TO service_role;
ALTER TABLE public.login_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read login events" ON public.login_events
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can insert login events" ON public.login_events
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- =========================================================
-- 2. INVENTORY QUERIES
-- =========================================================
CREATE TABLE public.inventory_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  session_id TEXT,
  query_type TEXT NOT NULL, -- search | filter | view | compare
  search_term TEXT,
  filters JSONB,
  vehicle_id TEXT,
  vehicle_vin TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.inventory_queries TO authenticated;
GRANT INSERT ON public.inventory_queries TO anon;
GRANT ALL ON public.inventory_queries TO service_role;
ALTER TABLE public.inventory_queries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read inventory queries" ON public.inventory_queries
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can insert inventory queries" ON public.inventory_queries
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- =========================================================
-- 3. FUNNEL EVENTS
-- =========================================================
CREATE TABLE public.funnel_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  session_id TEXT,
  email TEXT,
  step TEXT NOT NULL, -- landing | inventory_view | quick_qualify | lead_submit | credit_app | deal_created | deal_closed
  metadata JSONB,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.funnel_events TO authenticated;
GRANT INSERT ON public.funnel_events TO anon;
GRANT ALL ON public.funnel_events TO service_role;
ALTER TABLE public.funnel_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read funnel events" ON public.funnel_events
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can insert funnel events" ON public.funnel_events
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- =========================================================
-- 4. CUSTOMER PROFILES (unified, keyed by email)
-- =========================================================
CREATE TABLE public.customer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  first_source TEXT,
  first_utm_source TEXT,
  first_utm_medium TEXT,
  first_utm_campaign TEXT,
  last_utm_source TEXT,
  last_utm_medium TEXT,
  last_utm_campaign TEXT,
  lead_count INT NOT NULL DEFAULT 0,
  credit_app_count INT NOT NULL DEFAULT 0,
  last_ip TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.customer_profiles TO authenticated;
GRANT ALL ON public.customer_profiles TO service_role;
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage customer profiles" ON public.customer_profiles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_customer_profiles_updated_at
  BEFORE UPDATE ON public.customer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- 5. INTEGRATION SETTINGS (admin key/value: sheet IDs, etc.)
-- =========================================================
CREATE TABLE public.integration_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.integration_settings TO authenticated;
GRANT ALL ON public.integration_settings TO service_role;
ALTER TABLE public.integration_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage integration settings" ON public.integration_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- 6. EMAIL CAPTURES (cold traffic)
-- =========================================================
CREATE TABLE public.email_captures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  source TEXT,
  session_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.email_captures TO authenticated;
GRANT INSERT ON public.email_captures TO anon, authenticated;
GRANT ALL ON public.email_captures TO service_role;
ALTER TABLE public.email_captures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read email captures" ON public.email_captures
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone submits email capture" ON public.email_captures
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- =========================================================
-- 7. Extend page_views with IP + attribution
-- =========================================================
ALTER TABLE public.page_views
  ADD COLUMN IF NOT EXISTS ip_address TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS first_utm_source TEXT,
  ADD COLUMN IF NOT EXISTS first_utm_medium TEXT,
  ADD COLUMN IF NOT EXISTS first_utm_campaign TEXT;

-- =========================================================
-- 8. Auto-create/update customer profile on lead / credit app
-- =========================================================
CREATE OR REPLACE FUNCTION public.upsert_customer_profile_from_lead()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email IS NULL OR NEW.email = '' THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.customer_profiles (
    email, full_name, phone, first_source, first_utm_source, first_utm_medium, first_utm_campaign,
    last_utm_source, last_utm_medium, last_utm_campaign, lead_count
  ) VALUES (
    lower(NEW.email), NEW.name, NEW.phone, COALESCE(NEW.program, 'lead'),
    NEW.utm_source, NEW.utm_medium, NEW.utm_campaign,
    NEW.utm_source, NEW.utm_medium, NEW.utm_campaign, 1
  )
  ON CONFLICT (email) DO UPDATE SET
    full_name = COALESCE(customer_profiles.full_name, EXCLUDED.full_name),
    phone = COALESCE(customer_profiles.phone, EXCLUDED.phone),
    last_utm_source = COALESCE(EXCLUDED.last_utm_source, customer_profiles.last_utm_source),
    last_utm_medium = COALESCE(EXCLUDED.last_utm_medium, customer_profiles.last_utm_medium),
    last_utm_campaign = COALESCE(EXCLUDED.last_utm_campaign, customer_profiles.last_utm_campaign),
    lead_count = customer_profiles.lead_count + 1,
    updated_at = now();
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.upsert_customer_profile_from_lead() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER trg_lead_to_customer_profile
  AFTER INSERT ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.upsert_customer_profile_from_lead();

CREATE OR REPLACE FUNCTION public.upsert_customer_profile_from_credit_app()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email IS NULL OR NEW.email = '' THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.customer_profiles (
    email, full_name, phone, address, city, state, zip,
    first_source, credit_app_count
  ) VALUES (
    lower(NEW.email),
    trim(concat_ws(' ', NEW.first_name, NEW.last_name)),
    NEW.phone, NEW.address, NEW.city, NEW.state, NEW.zip,
    'credit_application', 1
  )
  ON CONFLICT (email) DO UPDATE SET
    full_name = COALESCE(customer_profiles.full_name, EXCLUDED.full_name),
    phone = COALESCE(customer_profiles.phone, EXCLUDED.phone),
    address = COALESCE(EXCLUDED.address, customer_profiles.address),
    city = COALESCE(EXCLUDED.city, customer_profiles.city),
    state = COALESCE(EXCLUDED.state, customer_profiles.state),
    zip = COALESCE(EXCLUDED.zip, customer_profiles.zip),
    credit_app_count = customer_profiles.credit_app_count + 1,
    updated_at = now();
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.upsert_customer_profile_from_credit_app() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER trg_credit_app_to_customer_profile
  AFTER INSERT ON public.credit_applications
  FOR EACH ROW EXECUTE FUNCTION public.upsert_customer_profile_from_credit_app();

-- =========================================================
-- 9. STORAGE POLICIES for sales-jackets bucket
-- =========================================================
CREATE POLICY "Admins can read sales jackets"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'sales-jackets' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can upload sales jackets"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'sales-jackets' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update sales jackets"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'sales-jackets' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete sales jackets"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'sales-jackets' AND public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- 10. Indexes
-- =========================================================
CREATE INDEX idx_login_events_created ON public.login_events(created_at DESC);
CREATE INDEX idx_inventory_queries_created ON public.inventory_queries(created_at DESC);
CREATE INDEX idx_funnel_events_created ON public.funnel_events(created_at DESC);
CREATE INDEX idx_funnel_events_step ON public.funnel_events(step);
CREATE INDEX idx_email_captures_created ON public.email_captures(created_at DESC);
CREATE INDEX idx_customer_profiles_email ON public.customer_profiles(email);
