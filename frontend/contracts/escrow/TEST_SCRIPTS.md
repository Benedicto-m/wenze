# Scripts de Test Rapides - Contrat Escrow

Scripts JavaScript à exécuter dans la console du navigateur (F12) pour tester rapidement le contrat escrow.

## 🔧 Configuration Initiale

Ouvrez la console du navigateur (F12) et exécutez :

```javascript
// Importer les fonctions nécessaires
import { 
  lockFundsInEscrow, 
  releaseFundsFromEscrowV2, 
  cancelEscrow,
  getEscrowUtxos,
  getEscrowAddress,
  checkEscrowStatus
} from './src/blockchain/escrowContract';
import { getLucid } from './src/blockchain/lucidService';

// Initialiser Lucid
const lucid = getLucid();
```

---

## 📝 Test 1 : Lock (Verrouillage)

```javascript
// Test de verrouillage des fonds
async function testLock() {
  try {
    const orderId = `test-${Date.now()}`;
    const amountAda = 2; // 2 ADA
    const buyerAddress = await lucid.wallet.address();
    const sellerAddress = 'addr_test1qpx...'; // Remplacez par une adresse de test
    
    console.log('🔒 Test de verrouillage...');
    console.log('Order ID:', orderId);
    console.log('Buyer:', buyerAddress);
    console.log('Seller:', sellerAddress);
    console.log('Amount:', amountAda, 'ADA');
    
    const result = await lockFundsInEscrow(
      orderId,
      amountAda,
      buyerAddress,
      sellerAddress
    );
    
    console.log('✅ Lock réussi !');
    console.log('Transaction Hash:', result.txHash);
    console.log('Escrow Address:', result.escrowAddress);
    console.log('Escrow UTXO:', result.escrowUtxo);
    
    return result;
  } catch (error) {
    console.error('❌ Erreur lors du lock:', error);
    throw error;
  }
}

// Exécuter le test
const lockResult = await testLock();
```

---

## 📝 Test 2 : Release (Libération)

```javascript
// Test de libération des fonds
async function testRelease(escrowUtxo, sellerAddress) {
  try {
    console.log('🔓 Test de libération...');
    console.log('Escrow UTXO:', escrowUtxo.txHash, escrowUtxo.outputIndex);
    console.log('Seller Address:', sellerAddress);
    
    const txHash = await releaseFundsFromEscrowV2(
      escrowUtxo,
      sellerAddress
    );
    
    console.log('✅ Release réussi !');
    console.log('Transaction Hash:', txHash);
    
    return txHash;
  } catch (error) {
    console.error('❌ Erreur lors du release:', error);
    throw error;
  }
}

// Exécuter le test (remplacez les valeurs)
const sellerAddress = 'addr_test1qpx...'; // Adresse du vendeur
const releaseTxHash = await testRelease(lockResult.escrowUtxo, sellerAddress);
```

---

## 📝 Test 3 : Cancel/Refund (Annulation)

```javascript
// Test d'annulation/remboursement
async function testCancel(escrowUtxo, buyerAddress) {
  try {
    console.log('❌ Test d\'annulation...');
    console.log('Escrow UTXO:', escrowUtxo.txHash, escrowUtxo.outputIndex);
    console.log('Buyer Address:', buyerAddress);
    
    // Note: Pour que ce test fonctionne, le deadline doit être expiré
    // Ou modifiez le deadline dans lockFundsInEscrow pour qu'il soit dans le passé
    
    const txHash = await cancelEscrow(
      escrowUtxo,
      buyerAddress
    );
    
    console.log('✅ Cancel réussi !');
    console.log('Transaction Hash:', txHash);
    
    return txHash;
  } catch (error) {
    console.error('❌ Erreur lors du cancel:', error);
    throw error;
  }
}

// Exécuter le test (remplacez les valeurs)
const buyerAddress = await lucid.wallet.address();
const cancelTxHash = await testCancel(lockResult.escrowUtxo, buyerAddress);
```

---

## 📝 Test 4 : Vérification des UTXOs

