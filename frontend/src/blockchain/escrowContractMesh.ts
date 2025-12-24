/**
 * Smart Contract Escrow pour WENZE - Implémentation 100% MeshSDK
 *
 * On s'appuie uniquement sur le contrat escrow fourni par Mesh:
 * - initiateEscrow      → lockFundsInEscrowMesh
 * - getUtxoByTxHash     → getEscrowUtxoByTxHash
 * - completeEscrow      → releaseFundsFromEscrowMesh
 * - cancelEscrow        → cancelEscrowMesh
 *
 * Documentation officielle Mesh:
 * https://meshjs.dev/smart-contracts/escrow
 */

import { MeshEscrowContract } from '@meshsdk/contract';
import { MeshTxBuilder, BlockfrostProvider, Asset } from '@meshsdk/core';
import { getBlockfrostProjectId } from './config';

// Instances globales MeshSDK
let meshContractInstance: MeshEscrowContract | null = null;
let meshTxBuilderInstance: MeshTxBuilder | null = null;
let blockfrostProviderInstance: BlockfrostProvider | null = null;

/**
 * Initialise MeshSDK avec Blockfrost et un wallet
 */
export const initMeshSDK = async (
  wallet: any, // Wallet API CIP-30
  network: 'mainnet' | 'testnet' = 'testnet'
): Promise<MeshEscrowContract> => {
  try {
    const projectId = getBlockfrostProjectId(network);

    if (!projectId || projectId.trim() === '') {
      throw new Error('Blockfrost Project ID non configuré. Configurez VITE_BLOCKFROST_PROJECT_ID dans .env');
    }

    // Initialiser le provider Blockfrost
    const provider = new BlockfrostProvider(projectId);
    blockfrostProviderInstance = provider;

    // Initialiser MeshTxBuilder (requis par MeshEscrowContract)
    const meshTxBuilder = new MeshTxBuilder({
      fetcher: provider,
      submitter: provider,
    });
    meshTxBuilderInstance = meshTxBuilder;

    // Initialiser le contrat escrow
    // networkId: 0 pour testnet (Preprod), 1 pour mainnet
    const networkId = network === 'testnet' ? 0 : 1;

    const contract = new MeshEscrowContract({
      mesh: meshTxBuilder,
      fetcher: provider,
      wallet: wallet,
      networkId: networkId,
    });

    meshContractInstance = contract;
    
    console.log('✅ MeshSDK initialisé avec succès');
    console.log('📡 Réseau:', network, '(networkId:', networkId + ')');
    
    return contract;
  } catch (error: any) {
    console.error('❌ Erreur lors de l\'initialisation de MeshSDK:', error);
    throw new Error(`Impossible d'initialiser MeshSDK: ${error?.message || 'Erreur inconnue'}`);
  }
};

/**
 * Obtient l'instance du contrat MeshSDK
 */
export const getMeshContract = (): MeshEscrowContract => {
  if (!meshContractInstance) {
    throw new Error('MeshSDK n\'est pas initialisé. Appelez initMeshSDK() d\'abord.');
  }
  return meshContractInstance;
};

/**
 * Réinitialise MeshSDK (utile lors de la déconnexion du wallet)
 */
export const resetMeshSDK = (): void => {
  meshContractInstance = null;
  meshTxBuilderInstance = null;
  blockfrostProviderInstance = null;
};

/**
 * Convertit ADA en Lovelace
 */
export const adaToLovelace = (ada: number): bigint => {
  return BigInt(Math.floor(ada * 1_000_000));
};

/**
 * Convertit Lovelace en ADA
 */
export const lovelaceToAda = (lovelace: bigint | number): number => {
  const value = typeof lovelace === 'bigint' ? Number(lovelace) : lovelace;
  return value / 1_000_000;
};

/**
 * Interface pour les résultats de transaction
 */
export interface EscrowTransactionResult {
  txHash: string;
  success: boolean;
  message: string;
  explorerUrl?: string;
}

/**
 * Verrouille les fonds en escrow (équivalent à lockFundsInEscrow)
 * 
 * @param amountAda - Montant en ADA à verrouiller
 * @param wallet - Wallet API CIP-30
 * @param network - Réseau (testnet ou mainnet)
 */
export const lockFundsInEscrowMesh = async (
  amountAda: number,
  wallet: any,
  network: 'mainnet' | 'testnet' = 'testnet'
): Promise<EscrowTransactionResult> => {
  try {
    // Initialiser MeshSDK si nécessaire
    let contract = meshContractInstance;
    if (!contract) {
      contract = await initMeshSDK(wallet, network);
    }

    // Convertir ADA en Lovelace
    const amountLovelace = adaToLovelace(amountAda);

    // Préparer les assets pour MeshSDK
    const escrowAmount: Asset[] = [
      {
        unit: 'lovelace',
        quantity: amountLovelace.toString(),
      },
    ];

    console.log('🔒 Verrouillage des fonds en escrow avec MeshSDK...');
    console.log('💰 Montant:', amountAda, 'ADA (', amountLovelace.toString(), 'lovelace)');

    // Initier l'escrow
    const tx = await contract.initiateEscrow(escrowAmount);
    
    // Signer la transaction
    const signedTx = await wallet.signTx(tx);
    
    // Soumettre la transaction
    const txHash = await wallet.submitTx(signedTx);

    console.log('✅ Fonds verrouillés en escrow avec succès');
    console.log('📝 Hash de transaction:', txHash);

    const explorerUrl = network === 'testnet'
      ? `https://preprod.cardanoscan.io/transaction/${txHash}`
      : `https://cardanoscan.io/transaction/${txHash}`;

    return {
      txHash,
      success: true,
      message: 'Fonds verrouillés en escrow avec succès',
      explorerUrl,
    };
  } catch (error: any) {
    console.error('❌ Erreur lors du verrouillage des fonds:', error);
    
    // Gérer spécifiquement les erreurs de signature
    if (error.message?.includes('declined') || error.message?.includes('user declined') || error.message?.includes('rejected')) {
      return {
        txHash: '',
        success: false,
        message: 'Transaction annulée. Vous avez refusé de signer la transaction dans votre wallet.',
      };
    }

    return {
      txHash: '',
      success: false,
      message: error.message || 'Erreur lors du verrouillage des fonds en escrow',
    };
  }
};

