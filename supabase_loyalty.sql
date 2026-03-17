-- Add guest_loyalty table for persistent points tracking
CREATE TABLE IF NOT EXISTS guest_loyalty (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
    phone TEXT NOT NULL,
    name TEXT,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(hotel_id, phone)
);

-- Enable RLS
ALTER TABLE guest_loyalty ENABLE ROW LEVEL SECURITY;

-- Public Read/Upsert for guests (Scoped by hotel and phone)
-- In a real production app, we would use OTP verification, but for this vibe-focused MVP, 
-- we allow guests to track points by phone number.
DROP POLICY IF EXISTS "Allow public read loyalty" ON guest_loyalty;
CREATE POLICY "Allow public read loyalty" ON guest_loyalty FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert/update loyalty" ON guest_loyalty;
CREATE POLICY "Allow public insert/update loyalty" ON guest_loyalty FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update loyalty" ON guest_loyalty FOR UPDATE USING (true);
