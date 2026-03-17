-- Canonical Supabase repair script for admin realtime sync.
-- Run this in Supabase SQL Editor, then reload the admin app.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Ensure all required columns exist in requests table
DO $$
BEGIN
    -- Core requests columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'requests' AND column_name = 'room') THEN
        ALTER TABLE requests ADD COLUMN room TEXT DEFAULT 'Unknown';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'requests' AND column_name = 'price') THEN
        ALTER TABLE requests ADD COLUMN price DECIMAL(10, 2) DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'requests' AND column_name = 'total') THEN
        ALTER TABLE requests ADD COLUMN total DECIMAL(10, 2) DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'requests' AND column_name = 'is_paid') THEN
        ALTER TABLE requests ADD COLUMN is_paid BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'requests' AND column_name = 'items') THEN
        ALTER TABLE requests ADD COLUMN items JSONB;
    END IF;

    -- Hotel columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hotels' AND column_name = 'bg_pattern') THEN
        ALTER TABLE hotels ADD COLUMN bg_pattern TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hotels' AND column_name = 'address') THEN
        ALTER TABLE hotels ADD COLUMN address TEXT;
    END IF;

    -- Menu items columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu_items' AND column_name = 'is_popular') THEN
        ALTER TABLE menu_items ADD COLUMN is_popular BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu_items' AND column_name = 'is_recommended') THEN
        ALTER TABLE menu_items ADD COLUMN is_recommended BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu_items' AND column_name = 'upsell_items') THEN
        ALTER TABLE menu_items ADD COLUMN upsell_items UUID[] DEFAULT '{}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu_items' AND column_name = 'badge_text') THEN
        ALTER TABLE menu_items ADD COLUMN badge_text TEXT;
    END IF;
END $$;

-- 2. Create offers table if it doesn't exist
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

-- 3. Normalize request status values used by the UI
ALTER TABLE requests DROP CONSTRAINT IF EXISTS requests_status_check;
ALTER TABLE requests
    ADD CONSTRAINT requests_status_check
    CHECK (status IN ('Pending', 'Assigned', 'In Progress', 'Completed', 'Cancelled'));

UPDATE requests
SET status = 'Assigned'
WHERE status = 'Processing';

-- 4. Enable RLS everywhere the app expects it
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- 5. Public read policies for guest-facing tables
DROP POLICY IF EXISTS "Allow public read hotels" ON hotels;
CREATE POLICY "Allow public read hotels" ON hotels FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert hotels" ON hotels;
CREATE POLICY "Allow public insert hotels" ON hotels FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read rooms" ON rooms;
CREATE POLICY "Allow public read rooms" ON rooms FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read guests" ON guests;
CREATE POLICY "Allow public read guests" ON guests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read requests" ON requests;
CREATE POLICY "Allow public read requests" ON requests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert requests" ON requests;
CREATE POLICY "Allow public insert requests" ON requests FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read menu_items" ON menu_items;
CREATE POLICY "Allow public read menu_items" ON menu_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read special_offers" ON special_offers;
CREATE POLICY "Allow public read special_offers" ON special_offers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read offers" ON offers;
CREATE POLICY "Allow public read offers" ON offers FOR SELECT USING (true);

-- 6. Hotel-scoped staff access
DROP POLICY IF EXISTS "Profiles are viewable by self or hotel staff" ON profiles;
CREATE POLICY "Profiles are viewable by self or hotel staff" ON profiles
    FOR SELECT USING (
        auth.uid() = user_id OR EXISTS (
            SELECT 1
            FROM profiles AS actor
            WHERE actor.user_id = auth.uid()
            AND actor.hotel_id = profiles.hotel_id
        )
    );

DROP POLICY IF EXISTS "Profiles can be created by self" ON profiles;
CREATE POLICY "Profiles can be created by self" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Staff can manage hotels" ON hotels;
CREATE POLICY "Staff can manage hotels" ON hotels
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.hotel_id = hotels.id
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.hotel_id = hotels.id
        )
    );

