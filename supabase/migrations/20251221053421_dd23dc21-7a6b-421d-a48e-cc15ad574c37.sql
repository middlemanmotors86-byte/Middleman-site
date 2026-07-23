-- Create contact_submissions table for secure form storage
CREATE TABLE public.contact_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_read BOOLEAN NOT NULL DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to INSERT (public contact form)
CREATE POLICY "Anyone can submit contact form"
ON public.contact_submissions
FOR INSERT
WITH CHECK (true);

-- Policy: No public SELECT/UPDATE/DELETE (admin only via service role)
-- This ensures customer data is protected and only accessible server-side

-- Add index for faster queries on created_at
CREATE INDEX idx_contact_submissions_created_at ON public.contact_submissions(created_at DESC);