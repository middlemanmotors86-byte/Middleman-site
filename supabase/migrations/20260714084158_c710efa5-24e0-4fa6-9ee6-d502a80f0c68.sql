
-- Extend leads with a follow-up timestamp
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS follow_up_at TIMESTAMPTZ;

-- ============ crm_activities ============
CREATE TABLE public.crm_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  contact_email TEXT,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('call','email','sms','meeting','note','system')),
  direction TEXT CHECK (direction IN ('inbound','outbound')),
  subject TEXT,
  body TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_crm_activities_lead ON public.crm_activities(lead_id);
CREATE INDEX idx_crm_activities_email ON public.crm_activities(contact_email);
CREATE INDEX idx_crm_activities_occurred ON public.crm_activities(occurred_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_activities TO authenticated;
GRANT ALL ON public.crm_activities TO service_role;
ALTER TABLE public.crm_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read activities" ON public.crm_activities FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'finance'));
CREATE POLICY "Staff write activities" ON public.crm_activities FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'finance'));
CREATE POLICY "Staff update activities" ON public.crm_activities FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'finance'));
CREATE POLICY "Admin delete activities" ON public.crm_activities FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_crm_activities_updated BEFORE UPDATE ON public.crm_activities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ crm_tasks ============
CREATE TABLE public.crm_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  contact_email TEXT,
  title TEXT NOT NULL,
  description TEXT,
  due_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','done','cancelled')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_crm_tasks_due ON public.crm_tasks(due_at) WHERE status IN ('open','in_progress');
CREATE INDEX idx_crm_tasks_assigned ON public.crm_tasks(assigned_to);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_tasks TO authenticated;
GRANT ALL ON public.crm_tasks TO service_role;
ALTER TABLE public.crm_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read tasks" ON public.crm_tasks FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'finance'));
CREATE POLICY "Staff write tasks" ON public.crm_tasks FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'finance'));
CREATE POLICY "Staff update tasks" ON public.crm_tasks FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'finance'));
CREATE POLICY "Admin delete tasks" ON public.crm_tasks FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_crm_tasks_updated BEFORE UPDATE ON public.crm_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ marketing_campaigns ============
CREATE TABLE public.marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('email','sms')),
  subject TEXT,
  body TEXT NOT NULL,
  audience_filter JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','scheduled','sending','sent','paused','cancelled')),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  stats JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketing_campaigns TO authenticated;
GRANT ALL ON public.marketing_campaigns TO service_role;
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read campaigns" ON public.marketing_campaigns FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'finance'));
CREATE POLICY "Admin manage campaigns" ON public.marketing_campaigns FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_marketing_campaigns_updated BEFORE UPDATE ON public.marketing_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ marketing_recipients ============
CREATE TABLE public.marketing_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.marketing_campaigns(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  phone TEXT,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','sent','delivered','opened','clicked','bounced','failed','unsubscribed')),
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, email)
);
CREATE INDEX idx_marketing_recipients_campaign ON public.marketing_recipients(campaign_id);
CREATE INDEX idx_marketing_recipients_email ON public.marketing_recipients(email);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketing_recipients TO authenticated;
GRANT ALL ON public.marketing_recipients TO service_role;
ALTER TABLE public.marketing_recipients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read recipients" ON public.marketing_recipients FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'finance'));
CREATE POLICY "Admin manage recipients" ON public.marketing_recipients FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_marketing_recipients_updated BEFORE UPDATE ON public.marketing_recipients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ Auto follow-up task on new lead ============
CREATE OR REPLACE FUNCTION public.create_initial_followup_task()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.crm_tasks (lead_id, contact_email, title, description, due_at, priority)
  VALUES (
    NEW.id,
    NEW.email,
    'Initial follow-up: ' || COALESCE(NEW.name, NEW.email, 'new lead'),
    'Reach out to new lead from ' || COALESCE(NEW.source,'website'),
    now() + interval '1 day',
    CASE WHEN 'rideshare' = ANY(COALESCE(NEW.program_tags,'{}'::text[])) THEN 'high' ELSE 'normal' END
  );

  INSERT INTO public.crm_activities (lead_id, contact_email, activity_type, subject, body)
  VALUES (NEW.id, NEW.email, 'system', 'Lead captured', 'Source: ' || COALESCE(NEW.source,'unknown'));

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_leads_initial_followup
  AFTER INSERT ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.create_initial_followup_task();
