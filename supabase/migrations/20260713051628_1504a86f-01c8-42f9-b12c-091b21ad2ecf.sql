-- credit-app-requests: admin + finance read/write
CREATE POLICY "Staff can read credit-app-requests"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'credit-app-requests'
         AND (public.has_role(auth.uid(), 'admin'::public.app_role)
              OR public.has_role(auth.uid(), 'finance'::public.app_role)));

CREATE POLICY "Staff can upload credit-app-requests"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'credit-app-requests'
             AND (public.has_role(auth.uid(), 'admin'::public.app_role)
                  OR public.has_role(auth.uid(), 'finance'::public.app_role)));

CREATE POLICY "Staff can update credit-app-requests"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'credit-app-requests'
         AND (public.has_role(auth.uid(), 'admin'::public.app_role)
              OR public.has_role(auth.uid(), 'finance'::public.app_role)));

CREATE POLICY "Admins can delete credit-app-requests"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'credit-app-requests'
         AND public.has_role(auth.uid(), 'admin'::public.app_role));

-- credit-app-approvals: admin-only
CREATE POLICY "Admins can read credit-app-approvals"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'credit-app-approvals'
         AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can upload credit-app-approvals"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'credit-app-approvals'
             AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update credit-app-approvals"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'credit-app-approvals'
         AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete credit-app-approvals"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'credit-app-approvals'
         AND public.has_role(auth.uid(), 'admin'::public.app_role));