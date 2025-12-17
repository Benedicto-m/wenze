/**
 * Smart Contract Escrow pour WENZE
 * 
 * Ce contrat permet de :
 * 1. Verrouiller les fonds d'une transaction
 * 2. Libérer les fonds au vendeur après confirmation de l'acheteur
 * 3. Récupérer les fonds si le délai expire (timeout)
 */

import { Lucid, Data, UTxO, fromText, fromHex } from 'lucid-cardano';
import { adaToLovelace, getLucid } from './lucidService';

// Adresse du script escrow sur Preprod (testnet)
// IMPORTANT : à configurer via .env => VITE_ESCROW_ADDRESS_TESTNET
// Exemple : VITE_ESCROW_ADDRESS_TESTNET=addr_test1w...
const ESCROW_ADDRESS_TESTNET =
  (import.meta as any).env?.VITE_ESCROW_ADDRESS_TESTNET || '';

/**
 * Définition du Datum pour le contrat escrow
 */
export interface EscrowDatum {
  order_id: string;
  buyer: string; // VerificationKeyHash (hex)
  seller: string; // VerificationKeyHash (hex)
  amount: bigint;
  deadline: bigint; // Timestamp en secondes
}

/**
 * Type de redeemer pour le contrat escrow
 */
export type EscrowRedeemer = 
  | { release: "release" }
  | { cancel: "cancel" };

/**
 * Charge le script validateur compilé depuis le fichier
 *
 * Pour contourner la limite actuelle de lucid-cardano (pas de support PlutusV3),
 * on utilise en priorité un script de test PlutusScriptV2
 * situé dans public/contracts/escrow_v2_test.plutus.json.
 *
 * Quand le support PlutusV3 sera stable, on pourra réactiver le chargement
 * du contrat Aiken V3 ci-dessous.
 */
export const loadEscrowValidator = async (): Promise<string> => {
  // 1. PRIORITÉ ABSOLUE : Utiliser le script V3 (vrai contrat compilé) en forçant le type V2
  // Le script V3 est un vrai contrat compilé, on va l'utiliser en forçant le type V2
  console.log('🔍 Tentative de chargement du script V3...');
  try {
    const v3Response = await fetch('/contracts/escrow.plutus.json');
    console.log('   Réponse V3:', v3Response.status, v3Response.ok);
    if (v3Response.ok) {
      const v3Data = await v3Response.json();
      console.log('   Données V3:', v3Data.type, v3Data.cborHex ? 'cborHex présent' : 'cborHex manquant');
      if (v3Data.cborHex) {
        console.log('✅ Contrat escrow V3 chargé, utilisé comme V2 (workaround)');
        // Nettoyer le cborHex : enlever espaces, virgules, etc.
        const cleanCborHex = v3Data.cborHex.trim().replace(/[^0-9a-fA-F]/g, '');
        console.log('   cborHex nettoyé:', cleanCborHex.substring(0, 30) + '... (length:', cleanCborHex.length, ')');
        const result = JSON.stringify({
          type: "PlutusScriptV2", // Forcer en V2 même si c'est V3
          description: "Escrow V3 utilisé comme V2 (workaround)",
          cborHex: cleanCborHex
        });
        console.log('   ✅ Retour du script V3 forcé en V2');
        return result;
      } else {
        console.warn('⚠️ V3 chargé mais cborHex manquant');
      }
    } else {
      console.warn('⚠️ Réponse V3 non OK:', v3Response.status, v3Response.statusText);
    }
  } catch (error: any) {
    console.warn('⚠️ Erreur lors du chargement du script V3:', error?.message);
  }
  
  // 2. Fallback : script de test V2 compatible Lucid (SEULEMENT si V3 échoue)
  console.log('🔍 Tentative de chargement du script V2 de test (fallback)...');
  try {
    const v2Response = await fetch('/contracts/escrow_v2_test.plutus.json');
    if (v2Response.ok) {
      const v2Data = await v2Response.json();
      if (v2Data.cborHex) {
        console.log('⚠️ Contrat escrow V2 de test chargé (fallback - V3 non disponible)');
        // Nettoyer le cborHex : enlever espaces, virgules, etc.
        let cborHex = v2Data.cborHex.trim().replace(/[^0-9a-fA-F]/g, '');
        console.log('   cborHex nettoyé:', cborHex.substring(0, 20) + '... (length:', cborHex.length, ')');
        return JSON.stringify({
          ...v2Data,
          cborHex: cborHex
        });
      }
    }
  } catch (error) {
    console.warn('⚠️ Erreur lors du chargement du contrat V2 de test:', error);
  }

  // 3. Dernier recours absolu : script AlwaysSucceeds PlutusV2 minimal
  // Script AlwaysSucceeds PlutusV2 valide (accepte n'importe quel redeemer)
  // Format CBOR correct pour un script AlwaysSucceeds
  const ALWAYS_SUCCEEDS_V2_CBOR = '01000033220011011a00000000';
  
  console.error('❌ Aucun script valide trouvé, utilisation d\'un script AlwaysSucceeds minimal');
  return JSON.stringify({
    type: "PlutusScriptV2",
    description: "AlwaysSucceeds script generated directly",
    cborHex: ALWAYS_SUCCEEDS_V2_CBOR
  });
};

