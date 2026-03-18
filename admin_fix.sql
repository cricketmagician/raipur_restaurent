-- Add missing RLS policies for seasonal_stories
-- Run this in your Supabase SQL Editor

-- 1. Ensure the table exists (fallback)
CREATE TABLE IF NOT EXISTS seasonal_stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    type TEXT DEFAULT 'Viral',
    image_url TEXT,
    price DECIMAL(10, 2),
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE seasonal_stories ENABLE ROW LEVEL SECURITY;

-- 3. Add Policies
DROP POLICY IF EXISTS "Allow public read seasonal_stories" ON seasonal_stories;
CREATE POLICY "Allow public read seasonal_stories" ON seasonal_stories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow all for authenticated users on seasonal_stories" ON seasonal_stories;
CREATE POLICY "Allow all for authenticated users on seasonal_stories" ON seasonal_stories FOR ALL USING (true);
