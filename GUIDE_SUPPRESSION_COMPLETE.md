# 🗑️ Guide - Suppression Complète des Produits et Commandes

## ⚠️ ATTENTION : Action irréversible

Ce script supprime **DÉFINITIVEMENT** tous les produits et tous les historiques de commandes pour repartir à zéro.

---

## 📋 Ce qui sera supprimé

### **Tables affectées :**

1. ✅ **Products** - Tous les produits
2. ✅ **Orders** - Toutes les commandes (historiques complets)
3. ✅ **Messages** - Tous les messages de chat liés aux commandes
4. ✅ **Ratings** - Toutes les évaluations
5. ✅ **WZP Transactions** - Transactions liées aux commandes

### **Tables préservées :**

- ✅ **Profiles** - Les comptes utilisateurs sont conservés
- ✅ **WZP Transactions** (non liées) - Transactions de référentiel, etc.

---

## 🔧 Instructions d'utilisation

### **ÉTAPE 1 : Ouvrir Supabase SQL Editor**

1. Allez dans votre **Supabase Dashboard**
2. Cliquez sur **SQL Editor** dans le menu de gauche
3. Créez une nouvelle requête

---

### **ÉTAPE 2 : Vérification avant suppression**

Exécutez cette requête pour voir combien d'éléments seront supprimés :

```sql
SELECT 
    (SELECT COUNT(*) FROM products) as produits,
    (SELECT COUNT(*) FROM orders) as commandes,
    (SELECT COUNT(*) FROM messages) as messages,
    (SELECT COUNT(*) FROM ratings) as evaluations,
    (SELECT COUNT(*) FROM wzp_transactions WHERE reference_id IS NOT NULL) as transactions_wzp;
```

**➡️ Notez ces chiffres pour référence.**

---

### **ÉTAPE 3 : Suppression**

Exécutez chaque commande **UNE PAR UNE** dans cet ordre :

#### **1. Supprimer les messages**

```sql
DELETE FROM messages;
```

#### **2. Supprimer les évaluations**

```sql
DELETE FROM ratings;
```

#### **3. Supprimer les transactions WZP liées aux commandes**

```sql
DELETE FROM wzp_transactions WHERE reference_id IS NOT NULL;
```

#### **4. Supprimer toutes les commandes**

```sql
DELETE FROM orders;
```

#### **5. Supprimer tous les produits**

```sql
DELETE FROM products;
```

---

### **ÉTAPE 4 : Vérification finale**

Exécutez cette requête pour vérifier que tout a été supprimé :

```sql
SELECT 
    (SELECT COUNT(*) FROM products) as produits_restants,
    (SELECT COUNT(*) FROM orders) as commandes_restantes,
    (SELECT COUNT(*) FROM messages) as messages_restants,
    (SELECT COUNT(*) FROM ratings) as evaluations_restantes,
    (SELECT COUNT(*) FROM wzp_transactions WHERE reference_id IS NOT NULL) as transactions_wzp_restantes;
```

**➡️ Toutes les valeurs doivent être `0`. Si c'est le cas, c'est parfait ! ✅**

---

## 🔄 Version en une seule transaction (AVANCÉ)

Si vous êtes sûr et voulez tout supprimer en une seule transaction (rollback possible) :

```sql
BEGIN;

DELETE FROM messages;
DELETE FROM ratings;
DELETE FROM wzp_transactions WHERE reference_id IS NOT NULL;
DELETE FROM orders;
DELETE FROM products;

-- Vérifier avant de commit
SELECT 
    (SELECT COUNT(*) FROM products) as produits_restants,
    (SELECT COUNT(*) FROM orders) as commandes_restantes;

-- Si tout est à 0, exécutez :
COMMIT;

-- Si vous voulez annuler :
-- ROLLBACK;
```

---

## 📊 Ordre de suppression (important)

L'ordre est **crucial** à cause des clés étrangères :

```
1. messages      → (référence orders)
   ↓
2. ratings       → (référence orders)
   ↓
3. wzp_transactions → (peut référencer orders)
   ↓
4. orders        → (référence products)
   ↓
5. products      → (table principale)
```

**⚠️ Si vous changez l'ordre, la suppression échouera !**

---

## ✅ Résultat attendu

### **Avant suppression :**
- ❌ Produits existants dans la base
- ❌ Historique de commandes
- ❌ Messages de chat
- ❌ Évaluations

### **Après suppression :**
- ✅ Base de données propre
- ✅ Aucun produit
- ✅ Aucune commande
- ✅ Prêt pour de nouveaux tests

---

## 🎯 Prochaines étapes

Après la suppression :

1. ✅ **Les utilisateurs peuvent republier des produits**
2. ✅ **Nouveaux tests peuvent commencer**
3. ✅ **Base de données propre pour les testeurs**

---

## 📂 Fichiers créés

### ✅ Scripts SQL

1. **`supabase/migrations/delete_all_products_and_orders.sql`**
   - Version complète avec vérifications détaillées

2. **`supabase/migrations/delete_all_products_and_orders_SIMPLE.sql`**
   - Version simplifiée (RECOMMANDÉ pour exécution manuelle)

---

## ⚠️ Avertissements

1. ⚠️ **Action irréversible** - Les données supprimées ne peuvent pas être récupérées
2. ⚠️ **Sauvegarde recommandée** - Faites une sauvegarde avant si nécessaire
3. ⚠️ **Ordre important** - Respectez l'ordre de suppression
4. ⚠️ **Profiles conservés** - Les comptes utilisateurs ne sont pas supprimés

---

## 🚀 Action rapide

Pour supprimer tout rapidement, copiez-collez cette requête complète :

```sql
-- Suppression complète en une seule transaction
BEGIN;

DELETE FROM messages;
DELETE FROM ratings;
DELETE FROM wzp_transactions WHERE reference_id IS NOT NULL;
DELETE FROM orders;
DELETE FROM products;

COMMIT;

-- Vérification
SELECT 
    (SELECT COUNT(*) FROM products) as produits,
    (SELECT COUNT(*) FROM orders) as commandes;
```

**➡️ Si les deux valeurs sont 0, la suppression est réussie ! ✅**

---

## 🎉 Résultat

Après exécution du script :

✅ **Base de données propre** - Aucun produit ni commande  
✅ **Prêt pour les tests** - Les testeurs peuvent repartir à zéro  
✅ **Historiques supprimés** - Aucune trace des anciennes données  
✅ **Utilisateurs conservés** - Les comptes restent intacts  

**La base est maintenant prête pour de nouveaux tests ! 🚀**

