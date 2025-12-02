# 💱 Guide - Conversion FC (Francs Congolais) vers ADA

## ✅ Fonctionnalité implémentée

Le système permet maintenant aux utilisateurs de **saisir le prix en FC** (Francs Congolais) lors de la publication d'un produit. L'application convertit automatiquement ce montant en ADA pour le stockage et l'affichage.

---

## 🎯 Fonctionnement

### 1. **Lors de la publication** (CreateProduct.tsx)
- L'utilisateur saisit le **prix en FC** dans un champ dédié
- La conversion en **ADA** s'affiche en temps réel sous le champ
- Le taux de change actuel est visible (ex: 1 ADA = 2 400 FC)
- Le prix en **ADA est stocké** dans la base de données

### 2. **Sur le marché** (Products.tsx)
- Les produits affichent le **prix en FC en grand**
- La conversion en **ADA est visible** en petit en dessous
- Format : `12 000 FC` (grand) et `≈ 5.00 ADA` (petit)

### 3. **Sur la page produit** (ProductDetail.tsx)
- Le **prix principal est en FC**
- La conversion en **ADA est affichée** en dessous
- Format similaire au marché

---

## 💻 Configuration du taux de change

### Taux par défaut

Le taux par défaut est défini dans `frontend/src/utils/currencyConverter.ts` :

```typescript
const FC_TO_ADA_RATE = 2400; // 1 ADA = 2400 FC
```

### Modifier le taux de change

#### Option 1 : Dans le code (permanent)

Modifiez la constante dans `currencyConverter.ts` :

```typescript
const FC_TO_ADA_RATE = 2500; // Nouveau taux (1 ADA = 2500 FC)
```

#### Option 2 : Depuis la console du navigateur (temporaire)

Ouvrez la console (F12) et exécutez :

```javascript
// Récupérer le service de conversion
import { setExchangeRate } from './utils/currencyConverter';

// Définir un nouveau taux (ex: 1 ADA = 2500 FC)
setExchangeRate(2500);

// Le taux sera sauvegardé dans localStorage
```

#### Option 3 : Dans l'application (futur)

Vous pouvez créer une page d'administration pour gérer le taux de change.

---

## 📊 Taux de change stocké

Le taux de change est sauvegardé dans le **localStorage** du navigateur :
- Clé : `fc_to_ada_rate`
- Format : nombre (ex: `2400`)
- Persiste entre les sessions

---

## 🔧 Structure technique

### Fichier : `frontend/src/utils/currencyConverter.ts`

Contient :
- ✅ Service de conversion FC ↔ ADA
- ✅ Formatage des montants (FC et ADA)
- ✅ Gestion du taux de change
- ✅ Sauvegarde dans localStorage

### Fonctions principales :

```typescript
// Convertir FC vers ADA
convertFCToADA(amountFC: number): number

// Convertir ADA vers FC
convertADAToFC(amountADA: number): number

// Formater un montant FC
formatFC(amount: number): string

// Formater un montant ADA
formatADA(amount: number): string

// Récupérer le taux actuel
getExchangeRate(): number

// Définir un nouveau taux
setExchangeRate(rate: number): void
```

---

## 📝 Fichiers modifiés

### ✅ Créés :
- `frontend/src/utils/currencyConverter.ts` - Service de conversion

### ✅ Modifiés :
- `frontend/src/pages/CreateProduct.tsx` - Saisie en FC avec conversion
- `frontend/src/pages/EditProduct.tsx` - Édition en FC avec conversion
- `frontend/src/pages/Products.tsx` - Affichage en FC avec ADA visible
- `frontend/src/pages/ProductDetail.tsx` - Affichage en FC avec ADA visible

---

## 💡 Exemple d'affichage

### Sur le marché :
```
┌─────────────────────┐
│ 12 000 FC          │
│ ≈ 5.00 ADA         │
└─────────────────────┘
```

### Sur la page produit :
```
┌─────────────────────┐
│ 12 000 FC          │
│ ≈ 5.00 ADA         │
│                     │
│ Taux: 1 ADA = 2 400 FC │
└─────────────────────┘
```

### Lors de la publication :
```
┌─────────────────────┐
│ Prix (Francs Congolais) │
│ [12 000] FC         │
│                     │
│ 📈 Équivalent en ADA: │
│ 5.00 ADA            │
│ Taux: 1 ADA = 2 400 FC │
└─────────────────────┘
```

---

## ⚙️ Mise à jour du taux de change

### Taux de référence

Pour Goma, RDC, vous pouvez utiliser :
- **Taux approximatif actuel** : 1 ADA ≈ 2 000 - 2 500 FC
- Ce taux doit être **mis à jour régulièrement** selon le marché

### Sources pour le taux

Vous pouvez récupérer le taux depuis :
- Un partenaire d'échange local
- Une API de taux de change crypto
- Une configuration manuelle dans l'admin

---

## 📌 Notes importantes

1. ✅ Le prix est **toujours stocké en ADA** dans la base de données
2. ✅ L'affichage est **prioritairement en FC** pour la compréhension locale
3. ✅ La conversion est **automatique** et **transparente**
4. ✅ Le taux de change peut être **modifié facilement**

---

## 🚀 Prochaines améliorations possibles

- [ ] Page d'administration pour gérer le taux de change
- [ ] Récupération automatique du taux depuis une API
- [ ] Historique des taux de change
- [ ] Notification quand le taux change significativement

---

**Tout est prêt ! Les utilisateurs peuvent maintenant publier leurs produits en FC. ✅**

