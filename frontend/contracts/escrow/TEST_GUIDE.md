# Guide de Test - Contrat Escrow Aiken

Ce guide vous explique comment tester le contrat escrow compilé depuis Aiken et vérifier que toutes les transactions fonctionnent correctement.

## 📋 Prérequis

### 1. Configuration
- ✅ Wallet Cardano connecté (Nami, Eternl, ou autre compatible CIP-30)
- ✅ Réseau : **Preprod Testnet** (pour les tests)
- ✅ Fonds suffisants dans le wallet :
  - Au moins **10 ADA** pour les tests
  - Plus pour couvrir les frais de transaction et le minimum ADA requis

### 2. Vérification du contrat
```bash
cd frontend/contracts/escrow
aiken build
```
✅ Vérifiez que la compilation réussit et génère `plutus.json` avec les validators.

### 3. Vérification du frontend
```bash
cd frontend
npm run dev
```
✅ Vérifiez que l'application démarre sans erreurs.

---

## 🧪 Tests à Effectuer

### Test 1 : Verrouillage des fonds (LOCK)

**Objectif** : Vérifier que les fonds peuvent être verrouillés dans l'escrow avec le datum structuré.

#### Étapes :

1. **Ouvrir l'application** dans le navigateur
2. **Connecter votre wallet** (Preprod Testnet)
3. **Naviguer vers un produit** et cliquer sur "Acheter"
4. **Remplir les informations** :
   - Montant : **2 ADA** (pour commencer petit)
   - Adresse du vendeur : Utilisez une autre adresse de test ou la même
5. **Confirmer la transaction**

#### Vérifications :

✅ **Dans la console du navigateur (F12)** :
```
✅ Adresse du script escrow (V3 Aiken): addr_test1...
🔒 Création du datum EscrowDatum structuré...
✅ Datum EscrowDatum créé avec: { orderId, buyer, seller, amount, deadline }
✅ Transaction soumise: <txHash>
```

✅ **Dans l'explorateur Cardano** :
- Allez sur https://preprod.cardanoscan.io/transaction/<txHash>
- Vérifiez que :
  - La transaction est confirmée
  - Il y a un output vers l'adresse escrow
  - Le datum est présent (inline)
  - Le montant correspond (2 ADA + minimum ADA requis)

✅ **Dans l'application** :
- La commande apparaît avec le statut "En attente"
- L'UTXO escrow est créé

---

### Test 2 : Libération des fonds (RELEASE)

**Objectif** : Vérifier que l'acheteur peut libérer les fonds au vendeur avec la signature.

#### Prérequis :
- ✅ Avoir complété le Test 1 (fond verrouillé)
- ✅ Avoir l'UTXO escrow disponible

#### Étapes :

1. **Ouvrir la page de détail de la commande**
2. **Cliquer sur "Confirmer la réception"** ou "Libérer les fonds"
3. **Confirmer la signature** dans le wallet
4. **Attendre la confirmation**

#### Vérifications :

✅ **Dans la console du navigateur (F12)** :
```
🔎 UTXO sélectionné (release V2): <txHash> <index>
🔎 Buyer VKeyHash trouvé dans le datum: <hash>...
✅ Redeemer Release créé (Constr(0, []))
🔧 Construction de la transaction de libération...
✅ Transaction complétée avec succès
✅ Transaction de libération soumise: <txHash>
```

✅ **Dans l'explorateur Cardano** :
- Allez sur https://preprod.cardanoscan.io/transaction/<txHash>
- Vérifiez que :
  - La transaction est confirmée
  - L'UTXO escrow est consommé (input)
  - Les fonds sont envoyés au vendeur (output)
  - Le redeemer est `Constr(0, [])` (Release)

✅ **Vérification on-chain** :
- Le script Aiken vérifie que le buyer a signé
- Si le buyer n'a pas signé, la transaction échoue
- Si le buyer a signé, la transaction réussit

#### Test de sécurité :

