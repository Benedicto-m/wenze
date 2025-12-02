# Guide : Supprimer les produits d'Olivier M et Kaota

## 🎯 Méthode 1 : Script SQL (Recommandé - Plus rapide)

### Étapes :

1. **Ouvrez votre projet Supabase** → Allez sur [app.supabase.com](https://app.supabase.com)

2. **Accédez à l'éditeur SQL** :
   - Cliquez sur "SQL Editor" dans le menu de gauche
   - Cliquez sur "New Query"

3. **Exécutez le script de vérification** (pour voir ce qui sera supprimé) :

```sql
-- Voir les produits qui seront supprimés
SELECT 
  pr.full_name as "Nom du vendeur",
  pr.email as "Email",
  p.id as "ID Produit",
  p.title as "Titre",
  p.price_ada as "Prix",
  p.created_at as "Date de publication"
FROM products p
JOIN profiles pr ON p.seller_id = pr.id
WHERE 
  pr.full_name ILIKE '%Olivier%M%' 
  OR pr.full_name ILIKE '%Kaota%'
ORDER BY p.created_at DESC;
```

4. **Si tout est correct, exécutez le script de suppression** :

```sql
-- ⚠️ ATTENTION : Ceci va supprimer définitivement !

BEGIN;

-- Supprimer les messages liés
DELETE FROM messages
WHERE order_id IN (
  SELECT o.id
  FROM orders o
  JOIN products p ON o.product_id = p.id
  JOIN profiles pr ON p.seller_id = pr.id
  WHERE pr.full_name ILIKE '%Olivier%M%' OR pr.full_name ILIKE '%Kaota%'
);

-- Supprimer les ratings liés
DELETE FROM ratings
WHERE order_id IN (
  SELECT o.id
  FROM orders o
  JOIN products p ON o.product_id = p.id
  JOIN profiles pr ON p.seller_id = pr.id
  WHERE pr.full_name ILIKE '%Olivier%M%' OR pr.full_name ILIKE '%Kaota%'
);

-- Supprimer les commandes liées
DELETE FROM orders
WHERE product_id IN (
  SELECT p.id
  FROM products p
  JOIN profiles pr ON p.seller_id = pr.id
  WHERE pr.full_name ILIKE '%Olivier%M%' OR pr.full_name ILIKE '%Kaota%'
);

-- Supprimer les produits
DELETE FROM products
WHERE seller_id IN (
  SELECT id
  FROM profiles
  WHERE full_name ILIKE '%Olivier%M%' OR pr.full_name ILIKE '%Kaota%'
);

COMMIT;
```

5. **Vérifiez que tout est bien supprimé** :

```sql
SELECT COUNT(*) as "Produits restants (doit être 0)"
FROM products p
JOIN profiles pr ON p.seller_id = pr.id
WHERE pr.full_name ILIKE '%Olivier%M%' OR pr.full_name ILIKE '%Kaota%';
```

---

## 🎯 Méthode 2 : Interface Admin (Plus visuel)

### Étapes :

1. **Ouvrez le fichier** `frontend/src/pages/AdminProducts.tsx` - Il est déjà créé !

2. **Ajoutez la route dans `App.tsx`** (si pas déjà fait) :

```tsx
import AdminProducts from './pages/AdminProducts';

// Dans les routes protégées :
<Route path="/admin/products" element={
  <ProtectedRoute>
    <AdminProducts />
  </ProtectedRoute>
} />
```

3. **Accédez à la page admin** :
   - Allez sur : `http://localhost:5173/admin/products` (ou votre URL)
   - Vous verrez tous les produits avec leurs vendeurs

4. **Suppression en masse** :
   - Cliquez sur "Suppression en masse"
   - Entrez "Olivier M" ou "Kaota"
   - Cliquez sur "Supprimer tous les produits"

---

## 🔍 Si les noms ne correspondent pas exactement

Si les produits ne sont pas trouvés, vérifiez les noms exacts :

```sql
-- Trouver tous les noms de vendeurs qui contiennent "Olivier" ou "Kaota"
SELECT DISTINCT full_name, email
FROM profiles
WHERE full_name ILIKE '%Olivier%' 
   OR full_name ILIKE '%Kaota%'
   OR full_name ILIKE '%olivier%'
   OR full_name ILIKE '%kaota%';
```

Ensuite, ajustez le script avec les vrais noms trouvés.

---

## ⚠️ Important

- **Sauvegardez d'abord** : Faites une sauvegarde de votre base de données avant de supprimer
- **Testez en premier** : Exécutez toujours les requêtes SELECT avant DELETE
- **Ordre de suppression** : Messages → Ratings → Orders → Products (important pour éviter les erreurs de contraintes)

---

## 📁 Fichiers créés

- `supabase/migrations/DELETE_PRODUCTS_SIMPLE.sql` - Script SQL simple
- `supabase/migrations/delete_specific_sellers_products.sql` - Script SQL détaillé
- `frontend/src/pages/AdminProducts.tsx` - Interface admin

---

## 🆘 Besoin d'aide ?

Si vous avez des erreurs, vérifiez :
1. Les noms exacts des vendeurs dans la table `profiles`
2. Les permissions RLS (Row Level Security) dans Supabase
3. Les contraintes de clés étrangères

