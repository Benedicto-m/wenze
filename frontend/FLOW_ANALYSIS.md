# Analyse du Flow Escrow - Comparaison avec le Flow Pensé

## 📋 Flow Pensé vs Flow Actuel

### 1️⃣ Buyer crée la commande (LOCK) - ON-CHAIN

**Flow Pensé :**
- ✅ Buyer signe une transaction
- ✅ Envoie amount vers l'adresse du script
- ✅ Ajoute datum EscrowDatum (order_id, buyer, seller, amount, deadline)
- ✅ Résultat : 1 UTxO verrouillé, fonds bloqués
- ✅ Aucune signature seller requise

**Flow Actuel :**
- ✅ Buyer signe une transaction (`lockFundsInEscrow`)
- ✅ Envoie amount vers l'adresse du script
- ❌ **PROBLÈME** : Datum est juste une chaîne vide `Data.to('')` au lieu d'un EscrowDatum structuré
- ✅ Résultat : 1 UTxO verrouillé, fonds bloqués
- ✅ Aucune signature seller requise

**🔧 À CORRIGER :**
- Le datum doit être un `EscrowDatum` structuré avec :
  - `order_id`: string
  - `buyer`: VerificationKeyHash
  - `seller`: VerificationKeyHash
  - `amount`: bigint
  - `deadline`: bigint (timestamp)

---

### 2️⃣ Seller voit la commande - OFF-CHAIN

**Flow Pensé :**
- ✅ Backend / indexer détecte l'UTxO escrow
- ✅ UI affiche : "Nouvelle commande"
- ✅ Seller clique Accept / Reject
- ✅ Aucune transaction blockchain ici

**Flow Actuel :**
- ❓ **À VÉRIFIER** : Comment le seller détecte-t-il la nouvelle commande ?
- ✅ UI affiche probablement les commandes depuis la DB
- ❓ **À VÉRIFIER** : Y a-t-il un bouton Accept/Reject pour le seller ?

**🔧 À IMPLÉMENTER/VÉRIFIER :**
- Système de détection des nouveaux UTXOs escrow (indexer ou polling)
- UI pour le seller avec boutons Accept/Reject

---

### 3️⃣ Seller accepte - OFF-CHAIN

**Flow Pensé :**
- ✅ Mise à jour en base de données
- ✅ Statut = accepted
- ✅ Buyer est notifié
- ✅ Avantage : Pas de tx inutile, pas de datum compliqué

**Flow Actuel :**
- ❓ **À VÉRIFIER** : Comment le seller accepte-t-il ?
- ✅ Probablement via mise à jour DB (status = 'accepted' ou similaire)
- ❓ **À VÉRIFIER** : Notification au buyer

**🔧 À IMPLÉMENTER/VÉRIFIER :**
- Fonction pour que le seller accepte (update DB seulement)
- Système de notification

---

### 4️⃣ Buyer confirme l'échange réel - OFF-CHAIN

**Flow Pensé :**
- ✅ Chat
- ✅ Rencontre
- ✅ Livraison
- ✅ Validation humaine
- ✅ Rien sur la blockchain

**Flow Actuel :**
- ✅ Chat disponible (ChatBox component)
- ✅ Validation humaine via UI
- ✅ Pas de transaction blockchain

**✅ CORRECT :** Ce flow est bien implémenté

---

### 5️⃣ Buyer clique "Release funds" - ON-CHAIN (CRITIQUE)

**Flow Pensé :**
- ✅ Transaction de libération :
  - Consomme l'UTxO escrow
  - Fournit le datum original
  - redeemer = Release
  - Signée par buyer
- ✅ Le script vérifie :
  - `txSignedBy buyer`
  - `currentTime < deadline`
- ✅ Si OK : Les fonds vont au seller

**Flow Actuel :**
- ✅ Transaction de libération (`releaseFundsFromEscrowV2`)
- ✅ Consomme l'UTxO escrow
- ❌ **PROBLÈME** : Redeemer est `Constr(0, [])` au lieu de `Release`
- ✅ Signée par buyer
- ❌ **PROBLÈME MAJEUR** : Le script AlwaysSucceeds ne vérifie RIEN !
  - Pas de vérification `txSignedBy buyer`
  - Pas de vérification `currentTime < deadline`
- ✅ Si OK : Les fonds vont au seller
- ❌ **ERREUR ACTUELLE** : "unexpected type u8" lors de la sérialisation

**🔧 À CORRIGER :**
1. Le redeemer doit être `Release` (pas `Constr(0, [])`)
2. Le script doit vérifier :
   - Signature du buyer
   - Deadline (currentTime < deadline)
3. Résoudre l'erreur de sérialisation

---

### 6️⃣ Timeout → Refund possible - ON-CHAIN

**Flow Pensé :**
- ✅ Si `now >= deadline` :
  - Transaction de remboursement
  - Consomme l'UTxO escrow
  - Redeemer = Refund
  - Signée par buyer
- ✅ Le script vérifie :
  - `txSignedBy buyer`
  - `currentTime >= deadline`
- ✅ Fonds retournés au buyer

**Flow Actuel :**
- ✅ Fonction `cancelEscrow` existe
- ❌ **PROBLÈME** : Utilise le même script AlwaysSucceeds qui ne vérifie rien
- ❌ **PROBLÈME** : Redeemer est `Constr(0, [])` au lieu de `Refund`
- ❌ **PROBLÈME** : Pas de vérification de deadline

**🔧 À CORRIGER :**
1. Le redeemer doit être `Refund` (pas `Constr(0, [])`)
2. Le script doit vérifier :
   - Signature du buyer
   - Deadline (currentTime >= deadline)
3. Les fonds doivent retourner au buyer (pas au seller)

---

## 🎯 Résumé des Problèmes

### Problèmes Critiques :
1. ❌ **Script AlwaysSucceeds** : Ne vérifie rien (signature, deadline)
2. ❌ **Datum vide** : Devrait être un EscrowDatum structuré
3. ❌ **Redeemer incorrect** : Devrait être `Release` ou `Refund`, pas `Constr(0, [])`
4. ❌ **Erreur de sérialisation** : "unexpected type u8" bloque tout

### Problèmes Mineurs :
1. ❓ Détection automatique des nouveaux UTXOs escrow
2. ❓ Flow d'acceptation/rejet du seller
3. ❓ Système de notification

---

## 🔧 Solutions Proposées

### Solution 1 : Utiliser le contrat Aiken (Recommandé)
- Compiler le contrat Aiken existant (`escrow.ak`)
- Il a déjà la logique correcte :
  - Vérification de signature buyer
  - Vérification de deadline
  - Redeemers `Release` et `Cancel`
  - Datum structuré `EscrowDatum`

### Solution 2 : Corriger le script AlwaysSucceeds
- Créer un script Plutus V2 qui vérifie vraiment
- Mais cela nécessite un compilateur Plutus

### Solution 3 : Utiliser MeshSDK Escrow Contract
- MeshSDK a un contrat escrow intégré
- Mais nous avons eu des problèmes de compatibilité avant

---

## 📝 Recommandation

**Utiliser le contrat Aiken** car :
1. ✅ Il est déjà écrit avec la bonne logique
2. ✅ Il correspond exactement au flow pensé
3. ✅ Il vérifie les signatures et deadlines
4. ✅ Il utilise les bons redeemers

**Prochaines étapes :**
1. Corriger les problèmes de compilation Aiken
2. Compiler le contrat
3. Utiliser le script compilé dans `escrowContract.ts`
4. Adapter le code pour utiliser le datum structuré et les bons redeemers

