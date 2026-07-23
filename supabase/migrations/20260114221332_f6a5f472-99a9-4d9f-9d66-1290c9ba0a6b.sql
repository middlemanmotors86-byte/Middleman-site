-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents', 
  'documents', 
  false,
  20971520, -- 20MB limit
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/webp',
    'text/plain',
    'text/csv'
  ]
);

-- Create table to track document uploads
CREATE TABLE public.document_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  contact_submission_id UUID REFERENCES public.contact_submissions(id) ON DELETE CASCADE,
  description TEXT
);

-- Enable RLS on document_uploads table
ALTER TABLE public.document_uploads ENABLE ROW LEVEL SECURITY;

-- Admins can view all documents
CREATE POLICY "Admins can view all documents"
ON public.document_uploads
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert documents
CREATE POLICY "Admins can insert documents"
ON public.document_uploads
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR contact_submission_id IS NOT NULL);

-- Admins can delete documents
CREATE POLICY "Admins can delete documents"
ON public.document_uploads
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Storage policies for documents bucket

-- Admins can read all files
CREATE POLICY "Admins can read all documents"
ON storage.objects
FOR SELECT
USING (bucket_id = 'documents' AND has_role(auth.uid(), 'admin'::app_role));

-- Public can read contact-attachments folder (for edge function access)
CREATE POLICY "Service can read contact attachments"
ON storage.objects
FOR SELECT
USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = 'contact-attachments');

-- Admins can upload to admin-documents folder
CREATE POLICY "Admins can upload to admin folder"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] = 'admin-documents' AND has_role(auth.uid(), 'admin'::app_role));

-- Public can upload to contact-attachments folder (for contact form)
CREATE POLICY "Public can upload contact attachments"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] = 'contact-attachments');

-- Admins can delete any files
CREATE POLICY "Admins can delete documents"
ON storage.objects
FOR DELETE
USING (bucket_id = 'documents' AND has_role(auth.uid(), 'admin'::app_role));