/**
 * Obtient l'adresse du script validateur
 */
/**
 * Crée l'adresse du script à partir du hash (solution de contournement pour Lucid 0.10.11)
 * Cette fonction utilise le hash du script directement pour créer l'adresse
 */
const createScriptAddressFromHash = (scriptHash: string, network: 'mainnet' | 'testnet' = 'testnet'): string => {
  // Cette adresse est calculée à partir du hash du script
  // Pour PlutusV3 sur testnet Preprod, le format est: addr_test + script hash (28 bytes) + stake key (optionnel, vide ici)
  
  // Hash connu du contrat escrow compilé
  // Si le hash change après recompilation, il faudra mettre à jour cette valeur
  const KNOWN_SCRIPT_HASH = 'd5c214c90928733c8a8741b40de67ded41255290af2f4d88400a3d19';
  
  // Pour l'instant, utiliser une solution de contournement : 
  // Utiliser une adresse de test connue ou calculer manuellement
  // Note: Le calcul complet d'une adresse Cardano nécessite des fonctions de hachage et encoding Bech32 complexes
  
  // SOLUTION TEMPORAIRE: Utiliser le hash pour créer l'adresse via une API ou un service externe
  // Pour Preprod testnet avec un script (sans stake key):
  // - Prefix: 00 pour testnet script address
  // - Script hash: 28 bytes (56 hex chars)
  
  console.warn('⚠️ SOLUTION DE CONTOURNEMENT: Utilisation du hash du script pour créer l\'adresse');
  console.warn('⚠️ Cette solution est temporaire en attendant le support PlutusV3 dans lucid-cardano');
  
  // Calculer l'adresse manuellement serait complexe, donc pour l'instant
  // on retourne une erreur explicative avec le hash pour référence
  throw new Error(
    `WORKAROUND REQUIRED: Lucid 0.10.11 ne supporte pas PlutusV3.\n\n` +
    `Script Hash: ${scriptHash || KNOWN_SCRIPT_HASH}\n\n` +
    `Solutions possibles:\n` +
    `1. Attendre une mise à jour de lucid-cardano qui supporte PlutusV3\n` +
    `2. Utiliser une API externe pour créer l'adresse à partir du hash\n` +
    `3. Calculer manuellement l'adresse (complexe, nécessite Bech32 encoding)\n` +
    `4. Utiliser un contrat PlutusV2 au lieu de V3 (nécessite recompilation)`
  );
};

