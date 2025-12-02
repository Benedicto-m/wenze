# 🔧 Guide - Script SQL pour Marquer les Produits Vendus

## ⚠️ Problème identifié

Les produits qui ont des commandes actives ne sont pas automatiquement marqués comme `sold` dans la base de données, ce qui fait qu'ils apparaissent encore sur le marché alors qu'ils sont déjà vendus.

---

## 🎯 Solution : Script SQL

J'ai créé **3 scripts SQL** pour résoudre ce problème :

### **1. Script complet avec vérification** 
`supabase/migrations/mark_sold_products_with_orders.sql`

### **2. Script simplifié** (RECOMMANDÉ)
`supabase/migrations/mark_sold_products_SIMPLE.sql`

### **3. Trigger automatique pour l'avenir**
`supabase/migrations/trigger_auto_mark_sold.sql`

---

## 📋 Instructions d'utilisation

### **ÉTAPE 1 : Script de correction immédiate (RECOMMANDÉ)**

1. Ouvrez **Supabase Dashboard** → **SQL Editor**
2. Ouvrez le fichier `mark_sold_products_SIMPLE.sql`
3. Exécutez les requêtes **UNE PAR UNE** dans l'ordre :

#### **Requête 1 : Vérification**

```sql
SELECT 
    p.id,
    p.title,
    p.status as statut_actuel,
    COUNT(o.id) as nombre_commandes
FROM products p
INNER JOIN orders o ON o.product_id = p.id
WHERE 
    o.status IN ('pending', 'escrow_web2', 'shipped', 'completed')
    AND o.status != 'disputed'
    AND (p.status = 'available' OR p.status IS NULL)
GROUP BY p.id, p.title, p.status;
```

**➡️ Cette requête vous montre tous les produits qui seront marqués comme vendus.**

#### **Requête 2 : Mise à jour**

```sql
UPDATE products
SET status = 'sold'
WHERE id IN (
    SELECT DISTINCT p.id
    FROM products p
    INNER JOIN orders o ON o.product_id = p.id
    WHERE 
        o.status IN ('pending', 'escrow_web2', 'shipped', 'completed')
        AND o.status != 'disputed'
        AND (p.status = 'available' OR p.status IS NULL)
);
```

**➡️ Cette requête marque effectivement les produits comme vendus.**

#### **Requête 3 : Vérification finale**

```sql
SELECT COUNT(*) as produits_restants_a_corriger
FROM products p
INNER JOIN orders o ON o.product_id = p.id
WHERE 
    p.status = 'available'
    AND o.status IN ('pending', 'escrow_web2', 'shipped', 'completed')
    AND o.status != 'disputed';
```

**➡️ Si cette requête retourne `0`, tout est bon ! ✅**

---

### **ÉTAPE 2 : Trigger automatique (OPTIONNEL mais RECOMMANDÉ)**

Pour éviter que ce problème se reproduise à l'avenir, installez un trigger qui marque automatiquement les produits comme vendus :

1. Ouvrez **Supabase Dashboard** → **SQL Editor**
2. Ouvrez le fichier `trigger_auto_mark_sold.sql`
3. **Copiez tout le contenu** et exécutez-le en une seule fois

**➡️ Ce trigger marquera automatiquement les produits comme vendus dès qu'une commande est créée.**

---

## 🔍 Logique du script

### **Produits marqués comme vendus si :**

✅ Ils ont une commande avec statut :
- `pending` (créée)
- `escrow_web2` (paiement reçu)
- `shipped` (expédiée)
- `completed` (terminée)

❌ **Exclusions :**
- Commandes avec statut `disputed` (litige)
- Produits déjà marqués comme `sold`

### **Pour les négociations :**

- ✅ Mode `direct` → Toujours marquer comme vendu
- ✅ Mode `negotiation` + `escrow_status = 'open'` → Marquer comme vendu
- ✅ Mode `negotiation` + statut `shipped` ou `completed` → Marquer comme vendu
- ❌ Mode `negotiation` + pas encore payée → Ne pas marquer (en attente)

---

## 📊 Résultat attendu

### **Avant le script :**
- ❌ Produits avec commandes actives mais `status = 'available'`
- ❌ Produits visibles sur le marché alors qu'ils sont vendus

### **Après le script :**
- ✅ Tous les produits avec commandes actives → `status = 'sold'`
- ✅ Produits vendus **disparaissent automatiquement** du marché
- ✅ Plus de confusion pour les acheteurs

---

## ⚙️ Trigger automatique

### **Fonctionnement**

Le trigger `auto_mark_product_sold_on_order` :
- Se déclenche **automatiquement** après chaque `INSERT` ou `UPDATE` sur la table `orders`
- Marque le produit comme `sold` si la commande est active
- **Garantit** que le problème ne se reproduira plus

### **Avantages**

✅ **Automatique** - Pas besoin d'intervention manuelle  
✅ **Temps réel** - Produit marqué immédiatement  
✅ **Fiable** - Impossible d'oublier de marquer un produit  
✅ **Performant** - Exécution rapide côté base de données  

---

## 🔄 Vérification périodique (optionnelle)

Si vous voulez vérifier périodiquement qu'il n'y a pas de produits oubliés :

```sql
-- Produits disponibles qui ont des commandes actives (ne devrait pas exister)
SELECT 
    p.id,
    p.title,
    p.status,
    COUNT(o.id) as commandes_actives
FROM products p
INNER JOIN orders o ON o.product_id = p.id
WHERE 
    p.status = 'available'
    AND o.status IN ('pending', 'escrow_web2', 'shipped', 'completed')
    AND o.status != 'disputed'
GROUP BY p.id, p.title, p.status;
```

**➡️ Cette requête devrait toujours retourner 0 résultat.**

---

## 📂 Fichiers créés

### ✅ Scripts SQL

1. **`supabase/migrations/mark_sold_products_with_orders.sql`**
   - Version complète avec vérifications détaillées

2. **`supabase/migrations/mark_sold_products_SIMPLE.sql`**
   - Version simplifiée (RECOMMANDÉ pour exécution manuelle)

3. **`supabase/migrations/trigger_auto_mark_sold.sql`**
   - Trigger automatique pour éviter le problème à l'avenir

---

## 🚀 Action immédiate

### **1. Exécutez le script simple maintenant :**

```sql
-- Copiez-collez cette requête dans Supabase SQL Editor :

UPDATE products
SET status = 'sold'
WHERE id IN (
    SELECT DISTINCT p.id
    FROM products p
    INNER JOIN orders o ON o.product_id = p.id
    WHERE 
        o.status IN ('pending', 'escrow_web2', 'shipped', 'completed')
        AND o.status != 'disputed'
        AND (p.status = 'available' OR p.status IS NULL)
);
```

### **2. Installez le trigger automatique :**

Exécutez le fichier `trigger_auto_mark_sold.sql` pour éviter que le problème se reproduise.

---

## ✅ Résultat final

Après exécution du script :

✅ **Tous les produits vendus** sont marqués comme `sold`  
✅ **Ils disparaissent immédiatement** du marché  
✅ **Le trigger** garantit que ça restera automatique  
✅ **Plus de confusion** pour les acheteurs  

**Le problème est maintenant résolu de manière définitive ! 🎉**

