-- ==========================================
-- FIX COMPANY_ORDERS TABLE SCHEMA
-- Run this to ensure order_id column exists
-- ==========================================

-- First, ensure the company_orders table has all required columns
DO $$ 
BEGIN 
    -- Check if order_id column exists, if not add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='company_orders' AND column_name='order_id') THEN
        ALTER TABLE company_orders ADD COLUMN order_id TEXT UNIQUE NOT NULL DEFAULT 'ORD-' || FLOOR(RANDOM() * 1000000)::TEXT;
        -- After adding, remove the default for future inserts
        ALTER TABLE company_orders ALTER COLUMN order_id DROP DEFAULT;
    END IF;
    
    -- Ensure created_at exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='company_orders' AND column_name='created_at') THEN
        ALTER TABLE company_orders ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
    END IF;
    
    -- Ensure company_id exists and references profiles
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='company_orders' AND column_name='company_id') THEN
        ALTER TABLE company_orders ADD COLUMN company_id UUID REFERENCES public.profiles(id) NOT NULL;
    END IF;
    
    -- Ensure inventory_id exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='company_orders' AND column_name='inventory_id') THEN
        ALTER TABLE company_orders ADD COLUMN inventory_id UUID REFERENCES public.inventory(id) NOT NULL;
    END IF;
    
    -- Ensure qty exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='company_orders' AND column_name='qty') THEN
        ALTER TABLE company_orders ADD COLUMN qty INTEGER NOT NULL DEFAULT 1;
    END IF;
    
    -- Ensure price_per_unit exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='company_orders' AND column_name='price_per_unit') THEN
        ALTER TABLE company_orders ADD COLUMN price_per_unit DECIMAL(10,2) NOT NULL DEFAULT 0.00;
    END IF;
    
    -- Ensure total_price exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='company_orders' AND column_name='total_price') THEN
        ALTER TABLE company_orders ADD COLUMN total_price DECIMAL(10,2) NOT NULL DEFAULT 0.00;
    END IF;
    
    -- Ensure status exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='company_orders' AND column_name='status') THEN
        ALTER TABLE company_orders ADD COLUMN status TEXT DEFAULT 'Requested';
    END IF;
    
END $$;

-- Refresh RLS policies
ALTER TABLE public.company_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin manage orders" ON company_orders;
DROP POLICY IF EXISTS "Partner orders" ON company_orders;
DROP POLICY IF EXISTS "Partner buy" ON company_orders;

CREATE POLICY "Admin manage orders" ON company_orders FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Partner orders" ON company_orders FOR SELECT USING (auth.uid() = company_id);

CREATE POLICY "Partner buy" ON company_orders FOR INSERT WITH CHECK (auth.uid() = company_id);