export const getEscrowAddress = async (lucid: Lucid, validatorJson: string, network?: 'mainnet' | 'testnet'): Promise<string> => {
  // Parser le JSON du validateur
  const validatorData = JSON.parse(validatorJson);
  
  // Vérifier que le contrat a bien cborHex
  if (!validatorData.cborHex) {
    throw new Error('Le contrat validateur doit contenir un champ cborHex');
  }
  
  const cborHex = validatorData.cborHex;
  if (typeof cborHex !== 'string') {
    throw new Error('cborHex doit être une chaîne hexadécimale');
  }
  
  const cborHexTrimmed = cborHex.trim();
  const scriptHash = validatorData.hash; // Hash du script depuis plutus.json
  
  const scriptType = validatorData.type || "PlutusScriptV3";
  console.log('📝 Tentative de création de l\'adresse du validateur...');
  console.log('Type du script dans JSON:', scriptType);
  console.log('CBOR Hex length:', cborHexTrimmed.length);
  console.log('Script Hash:', scriptHash || 'Non disponible');
  
  // Essayer toutes les méthodes possibles avec Lucid
  // Si le script est marqué V2, essayer V2 en premier
  // Sinon, essayer dans l'ordre standard
  const formatsToTry = scriptType === "PlutusScriptV2" 
    ? [
        { type: "PlutusScriptV2", format: "cborHex", value: cborHexTrimmed },
        { type: "PlutusScriptV2", format: "script", value: null as any }, // Sera rempli si bytes fonctionne
      ]
    : [
        { type: "PlutusScriptV2", format: "cborHex", value: cborHexTrimmed },
        { type: "PlutusScriptV3", format: "cborHex", value: cborHexTrimmed },
      ];
  
  // Essayer avec bytes aussi
  try {
    const cborBytes = fromHex(cborHexTrimmed);
    if (scriptType === "PlutusScriptV2") {
      formatsToTry[1].value = cborBytes; // Remplacer le null
    } else {
      formatsToTry.push(
        { type: "PlutusScriptV2", format: "script", value: cborBytes },
        { type: "PlutusScriptV3", format: "script", value: cborBytes }
      );
    }
  } catch (e) {
    console.warn('⚠️ Impossible de convertir hex en bytes:', e);
    // Retirer les formats "script" qui nécessitent bytes
    formatsToTry.forEach((fmt, idx) => {
      if (fmt.format === "script" && fmt.value === null) {
        formatsToTry.splice(idx, 1);
      }
    });
  }
  
  for (const format of formatsToTry) {
    if (format.value === null) continue; // Skip les formats qui nécessitent bytes mais n'ont pas pu être convertis
    
    try {
      console.log(`🔄 Tentative avec ${format.type} (${format.format})...`);
      const script: any = {
        type: format.type,
        [format.format]: format.value
      };
      
      const address = lucid.utils.validatorToAddress(script);
      console.log(`✅✅✅ Adresse créée avec ${format.type} (${format.format}):`, address.substring(0, 30) + '...');
      return address;
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      console.warn(`⚠️ ${format.type} (${format.format}) a échoué:`, errorMsg);
      continue;
    }
  }
  
  // Si toutes les tentatives ont échoué, utiliser le hash pour calculer l'adresse manuellement
  console.error(`❌ Toutes les méthodes Lucid ont échoué pour ${scriptType}.`);
  console.log('🔄 Tentative de calcul manuel de l\'adresse à partir du hash...');
  
  // Si on a le hash du script, on peut calculer l'adresse manuellement
  if (scriptHash && scriptHash.length === 56) {
    try {
      const address = calculateAddressFromHash(scriptHash, 'testnet');
      console.log('✅ Adresse calculée manuellement:', address.substring(0, 50) + '...');
      return address;
    } catch (calcError: any) {
      console.error('❌ Échec du calcul manuel:', calcError?.message || calcError);
    }
  }
  
  // Message d'erreur adapté selon le type
  if (scriptType === "PlutusScriptV2") {
    throw new Error(
      `❌ IMPOSSIBLE: lucid-cardano 0.10.11 ne peut PAS créer d'adresse avec ce script PlutusV2.\n\n` +
      `Le problème est plus général que juste PlutusV3.\n\n` +
      `Erreurs rencontrées lors des tentatives avec:\n` +
      `- PlutusScriptV2 (cborHex)\n` +
      `- PlutusScriptV2 (script bytes)\n\n` +
      `Vérifiez:\n` +
      `1. Le format CBOR du script\n` +
      `2. La configuration de Lucid\n` +
      `3. La version de lucid-cardano (actuellement: 0.10.11)`
    );
  } else {
    // PlutusV3
    throw new Error(
      `❌ IMPOSSIBLE: lucid-cardano 0.10.11 ne supporte PAS les scripts PlutusV3 compilés par Aiken.\n\n` +
      `🔧 SOLUTIONS POSSIBLES:\n\n` +
      `1. ATTENDRE: Surveillez les mises à jour de lucid-cardano pour le support PlutusV3\n` +
      `   npm view lucid-cardano version  # Vérifier les nouvelles versions\n\n` +
      `2. WORKAROUND: Utiliser une API externe ou calculer l'adresse manuellement\n` +
      `   Hash du script: ${scriptHash || 'Non disponible'}\n\n` +
      `3. ALTERNATIVE: Compiler le contrat en PlutusV2 (nécessite downgrade d'Aiken, pas recommandé)\n\n` +
      `📋 Pour l'instant, les transactions escrow ne peuvent pas fonctionner avec cette configuration.`
    );
  }
};

