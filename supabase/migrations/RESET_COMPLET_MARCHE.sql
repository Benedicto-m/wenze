-- =====================================================
-- RESET COMPLET DU MARCHÉ - Version Simple
-- =====================================================
-- 
-- Ce script supprime TOUS les produits et TOUS les historiques
-- de commandes pour permettre de repartir à zéro.
--
-- ⚠️ ATTENTION : Action irréversible !
-- =====================================================

-- Copiez-collez tout ce bloc dans Supabase SQL Editor et exécutez

BEGIN;

-- 1. Supprimer les messages de chat
DELETE FROM messages;

-- 2. Supprimer les évaluations
DELETE FROM ratings;

-- 3. Supprimer toutes les commandes
DELETE FROM orders;

-- 4. Supprimer tous les produits
DELETE FROM products;

-- Afficher le résultat
SELECT 
    '✅ SUPPRESSION TERMINÉE' as status,
    (SELECT COUNT(*) FROM products) as produits_restants,
    (SELECT COUNT(*) FROM orders) as commandes_restantes;

COMMIT;

-- Si les valeurs sont 0, c'est parfait ! ✅