```javascript
// Vérifier les UTXOs de l'escrow
async function testGetUtxos(orderId) {
  try {
    console.log('🔍 Recherche des UTXOs pour orderId:', orderId);
    
    const utxos = await getEscrowUtxos(orderId);
    
    console.log('✅ UTXOs trouvés:', utxos.length);
    utxos.forEach((utxo, index) => {
      console.log(`UTXO ${index + 1}:`, {
        txHash: utxo.txHash,
        outputIndex: utxo.outputIndex,
        assets: utxo.assets,
        datum: utxo.datum
      });
    });
    
    return utxos;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des UTXOs:', error);
    throw error;
  }
}

// Exécuter le test
const orderId = 'test-1234567890'; // Remplacez par votre orderId
const utxos = await testGetUtxos(orderId);
```

---

## 📝 Test 5 : Vérification de l'Adresse Escrow

```javascript
// Vérifier l'adresse du script escrow
async function testGetAddress() {
  try {
    console.log('📍 Récupération de l\'adresse escrow...');
    
    const address = await getEscrowAddress(lucid);
    
    console.log('✅ Adresse escrow:', address);
    
    // Vérifier les UTXOs à cette adresse
    const utxos = await lucid.utxosAt(address);
    console.log('UTXOs à l\'adresse escrow:', utxos.length);
    
    return address;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération de l\'adresse:', error);
    throw error;
  }
}

// Exécuter le test
const escrowAddress = await testGetAddress();
```

---

## 📝 Test 6 : Vérification du Statut

```javascript
// Vérifier le statut de l'escrow
async function testCheckStatus(orderId) {
  try {
    console.log('📊 Vérification du statut pour orderId:', orderId);
    
    const status = await checkEscrowStatus(orderId);
    
    console.log('✅ Statut:', {
      exists: status.exists,
      utxo: status.utxo ? {
        txHash: status.utxo.txHash,
        outputIndex: status.utxo.outputIndex,
        assets: status.utxo.assets
      } : null,
      deadline: status.deadline
    });
    
    return status;
  } catch (error) {
    console.error('❌ Erreur lors de la vérification du statut:', error);
    throw error;
  }
}

// Exécuter le test
const orderId = 'test-1234567890'; // Remplacez par votre orderId
const status = await testCheckStatus(orderId);
```

---

## 📝 Test Complet : Workflow End-to-End

```javascript
// Test complet du workflow escrow
async function testFullWorkflow() {
  try {
    console.log('🚀 Démarrage du test complet...\n');
    
    // 1. Lock
    console.log('=== ÉTAPE 1 : LOCK ===');
    const orderId = `test-full-${Date.now()}`;
    const buyerAddress = await lucid.wallet.address();
    const sellerAddress = 'addr_test1qpx...'; // Remplacez par une adresse de test
    const amountAda = 2;
    
    const lockResult = await lockFundsInEscrow(
      orderId,
      amountAda,
      buyerAddress,
      sellerAddress
    );
    console.log('✅ Lock réussi:', lockResult.txHash);
    console.log('Escrow Address:', lockResult.escrowAddress);
    console.log('');
    
    // Attendre la confirmation
    console.log('⏳ Attente de la confirmation de la transaction...');
    await new Promise(resolve => setTimeout(resolve, 10000)); // 10 secondes
    
    // 2. Vérifier les UTXOs
    console.log('\n=== ÉTAPE 2 : VÉRIFICATION ===');
    const utxos = await getEscrowUtxos(orderId);
    console.log('✅ UTXOs trouvés:', utxos.length);
    
    if (utxos.length === 0) {
      throw new Error('Aucun UTXO trouvé après le lock');
    }
    
    const escrowUtxo = utxos[0];
    console.log('Escrow UTXO:', escrowUtxo.txHash, escrowUtxo.outputIndex);
    console.log('');
    
    // 3. Release
    console.log('=== ÉTAPE 3 : RELEASE ===');
    const releaseTxHash = await releaseFundsFromEscrowV2(
      escrowUtxo,
      sellerAddress
    );
    console.log('✅ Release réussi:', releaseTxHash);
    console.log('');
    
    // Attendre la confirmation
    console.log('⏳ Attente de la confirmation de la transaction...');
    await new Promise(resolve => setTimeout(resolve, 10000)); // 10 secondes
    
    // 4. Vérifier que l'UTXO a été consommé
    console.log('\n=== ÉTAPE 4 : VÉRIFICATION FINALE ===');
    const finalUtxos = await getEscrowUtxos(orderId);
    console.log('✅ UTXOs restants:', finalUtxos.length);
    
    if (finalUtxos.length === 0) {
      console.log('✅ L\'UTXO a été correctement consommé !');
    } else {
      console.warn('⚠️ Il reste encore des UTXOs');
    }
    
    console.log('\n🎉 Test complet réussi !');
    
    return {
      orderId,
      lockTxHash: lockResult.txHash,
      releaseTxHash,
      escrowAddress: lockResult.escrowAddress
    };
  } catch (error) {
    console.error('❌ Erreur lors du test complet:', error);
    throw error;
  }
}

// Exécuter le test complet
const fullTestResult = await testFullWorkflow();
```

