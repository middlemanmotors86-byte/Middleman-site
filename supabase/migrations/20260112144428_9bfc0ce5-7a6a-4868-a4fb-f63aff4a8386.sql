-- Create rate limit tracking table
CREATE TABLE public.rate_limit_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient lookups
CREATE INDEX idx_rate_limit_identifier_action_time 
ON public.rate_limit_tracking (identifier, action, created_at DESC);

-- Enable RLS
ALTER TABLE public.rate_limit_tracking ENABLE ROW LEVEL SECURITY;

-- Only service role can manage rate limit records (edge functions use service role)
-- No public access policies - only edge function with service role can read/write

-- Auto-cleanup old records (older than 1 hour)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.rate_limit_tracking 
  WHERE created_at < now() - interval '1 hour';
  RETURN NEW;
END;
$$;

-- Trigger to cleanup on each insert
CREATE TRIGGER cleanup_rate_limits_trigger
AFTER INSERT ON public.rate_limit_tracking
FOR EACH STATEMENT
EXECUTE FUNCTION public.cleanup_old_rate_limits();