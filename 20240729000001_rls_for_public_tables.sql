-- Enable Row Level Security for the vehicles table
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all vehicles
CREATE POLICY "Public read access for vehicles"
ON public.vehicles
FOR SELECT
TO anon, authenticated
USING (true);

-- Admins can do anything
CREATE POLICY "Admin full access for vehicles" ON public.vehicles FOR ALL TO service_role USING (true);