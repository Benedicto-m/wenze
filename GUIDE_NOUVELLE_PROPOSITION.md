# 🔄 Guide - Nouvelle Proposition Après Refus

## ✅ Fonctionnalité ajoutée

L'acheteur peut maintenant proposer un nouveau prix après qu'une proposition ait été refusée par le vendeur.

---

## 🎯 Fonctionnement

### **Scénario :**

1. **Acheteur** : Propose un prix (ex: 3000 FC)
2. **Vendeur** : Refuse la proposition
3. **Acheteur** : Discute avec le vendeur dans le chat
4. **Acheteur** : Peut proposer un nouveau prix (ex: 3200 FC)
5. **Vendeur** : Peut accepter ou refuser la nouvelle proposition

---

## 📊 États de la négociation

### Après un refus :

- `escrow_status = 'cancelled'`
- `status = 'disputed'` (temporaire)
- `proposed_price` reste défini (pour référence)

### Après une nouvelle proposition :

- `escrow_status = null` (réinitialisé)
- `status = 'pending'` (retour à l'état initial)
- `proposed_price` = nouveau prix proposé
- `final_price = null` (réinitialisé)

---

## 🎨 Interface utilisateur

### Section "Proposition refusée"

Quand une proposition est refusée, l'acheteur voit :

```
❌ Proposition refusée
La négociation a été annulée par le vendeur. 
Vous pouvez discuter dans le chat et proposer un nouveau prix si nécessaire.

[Proposer un nouveau prix]
```

### Modal de nouvelle proposition

- **Design premium** avec animations
- **Affichage du prix précédent** (refusé)
- **Calcul en temps réel** FC → ADA
- **Validation automatique**
- **Conseil** : "Après discussion avec le vendeur..."

---

## 💬 Messages automatiques

### Quand une nouvelle proposition est envoyée :

```
💰 Nouvelle proposition de prix : 3200 FC (≈ 2.29 ADA)
```

Le vendeur reçoit ce message automatiquement dans le chat.

---

## 🔧 Fonction implémentée

### `handleProposeNewPrice()`

Cette fonction :
1. Valide le nouveau prix proposé
2. Réinitialise l'état de négociation
3. Met à jour `proposed_price` avec le nouveau prix
4. Remet `status = 'pending'` et `escrow_status = null`
5. Envoie un message automatique au vendeur

---

## 🔄 Flux complet

```
Proposition initiale (3000 FC)
    ↓
Refus par le vendeur
    ↓
Discussion dans le chat
    ↓
Nouvelle proposition (3200 FC)
    ↓
Le vendeur peut accepter/refuser
    ↓
Si accepté → Paiement → Escrow
```

---

## ⚠️ Important

1. ✅ L'acheteur peut proposer **plusieurs fois** si nécessaire
2. ✅ Chaque nouvelle proposition **réinitialise** l'état précédent
3. ✅ Le vendeur est **notifié** à chaque nouvelle proposition
4. ✅ La discussion dans le chat permet de **négocier** avant de proposer

---

## 📝 Fichiers modifiés

### ✅ Modifié :
1. **`frontend/src/pages/OrderDetail.tsx`**
   - Ajout de la fonction `handleProposeNewPrice()`
   - Bouton "Proposer un nouveau prix" après refus
   - Modal de nouvelle proposition
   - Réinitialisation de l'état de négociation

---

## 🚀 Résultat

Les utilisateurs peuvent maintenant :
- ✅ Proposer plusieurs prix si nécessaire
- ✅ Négocier dans le chat avant de proposer
- ✅ Relancer une négociation après un refus
- ✅ Voir l'historique des propositions

**Le système de négociation est maintenant encore plus flexible ! 🎉**

