-- Harden sales-jackets bucket: require admin role on INSERT via WITH CHECK
DROP POLICY IF EXISTS "Admins can upload sales jackets" ON storage.objects;
CREATE POLICY "Admins can upload sales jackets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'sales-jackets' AND public.has_role(auth.uid(), 'admin'::public.app_role));