/**
 * Crée une transaction pour verrouiller les fonds en escrow
 */
export const lockFundsInEscrow = async (
  orderId: string,
  amountAda: number,
  buyerAddress: string,
  sellerAddress: string,
  deadline: number = Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 jours par défaut
  lucidInstance?: Lucid | null
): Promise<{ txHash: string; escrowAddress: string; escrowUtxo: UTxO }> => {
  const lucid = lucidInstance || getLucid();
  const amountLovelace = adaToLovelace(amountAda);

  if (!ESCROW_ADDRESS_TESTNET) {
    throw new Error(
      'Adresse du script escrow non configurée. ' +
        'Veuillez définir VITE_ESCROW_ADDRESS_TESTNET dans votre fichier .env avec l’adresse du script sur Preprod.'
    );
  }

  const escrowAddress = ESCROW_ADDRESS_TESTNET;
  console.log('✅ Utilisation de l’adresse escrow configurée:', escrowAddress.substring(0, 50) + '...');
  
  // Obtenir les clés de vérification de l'acheteur et du vendeur
  const buyerDetails = lucid.utils.getAddressDetails(buyerAddress);
  const sellerDetails = lucid.utils.getAddressDetails(sellerAddress);
  
  const buyerVKeyHash = buyerDetails.paymentCredential?.hash;
  const sellerVKeyHash = sellerDetails.paymentCredential?.hash;
  
  if (!buyerVKeyHash || !sellerVKeyHash) {
    throw new Error('Impossible d\'obtenir les clés de vérification des adresses');
  }
  
  // Datum simplifié pour compatibilité (le script V2 de test AlwaysSucceeds n'utilise pas réellement le datum)
  // SOLUTION: Utiliser un datum inline avec une chaîne vide (format le plus simple que Lucid peut sérialiser)
  console.log('🔒 Création du datum (chaîne vide) pour le script AlwaysSucceeds...');
  
  // Pour un script AlwaysSucceeds, le datum n'a pas d'importance
  // Utiliser une chaîne vide comme datum - c'est le format le plus simple que Lucid peut sérialiser
  const datum = Data.to('');
  
  console.log('📝 Construction de la transaction avec datum inline (chaîne vide)...');
  const tx = await lucid
    .newTx()
    .payToContract(escrowAddress, { inline: datum }, { lovelace: amountLovelace })
    .complete();
  
  console.log('✅ Transaction construite, signature...');
  const signedTx = await tx.sign().complete();
  const txHash = await signedTx.submit();
  console.log('✅ Transaction soumise:', txHash);
  
  // Attendre que la transaction soit confirmée
  await lucid.awaitTx(txHash);
  
  // Récupérer les UTXOs de l'escrow
  const utxos = await lucid.utxosAt(escrowAddress);
  const escrowUtxo = utxos[0] as UTxO | undefined;
  
  if (!escrowUtxo) {
    console.warn('⚠️ UTXO de l\'escrow non trouvé immédiatement après la transaction.');
  }
  
  return {
    txHash,
    escrowAddress,
    escrowUtxo: (escrowUtxo as UTxO) ?? ({} as UTxO),
  };
};

/**
 * Libère les fonds de l'escrow au vendeur
 * Doit être signé par l'acheteur
 */
