-- Migration: Add price_fc column to products table
-- This column stores the fixed price in Francs Congolais
-- 
-- IMPORTANT: Exécutez chaque instruction séparément dans Supabase SQL Editor
-- Copiez et collez une instruction à la fois, puis cliquez sur "Run"

-- ÉTAPE 1: Ajouter la colonne price_fc
ALTER TABLE products ADD COLUMN IF NOT EXISTS price_fc NUMERIC;

-- ÉTAPE 2: Mettre à jour les produits existants (exécutez après l'étape 1)
UPDATE products SET price_fc = price_ada * 2400 WHERE price_fc IS NULL;

-- ÉTAPE 3 (optionnel): Ajouter un commentaire pour la documentation
COMMENT ON COLUMN products.price_fc IS 'Fixed price in Francs Congolais (FC). This value remains constant while price_ada varies with market rates.';
