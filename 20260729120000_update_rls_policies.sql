-- =========================================================
-- RLS Policy Update
-- This migration updates and standardizes RLS policies across multiple tables
-- based on the application's access control requirements.
-- =========================================================

-- --------------------------------------
-- contact_submissions
-- --------------------------------------
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can submit contact forms" ON public.contact_submissions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Only admins can view contact submissions" ON public.contact_submissions FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Only admins can update contact submissions" ON public.contact_submissions FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Only admins can delete contact submissions" ON public.contact_submissions FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- --------------------------------------
-- credit_applications
-- --------------------------------------
-- Drop old, less specific policies
DROP POLICY IF EXISTS "Allow public insert for credit_applications" ON public.credit_applications;
DROP POLICY IF EXISTS "Allow admin full access for credit_applications" ON public.credit_applications;

-- Create new, more granular policies
CREATE POLICY "Public can submit credit applications" ON public.credit_applications FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admin or finance can view credit apps" ON public.credit_applications FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role));
CREATE POLICY "Admin or finance can manually insert credit apps" ON public.credit_applications FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role));
CREATE POLICY "Admin or finance can update credit apps" ON public.credit_applications FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role));
CREATE POLICY "Only admins can delete credit apps" ON public.credit_applications FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- --------------------------------------
-- crm_activities
-- --------------------------------------
ALTER TABLE public.crm_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read activities" ON public.crm_activities FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role));
CREATE POLICY "Staff write activities" ON public.crm_activities FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role));
CREATE POLICY "Staff update activities" ON public.crm_activities FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role));
CREATE POLICY "Admin delete activities" ON public.crm_activities FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- --------------------------------------
-- crm_tasks
-- --------------------------------------
ALTER TABLE public.crm_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read tasks" ON public.crm_tasks FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role));
CREATE POLICY "Staff write tasks" ON public.crm_tasks FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role));
CREATE POLICY "Staff update tasks" ON public.crm_tasks FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role));
CREATE POLICY "Admin delete tasks" ON public.crm_tasks FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- --------------------------------------
-- deal_documents
-- --------------------------------------
ALTER TABLE public.deal_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view deal documents" ON public.deal_documents FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert deal documents" ON public.deal_documents FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete deal documents" ON public.deal_documents FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- --------------------------------------
-- deals
-- --------------------------------------
-- Drop old policy and add more granular ones
DROP POLICY IF EXISTS "Allow admin full access for deals" ON public.deals;
CREATE POLICY "Admins can view deals" ON public.deals FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert deals" ON public.deals FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update deals" ON public.deals FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete deals" ON public.deals FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- --------------------------------------
-- document_uploads
-- --------------------------------------
ALTER TABLE public.document_uploads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view all documents" ON public.document_uploads FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert documents" ON public.document_uploads FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update documents" ON public.document_uploads FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete documents" ON public.document_uploads FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- --------------------------------------
-- email_captures
-- --------------------------------------
-- Update INSERT policy to be more robust
DROP POLICY IF EXISTS "Anyone submits email capture" ON public.email_captures;
CREATE POLICY "Anyone can submit email capture" ON public.email_captures FOR INSERT TO anon, authenticated WITH CHECK (((email IS NOT NULL) AND (length(email) >= 3) AND (length(email) <= 320) AND (email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$'::text)));

-- --------------------------------------
-- funnel_events
-- --------------------------------------
-- Update INSERT policy to be more robust
DROP POLICY IF EXISTS "Anyone can insert funnel events" ON public.funnel_events;
CREATE POLICY "Anyone can insert funnel events" ON public.funnel_events FOR INSERT TO anon, authenticated WITH CHECK (((step IS NOT NULL) AND (length(step) >= 1) AND (length(step) <= 128) AND ((email IS NULL) OR (length(email) <= 320))));

-- --------------------------------------
-- inventory_queries
-- --------------------------------------
-- Update INSERT policy to be more robust
DROP POLICY IF EXISTS "Anyone can insert inventory queries" ON public.inventory_queries;
CREATE POLICY "Anyone can insert inventory queries" ON public.inventory_queries FOR INSERT TO anon, authenticated WITH CHECK (((query_type IS NOT NULL) AND (length(query_type) >= 1) AND (length(query_type) <= 64) AND ((search_term IS NULL) OR (length(search_term) <= 500))));

-- --------------------------------------
-- leads
-- --------------------------------------
-- Drop old policies and add more granular ones
DROP POLICY IF EXISTS "Allow public insert for leads" ON public.leads;
DROP POLICY IF EXISTS "Allow admin full access for leads" ON public.leads;
CREATE POLICY "Admins can view leads" ON public.leads FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert leads" ON public.leads FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update leads" ON public.leads FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete leads" ON public.leads FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Deny public access to leads" ON public.leads FOR ALL TO anon USING (false) WITH CHECK (false);

-- --------------------------------------
-- login_events
-- --------------------------------------
-- Update INSERT policy to be more robust
DROP POLICY IF EXISTS "Anyone can insert login events" ON public.login_events;
CREATE POLICY "Anyone can insert login events" ON public.login_events FOR INSERT TO anon, authenticated WITH CHECK (((success IS NOT NULL) AND ((email IS NULL) OR (length(email) <= 320)) AND ((provider IS NULL) OR (length(provider) <= 64))));

-- --------------------------------------
-- marketing_campaigns
-- --------------------------------------
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read campaigns" ON public.marketing_campaigns FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role));
CREATE POLICY "Admin manage campaigns" ON public.marketing_campaigns FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- --------------------------------------
-- marketing_recipients
-- --------------------------------------
ALTER TABLE public.marketing_recipients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read recipients" ON public.marketing_recipients FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role));
CREATE POLICY "Admin manage recipients" ON public.marketing_recipients FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- --------------------------------------
-- page_views
-- --------------------------------------
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can log a page view" ON public.page_views;
CREATE POLICY "Admins can view page views" ON public.page_views FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Anyone can log a page view" ON public.page_views FOR INSERT TO anon, authenticated WITH CHECK (((path IS NOT NULL) AND (length(path) >= 1) AND (length(path) <= 2048) AND ((email IS NULL) OR (length(email) <= 320))));

-- --------------------------------------
-- portfolio_buyers
-- --------------------------------------
ALTER TABLE public.portfolio_buyers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view portfolio buyers" ON public.portfolio_buyers FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert portfolio buyers" ON public.portfolio_buyers FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update portfolio buyers" ON public.portfolio_buyers FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete portfolio buyers" ON public.portfolio_buyers FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Deny public access to portfolio buyers" ON public.portfolio_buyers FOR ALL TO anon USING (false) WITH CHECK (false);

-- --------------------------------------
-- questionnaire_submissions
-- --------------------------------------
ALTER TABLE public.questionnaire_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view questionnaire submissions" ON public.questionnaire_submissions FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert questionnaire submissions" ON public.questionnaire_submissions FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update questionnaire submissions" ON public.questionnaire_submissions FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete questionnaire submissions" ON public.questionnaire_submissions FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- --------------------------------------
-- rate_limit_tracking
-- --------------------------------------
ALTER TABLE public.rate_limit_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Deny all public access to rate limit tracking" ON public.rate_limit_tracking FOR ALL TO public USING (false) WITH CHECK (false);

-- --------------------------------------
-- sales_jacket_sends
-- --------------------------------------
ALTER TABLE public.sales_jacket_sends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view sales jacket sends" ON public.sales_jacket_sends FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can insert sales jacket sends" ON public.sales_jacket_sends FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete sales jacket sends" ON public.sales_jacket_sends FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- --------------------------------------
-- user_roles
-- --------------------------------------
-- Drop old policies and add more granular ones
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- --------------------------------------
-- storage.objects
-- --------------------------------------
-- Drop old policies to replace them
DROP POLICY IF EXISTS "Admins can read sales jackets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload sales jackets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update sales jackets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete sales jackets" ON storage.objects;

-- Recreate with explicit bucket_id checks
CREATE POLICY "Admins can read sales jackets" ON storage.objects FOR SELECT TO authenticated USING ((bucket_id = 'sales-jackets') AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can upload sales jackets" ON storage.objects FOR INSERT TO authenticated WITH CHECK ((bucket_id = 'sales-jackets') AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update sales jackets" ON storage.objects FOR UPDATE TO authenticated USING ((bucket_id = 'sales-jackets') AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete sales jackets" ON storage.objects FOR DELETE TO authenticated USING ((bucket_id = 'sales-jackets') AND has_role(auth.uid(), 'admin'::app_role));

-- Add new storage policies
CREATE POLICY "Admins can read credit-app-approvals" ON storage.objects FOR SELECT TO authenticated USING ((bucket_id = 'credit-app-approvals') AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can upload credit-app-approvals" ON storage.objects FOR INSERT TO authenticated WITH CHECK ((bucket_id = 'credit-app-approvals') AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update credit-app-approvals" ON storage.objects FOR UPDATE TO authenticated USING ((bucket_id = 'credit-app-approvals') AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete credit-app-approvals" ON storage.objects FOR DELETE TO authenticated USING ((bucket_id = 'credit-app-approvals') AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can read credit-app-requests" ON storage.objects FOR SELECT TO authenticated USING ((bucket_id = 'credit-app-requests') AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role)));
CREATE POLICY "Staff can upload credit-app-requests" ON storage.objects FOR INSERT TO authenticated WITH CHECK ((bucket_id = 'credit-app-requests') AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role)));
CREATE POLICY "Staff can update credit-app-requests" ON storage.objects FOR UPDATE TO authenticated USING ((bucket_id = 'credit-app-requests') AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'finance'::app_role)));
CREATE POLICY "Admins can delete credit-app-requests" ON storage.objects FOR DELETE TO authenticated USING ((bucket_id = 'credit-app-requests') AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can read all documents" ON storage.objects FOR SELECT TO public USING ((bucket_id = 'documents') AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can upload to admin folder" ON storage.objects FOR INSERT TO public WITH CHECK ((bucket_id = 'documents') AND ((storage.foldername(name))[1] = 'admin-documents') AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete documents" ON storage.objects FOR DELETE TO public USING ((bucket_id = 'documents') AND has_role(auth.uid(), 'admin'::app_role));