---

## 🔍 Utilitaires de Debug

### Décoder un Datum

```javascript
import { Data, Constr } from 'lucid-cardano';

function decodeDatum(datumHex) {
  try {
    const decoded = Data.from(datumHex);
    console.log('Datum décodé:', decoded);
    
    if (decoded instanceof Constr) {
      console.log('Type: Constr');
      console.log('Index:', decoded.index);
      console.log('Fields:', decoded.fields);
      
      if (decoded.fields.length >= 5) {
        console.log('Order ID (hex):', decoded.fields[0]);
        console.log('Buyer VKeyHash:', decoded.fields[1]);
        console.log('Seller VKeyHash:', decoded.fields[2]);
        console.log('Amount (lovelace):', decoded.fields[3].toString());
        console.log('Deadline (timestamp):', decoded.fields[4].toString());
        console.log('Deadline (date):', new Date(Number(decoded.fields[4])));
      }
    }
    
    return decoded;
  } catch (error) {
    console.error('Erreur lors du décodage:', error);
    throw error;
  }
}

// Utilisation
const datumHex = 'd8799f...'; // Remplacez par le datum hex de l'explorateur
decodeDatum(datumHex);
```

### Vérifier un Redeemer

```javascript
import { Data, Constr } from 'lucid-cardano';

function verifyRedeemer(redeemerHex, expectedType) {
  try {
    const decoded = Data.from(redeemerHex);
    console.log('Redeemer décodé:', decoded);
    
    if (decoded instanceof Constr) {
      console.log('Type: Constr');
      console.log('Index:', decoded.index);
      console.log('Fields:', decoded.fields);
      
      if (expectedType === 'Release' && decoded.index === 0) {
        console.log('✅ Redeemer Release correct (Constr(0, []))');
      } else if (expectedType === 'Refund' && decoded.index === 1) {
        console.log('✅ Redeemer Refund correct (Constr(1, []))');
      } else {
        console.warn('⚠️ Type de redeemer inattendu');
      }
    }
    
    return decoded;
  } catch (error) {
    console.error('Erreur lors de la vérification:', error);
    throw error;
  }
}

// Utilisation
const releaseRedeemer = Data.to(new Constr(0, []));
verifyRedeemer(releaseRedeemer, 'Release');

const refundRedeemer = Data.to(new Constr(1, []));
verifyRedeemer(refundRedeemer, 'Refund');
```

---

## 📊 Résumé des Tests

| Test | Fonction | Objectif | Vérification |
|------|----------|----------|--------------|
| 1 | `lockFundsInEscrow` | Verrouiller les fonds | UTXO créé avec datum structuré |
| 2 | `releaseFundsFromEscrowV2` | Libérer les fonds | Transaction réussit avec signature buyer |
| 3 | `cancelEscrow` | Annuler/rembourser | Transaction réussit si deadline expiré |
| 4 | `getEscrowUtxos` | Récupérer les UTXOs | Liste des UTXOs disponibles |
| 5 | `getEscrowAddress` | Adresse du script | Adresse générée correctement |
| 6 | `checkEscrowStatus` | Statut de l'escrow | Informations sur l'UTXO |

---

**Note** : Remplacez les adresses de test par vos propres adresses Preprod Testnet avant d'exécuter les scripts.

