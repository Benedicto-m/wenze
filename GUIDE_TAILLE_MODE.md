# ✅ Ajout du champ Taille pour la catégorie Mode

## 🎯 Fonctionnalité ajoutée

Lorsque l'utilisateur sélectionne la catégorie **"Mode"** dans le formulaire de création de produit, un champ **"Taille"** apparaît automatiquement.

### Tailles disponibles :
- XS - Très petit
- S - Petit
- M - Moyen
- L - Large
- XL - Très large
- XXL - Extra large
- XXXL - Triple extra large

---

## 📝 Modification de la base de données

### ⚠️ IMPORTANT : Vous devez exécuter cette migration SQL

1. **Ouvrez votre projet Supabase** → SQL Editor

2. **Copiez et exécutez ce script** :

```sql
-- Ajouter le champ size à la table products
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS size TEXT;
```

Le fichier complet est disponible dans : `supabase/migrations/add_product_size.sql`

---

## ✅ Fichiers modifiés

1. **`frontend/src/pages/CreateProduct.tsx`**
   - Ajout du champ `size` dans le state
   - Champ de sélection de taille affiché uniquement pour la catégorie "Mode"
   - Réinitialisation automatique de la taille si la catégorie change

2. **`frontend/src/pages/ProductDetail.tsx`**
   - Affichage de la taille dans la page de détail (pour les produits Mode)

3. **`supabase/migrations/add_product_size.sql`**
   - Migration SQL pour ajouter le champ `size`

---

## 🎨 Comment ça fonctionne

1. **Dans le formulaire** :
   - L'utilisateur sélectionne "Mode" comme catégorie
   - Le champ "Taille" apparaît automatiquement
   - Il peut sélectionner une taille parmi les options disponibles

2. **Dans la page de détail** :
   - La taille est affichée dans la section prix si c'est un produit Mode
   - Format : "Taille: M" par exemple

---

## 🚀 Test

1. Exécutez la migration SQL
2. Créez un nouveau produit avec la catégorie "Mode"
3. Sélectionnez une taille
4. Vérifiez que la taille s'affiche dans la page de détail

---

## 📌 Notes

- Le champ taille est **optionnel** (peut être laissé vide)
- La taille n'est sauvegardée que pour les produits de catégorie "Mode"
- Si l'utilisateur change de catégorie, la taille est automatiquement réinitialisée

