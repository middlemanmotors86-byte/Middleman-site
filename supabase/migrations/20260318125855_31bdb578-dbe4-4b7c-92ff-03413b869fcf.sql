
-- Fix 1: document_uploads INSERT - restrict to admins only (edge function uses service role)
DROP POLICY "Admins can insert documents" ON public.document_uploads;
CREATE POLICY "Admins can insert documents" ON public.document_uploads
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Fix 2: Remove public INSERT on contact_submissions (edge function uses service role)
DROP POLICY "Public can submit contact form" ON public.contact_submissions;

-- Fix 3: Tighten document_uploads SELECT to authenticated
DROP POLICY "Admins can view all documents" ON public.document_uploads;
CREATE POLICY "Admins can view all documents" ON public.document_uploads
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix 4: Tighten document_uploads DELETE to authenticated
DROP POLICY "Admins can delete documents" ON public.document_uploads;
CREATE POLICY "Admins can delete documents" ON public.document_uploads
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix 5: Add document_uploads UPDATE policy for admins
CREATE POLICY "Admins can update documents" ON public.document_uploads
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
