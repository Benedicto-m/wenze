# 💰 Guide - Prix FC Fixe / ADA Variable

## ✅ Changement important

Le système de prix a été modifié pour que :
- **Le prix en FC reste fixe** (statique) - si l'utilisateur met 3500 FC, ça reste 3500 FC
- **Seul le prix en ADA varie** selon le marché boursier
- Si le taux de change change, c'est le montant ADA qui s'ajuste, pas le FC

---

## 🎯 Fonctionnement

### Avant (ancien système)
- L'utilisateur entrait un prix en FC
- Le système le convertissait en ADA une fois et stockait les deux valeurs
- Les deux prix étaient fixes

### Maintenant (nouveau système)
- L'utilisateur entre un prix en FC (ex: 3500 FC)
- **Le FC reste fixe** : 3500 FC ne change jamais
- **L'ADA est calculé en temps réel** : Si le taux change, seul l'ADA change
  - Exemple : Si 1 ADA = 1400 FC → 3500 FC = 2.50 ADA
  - Si le taux devient 1 ADA = 1500 FC → 3500 FC = 2.33 ADA (l'ADA a changé, pas le FC)

---

## 📊 Exemple concret

### Scénario :

1. **Publication du produit** :
   - Utilisateur entre : **3500 FC**
   - Taux actuel : 1 ADA = 1400 FC
   - Prix en ADA calculé : 3500 / 1400 = **2.50 ADA**
   - Le système stocke :
     - `price_fc = 3500` (fixe)
     - `price_ada = 2.50` (pour rétrocompatibilité)

2. **Affichage quelques jours plus tard** :
   - Taux actuel : 1 ADA = 1500 FC (a changé !)
   - Prix en FC affiché : **3500 FC** (fixe, n'a pas changé)
   - Prix en ADA recalculé : 3500 / 1500 = **2.33 ADA** (a changé selon le marché)

3. **Commande passée** :
   - L'acheteur paie : **2.33 ADA** (le prix actuel)
   - Le vendeur reçoit l'équivalent de : **3500 FC** (le prix fixe)

---

## 🔧 Modifications techniques

### 1. Base de données

**Migration ajoutée** : `supabase/migrations/add_price_fc_column.sql`
- Ajoute la colonne `price_fc` dans la table `products`
- `price_fc` : Prix fixe en Francs Congolais (FC)
- `price_ada` : Conservé pour rétrocompatibilité

### 2. Création de produit (`CreateProduct.tsx`)

- L'utilisateur entre le prix en FC
- Le système stocke :
  - `price_fc` : Le prix en FC (fixe)
  - `price_ada` : Calculé au moment de la création (pour rétrocompatibilité)

### 3. Affichage des produits

**Tous les affichages recalculent l'ADA depuis le FC avec le taux actuel** :
- `Products.tsx` - Liste des produits
- `ProductDetail.tsx` - Détail du produit
- `SellerProfile.tsx` - Profil du vendeur

### 4. Commande (`ProductDetail.tsx`)

- Au moment de la commande, le système :
  - Récupère `price_fc` (fixe)
  - Recalcule `price_ada` avec le taux actuel
  - L'acheteur paie le montant ADA calculé

### 5. Édition de produit (`EditProduct.tsx`)

- L'utilisateur peut modifier le prix en FC
- Le nouveau prix en FC devient la nouvelle valeur fixe
- L'ADA est recalculé automatiquement

---

## 💡 Logique de calcul

### Fonction helper dans `ProductDetail.tsx` :

```typescript
// Obtenir le prix en FC (fixe)
const getPriceInFC = (product: Product): number => {
  return product.price_fc || convertADAToFC(product.price_ada);
};

// Calculer le prix en ADA depuis le FC (taux actuel)
const getCurrentPriceInADA = (product: Product): number => {
  const priceInFC = getPriceInFC(product);
  return convertFCToADA(priceInFC); // Utilise le taux actuel
};
```

### Rétrocompatibilité

- Si `price_fc` existe → Utiliser `price_fc` (nouveau système)
- Si `price_fc` n'existe pas → Convertir depuis `price_ada` (ancien système)

---

## 📝 Fichiers modifiés

### ✅ Migration créée :
1. `supabase/migrations/add_price_fc_column.sql` - Ajoute la colonne `price_fc`

### ✅ Fichiers modifiés :
1. `frontend/src/pages/CreateProduct.tsx` - Stocke `price_fc`
2. `frontend/src/pages/EditProduct.tsx` - Utilise et sauvegarde `price_fc`
3. `frontend/src/pages/Products.tsx` - Recalcule ADA depuis FC
4. `frontend/src/pages/ProductDetail.tsx` - Recalcule ADA depuis FC
5. `frontend/src/pages/SellerProfile.tsx` - Recalcule ADA depuis FC

---

## 🔄 Flux de données

### Création de produit :
```
Utilisateur entre : 3500 FC
    ↓
Système stocke :
    - price_fc = 3500 (fixe)
    - price_ada = 2.50 (calculé au moment de la création)
```

### Affichage de produit :
```
Système récupère : price_fc = 3500
    ↓
Système récupère : Taux actuel (ex: 1 ADA = 1500 FC)
    ↓
Système calcule : price_ada = 3500 / 1500 = 2.33 ADA
    ↓
Affichage :
    - 3500 FC (fixe)
    - ≈ 2.33 ADA (temps réel)
```

### Commande :
```
Acheteur clique sur "Acheter"
    ↓
Système calcule : price_ada = price_fc / taux_actuel
    ↓
Commande créée avec : amount_ada = 2.33 ADA
    ↓
L'acheteur paie : 2.33 ADA
```

---

## ⚠️ Important

1. ✅ **Le prix en FC est fixe** - Ne change jamais après la publication
2. ✅ **Le prix en ADA varie** - Recalculé automatiquement avec le taux actuel
3. ✅ **Rétrocompatibilité** - Les anciens produits (sans `price_fc`) fonctionnent toujours
4. ✅ **Taux en temps réel** - L'ADA est toujours calculé avec le dernier taux de change

---

## 🎨 Indicateur visuel

Un badge "Temps réel" apparaît à côté du prix en ADA pour indiquer que c'est calculé en temps réel :
```
3500 FC
≈ 2.33 ADA 🟢 Temps réel
```

---

## 🚀 Résultat

Les utilisateurs de Goma peuvent maintenant :
- ✅ Fixer leur prix en FC (monnaie locale qu'ils comprennent)
- ✅ Le prix en FC reste stable et prévisible
- ✅ Le prix en ADA s'ajuste automatiquement selon le marché
- ✅ Pas besoin de modifier le prix quand le taux change

**Le système est maintenant adapté aux utilisateurs locaux ! 🎉**

