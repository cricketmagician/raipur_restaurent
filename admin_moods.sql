-- Create Moods Table
CREATE TABLE IF NOT EXISTS moods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID REFERENCES hotels(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    tag_linked TEXT NOT NULL,
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE moods ENABLE ROW LEVEL SECURITY;

-- Allow public read access
DROP POLICY IF EXISTS "Allow public read moods" ON moods;
CREATE POLICY "Allow public read moods" ON moods FOR SELECT USING (true);

-- Allow authenticated users to insert/update/delete (adjust according to your strict roles if needed)
DROP POLICY IF EXISTS "Allow authenticated insert moods" ON moods;
CREATE POLICY "Allow authenticated insert moods" ON moods FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated update moods" ON moods;
CREATE POLICY "Allow authenticated update moods" ON moods FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated delete moods" ON moods;
CREATE POLICY "Allow authenticated delete moods" ON moods FOR DELETE USING (auth.role() = 'authenticated');
