create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

create table if not exists public.inventory_cache (
  vin text primary key,
  dealer_id text not null default '47651',
  stock_number text,
  year integer,
  make text,
  model text,
  price numeric,
  mileage numeric,
  fuel text,
  transmission text,
  engine text,
  drivetrain text,
  color_exterior text,
  color_interior text,
  description text,
  badge text,
  features jsonb not null default '[]'::jsonb,
  photos jsonb not null default '[]'::jsonb,
  image text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.inventory_cache enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'inventory_cache'
      and policyname = 'Public can read inventory cache'
  ) then
    create policy "Public can read inventory cache"
      on public.inventory_cache
      for select
      using (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'inventory_cache'
      and policyname = 'Service role can manage inventory cache'
  ) then
    create policy "Service role can manage inventory cache"
      on public.inventory_cache
      for all
      using (auth.role() = 'service_role')
      with check (auth.role() = 'service_role');
  end if;
end
$$;

create index if not exists idx_inventory_cache_price on public.inventory_cache(price);
create index if not exists idx_inventory_cache_updated_at on public.inventory_cache(updated_at desc);

select cron.schedule(
  'waynereaves-inventory-sync',
  '*/30 * * * *',
  $$
  select net.http_post(
    url := 'https://yctkxtnzjcsqanmbmciq.supabase.co/functions/v1/waynereaves-inventory',
    body := '{"action":"sync"}'::jsonb,
    headers := '{"Content-Type":"application/json"}'::jsonb
  );
  $$
);
