-- --- Supabase Database Schema for Raipur Restaurant ---
-- Run this in your Supabase SQL Editor

-- 1. Hotels Table
CREATE TABLE IF NOT EXISTS hotels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    logo TEXT,
    logo_image TEXT,
    primary_color TEXT DEFAULT '#2563eb',
    accent_color TEXT DEFAULT '#4f46e5',
    wifi_name TEXT,
    wifi_password TEXT,
    reception_phone TEXT,
    bg_pattern TEXT,
    breakfast_start TEXT,
    breakfast_end TEXT,
    lunch_start TEXT,
    lunch_end TEXT,
    dinner_start TEXT,
    dinner_end TEXT,
    late_checkout_phone TEXT,
    late_checkout_charge_1 TEXT,
    late_checkout_charge_2 TEXT,
    late_checkout_charge_3 TEXT,
    checkout_message TEXT,
    google_review_link TEXT,
    welcome_message TEXT,
    address TEXT,
    guest_theme TEXT DEFAULT 'CAFE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
    full_name TEXT,
    role TEXT CHECK (role IN ('admin', 'reception', 'kitchen', 'housekeeping', 'staff', 'waiter')) DEFAULT 'staff',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- 3. Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
    room_number TEXT NOT NULL,
    booking_pin TEXT,
    is_occupied BOOLEAN DEFAULT false,
    checkout_date TEXT,
    checkout_time TEXT,
    num_guests INTEGER,
    checked_in_at BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(hotel_id, room_number)
);

-- 4. Guests Table
CREATE TABLE IF NOT EXISTS guests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    room_number TEXT NOT NULL,
    check_in_date TEXT,
    check_out_date TEXT,
    status TEXT CHECK (status IN ('active', 'checked_out', 'deleted')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Requests Table
CREATE TABLE IF NOT EXISTS requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
    room TEXT NOT NULL,
    type TEXT NOT NULL,
    notes TEXT,
    status TEXT CHECK (status IN ('Pending', 'Assigned', 'In Progress', 'Completed', 'Cancelled')) DEFAULT 'Pending',
    timestamp BIGINT NOT NULL,
    time TEXT NOT NULL,
    price DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) DEFAULT 0,
    is_paid BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    is_popular BOOLEAN DEFAULT false,
    is_recommended BOOLEAN DEFAULT false,
    upsell_items UUID[] DEFAULT '{}',
    badge_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6.1 Offers (Cart Value Unlock)
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

-- 7. Special Offers
CREATE TABLE IF NOT EXISTS special_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
-- NOTE: You should configure specific policies based on your security needs.
-- For now, we'll just enable them.

ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- Basic Public Read Policies
DROP POLICY IF EXISTS "Allow public read hotels" ON hotels;
CREATE POLICY "Allow public read hotels" ON hotels FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read rooms" ON rooms;
CREATE POLICY "Allow public read rooms" ON rooms FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read guests" ON guests;
CREATE POLICY "Allow public read guests" ON guests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read requests" ON requests;
CREATE POLICY "Allow public read requests" ON requests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read menu_items" ON menu_items;
CREATE POLICY "Allow public read menu_items" ON menu_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read special_offers" ON special_offers;
CREATE POLICY "Allow public read special_offers" ON special_offers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read offers" ON offers;
CREATE POLICY "Allow public read offers" ON offers FOR SELECT USING (true);

-- Admin/Staff policies should be added here...
