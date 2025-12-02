# 🔧 Solution - Erreur 400 lors de la création de produit

## ❌ Problème

L'erreur 400 lors de la création d'un produit indique généralement que les colonnes `fashion_type` et/ou `shoe_number` n'existent pas encore dans votre base de données Supabase.

```
Failed to load resource: the server responded with a status of 400 ()
Error creating product: Object
```

## ✅ Solution

### Étape 1 : Exécuter la migration SQL

La migration SQL doit être exécutée dans Supabase pour ajouter les nouvelles colonnes.

**Fichier de migration :** `supabase/migrations/add_fashion_fields.sql`

**Comment exécuter :**

1. Ouvrez votre projet Supabase
2. Allez dans **SQL Editor**
3. Copiez et collez le contenu de la migration :

```sql
-- Ajouter la colonne fashion_type pour distinguer Habit et Soulier
ALTER TABLE products
ADD COLUMN IF NOT EXISTS fashion_type TEXT;

-- Ajouter la colonne shoe_number pour le numéro des souliers
ALTER TABLE products
ADD COLUMN IF NOT EXISTS shoe_number TEXT;
```

4. Cliquez sur **Run** pour exécuter

### Étape 2 : Vérifier que les colonnes existent

Pour vérifier que les colonnes ont été ajoutées :

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('fashion_type', 'shoe_number');
```

### Étape 3 : Tester à nouveau

Après avoir exécuté la migration, essayez de créer un produit à nouveau.

---

## 🔍 Vérification alternative

Si vous ne pouvez pas exécuter la migration immédiatement, vous pouvez temporairement créer un produit sans utiliser la catégorie "Mode" pour vérifier que le reste fonctionne.

---

## 📝 Notes

- Les colonnes `fashion_type` et `shoe_number` sont **optionnelles** pour les autres catégories
- Elles ne sont utilisées que pour la catégorie **Mode**
- Si vous créez un produit dans une autre catégorie, ces colonnes ne sont pas nécessaires

---

**Après avoir exécuté la migration, l'erreur devrait disparaître ! ✅**

