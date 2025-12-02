# 🤝 Guide Complet - Système de Négociation

## ✅ Système complet implémenté

Le système de négociation permet maintenant aux acheteurs de proposer un prix, aux vendeurs d'accepter/refuser, et de payer après acceptation avec notification automatique.

---

## 🎯 Flux complet de négociation

### **Étape 1 : Proposition (Acheteur)**

1. L'acheteur clique sur **"Négocier"** sur la page produit
2. Il entre un prix inférieur dans la modal
3. La proposition est envoyée
4. Une commande est créée avec :
   - `order_mode = 'negotiation'`
   - `proposed_price = prix proposé en ADA`
   - `status = 'pending'`
5. Un message automatique est envoyé au vendeur

### **Étape 2 : Acceptation/Refus (Vendeur)**

Le vendeur voit dans OrderDetail :
- ✅ **Bouton "Accepter"** → Fixe `final_price` et notifie l'acheteur
- ❌ **Bouton "Refuser"** → Annule la négociation (`escrow_status = 'cancelled'`)

### **Étape 3 : Paiement (Acheteur)**

Si accepté, l'acheteur voit :
- ✅ **Bouton "Payer et mettre en escrow"**
- Au clic : L'argent entre en escrow
- `status = 'escrow_web2'`
- `escrow_status = 'open'`
- **Notification automatique au vendeur** avec le montant

### **Étape 4 : Expédition (Vendeur)**

Le vendeur est notifié et peut :
- Confirmer l'expédition
- Les fonds restent en escrow jusqu'à réception

---

## 📊 États de la négociation

| État | `order_mode` | `proposed_price` | `final_price` | `escrow_status` | `status` |
|------|--------------|------------------|---------------|-----------------|----------|
| **Proposé** | `negotiation` | ✅ Défini | ❌ null | ❌ null | `pending` |
| **Accepté** | `negotiation` | ✅ Défini | ✅ Défini | ❌ null | `pending` |
| **Payé** | `negotiation` | ✅ Défini | ✅ Défini | `open` | `escrow_web2` |
| **Refusé** | `negotiation` | ✅ Défini | ❌ null | `cancelled` | `disputed` |
| **Expédié** | `negotiation` | ✅ Défini | ✅ Défini | `open` | `shipped` |

---

## 🎨 Interface utilisateur

### ProductDetail - Bouton Négocier

```
[Négocier]  [Acheter]
```

### Modal de négociation

- Design premium avec animations
- Calcul en temps réel FC → ADA
- Validation automatique
- Affichage de la réduction

### OrderDetail - Actions selon l'état

#### **Vendeur - Proposition reçue**
```
🤝 Nouvelle proposition de prix
[Refuser] [Accepter]
```

#### **Acheteur - Proposition acceptée**
```
✅ Proposition acceptée !
[Payer et mettre en escrow]
```

#### **Vendeur - Argent en escrow**
```
💰 Argent en escrow
[Confirmer l'expédition]
```

---

## 💬 Messages automatiques

Le système envoie automatiquement des messages :

1. **Proposition envoyée** :
   ```
   💰 Nouvelle proposition de prix : 3000 FC (≈ 2.14 ADA)
   ```

2. **Proposition acceptée** :
   ```
   ✅ Proposition acceptée ! Le prix final est de 2.14 ADA. 
   Vous pouvez maintenant procéder au paiement.
   ```

3. **Paiement effectué** :
   ```
   💰 Paiement effectué ! 3000 FC (≈ 2.14 ADA) sont maintenant 
   en escrow. Vous pouvez expédier le produit.
   ```

4. **Proposition refusée** :
   ```
   ❌ Proposition refusée. La négociation est annulée.
   ```

---

## 🔧 Fonctions implémentées

### OrderDetail.tsx

1. **`handleAcceptNegotiation()`**
   - Fixe `final_price = proposed_price`
   - Notifie l'acheteur
   - Message automatique

2. **`handleRejectNegotiation()`**
   - Met `escrow_status = 'cancelled'`
   - Met `status = 'disputed'`
   - Notifie l'acheteur

3. **`handlePayAfterNegotiation()`**
   - Prépare le paiement
   - Met l'argent en escrow
   - Met `status = 'escrow_web2'`
   - Met `escrow_status = 'open'`
   - **Notifie le vendeur avec le montant**

---

## 📱 Notifications

### Vendeur notifié quand :

1. ✅ **Proposition reçue** → Message dans le chat
2. ✅ **Argent en escrow** → Message avec montant exact

### Acheteur notifié quand :

1. ✅ **Proposition acceptée** → Peut payer
2. ✅ **Proposition refusée** → Négociation annulée

---

## 💡 Exemple de flux complet

### Scénario :

1. **Acheteur** : Produit à 3500 FC
2. **Acheteur** : Propose 3000 FC via modal
3. **Système** : Crée commande en négociation
4. **Vendeur** : Reçoit message "💰 Nouvelle proposition : 3000 FC"
5. **Vendeur** : Va sur OrderDetail, clique "Accepter"
6. **Acheteur** : Reçoit message "✅ Proposition acceptée !"
7. **Acheteur** : Va sur OrderDetail, clique "Payer"
8. **Système** : Argent (3000 FC ≈ 2.14 ADA) entre en escrow
9. **Vendeur** : Reçoit notification "💰 Paiement effectué ! 3000 FC (≈ 2.14 ADA) sont en escrow"
10. **Vendeur** : Expédie le produit

---

## 📝 Fichiers modifiés

### ✅ Modifiés :
1. **`frontend/src/pages/ProductDetail.tsx`**
   - Modal de négociation
   - Fonction `handleStartNegotiation()`
   - Fonction `handleSubmitNegotiation()`

2. **`frontend/src/pages/OrderDetail.tsx`**
   - Fonction `handleAcceptNegotiation()`
   - Fonction `handleRejectNegotiation()`
   - Fonction `handlePayAfterNegotiation()`
   - Interface complète pour tous les états
   - Affichage du prix amélioré

---

## ⚠️ Important

1. ✅ La négociation fonctionne uniquement pour les produits avec escrow
2. ✅ Le prix proposé doit être inférieur au prix actuel
3. ✅ L'argent n'est mis en escrow qu'après acceptation et paiement
4. ✅ Le vendeur est automatiquement notifié avec le montant exact en escrow
5. ✅ Les notifications se font via messages dans le chat

---

## 🚀 Résultat

Les utilisateurs peuvent maintenant :
- ✅ Proposer un prix avant l'achat
- ✅ Accepter/refuser les propositions
- ✅ Payer seulement après accord
- ✅ Recevoir des notifications automatiques
- ✅ Voir le montant exact en escrow

**Le système de négociation est maintenant complet et fonctionnel ! 🎉**

