-- Migration: Add service availability and price type (fixed/negotiable) to products
-- Run this in your Supabase SQL Editor

-- Add is_available column for services (only relevant for service category)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;

-- Add price_type column (fixed or negotiable)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS price_type TEXT DEFAULT 'fixed' CHECK (price_type IN ('fixed', 'negotiable'));

-- Add price_min and price_max columns for negotiable prices
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS price_min NUMERIC;
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS price_max NUMERIC;

-- Add comments for documentation
COMMENT ON COLUMN products.is_available IS 'Availability status for services (true = available, false = unavailable)';
COMMENT ON COLUMN products.price_type IS 'Price type: fixed (price is fixed) or negotiable (price can be negotiated between min and max)';
COMMENT ON COLUMN products.price_min IS 'Minimum price if price_type is negotiable';
COMMENT ON COLUMN products.price_max IS 'Maximum price if price_type is negotiable';

