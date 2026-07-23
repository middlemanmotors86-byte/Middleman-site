-- ============================================================
-- LEADS (CRM lead capture w/ program tags)
-- ============================================================
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Contact
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  message TEXT,

  -- Source & tagging
  source TEXT NOT NULL DEFAULT 'website',           -- e.g. 'truecar_portal', 'rideshare_banner', 'rideshare_form', 'contact_form'
  program_tags TEXT[] NOT NULL DEFAULT '{}'::text[], -- e.g. ['rideshare','truecar','uber','lyft']

  -- Rideshare-specific (nullable — only for rideshare leads)
  rideshare_platform TEXT,                           -- 'uber' | 'lyft' | 'both'
  rideshare_weekly_earnings NUMERIC,
  rideshare_account_active BOOLEAN,
  rideshare_months_driving INTEGER,

  -- CRM workflow
  status TEXT NOT NULL DEFAULT 'new',                -- new | contacted | qualified | converted | lost
  assigned_to UUID,
  internal_notes TEXT,

  -- Audit
  submitted_ip TEXT,
  submitted_user_agent TEXT
);

CREATE INDEX idx_leads_created_at ON public.leads (created_at DESC);
CREATE INDEX idx_leads_status ON public.leads (status);
CREATE INDEX idx_leads_program_tags ON public.leads USING GIN (program_tags);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Public CANNOT insert / select — all writes go through edge function w/ service role.
CREATE POLICY "Admins can view leads"
  ON public.leads FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert leads"
  ON public.leads FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update leads"
  ON public.leads FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete leads"
  ON public.leads FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Block any anonymous direct access explicitly
CREATE POLICY "Deny public access to leads"
  ON public.leads FOR ALL TO anon
  USING (false) WITH CHECK (false);

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ============================================================
-- PORTFOLIO BUYERS (admin-only Agora-style providers)
-- ============================================================
CREATE TABLE public.portfolio_buyers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  company_name TEXT NOT NULL,
  website TEXT,
  buyer_type TEXT,                  -- e.g. 'BHPH portfolio', 'Sub-prime', 'Lease', 'Charge-off'
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  terms_summary TEXT,               -- short description of pricing / advance rate
  status TEXT NOT NULL DEFAULT 'prospect',  -- prospect | active | paused | inactive
  last_contacted_at DATE,
  notes TEXT
);

CREATE INDEX idx_portfolio_buyers_status ON public.portfolio_buyers (status);

ALTER TABLE public.portfolio_buyers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view portfolio buyers"
  ON public.portfolio_buyers FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert portfolio buyers"
  ON public.portfolio_buyers FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update portfolio buyers"
  ON public.portfolio_buyers FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete portfolio buyers"
  ON public.portfolio_buyers FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Deny public access to portfolio buyers"
  ON public.portfolio_buyers FOR ALL TO anon
  USING (false) WITH CHECK (false);

CREATE TRIGGER update_portfolio_buyers_updated_at
  BEFORE UPDATE ON public.portfolio_buyers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
