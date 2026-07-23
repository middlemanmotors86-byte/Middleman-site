-- LEADS TABLE
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert for leads"
ON public.leads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow admin full access for leads"
ON public.leads
FOR ALL
TO service_role
USING (true);

-- CONTACTS TABLE
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert for contacts" ON public.contacts FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow admin full access for contacts" ON public.contacts FOR ALL TO service_role USING (true);

-- CREDIT APPLICATIONS TABLE
ALTER TABLE public.credit_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert for credit_applications" ON public.credit_applications FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow admin full access for credit_applications" ON public.credit_applications FOR ALL TO service_role USING (true);

-- DEALS TABLE
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- Note: Deals are likely created by admins, not public users.
-- If public forms can create deals, an INSERT policy would be needed.
-- For now, we assume only admins manage deals.
CREATE POLICY "Allow admin full access for deals"
ON public.deals
FOR ALL
TO service_role
USING (true);