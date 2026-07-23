CREATE TABLE public.sales_jacket_sends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL,
  sent_to_email TEXT NOT NULL,
  sent_to_name TEXT,
  sent_by UUID,
  status TEXT NOT NULL DEFAULT 'sent',
  error_message TEXT,
  provider_message_id TEXT,
  file_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales_jacket_sends TO authenticated;
GRANT ALL ON public.sales_jacket_sends TO service_role;

ALTER TABLE public.sales_jacket_sends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view sales jacket sends"
ON public.sales_jacket_sends FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert sales jacket sends"
ON public.sales_jacket_sends FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete sales jacket sends"
ON public.sales_jacket_sends FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_sales_jacket_sends_deal ON public.sales_jacket_sends(deal_id, created_at DESC);