🔒 **Test négatif** : Essayer de libérer avec un autre wallet
- Résultat attendu : ❌ La transaction échoue car le script vérifie la signature du buyer

---

### Test 3 : Annulation / Remboursement (REFUND)

**Objectif** : Vérifier que l'acheteur peut récupérer ses fonds après expiration du deadline.

#### Prérequis :
- ✅ Avoir complété le Test 1 (fond verrouillé)
- ⚠️ **Important** : Pour tester rapidement, vous pouvez modifier le deadline dans le code pour qu'il soit dans le passé

#### Étapes :

1. **Vérifier le deadline** :
   - Le deadline doit être dans le passé (ou très proche)
   - Par défaut : 7 jours après le lock
   - Pour tester rapidement, modifiez `deadline` dans `lockFundsInEscrow` :
     ```typescript
     deadline: number = Date.now() - 1000, // Deadline dans le passé
     ```

2. **Appeler la fonction `cancelEscrow`** :
   - Soit via l'interface (si disponible)
   - Soit via la console du navigateur :
     ```javascript
     // Dans la console F12
     import { cancelEscrow, getEscrowUtxos } from './src/blockchain/escrowContract';
     const utxos = await getEscrowUtxos(orderId);
     if (utxos.length > 0) {
       const txHash = await cancelEscrow(utxos[0], buyerAddress);
       console.log('Transaction de remboursement:', txHash);
     }
     ```

3. **Confirmer la signature** dans le wallet

#### Vérifications :

✅ **Dans la console du navigateur (F12)** :
```
🔎 UTXO sélectionné (cancel): <txHash> <index>
🔎 Deadline trouvé dans le datum: <timestamp>
🔎 Validator type (cancel): PlutusV3
🔎 Utilisation du redeemer Refund (Constr(1, []))
✅ Transaction de remboursement soumise: <txHash>
```

✅ **Dans l'explorateur Cardano** :
- Allez sur https://preprod.cardanoscan.io/transaction/<txHash>
- Vérifiez que :
  - La transaction est confirmée
  - L'UTXO escrow est consommé (input)
  - Les fonds sont renvoyés à l'acheteur (output)
  - Le redeemer est `Constr(1, [])` (Refund)
  - Le `validity_range` commence après le deadline

✅ **Vérification on-chain** :
- Le script Aiken vérifie que `validity_range` est entièrement après le deadline
- Si le deadline n'est pas expiré, la transaction échoue
- Si le deadline est expiré, la transaction réussit

#### Test de sécurité :

🔒 **Test négatif** : Essayer de rembourser avant le deadline
- Résultat attendu : ❌ La transaction échoue car le script vérifie le deadline

---

## 🔍 Vérifications Techniques Avancées

### 1. Vérifier le Datum

Dans l'explorateur Cardano, décoder le datum de l'UTXO escrow :

```javascript
// Dans la console du navigateur
import { Data } from 'lucid-cardano';

// Récupérer le datum depuis l'UTXO
const datumHex = '<datum_hex_from_explorer>';
const decoded = Data.from(datumHex);
console.log('Datum décodé:', decoded);

// Vérifier la structure :
// Constr(0, [
//   order_id: ByteArray (hex string),
//   buyer: VerificationKeyHash (hex string),
//   seller: VerificationKeyHash (hex string),
//   amount: BigInt (lovelace),
//   deadline: BigInt (timestamp milliseconds)
// ])
```

### 2. Vérifier le Redeemer

Pour Release :
```javascript
const releaseRedeemer = Data.to(new Constr(0, []));
console.log('Release redeemer:', releaseRedeemer);
// Doit être : d87980 (Constr(0, []))
```

Pour Refund :
```javascript
const refundRedeemer = Data.to(new Constr(1, []));
console.log('Refund redeemer:', refundRedeemer);
// Doit être : d87981 (Constr(1, []))
```

### 3. Vérifier l'Adresse du Script

