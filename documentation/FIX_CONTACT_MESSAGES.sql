-- ==========================================
-- FIX CONTACT_MESSAGES TABLE SCHEMA
-- Run this SQL in your Supabase SQL Editor
-- ==========================================

-- Add missing columns to contact_messages table
DO $$ 
BEGIN 
    -- Add read_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='contact_messages' AND column_name='read_at') THEN
        ALTER TABLE contact_messages ADD COLUMN read_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Added read_at column to contact_messages';
    END IF;
    
    -- Add read_by column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='contact_messages' AND column_name='read_by') THEN
        ALTER TABLE contact_messages ADD COLUMN read_by UUID REFERENCES profiles(id);
        RAISE NOTICE 'Added read_by column to contact_messages';
    END IF;
    
    -- Ensure message_status column exists with correct type
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='contact_messages' AND column_name='message_status') THEN
        -- If message_status doesn't exist, add it
        ALTER TABLE contact_messages ADD COLUMN message_status TEXT DEFAULT 'unread';
        RAISE NOTICE 'Added message_status column to contact_messages';
    ELSE
        -- If it exists but is named 'status', we might need to rename it
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='contact_messages' AND column_name='status') THEN
            ALTER TABLE contact_messages RENAME COLUMN status TO message_status;
            RAISE NOTICE 'Renamed status to message_status';
        END IF;
    END IF;

END $$;

-- Ensure RLS is enabled
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Anyone can submit contact form" ON contact_messages;
DROP POLICY IF EXISTS "Admin can view all messages" ON contact_messages;
DROP POLICY IF EXISTS "Admin can update messages" ON contact_messages;
DROP POLICY IF EXISTS "Admin can delete messages" ON contact_messages;

-- Create is_admin function if it doesn't exist
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

-- Re-apply policies
CREATE POLICY "Anyone can submit contact form" 
  ON contact_messages FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admin can view all messages" 
  ON contact_messages FOR SELECT 
  USING (is_admin());

CREATE POLICY "Admin can update messages" 
  ON contact_messages FOR UPDATE 
  USING (is_admin());

CREATE POLICY "Admin can delete messages" 
  ON contact_messages FOR DELETE 
  USING (is_admin());

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ contact_messages table schema fixed successfully!';
    RAISE NOTICE '✅ Added read_at and read_by columns';
    RAISE NOTICE '✅ RLS policies are active';
END $$;