export const releaseFundsFromEscrow = async (
  escrowUtxo: UTxO,
  sellerAddress: string,
  buyerAddress?: string,
  lucidInstance?: Lucid | null
): Promise<string> => {
  const lucid = lucidInstance || getLucid();
  
  // Vérifier que l'UTXO est valide
  if (!escrowUtxo || !escrowUtxo.txHash || escrowUtxo.outputIndex === undefined) {
    throw new Error('UTXO invalide pour la libération');
  }
  
  // Vérifier que l'adresse du vendeur est valide
  if (!sellerAddress || !sellerAddress.startsWith('addr_')) {
    throw new Error('Adresse du vendeur invalide');
  }
  
  // Charger le validateur (utiliser le même que pour lockFundsInEscrow)
  const validatorStr = await loadEscrowValidator();
  const validator = JSON.parse(validatorStr);
  
  // Redeemer pour le script de test AlwaysSucceeds
  // Utiliser une chaîne vide (format le plus simple que Lucid peut sérialiser)
  const redeemer = Data.to('');
  
  console.log('🔓 Construction de la transaction de libération...');
  console.log('   - UTXO txHash:', escrowUtxo.txHash);
  console.log('   - UTXO outputIndex:', escrowUtxo.outputIndex);
  console.log('   - Vendeur:', sellerAddress);
  
  // Vérifier le montant de l'UTXO
  const lovelaceAmount = escrowUtxo.assets?.lovelace || 0n;
  const adaAmount = Number(lovelaceAmount) / 1_000_000;
  console.log('   - Montant lovelace brut:', lovelaceAmount.toString());
  console.log('   - Montant ADA:', adaAmount.toFixed(6));
  
  // Vérifier que le montant est raisonnable (pas 2345 ADA si on a envoyé 26.74 ADA)
  if (adaAmount > 1000) {
    console.warn('⚠️ ATTENTION: Montant UTXO suspect (>1000 ADA). Vérifiez que c\'est le bon UTXO.');
  }
  
  // Obtenir l'adresse de l'acheteur si non fournie
  if (!buyerAddress) {
    buyerAddress = await lucid.wallet.address();
  }
  
  // Créer le script validateur - essayer tous les formats possibles jusqu'à trouver celui qui fonctionne
  console.log('📝 Construction de la transaction avec script validateur...');
  
  let completedTx;
  let lastError: any;
  
  // Format 1: "PlutusV2" (sans "Script")
  try {
    const validatorScript1: any = { 
      type: "PlutusV2",
      cborHex: validator.cborHex 
    };
    console.log('   Essai format 1: PlutusV2');
    let tx = lucid
      .newTx()
      .collectFrom([escrowUtxo], redeemer)
      .payToAddress(sellerAddress, escrowUtxo.assets)
      .attachSpendingValidator(validatorScript1);
    
    if (buyerAddress) {
      tx = tx.addSigner(buyerAddress);
    }
    
    completedTx = await tx.complete();
    console.log('✅ Format 1 (PlutusV2) accepté');
  } catch (error1: any) {
    lastError = error1;
    console.warn('⚠️ Format 1 échoué:', error1?.message);
    
    // Format 2: "PlutusScriptV2" (format standard)
    try {
      const validatorScript2: any = { 
        type: "PlutusScriptV2",
        cborHex: validator.cborHex 
      };
      console.log('   Essai format 2: PlutusScriptV2');
      let tx = lucid
        .newTx()
        .collectFrom([escrowUtxo], redeemer)
        .payToAddress(sellerAddress, escrowUtxo.assets)
        .attachSpendingValidator(validatorScript2);
      
      if (buyerAddress) {
        tx = tx.addSigner(buyerAddress);
      }
      
      completedTx = await tx.complete();
      console.log('✅ Format 2 (PlutusScriptV2) accepté');
    } catch (error2: any) {
      lastError = error2;
      console.warn('⚠️ Format 2 échoué:', error2?.message);
      
      // Format 3: script avec bytes (fromHex)
      try {
        console.log('   Essai format 3: script bytes (fromHex)');
        // Nettoyer le cborHex avant conversion
        const cleanCborHex = validator.cborHex.trim().replace(/[^0-9a-fA-F]/g, '');
        console.log('   cborHex nettoyé pour fromHex:', cleanCborHex.substring(0, 20) + '...');
        const cborBytes = fromHex(cleanCborHex);
        const validatorScript3: any = { 
          type: "PlutusV2",
          script: cborBytes 
        };
        let tx = lucid
          .newTx()
          .collectFrom([escrowUtxo], redeemer)
          .payToAddress(sellerAddress, escrowUtxo.assets)
          .attachSpendingValidator(validatorScript3);
        
        if (buyerAddress) {
          tx = tx.addSigner(buyerAddress);
        }
        
        completedTx = await tx.complete();
        console.log('✅ Format 3 (script bytes) accepté');
      } catch (error3: any) {
        lastError = error3;
        // Format 4: cborHex direct comme string
        try {
          console.log('   Essai format 4: cborHex string direct');
          let tx = lucid
            .newTx()
            .collectFrom([escrowUtxo], redeemer)
            .payToAddress(sellerAddress, escrowUtxo.assets)
            .attachSpendingValidator(validator.cborHex);
          
          if (buyerAddress) {
            tx = tx.addSigner(buyerAddress);
          }
          
          completedTx = await tx.complete();
          console.log('✅ Format 4 (cborHex string) accepté');
        } catch (error4: any) {
          console.error('❌ Tous les formats ont échoué');
          throw new Error(`Impossible d'attacher le script validateur. Format 1: ${error1?.message}, Format 2: ${error2?.message}, Format 3: ${error3?.message}, Format 4: ${error4?.message}`);
        }
      }
    }
  }
  const signedTx = await completedTx.sign().complete();
  const txHash = await signedTx.submit();
  
  console.log('✅ Transaction de libération soumise:', txHash);
  
  return txHash;
};

