-- ==========================================
-- ADD DESCRIPTION FIELDS TO TABLES
-- Run this to add description fields where needed
-- ==========================================

-- 1. Add description to pickup_requests if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='pickup_requests' AND column_name='description') THEN
        ALTER TABLE pickup_requests ADD COLUMN description TEXT;
    END IF;
END $$;

-- 2. Add description to inventory table for item details
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='inventory' AND column_name='description') THEN
        ALTER TABLE inventory ADD COLUMN description TEXT;
    END IF;
END $$;

-- This allows storing additional details about items in both pickup requests and inventory
