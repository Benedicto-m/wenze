# 🔔 Guide - Notifications de Commandes

## ✅ Fonctionnalité implémentée

Un **badge rouge de notification** apparaît à côté du lien "Commandes" dans la navigation pour avertir l'utilisateur lorsqu'il y a de nouvelles activités dans ses commandes.

---

## 🎯 Ce qui déclenche une notification

### **1. Nouvelles commandes nécessitant une action**

#### **Pour le vendeur :**
- ✅ Commandes avec statut `pending` (en attente de traitement)
- ✅ Commandes avec statut `escrow_web2` (paiement reçu, produit à expédier)
- ✅ Négociations en attente d'acceptation (prix proposé, pas encore accepté)

#### **Pour l'acheteur :**
- ✅ Commandes avec statut `shipped` (produit expédié, à confirmer)
- ✅ Négociations acceptées (paiement en attente)

### **2. Messages non lus**

- ✅ Messages non lus dans les commandes actives
- ✅ Un message non lu par commande (pour éviter le spam)

---

## 🔧 Implémentation technique

### **1. Fonction de comptage**

```tsx
const fetchNotificationCount = async () => {
  // Récupérer toutes les commandes actives
  const { data: orders } = await supabase
    .from('orders')
    .select('id, buyer_id, seller_id, status, updated_at, order_mode, proposed_price, final_price, escrow_status')
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .neq('status', 'completed')
    .neq('status', 'disputed');

  let count = 0;

  // Compter les commandes nécessitant une action
  for (const order of orders) {
    const isBuyer = order.buyer_id === user.id;
    const isSeller = order.seller_id === user.id;

    // Actions pour le vendeur
    if (isSeller) {
      if (order.status === 'pending' || order.status === 'escrow_web2') {
        count++;
      }
      if (order.order_mode === 'negotiation' && order.proposed_price && !order.final_price) {
        count++;
      }
    }

    // Actions pour l'acheteur
    if (isBuyer) {
      if (order.status === 'shipped') {
        count++;
      }
      if (order.order_mode === 'negotiation' && order.final_price && order.escrow_status !== 'open') {
        count++;
      }
    }
  }

  // Compter les messages non lus (un par commande)
  const { data: unreadMessages } = await supabase
    .from('messages')
    .select('id, order_id, sender_id, is_read')
    .in('order_id', orderIds)
    .eq('is_read', false)
    .neq('sender_id', user.id);

  const uniqueOrderIds = [...new Set(unreadMessages.map(m => m.order_id))];
  count += uniqueOrderIds.length;

  setNotificationCount(count);
};
```

### **2. Polling automatique**

- ✅ Vérification toutes les **10 secondes**
- ✅ Se déclenche uniquement si l'utilisateur est connecté
- ✅ S'arrête automatiquement lors de la déconnexion

```tsx
useEffect(() => {
  if (user) {
    fetchNotificationCount();
    const interval = setInterval(() => {
      fetchNotificationCount();
    }, 10000); // 10 secondes
    return () => clearInterval(interval);
  } else {
    setNotificationCount(0);
  }
}, [user]);
```

---

## 🎨 Interface utilisateur

### **Desktop**

```
┌─────────────────────────────────┐
│ WENZE                           │
│                                 │
│ Marché  [Commandes 🔴3]        │
│                                 │
└─────────────────────────────────┘
```

- Badge rouge avec animation pulse
- Positionné en haut à droite du texte "Commandes"
- Affiche le nombre de notifications (max 99+)

### **Mobile**

```
┌─────────────────────────────────┐
│ Menu                            │
│                                 │
│ 📦 Mes commandes      [🔴3]     │
│                                 │
└─────────────────────────────────┘
```

- Même badge rouge
- Positionné à droite du texte
- Responsive et adaptatif

---

## 🎯 Statuts de commande surveillés

### **Commandes exclues**
- ❌ `completed` - Commande terminée
- ❌ `disputed` - Commande en litige

### **Commandes surveillées**
- ✅ `pending` - En attente
- ✅ `escrow_web2` - Paiement reçu
- ✅ `shipped` - Expédiée

---

## 🔄 Comptage intelligent

### **1. Éviter les doublons**
- Un seul compte par commande nécessitant une action
- Un seul compte par commande pour les messages non lus

### **2. Priorisation**
- Les commandes nécessitant une action ont la priorité
- Les messages non lus s'ajoutent au compteur

### **3. Limite d'affichage**
- Si plus de 99 notifications : affiche "99+"
- Badge toujours visible si `count > 0`

---

## 📱 Responsive

### **Desktop**
```tsx
<Link to="/orders" className="relative ...">
  Commandes
  {notificationCount > 0 && (
    <span className="absolute -top-1 -right-1 ...">
      {notificationCount > 99 ? '99+' : notificationCount}
    </span>
  )}
</Link>
```

### **Mobile**
```tsx
<Link to="/orders" className="relative ...">
  <span>Mes commandes</span>
  {notificationCount > 0 && (
    <span className="absolute right-4 ...">
      {notificationCount > 99 ? '99+' : notificationCount}
    </span>
  )}
</Link>
```

---

## 🎨 Style du badge

- **Couleur** : Rouge (`bg-red-500`)
- **Animation** : Pulse (`animate-pulse`)
- **Ombre** : `shadow-lg`
- **Taille** : Minimum 18px, adaptatif
- **Police** : Bold, texte blanc

---

## ⚡ Performance

### **Optimisations**
- ✅ Polling toutes les 10 secondes (pas trop fréquent)
- ✅ Requêtes filtrées (uniquement commandes actives)
- ✅ Nettoyage automatique lors de la déconnexion
- ✅ Comptage uniquement si l'utilisateur est connecté

### **Limites**
- ✅ Maximum 99+ affiché pour éviter les nombres trop longs
- ✅ Un seul message non lu par commande comptabilisé

---

## 📂 Fichiers modifiés

### ✅ Navbar.tsx

- Ajout de `notificationCount` state
- Ajout de `fetchNotificationCount()` fonction
- Ajout du polling automatique (10 secondes)
- Ajout du badge sur le lien "Commandes" (desktop)
- Ajout du badge sur le lien "Commandes" (mobile)
- Import de l'icône `Bell` (pour usage futur)

---

## 🚀 Résultat

L'utilisateur voit maintenant :

✅ **Badge rouge animé** quand il y a des nouvelles activités  
✅ **Nombre précis** de notifications à traiter  
✅ **Mise à jour automatique** toutes les 10 secondes  
✅ **Visible sur mobile et desktop**  
✅ **Disparaît automatiquement** quand toutes les activités sont traitées  

**L'expérience utilisateur est maintenant encore plus réactive ! 🎉**

