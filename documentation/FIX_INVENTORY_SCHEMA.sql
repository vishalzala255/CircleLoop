-- ==========================================
-- FIX INVENTORY TABLE SCHEMA
-- Run this to add the missing price_per_unit column
-- ==========================================

-- Add price_per_unit column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'inventory' 
        AND column_name = 'price_per_unit'
    ) THEN
        ALTER TABLE public.inventory 
        ADD COLUMN price_per_unit DECIMAL(10,2) DEFAULT 0.00;
        
        RAISE NOTICE 'Added price_per_unit column to inventory table';
    ELSE
        RAISE NOTICE 'price_per_unit column already exists';
    END IF;
END $$;

-- Handle contact_messages table creation/migration
DO $$ 
BEGIN
    -- If table doesn't exist, create it
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'contact_messages') THEN
        CREATE TABLE public.contact_messages (
          id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT NOT NULL,
          message TEXT NOT NULL,
          message_status TEXT DEFAULT 'unread' CHECK (message_status IN ('unread', 'read', 'archived')),
          read_at TIMESTAMP WITH TIME ZONE,
          read_by uuid REFERENCES public.profiles(id)
        );
        RAISE NOTICE 'Created contact_messages table';
    ELSE
        -- Table exists, check if we need to rename column
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'contact_messages' 
            AND column_name = 'status'
        ) THEN
            -- Rename status to message_status
            ALTER TABLE public.contact_messages RENAME COLUMN status TO message_status;
            RAISE NOTICE 'Renamed status column to message_status';
        END IF;
        
        -- Make sure message_status column exists (in case it was never there)
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'contact_messages' 
            AND column_name = 'message_status'
        ) THEN
            ALTER TABLE public.contact_messages 
            ADD COLUMN message_status TEXT DEFAULT 'unread' CHECK (message_status IN ('unread', 'read', 'archived'));
            RAISE NOTICE 'Added message_status column';
        END IF;
    END IF;
END $$;

-- Enable RLS for contact_messages
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can submit contact form" ON contact_messages;
DROP POLICY IF EXISTS "Admin can view all messages" ON contact_messages;
DROP POLICY IF EXISTS "Admin can update messages" ON contact_messages;

CREATE POLICY "Anyone can submit contact form" 
  ON contact_messages FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admin can view all messages" 
  ON contact_messages FOR SELECT 
  USING (is_admin());

CREATE POLICY "Admin can update messages" 
  ON contact_messages FOR UPDATE 
  USING (is_admin());

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_message_status ON contact_messages(message_status);
