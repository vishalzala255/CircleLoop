-- ==========================================
-- CIRCLELOOP MASTER DATABASE SETUP (SUPABASE)
-- Run this ONCE to fix all RLS and Schema issues.
-- ==========================================

-- 1. SECURITY DEFINER FUNCTION (Breaks Infinite Recursion)
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$;

-- 2. UPDATE PICKUP_REQUESTS Table
DO $$ 
BEGIN 
    -- Add human-readable Request ID
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pickup_requests' AND column_name='request_id') THEN
        ALTER TABLE pickup_requests ADD COLUMN request_id TEXT UNIQUE;
    END IF;

    -- Add Address
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pickup_requests' AND column_name='pickup_address') THEN
        ALTER TABLE pickup_requests ADD COLUMN pickup_address TEXT;
    END IF;

    -- Add Date
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pickup_requests' AND column_name='pickup_date') THEN
        ALTER TABLE pickup_requests ADD COLUMN pickup_date DATE;
    END IF;

    -- Add Time
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pickup_requests' AND column_name='pickup_time') THEN
        ALTER TABLE pickup_requests ADD COLUMN pickup_time TEXT;
    END IF;

    -- Rename waste_type to ewaste_type to match legacy exactly
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pickup_requests' AND column_name='waste_type') THEN
        ALTER TABLE pickup_requests RENAME COLUMN waste_type TO ewaste_type;
    END IF;

    -- Rename quantity to qty to match legacy exactly
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pickup_requests' AND column_name='quantity') THEN
        ALTER TABLE pickup_requests RENAME COLUMN quantity TO qty;
    END IF;

END $$;

-- 3. CREATE INVENTORY TABLE (Processed items for sale)
CREATE TABLE IF NOT EXISTS public.inventory (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  item_name TEXT NOT NULL,
  qty INTEGER DEFAULT 0,
  price_per_unit DECIMAL(10,2) DEFAULT 0.00,
  source_request_id BIGINT REFERENCES public.pickup_requests(id) ON DELETE SET NULL,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. CREATE ORDERS TABLE (Partner sales)
CREATE TABLE IF NOT EXISTS public.company_orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT UNIQUE NOT NULL, -- Human readable ID like ORD-1001
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  company_id uuid REFERENCES public.profiles(id) NOT NULL,
  inventory_id uuid REFERENCES public.inventory(id) NOT NULL,
  qty INTEGER NOT NULL,
  price_per_unit DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'Requested' -- Requested, Approved, Dispatched, Received, Cancelled
);

-- 5. CREATE STATUS HISTORY TABLE (Audit Log)
CREATE TABLE IF NOT EXISTS public.request_status_history (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  pickup_request_id BIGINT REFERENCES public.pickup_requests(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('Pending', 'Accepted', 'Collected', 'Recycled', 'Rejected')),
  updated_by TEXT NOT NULL, -- admin / customer / company
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. ENABLE RLS
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_status_history ENABLE ROW LEVEL SECURITY;

-- 7. CLEANUP OLD POLICIES
DROP POLICY IF EXISTS "Admin manage inventory" ON inventory;
DROP POLICY IF EXISTS "View inventory" ON inventory;
DROP POLICY IF EXISTS "Admin manage orders" ON company_orders;
DROP POLICY IF EXISTS "Partner orders" ON company_orders;
DROP POLICY IF EXISTS "Partner buy" ON company_orders;
DROP POLICY IF EXISTS "History access" ON request_status_history;
DROP POLICY IF EXISTS "Admin history" ON request_status_history;

-- 8. RE-APPLY SECURE POLICIES
CREATE POLICY "Admin manage inventory" ON inventory FOR ALL USING (is_admin());
CREATE POLICY "View inventory" ON inventory FOR SELECT USING (true);
CREATE POLICY "Admin manage orders" ON company_orders FOR ALL USING (is_admin());
CREATE POLICY "Partner orders" ON company_orders FOR SELECT USING (auth.uid() = company_id);
CREATE POLICY "Partner buy" ON company_orders FOR INSERT WITH CHECK (auth.uid() = company_id);

-- STATUS HISTORY: Admins can do anything, Users can see their own
CREATE POLICY "Admin manage history" ON request_status_history FOR ALL USING (is_admin());
CREATE POLICY "User view history" ON request_status_history FOR SELECT USING (
  EXISTS (SELECT 1 FROM pickup_requests WHERE id = pickup_request_id AND user_id = auth.uid())
);

GRANT EXECUTE ON FUNCTION is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin TO service_role;