```javascript
// Dans la console du navigateur
import { getEscrowAddress, getLucid } from './src/blockchain/escrowContract';

const lucid = getLucid();
const address = await getEscrowAddress(lucid);
console.log('Adresse escrow:', address);
// Notez cette adresse et vérifiez qu'elle correspond dans l'explorateur
```

### 4. Vérifier les UTXOs de l'Escrow

```javascript
// Dans la console du navigateur
import { getEscrowUtxos } from './src/blockchain/escrowContract';

const utxos = await getEscrowUtxos(orderId);
console.log('UTXOs escrow:', utxos);
// Vérifiez qu'il y a bien un UTXO avec le bon montant et datum
```

---

## 🐛 Dépannage

### Erreur : "missing required script"
**Cause** : L'UTXO a été créé avec un ancien script (V2 minimal) mais vous essayez de le dépenser avec le nouveau script (V3 Aiken).

**Solution** : Créez une nouvelle transaction de lock avec le nouveau script.

### Erreur : "unexpected type u8 at position 0"
**Cause** : Format de datum ou redeemer incorrect.

**Solution** : 
- Vérifiez que le datum est bien un `Constr(0, [...])` avec 5 champs
- Vérifiez que le redeemer est bien `Constr(0, [])` pour Release ou `Constr(1, [])` pour Refund

### Erreur : "Transaction failed: Script execution failed"
**Cause** : Le script Aiken a rejeté la transaction.

**Solutions** :
- Pour Release : Vérifiez que le buyer a bien signé la transaction
- Pour Refund : Vérifiez que le deadline est bien expiré et que `validity_range` est correctement défini

### Erreur : "insufficientlyFundedOutputs"
**Cause** : Le montant dans l'UTXO escrow est inférieur au minimum ADA requis.

**Solution** : Le script ajoute automatiquement le minimum ADA requis. Si l'erreur persiste, vérifiez que vous avez assez de fonds pour couvrir les frais.

---

## ✅ Checklist de Validation

Avant de considérer le contrat comme fonctionnel, vérifiez :

- [ ] Le contrat Aiken compile sans erreurs
- [ ] Le script V3 est correctement intégré dans `escrowContract.ts`
- [ ] L'adresse escrow est générée correctement
- [ ] Le lock fonctionne et crée un UTXO avec le datum structuré
- [ ] Le release fonctionne et vérifie la signature du buyer
- [ ] Le refund fonctionne et vérifie le deadline
- [ ] Les transactions apparaissent correctement dans l'explorateur
- [ ] Les redeemers sont corrects (Constr(0, []) pour Release, Constr(1, []) pour Refund)
- [ ] Les tests de sécurité échouent comme prévu (signature incorrecte, deadline non expiré)

---

## 📝 Notes Importantes

1. **Réseau de test** : Utilisez toujours Preprod Testnet pour les tests. Ne testez jamais sur Mainnet avec de vrais fonds.

2. **Anciens UTXOs** : Les UTXOs créés avec l'ancien script minimal (V2) ne fonctionneront pas avec le nouveau script (V3). Seules les nouvelles transactions utiliseront le script Aiken.

3. **Deadline** : Le deadline est en millisecondes (timestamp Unix). Assurez-vous que le format est correct.

4. **Frais de transaction** : Chaque transaction consomme des frais. Prévoyez suffisamment de fonds pour tous les tests.

5. **Collateral** : Les transactions de script nécessitent du collateral. Assurez-vous d'avoir au moins 5 ADA de collateral disponible.

---

## 🎯 Prochaines Étapes

Une fois tous les tests validés :

1. ✅ Intégrer les tests dans l'interface utilisateur
2. ✅ Ajouter des notifications pour les erreurs
3. ✅ Implémenter le suivi des transactions
4. ✅ Ajouter des tests unitaires automatisés
5. ✅ Documenter l'API pour les autres développeurs

---

**Bon test ! 🚀**

