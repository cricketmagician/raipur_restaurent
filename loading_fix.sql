-- Add loading_image to hotels table
-- Run this in your Supabase SQL Editor
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS loading_image TEXT;
