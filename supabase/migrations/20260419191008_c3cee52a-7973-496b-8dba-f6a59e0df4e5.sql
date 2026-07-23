CREATE TABLE public.questionnaire_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Vehicle wants
  desired_year TEXT,
  desired_make TEXT,
  desired_model TEXT,
  body_style TEXT,
  flexible_on_model BOOLEAN NOT NULL DEFAULT false,

  -- Budget
  budget_min NUMERIC,
  budget_max NUMERIC,

  -- Buyer profile
  financing_preference TEXT, -- 'cash' | 'finance' | 'trade_in' | 'bhph'
  timeline TEXT,             -- 'this_week' | 'this_month' | 'browsing'
  notes TEXT,

  -- Contact
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,

  -- Match results
  matched_stock_numbers TEXT[] NOT NULL DEFAULT '{}',
  inventory_source TEXT NOT NULL DEFAULT 'automanager',

  -- Pipeline link
  linked_deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.questionnaire_submissions ENABLE ROW LEVEL SECURITY;

-- Admin-only access
CREATE POLICY "Admins can view questionnaire submissions"
  ON public.questionnaire_submissions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert questionnaire submissions"
  ON public.questionnaire_submissions FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update questionnaire submissions"
  ON public.questionnaire_submissions FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete questionnaire submissions"
  ON public.questionnaire_submissions FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_questionnaire_submissions_updated_at
BEFORE UPDATE ON public.questionnaire_submissions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Helpful indexes
CREATE INDEX idx_questionnaire_submissions_created_at ON public.questionnaire_submissions(created_at DESC);
CREATE INDEX idx_questionnaire_submissions_linked_deal ON public.questionnaire_submissions(linked_deal_id);