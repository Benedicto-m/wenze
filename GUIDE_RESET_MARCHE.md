# 🔄 Guide - Reset Complet du Marché

## 🎯 Objectif

Supprimer **tous les produits** et **tous les historiques de commandes** pour repartir à zéro et permettre aux testeurs de commencer de nouveaux tests.

---

## ⚠️ ATTENTION

Cette action est **irréversible** ! Tous les produits et toutes les commandes seront définitivement supprimés.

---

## 🚀 Méthode rapide (RECOMMANDÉE)

### **Étape 1 : Ouvrir Supabase SQL Editor**

1. Allez dans votre **Supabase Dashboard**
2. Cliquez sur **SQL Editor**
3. Créez une nouvelle requête

### **Étape 2 : Copier-coller ce script**

Ouvrez le fichier `supabase/migrations/RESET_COMPLET_MARCHE.sql` et copiez tout son contenu dans l'éditeur SQL.

### **Étape 3 : Exécuter**

Cliquez sur **Run** ou appuyez sur `Ctrl+Enter`.

**➡️ C'est tout ! La suppression est terminée.**

---

## 📋 Script complet à copier-coller

Si vous préférez, voici le script directement :

```sql
BEGIN;

DELETE FROM messages;
DELETE FROM ratings;
DELETE FROM wzp_transactions WHERE reference_id IS NOT NULL;
DELETE FROM orders;
DELETE FROM products;

SELECT 
    '✅ SUPPRESSION TERMINÉE' as status,
    (SELECT COUNT(*) FROM products) as produits_restants,
    (SELECT COUNT(*) FROM orders) as commandes_restantes;

COMMIT;
```

---

## 📊 Ce qui sera supprimé

### ✅ **Tables vidées :**

1. **Products** - Tous les produits
2. **Orders** - Toutes les commandes
3. **Messages** - Tous les messages de chat
4. **Ratings** - Toutes les évaluations
5. **WZP Transactions** - Transactions liées aux commandes

### ✅ **Tables préservées :**

- **Profiles** - Les comptes utilisateurs restent intacts
- **Auth.users** - Les authentifications restent intactes

---

## ✅ Résultat attendu

Après exécution :

- ✅ **0 produits** dans la base de données
- ✅ **0 commandes** dans la base de données
- ✅ **0 messages** dans la base de données
- ✅ **0 évaluations** dans la base de données
- ✅ Base prête pour de nouveaux tests

---

## 🔄 Vérification

Après exécution, vous verrez :

```
✅ SUPPRESSION TERMINÉE
produits_restants: 0
commandes_restantes: 0
```

**Si les valeurs sont 0, c'est parfait ! ✅**

---

## 📂 Fichiers créés

1. **`supabase/migrations/RESET_COMPLET_MARCHE.sql`**
   - Version simple en une seule transaction

2. **`supabase/migrations/delete_all_products_and_orders_SIMPLE.sql`**
   - Version avec vérifications étape par étape

3. **`supabase/migrations/delete_all_products_and_orders.sql`**
   - Version complète avec toutes les vérifications

---

## 🎉 Prochaines étapes

Après la suppression :

1. ✅ Les utilisateurs peuvent publier de nouveaux produits
2. ✅ Les testeurs peuvent commencer de nouveaux tests
3. ✅ Le marché est propre et prêt
4. ✅ Aucun historique ne perturbe les tests

---

## ⚠️ Important

- ⚠️ **Action irréversible** - Pas de retour en arrière possible
- ⚠️ **Profiles conservés** - Les comptes utilisateurs restent
- ⚠️ **Ordre respecté** - Le script respecte l'ordre des clés étrangères

**Le marché est maintenant complètement réinitialisé ! 🚀**

