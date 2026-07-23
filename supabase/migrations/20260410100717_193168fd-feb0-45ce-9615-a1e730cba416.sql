
-- Fix 1: Remove public read access to contact attachments (edge function uses service role, so this public policy is unnecessary)
DROP POLICY IF EXISTS "Service can read contact attachments" ON storage.objects;

-- Fix 2: Remove public upload access to contact attachments (edge function uses service role for uploads)
DROP POLICY IF EXISTS "Public can upload contact attachments" ON storage.objects;
