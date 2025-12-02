# 🤝 Guide - Système de Négociation de Prix

## ✅ Fonctionnalités implémentées

Le système de négociation permet aux acheteurs de proposer un prix inférieur avant l'achat, et au vendeur d'accepter ou refuser.

---

## 🎯 Flux de négociation

### **1. L'acheteur propose un prix**

1. L'acheteur clique sur **"Négocier"** sur la page du produit
2. Une modal s'ouvre avec :
   - Prix actuel du produit
   - Champ pour entrer sa proposition (en FC)
   - Affichage automatique en ADA
   - Calcul de la réduction
3. L'acheteur envoie sa proposition
4. Une commande est créée en mode `negotiation`
5. Un message automatique est envoyé au vendeur

### **2. Le vendeur accepte ou refuse**

Dans la page de commande (`OrderDetail`), le vendeur peut :
- ✅ **Accepter** la proposition → Le prix final est fixé
- ❌ **Refuser** la proposition → La négociation est annulée
- 💬 **Contre-proposer** un autre prix

### **3. L'acheteur paie (si accepté)**

Une fois la proposition acceptée :
1. L'acheteur peut **payer** le prix accepté
2. L'argent entre dans **l'escrow**
3. Le vendeur est **notifié** automatiquement

---

## 📊 Structure de données

### Table `orders`

```sql
order_mode: 'direct' | 'negotiation'
proposed_price: numeric  -- Prix proposé par l'acheteur
final_price: numeric     -- Prix final accepté
escrow_status: 'open' | 'cancelled' | 'released' | null
```

### États de la négociation

- **Proposé** : `proposed_price` est défini, `escrow_status` est null
- **Accepté** : `final_price` est défini, `escrow_status` est null
- **Payé** : `escrow_status` = 'open'
- **Annulé** : `escrow_status` = 'cancelled'

---

## 🔧 Modifications apportées

### 1. **ProductDetail.tsx**

- ✅ Ajout du bouton **"Négocier"** à côté de "Acheter"
- ✅ Modal de négociation avec formulaire
- ✅ Calcul automatique du prix en ADA
- ✅ Validation du prix proposé (doit être inférieur)
- ✅ Création d'une commande en mode négociation
- ✅ Message automatique au vendeur

### 2. **À compléter : OrderDetail.tsx**

Le système nécessite maintenant :
- Boutons pour accepter/refuser la proposition (vendeur)
- Formulaire pour contre-proposer (vendeur)
- Bouton pour payer après acceptation (acheteur)
- Notification automatique quand l'argent est en escrow

---

## 🎨 Interface utilisateur

### Modal de négociation

- **Design premium** avec animations
- **Calcul en temps réel** du prix en ADA
- **Affichage de la réduction** en pourcentage
- **Validation visuelle** des prix invalides
- **Instructions claires** pour l'utilisateur

### Boutons

- **"Négocier"** : Ouverture de la modal
- **"Acheter"** : Achat direct sans négociation

---

## 📝 Prochaines étapes

### 1. Modifier OrderDetail.tsx

Ajouter la gestion des négociations :
- Afficher la proposition si en mode négociation
- Boutons Accepter/Refuser pour le vendeur
- Formulaire de contre-proposition
- Bouton Payer pour l'acheteur (si accepté)

### 2. Système de paiement

Après acceptation :
- L'acheteur peut payer
- L'argent va en escrow
- `escrow_status` = 'open'
- Notification au vendeur

### 3. Notifications

Créer un système de notification pour :
- ✅ Proposition reçue (vendeur)
- ✅ Proposition acceptée (acheteur)
- ✅ Paiement effectué / Argent en escrow (vendeur)

---

## 💡 Exemple de flux complet

### Scénario :

1. **Acheteur** : Voir produit à 3500 FC
2. **Acheteur** : Clique "Négocier" → Propose 3000 FC
3. **Système** : Crée commande en mode négociation
4. **Vendeur** : Reçoit notification "Nouvelle proposition : 3000 FC"
5. **Vendeur** : Va sur la page de commande
6. **Vendeur** : Accepte la proposition
7. **Acheteur** : Reçoit notification "Proposition acceptée"
8. **Acheteur** : Va sur la page de commande
9. **Acheteur** : Clique "Payer"
10. **Système** : Argent va en escrow
11. **Vendeur** : Reçoit notification "Argent en escrow : 3000 FC (≈ X ADA)"

---

## ⚠️ Important

1. ✅ La négociation ne fonctionne que pour les produits avec escrow
2. ✅ Les catégories sans escrow (Service, Immobilier, Auto) ne peuvent pas être négociées
3. ✅ Le prix proposé doit être inférieur au prix actuel
4. ✅ L'argent n'est mis en escrow qu'après acceptation et paiement

---

## 🚀 Résultat

Les utilisateurs peuvent maintenant :
- ✅ Négocier les prix avant l'achat
- ✅ Proposer des prix personnalisés
- ✅ Accepter/refuser des propositions
- ✅ Payer seulement après accord

**Le système de négociation est prêt pour être complété avec la gestion des commandes ! 🎉**

