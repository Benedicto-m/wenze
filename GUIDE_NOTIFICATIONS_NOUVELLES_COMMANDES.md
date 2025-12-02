# 🔔 Guide - Notifications pour Nouvelles Commandes Uniquement

## ✅ Modifications apportées

Le système de notifications a été optimisé pour ne compter **uniquement les NOUVELLES commandes** (créées dans les dernières 24 heures), et les produits sont maintenant **retirés du marché immédiatement** après un achat.

---

## 🎯 Notifications - Nouvelles Commandes Uniquement

### **Critères de comptage**

#### **1. Fenêtre temporelle**
- ✅ Uniquement les commandes créées dans les **dernières 24 heures**
- ✅ Les anciennes commandes ne sont plus comptabilisées

#### **2. Pour le vendeur**
- ✅ Nouvelles commandes avec statut `pending` (créées dans les 24h)
- ✅ Nouvelles commandes avec statut `escrow_web2` (paiement reçu dans les 24h)
- ✅ Nouvelles négociations en attente (proposées dans les 24h)

#### **3. Pour l'acheteur**
- ✅ Produits expédiés (si la commande est nouvelle)
- ✅ Négociations acceptées en attente de paiement (si nouvelles)

---

## 🛒 Produit Retiré Immédiatement du Marché

### **Moment du retrait**

Le produit est marqué comme `sold` (retiré du marché) dans ces cas :

1. ✅ **Achat direct** (`handleBuy` dans `ProductDetail.tsx`)
   - Après la création de la commande et le paiement
   - Le produit est immédiatement marqué comme `sold`

2. ✅ **Négociation acceptée et payée** (`handlePayAfterNegotiation` dans `OrderDetail.tsx`)
   - Quand l'acheteur paie après acceptation de la négociation
   - Le produit est marqué comme `sold`

### **Note importante**

- ⚠️ Une **négociation en attente** ne retire PAS le produit du marché
- ✅ Le produit n'est retiré que quand la transaction est **confirmée et payée**

---

## 🔧 Implémentation technique

### **1. Notifications - Filtrage par date**

```tsx
const fetchNotificationCount = async () => {
  // Uniquement les commandes créées dans les dernières 24 heures
  const oneDayAgo = new Date();
  oneDayAgo.setHours(oneDayAgo.getHours() - 24);
  const oneDayAgoISO = oneDayAgo.toISOString();

  const { data: orders } = await supabase
    .from('orders')
    .select('id, buyer_id, seller_id, status, created_at, ...')
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .neq('status', 'completed')
    .neq('status', 'disputed')
    .gte('created_at', oneDayAgoISO); // ✅ Filtre par date

  // Compter uniquement les nouvelles commandes...
};
```

### **2. Produit marqué comme vendu - Achat direct**

```tsx
const handleBuy = async () => {
  // Créer la commande
  const { data: orderData } = await supabase
    .from('orders')
    .insert([{...}])
    .select()
    .single();

  // Paiement
  const paymentPrep = await prepareAdaPayment(orderData.id, currentPriceInADA);
  
  // Mettre à jour la commande
  await supabase
    .from('orders')
    .update({ status: 'escrow_web2', ... })
    .eq('id', orderData.id);
  
  // ✅ Marquer le produit comme vendu
  await supabase
    .from('products')
    .update({ status: 'sold' })
    .eq('id', product.id);
};
```

### **3. Produit marqué comme vendu - Négociation payée**

```tsx
const handlePayAfterNegotiation = async () => {
  // Paiement
  const paymentPrep = await prepareAdaPayment(id!, priceToPay);
  
  // Mettre à jour la commande
  await supabase
    .from('orders')
    .update({ status: 'escrow_web2', ... })
    .eq('id', id);

  // ✅ Marquer le produit comme vendu
  if (order?.product_id) {
    await supabase
      .from('products')
      .update({ status: 'sold' })
      .eq('id', order.product_id);
  }
};
```

---

## 📊 Flux complet

### **Achat direct**
```
Acheteur clique "Acheter"
    ↓
Commande créée (status: pending)
    ↓
Paiement effectué
    ↓
Commande mise à jour (status: escrow_web2)
    ↓
✅ Produit marqué comme 'sold'
    ↓
✅ Produit retiré du marché immédiatement
```

### **Négociation**
```
Acheteur propose un prix
    ↓
Commande créée (status: pending, order_mode: negotiation)
    ⚠️ Produit RESTE disponible
    ↓
Vendeur accepte
    ↓
Acheteur paie
    ↓
✅ Produit marqué comme 'sold'
    ↓
✅ Produit retiré du marché
```

---

## 🎯 Résultat

### **Notifications**
- ✅ Seules les **nouvelles commandes** (24h) sont comptées
- ✅ Les anciennes commandes ne polluent plus les notifications
- ✅ Le badge reflète uniquement les activités récentes

### **Marché**
- ✅ Les produits vendus **disparaissent immédiatement** du marché
- ✅ Plus de risque de double vente
- ✅ Expérience utilisateur améliorée

---

## 📂 Fichiers modifiés

### ✅ Navbar.tsx
- Filtrage des commandes par date (dernières 24h)
- Suppression du comptage des messages non lus
- Focus uniquement sur les nouvelles commandes

### ✅ ProductDetail.tsx
- Déjà marquait le produit comme vendu (vérifié ✅)

### ✅ OrderDetail.tsx
- Ajout du marquage du produit comme vendu après paiement de négociation

---

## 🚀 Avantages

✅ **Notifications pertinentes** - Uniquement les nouvelles activités  
✅ **Marché à jour** - Produits vendus retirés immédiatement  
✅ **Pas de confusion** - Les utilisateurs voient uniquement ce qui est nouveau  
✅ **Performance** - Moins de données à traiter pour les notifications  

**Le système est maintenant plus précis et réactif ! 🎉**