/**
 * Libère les fonds de l'escrow (équivalent à releaseFundsFromEscrow)
 * en utilisant le contrat escrow Mesh officiel.
 *
 * IMPORTANT:
 * - Ne fonctionne QUE pour les escrows créés avec Mesh (initiateEscrow)
 * - Si l'UTXO a été créé avec un autre contrat (Aiken/Lucid), il ne sera pas trouvé
 * 
 * @param escrowTxHash - Hash de la transaction qui a créé l'escrow (Mesh)
 * @param wallet - Wallet API CIP-30
 * @param network - Réseau (testnet ou mainnet)
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
  
    // Validateur V2 minimal AlwaysSucceeds
    const validator = getEscrowValidator();
    const redeemer = Data.to(''); // redeemer minimal
  
    // Signataire acheteur
    if (!buyerAddress) {
      buyerAddress = await lucid.wallet.address();
    }
  
    console.log('🔎 UTXO sélectionné (release):', escrowUtxo.txHash, escrowUtxo.outputIndex);
  
    // Transaction simple : collecter le script UTXO, payer le vendeur, attacher le validateur V2
    const tx = await lucid
      .newTx()
      .collectFrom([escrowUtxo], redeemer)
      .payToAddress(sellerAddress, escrowUtxo.assets)
      .attachSpendingValidator(validator)
      .complete();
  
    const signedTx = await tx.sign().complete();
    const txHash = await signedTx.submit();
  
    return txHash;
  };

/**
 * Annule l'escrow et récupère les fonds (équivalent à cancelEscrow)
 * 
 * @param escrowTxHash - Hash de la transaction qui a créé l'escrow
 * @param wallet - Wallet API CIP-30
 * @param network - Réseau (testnet ou mainnet)
 */
export const cancelEscrowMesh = async (
  escrowTxHash: string,
  wallet: any,
  network: 'mainnet' | 'testnet' = 'testnet'
): Promise<EscrowTransactionResult> => {
  try {
    // Initialiser MeshSDK si nécessaire
    let contract = meshContractInstance;
    if (!contract) {
      contract = await initMeshSDK(wallet, network);
    }

    console.log('❌ Annulation de l\'escrow avec MeshSDK...');
    console.log('📝 Hash de transaction escrow:', escrowTxHash);

    // Récupérer l'UTXO de l'escrow
    const utxo = await contract.getUtxoByTxHash(escrowTxHash);
    
    if (!utxo) {
      throw new Error('UTXO de l\'escrow non trouvé. Vérifiez que le hash de transaction est correct.');
    }

    console.log('✅ UTXO trouvé:', utxo);

    // Annuler l'escrow
    const tx = await contract.cancelEscrow(utxo);
    
    // Signer la transaction
    const signedTx = await wallet.signTx(tx);
    
    // Soumettre la transaction
    const txHash = await wallet.submitTx(signedTx);

    console.log('✅ Escrow annulé avec succès');
    console.log('📝 Hash de transaction:', txHash);

    const explorerUrl = network === 'testnet'
      ? `https://preprod.cardanoscan.io/transaction/${txHash}`
      : `https://cardanoscan.io/transaction/${txHash}`;

    return {
      txHash,
      success: true,
      message: 'Escrow annulé avec succès. Les fonds ont été retournés.',
      explorerUrl,
    };
  } catch (error: any) {
    console.error('❌ Erreur lors de l\'annulation de l\'escrow:', error);
    
    // Gérer spécifiquement les erreurs de signature
    if (error.message?.includes('declined') || error.message?.includes('user declined') || error.message?.includes('rejected')) {
      return {
        txHash: '',
        success: false,
        message: 'Transaction annulée. Vous avez refusé de signer la transaction dans votre wallet.',
      };
    }

    return {
      txHash: '',
      success: false,
      message: error.message || 'Erreur lors de l\'annulation de l\'escrow',
    };
  }
};

/**
 * Récupère l'UTXO de l'escrow par hash de transaction
 */
export const getEscrowUtxoByTxHash = async (
  escrowTxHash: string,
  wallet: any,
  network: 'mainnet' | 'testnet' = 'testnet'
): Promise<any> => {
  try {
    // Initialiser MeshSDK si nécessaire
    let contract = meshContractInstance;
    if (!contract) {
      contract = await initMeshSDK(wallet, network);
    }

    const utxo = await contract.getUtxoByTxHash(escrowTxHash);
    return utxo;
  } catch (error: any) {
    console.error('❌ Erreur lors de la récupération de l\'UTXO:', error);
    throw error;
  }
};

