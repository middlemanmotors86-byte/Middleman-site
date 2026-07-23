
-- Deal stage enum
CREATE TYPE public.deal_stage AS ENUM ('inquiry', 'approved', 'docs_signing', 'sold');

-- Deals table with full customer profile
CREATE TABLE public.deals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  stage deal_stage NOT NULL DEFAULT 'inquiry',
  
  -- Vehicle info
  vehicle_vin TEXT,
  vehicle_year TEXT,
  vehicle_make TEXT,
  vehicle_model TEXT,
  vehicle_stock_number TEXT,
  sale_price NUMERIC(10,2),
  
  -- Customer basics
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  customer_city TEXT,
  customer_state TEXT DEFAULT 'GA',
  customer_zip TEXT,
  customer_dl_number TEXT,
  
  -- Financials
  customer_employer TEXT,
  customer_income NUMERIC(10,2),
  customer_credit_score INTEGER,
  
  -- Insurance
  insurance_provider TEXT,
  insurance_policy_number TEXT,
  
  -- Trade-in
  trade_in_year TEXT,
  trade_in_make TEXT,
  trade_in_model TEXT,
  trade_in_vin TEXT,
  trade_in_value NUMERIC(10,2),
  
  -- Co-buyer
  co_buyer_name TEXT,
  co_buyer_phone TEXT,
  co_buyer_email TEXT,
  co_buyer_dl_number TEXT,
  
  -- Notes
  notes TEXT
);

-- Junction table linking deals to existing document uploads
CREATE TABLE public.deal_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  document_upload_id UUID NOT NULL REFERENCES public.document_uploads(id) ON DELETE CASCADE,
  document_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(deal_id, document_upload_id)
);

-- Enable RLS
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies - admin only
CREATE POLICY "Admins can view deals" ON public.deals FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert deals" ON public.deals FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update deals" ON public.deals FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete deals" ON public.deals FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view deal documents" ON public.deal_documents FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert deal documents" ON public.deal_documents FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete deal documents" ON public.deal_documents FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
