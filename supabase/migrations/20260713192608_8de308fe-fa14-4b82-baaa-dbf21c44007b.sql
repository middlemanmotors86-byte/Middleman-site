
-- Tighten permissive INSERT policies (replace WITH CHECK true with real validation)

DROP POLICY IF EXISTS "Anyone can insert login events" ON public.login_events;
CREATE POLICY "Anyone can insert login events" ON public.login_events
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    success IS NOT NULL
    AND (email IS NULL OR length(email) <= 320)
    AND (provider IS NULL OR length(provider) <= 64)
  );

DROP POLICY IF EXISTS "Anyone can insert inventory queries" ON public.inventory_queries;
CREATE POLICY "Anyone can insert inventory queries" ON public.inventory_queries
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    query_type IS NOT NULL
    AND length(query_type) BETWEEN 1 AND 64
    AND (search_term IS NULL OR length(search_term) <= 500)
  );

DROP POLICY IF EXISTS "Anyone can insert funnel events" ON public.funnel_events;
CREATE POLICY "Anyone can insert funnel events" ON public.funnel_events
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    step IS NOT NULL
    AND length(step) BETWEEN 1 AND 128
    AND (email IS NULL OR length(email) <= 320)
  );

DROP POLICY IF EXISTS "Anyone submits email capture" ON public.email_captures;
CREATE POLICY "Anyone submits email capture" ON public.email_captures
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL
    AND length(email) BETWEEN 3 AND 320
    AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  );

DROP POLICY IF EXISTS "Anyone can log a page view" ON public.page_views;
CREATE POLICY "Anyone can log a page view" ON public.page_views
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    path IS NOT NULL
    AND length(path) BETWEEN 1 AND 2048
    AND (email IS NULL OR length(email) <= 320)
  );
