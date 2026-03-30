-- ==========================================
-- CIRCLELOOP EMERGENCY FIX
-- Run this SQL in your Supabase SQL Editor to fix the order_id error
-- ==========================================

-- STEP 1: Ensure company_orders table exists with all required columns
DO $$ 
BEGIN 
    -- Create the table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='company_orders') THEN
        CREATE TABLE public.company_orders (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            order_id TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            company_id uuid REFERENCES public.profiles(id) NOT NULL,
            inventory_id uuid REFERENCES public.inventory(id) NOT NULL,
            qty INTEGER NOT NULL,
            price_per_unit DECIMAL(10,2) NOT NULL,
            total_price DECIMAL(10,2) NOT NULL,
            status TEXT DEFAULT 'Requested'
        );
    END IF;

    -- Add order_id column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='company_orders' AND column_name='order_id') THEN
        -- Add column with temporary default
        ALTER TABLE company_orders ADD COLUMN order_id TEXT DEFAULT 'ORD-' || FLOOR(RANDOM() * 1000000)::TEXT;
        
        -- Update existing rows with unique order IDs
        UPDATE company_orders 
        SET order_id = 'ORD-' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 6, '0')
        WHERE order_id IS NULL OR order_id LIKE 'ORD-%';
        
        -- Make it NOT NULL and UNIQUE
        ALTER TABLE company_orders ALTER COLUMN order_id SET NOT NULL;
        ALTER TABLE company_orders ADD CONSTRAINT company_orders_order_id_key UNIQUE (order_id);
        
        -- Remove default for future inserts
        ALTER TABLE company_orders ALTER COLUMN order_id DROP DEFAULT;
    END IF;
    
    -- Ensure created_at exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='company_orders' AND column_name='created_at') THEN
        ALTER TABLE company_orders ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
    END IF;
    
    -- Ensure company_id exists
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

-- STEP 2: Enable RLS if not already enabled
ALTER TABLE public.company_orders ENABLE ROW LEVEL SECURITY;

-- STEP 3: Drop old policies
DROP POLICY IF EXISTS "Admin manage orders" ON company_orders;
DROP POLICY IF EXISTS "Partner orders" ON company_orders;
DROP POLICY IF EXISTS "Partner buy" ON company_orders;

-- STEP 4: Create the is_admin function if it doesn't exist
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

-- STEP 5: Re-apply policies
CREATE POLICY "Admin manage orders" ON company_orders FOR ALL USING (is_admin());
CREATE POLICY "Partner orders" ON company_orders FOR SELECT USING (auth.uid() = company_id);
CREATE POLICY "Partner buy" ON company_orders FOR INSERT WITH CHECK (auth.uid() = company_id);

-- STEP 6: Grant necessary permissions
GRANT EXECUTE ON FUNCTION is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin TO service_role;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ CircleLoop schema fix completed successfully!';
    RAISE NOTICE '✅ company_orders table is now properly configured';
    RAISE NOTICE '✅ All required columns including order_id are present';
    RAISE NOTICE '✅ RLS policies are active';
END $$;