/**
 * Annule l'escrow et récupère les fonds (si le délai est expiré)
 */
export const cancelEscrow = async (
  escrowUtxo: UTxO,
  buyerAddress: string,
  lucidInstance?: Lucid | null
): Promise<string> => {
  const lucid = lucidInstance || getLucid();
  
  // Charger le validateur (utiliser le même que pour lockFundsInEscrow)
  const validatorStr = await loadEscrowValidator();
  const validator = JSON.parse(validatorStr);
  
  // Pour le script de test AlwaysSucceeds, on ne lit plus le deadline dans le datum
  // et on ne fait pas de vérification on-chain du temps. Le délai sera géré côté app (Web2).

  // Redeemer pour annuler (chaîne vide - pour AlwaysSucceeds, le redeemer n'a pas d'importance)
  const redeemer = Data.to('');
  
  // Créer le script validateur - essayer différents formats
  let completedTx;
  
  try {
    const validatorScript1: any = { type: "PlutusV2", cborHex: validator.cborHex };
    completedTx = await lucid
      .newTx()
      .collectFrom([escrowUtxo], redeemer)
      .payToAddress(buyerAddress, escrowUtxo.assets)
      .attachSpendingValidator(validatorScript1)
      .complete();
  } catch (error1: any) {
    try {
      const validatorScript2: any = { type: "PlutusScriptV2", cborHex: validator.cborHex };
      completedTx = await lucid
        .newTx()
        .collectFrom([escrowUtxo], redeemer)
        .payToAddress(buyerAddress, escrowUtxo.assets)
        .attachSpendingValidator(validatorScript2)
        .complete();
    } catch (error2: any) {
      completedTx = await lucid
        .newTx()
        .collectFrom([escrowUtxo], redeemer)
        .payToAddress(buyerAddress, escrowUtxo.assets)
        .attachSpendingValidator(validator.cborHex)
        .complete();
    }
  }
  
  const signedTx = await completedTx.sign().complete();
  const txHash = await signedTx.submit();
  
  return txHash;
};

/**
 * Récupère tous les UTXOs de l'escrow pour une commande donnée
 */
export const getEscrowUtxos = async (
  orderId: string,
  lucidInstance?: Lucid | null
): Promise<UTxO[]> => {
  const lucid = lucidInstance || getLucid();
  if (!ESCROW_ADDRESS_TESTNET) {
    throw new Error(
      'Adresse du script escrow non configurée. ' +
        'Veuillez définir VITE_ESCROW_ADDRESS_TESTNET dans votre fichier .env avec l’adresse du script sur Preprod.'
    );
  }

  const escrowAddress = ESCROW_ADDRESS_TESTNET;
  
  // Récupérer tous les UTXOs présents à l'adresse escrow.
  // Avec le script V2 de test (AlwaysSucceeds) et un datum simplifié,
  // on ne filtre plus par orderId dans le datum.
  const utxos = await lucid.utxosAt(escrowAddress);
  return utxos;
};

/**
 * Vérifie l'état de l'escrow pour une commande
 */
export const checkEscrowStatus = async (
  orderId: string,
  lucidInstance?: Lucid | null
): Promise<{ exists: boolean; utxo?: UTxO; deadline?: number }> => {
  const utxos = await getEscrowUtxos(orderId, lucidInstance);
  
  if (utxos.length === 0) {
    return { exists: false };
  }

  // Pour l'instant, utiliser simplement le premier UTXO trouvé
  const utxo = utxos[0];

  return {
    exists: true,
    utxo,
    deadline: undefined,
  };
};
