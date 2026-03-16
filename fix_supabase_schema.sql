-- Run this in your Supabase SQL Editor to fix all schema cache errors and apply Revenue Engine updates

-- 1. Ensure all required columns exist in requests table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='requests' AND column_name='is_paid') THEN
        ALTER TABLE requests ADD COLUMN is_paid BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='requests' AND column_name='total') THEN
        ALTER TABLE requests ADD COLUMN total DECIMAL(10, 2) DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='requests' AND column_name='price') THEN
        ALTER TABLE requests ADD COLUMN price DECIMAL(10, 2) DEFAULT 0;
    END IF;
    -- Ensure room number column is present (sometimes it's called room or room_number)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='requests' AND column_name='room') THEN
        ALTER TABLE requests ADD COLUMN room TEXT DEFAULT 'Unknown';
    END IF;
END $$;

-- 2. Add Revenue Engine columns to menu_items if missing
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='menu_items' AND column_name='is_popular') THEN
        ALTER TABLE menu_items ADD COLUMN is_popular BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='menu_items' AND column_name='is_recommended') THEN
        ALTER TABLE menu_items ADD COLUMN is_recommended BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='menu_items' AND column_name='upsell_items') THEN
        ALTER TABLE menu_items ADD COLUMN upsell_items UUID[] DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='menu_items' AND column_name='badge_text') THEN
        ALTER TABLE menu_items ADD COLUMN badge_text TEXT;
    END IF;
END $$;

-- 3. Create offers table if missing
CREATE TABLE IF NOT EXISTS offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
    target_amount DECIMAL(10, 2) NOT NULL,
    offer_text TEXT NOT NULL,
    unlocked_item_id UUID REFERENCES menu_items(id),
    offer_price DECIMAL(10, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable RLS and Policies for offers and check existing ones
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read offers') THEN
        CREATE POLICY "Allow public read offers" ON offers FOR SELECT USING (true);
    END IF;
END $$;

-- 5. Force refresh the PostgREST schema cache
NOTIFY pgrst, 'reload schema';
