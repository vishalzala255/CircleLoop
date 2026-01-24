-- RESTORE LEGACY DATABASE STRUCTURE (Next.js + Supabase)

-- 1. Create INVENTORY Table (Processed Items ready for sale)
create table if not exists public.inventory (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  item_name text not null,
  qty integer default 1,
  price numeric default 0, -- Price per unit
  source_request_id uuid references public.pickup_requests(id) on delete set null,
  status text default 'Available' -- Available, Sold
);

-- 2. Create ORDERS Table (Sales to Partners)
create table if not exists public.company_orders (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  company_id uuid references public.profiles(id) not null,
  inventory_id uuid references public.inventory(id) not null,
  qty integer default 1,
  total_price numeric not null,
  status text default 'Completed'
);

-- 3. Enable RLS
alter table public.inventory enable row level security;
alter table public.company_orders enable row level security;

-- 4. Policies (Using the safe is_admin() function previously created)
-- Admin can do everything
create policy "Admins full access inventory"
on public.inventory for all
using ( is_admin() );

create policy "Admins full access orders"
on public.company_orders for all
using ( is_admin() );

-- Partners (Companies) can VIEW inventory
create policy "Everyone view available inventory"
on public.inventory for select
using ( status = 'Available' );

-- Partners view own orders
create policy "Companies view own orders"
on public.company_orders for select
using ( auth.uid() = company_id );

-- Partners can buy (create orders)
create policy "Companies create orders"
on public.company_orders for insert
with check ( auth.uid() = company_id );
