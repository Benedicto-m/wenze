# 📋 Modifications - Nouvelles Catégories et Fonctionnalités

## ✅ Catégories à ajouter

1. Électronique (déjà existante)
2. Mode (déjà existante) 
3. **Aliments** (nouveau)
4. **Beauté & Hygiène** (nouveau)
5. **Bricolage & Matériaux** (nouveau)
6. Services (déjà existante)
7. **Immobilier** (nouveau)
8. **Auto & Moto** (nouveau)
9. Autres (avec possibilité de catégorie personnalisée)

## ⚠️ Catégories sans escrow (contact direct)

- Services
- Immobilier
- Auto & Moto

Ces catégories nécessitent WhatsApp ou Email obligatoire lors de la publication.

## 🎯 Fonctionnalités à ajouter

1. ✅ Modification de produit par le propriétaire
2. ✅ Suppression de produit par le propriétaire
3. ✅ Catégorie personnalisée pour "Autres"
4. ✅ Modal de contact pour catégories sans escrow

## 📝 Fichiers à modifier

### 1. Products.tsx
- ✅ Catégories mises à jour
- ✅ Logique bouton "Contacter" vs "Acheter"

### 2. CreateProduct.tsx  
- ✅ Nouvelles catégories
- ✅ Champ catégorie personnalisée
- ✅ Champs contact pour catégories sans escrow

### 3. ProductDetail.tsx
- ⏳ Modal de contact pour catégories sans escrow
- ⏳ Boutons modifier/supprimer pour propriétaire

### 4. Nouveau: EditProduct.tsx
- ⏳ Page de modification de produit

### 5. Migration SQL
- ⏳ Ajouter champ custom_category si nécessaire

---

**Status**: En cours d'implémentation