DROP POLICY IF EXISTS "Staff can manage rooms" ON rooms;
CREATE POLICY "Staff can manage rooms" ON rooms
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.hotel_id = rooms.hotel_id
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.hotel_id = rooms.hotel_id
        )
    );

DROP POLICY IF EXISTS "Staff can manage guests" ON guests;
CREATE POLICY "Staff can manage guests" ON guests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.hotel_id = guests.hotel_id
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.hotel_id = guests.hotel_id
        )
    );

DROP POLICY IF EXISTS "Staff can manage requests" ON requests;
CREATE POLICY "Staff can manage requests" ON requests
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.hotel_id = requests.hotel_id
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.hotel_id = requests.hotel_id
        )
    );

DROP POLICY IF EXISTS "Staff can delete requests" ON requests;
CREATE POLICY "Staff can delete requests" ON requests
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.hotel_id = requests.hotel_id
        )
    );

DROP POLICY IF EXISTS "Staff can manage menu items" ON menu_items;
CREATE POLICY "Staff can manage menu items" ON menu_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.hotel_id = menu_items.hotel_id
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.hotel_id = menu_items.hotel_id
        )
    );

DROP POLICY IF EXISTS "Staff can manage special offers" ON special_offers;
CREATE POLICY "Staff can manage special offers" ON special_offers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.hotel_id = special_offers.hotel_id
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.hotel_id = special_offers.hotel_id
        )
    );

DROP POLICY IF EXISTS "Staff can manage offers" ON offers;
CREATE POLICY "Staff can manage offers" ON offers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.hotel_id = offers.hotel_id
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.hotel_id = offers.hotel_id
        )
    );

-- 7. Performance indexes for realtime fallback fetches
CREATE INDEX IF NOT EXISTS idx_requests_hotel_id ON requests(hotel_id);
CREATE INDEX IF NOT EXISTS idx_requests_room ON requests(room);
CREATE INDEX IF NOT EXISTS idx_rooms_hotel_id ON rooms(hotel_id);
CREATE INDEX IF NOT EXISTS idx_guests_hotel_id ON guests(hotel_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_hotel_id ON profiles(hotel_id);
CREATE INDEX IF NOT EXISTS idx_hotels_slug ON hotels(slug);
CREATE INDEX IF NOT EXISTS idx_menu_items_hotel_id ON menu_items(hotel_id);
CREATE INDEX IF NOT EXISTS idx_special_offers_hotel_id ON special_offers(hotel_id);
CREATE INDEX IF NOT EXISTS idx_offers_hotel_id ON offers(hotel_id);

-- 8. Reliable UPDATE / DELETE payloads for realtime
ALTER TABLE hotels REPLICA IDENTITY FULL;
ALTER TABLE profiles REPLICA IDENTITY FULL;
ALTER TABLE rooms REPLICA IDENTITY FULL;
ALTER TABLE guests REPLICA IDENTITY FULL;
ALTER TABLE requests REPLICA IDENTITY FULL;
ALTER TABLE menu_items REPLICA IDENTITY FULL;
ALTER TABLE special_offers REPLICA IDENTITY FULL;
ALTER TABLE offers REPLICA IDENTITY FULL;

-- 9. Ensure all admin-relevant tables publish to Supabase Realtime
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'requests') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE requests;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'rooms') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'hotels') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE hotels;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'menu_items') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'special_offers') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE special_offers;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'guests') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE guests;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'profiles') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
    END IF;
END $$;

-- 10. Explicit Authenticated Role Policies for Real-time
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated read requests') THEN
        CREATE POLICY "Allow authenticated read requests" ON requests FOR SELECT TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow authenticated read rooms') THEN
        CREATE POLICY "Allow authenticated read rooms" ON rooms FOR SELECT TO authenticated USING (true);
    END IF;
END $$;

-- 11. Reload API schema caches after repair
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';
