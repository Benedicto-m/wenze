# 👕 Guide - Mode : Habit et Soulier

## ✅ Modifications effectuées

Pour la catégorie **Mode**, l'utilisateur peut maintenant choisir entre deux types de produits :

1. **Habit / Vêtement** → Affiche un **champ de saisie libre** pour la taille (l'utilisateur peut saisir n'importe quelle valeur : XS, S, M, L, XL, 42, etc.)
2. **Soulier / Chaussure** → Affiche un **champ de saisie libre** pour le numéro (l'utilisateur peut saisir n'importe quelle valeur : 40, 42, 44, 40 EU, etc.)

---

## 🎯 Fonctionnalités

### Lors de la publication (CreateProduct.tsx)

1. Sélectionner **"Mode"** comme catégorie
2. Choisir le **Type de produit** :
   - **Habit / Vêtement** → Affiche le champ de saisie libre pour la taille
   - **Soulier / Chaussure** → Affiche le champ de saisie libre pour le numéro
3. Remplir le champ approprié (obligatoire, saisie libre)

### Lors de la modification (EditProduct.tsx)

- Même logique que la création
- Les champs sont pré-remplis avec les valeurs existantes

### Affichage sur la page produit (ProductDetail.tsx)

- **Pour Habit** : Affiche "Taille: XS" (ou la taille sélectionnée)
- **Pour Soulier** : Affiche "Numéro: 40 (EU)" (ou le numéro sélectionné)

---

## 📋 Champs ajoutés dans la base de données

### Nouveaux colonnes dans `products` :

- ✅ `fashion_type` : 'habit' | 'soulier' | null
- ✅ `shoe_number` : TEXT (numéro de chaussure, ex: "40")

### Colonnes existantes utilisées :

- ✅ `size` : Déjà existante, utilisée pour les habits

---

## 🗄️ Migration SQL

Une migration SQL a été créée : `supabase/migrations/add_fashion_fields.sql`

**À exécuter** dans Supabase pour ajouter les nouvelles colonnes.

```sql
ALTER TABLE products
ADD COLUMN IF NOT EXISTS fashion_type TEXT;

ALTER TABLE products
ADD COLUMN IF NOT EXISTS shoe_number TEXT;
```

---

## 📝 Validation

### Règles de validation :

1. ✅ Si catégorie = "Mode" :
   - Le **type** (Habit/Soulier) est **obligatoire**
   
2. ✅ Si type = "Habit" :
   - La **taille** est **obligatoire**
   
3. ✅ Si type = "Soulier" :
   - Le **numéro** est **obligatoire**

---

## 🔄 Logique de réinitialisation

Lors du changement :
- Si la catégorie change et n'est plus "Mode" → Tous les champs Mode sont réinitialisés
- Si le type change :
  - Habit → Soulier : Taille réinitialisée
  - Soulier → Habit : Numéro réinitialisé

---

## 📁 Fichiers modifiés

### ✅ Créés :
- `supabase/migrations/add_fashion_fields.sql`

### ✅ Modifiés :
- `frontend/src/pages/CreateProduct.tsx`
- `frontend/src/pages/EditProduct.tsx`
- `frontend/src/pages/ProductDetail.tsx`

---

## 🎨 Interface utilisateur

### Sélecteur de type (Mode) :
```
Type de produit
┌─────────────────────────────┐
│ Sélectionner un type        │
│ ✓ Habit / Vêtement          │
│   Soulier / Chaussure       │
└─────────────────────────────┘
```

### Champ Taille (Habit) :
```
Taille
┌─────────────────────────────┐
│ Ex: M, L, XL, 42, etc.     │
│ [Champ de saisie libre]    │
└─────────────────────────────┘
```

### Champ Numéro (Soulier) :
```
Numéro
┌─────────────────────────────┐
│ Ex: 40, 42, 44, etc.       │
│ [Champ de saisie libre]    │
└─────────────────────────────┘
```

**Note :** Les champs sont maintenant libres, permettant à l'utilisateur de saisir n'importe quelle valeur (ex: "40", "42 EU", "XL", etc.)

---

## ✅ Tout est prêt !

**N'oubliez pas d'exécuter la migration SQL** avant de tester les nouvelles fonctionnalités.

---

**Date de création :** 2024  
**Version :** 1.0

