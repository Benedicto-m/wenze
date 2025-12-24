/**
 * Prépare et exécute une transaction de paiement ADA
 * Implémentation 100% Lucid + script Plutus V2 minimal (escrow sous contrôle)
 */

import { getLucid, getExplorerUrl } from './lucidService';
import { lockFundsInEscrow } from './escrowContract';
import { Lucid } from 'lucid-cardano';

export interface PaymentResult {
  txHash: string;
  status: 'success' | 'pending' | 'failed';
  network: 'Preprod Testnet' | 'Mainnet';
  explorerUrl?: string;
  message?: string;
}

/**
 * Prépare et exécute un paiement ADA
 * Verrouille les fonds dans un UTXO de script (escrow) avec Lucid + Plutus V2
 * 
 * @param orderId - ID de la commande (pour référence)
 * @param amountAda - Montant en ADA à envoyer
 * @param sellerAddress - Adresse Cardano du vendeur (Bech32)
 * @param lucidInstance - Instance Lucid optionnelle (depuis le contexte)
 * @param wallet - Wallet API CIP-30 pour MeshSDK (optionnel, sera récupéré si non fourni)
 * @returns Résultat de la transaction avec le hash
 */
export const prepareAdaPayment = async (
  orderId: string,
  amountAda: number,
  sellerAddress?: string,
  lucidInstance?: Lucid | null,
  wallet?: any // Conservé pour compatibilité, non utilisé dans la version Lucid-only
): Promise<PaymentResult> => {
  try {
    // Récupérer ou initialiser Lucid
    let lucid: Lucid | null = lucidInstance || null;
    if (!lucid) {
        lucid = getLucid();
    }

    // Vérifier l'adresse du vendeur
    if (!sellerAddress) {
      throw new Error(
        "Adresse du vendeur requise. Le vendeur doit connecter son wallet Cardano pour recevoir les paiements."
      );
    }

    // Adresse de l'acheteur (wallet connecté)
    const buyerAddress = await lucid.wallet.address();
    if (!buyerAddress) {
      throw new Error("Impossible d'obtenir l'adresse du wallet connecté.");
    }

    console.log('🔒 Création de l\'escrow Lucid V2 (AlwaysSucceeds)...');
    console.log('📋 Détails de la transaction:');
    console.log('   - Commande:', orderId);
    console.log('   - Acheteur:', buyerAddress.substring(0, 20) + '...');
    console.log('   - Vendeur:', sellerAddress);
    console.log('   - Montant:', amountAda, 'ADA');

    // Verrouiller les fonds dans l'UTXO d'escrow (script V2 minimal)
      const escrowResult = await lockFundsInEscrow(
        orderId,
        amountAda,
        buyerAddress,
        sellerAddress,
        Date.now() + 7 * 24 * 60 * 60 * 1000,
        lucid
      );

    const txHash = escrowResult.txHash;

    // Déterminer le réseau
    const networkLabel: 'Preprod Testnet' | 'Mainnet' =
      lucid.network === 'Preprod' ? 'Preprod Testnet' : 'Mainnet';

    const explorerUrl = getExplorerUrl(
      txHash,
      lucid.network === 'Preprod' ? 'testnet' : 'mainnet'
    );

    return {
      txHash,
      status: 'success',
      network: networkLabel,
      explorerUrl,
      message: `Transaction ${networkLabel} envoyée avec succès`,
    };

  } catch (error: any) {
    console.error('❌ Erreur lors de la création de la transaction:', error);
    
    // Déterminer le réseau depuis Lucid (si disponible)
    let network: 'Preprod Testnet' | 'Mainnet' = 'Preprod Testnet';
    try {
      const lucid = getLucid();
      network = lucid.network === 'Preprod' ? 'Preprod Testnet' : 'Mainnet';
    } catch {
      // Lucid non disponible
    }

    // Gérer spécifiquement le cas où l'utilisateur refuse de signer
    let errorMessage = error.message || 'Erreur lors de la création de la transaction';
    if (error.message?.includes('declined') || error.message?.includes('user declined') || error.message?.includes('rejected')) {
      errorMessage = 'Transaction annulée. Vous avez refusé de signer la transaction dans votre wallet.';
    } else if (error.message?.includes('insufficient') || error.message?.includes('balance')) {
      errorMessage = 'Solde insuffisant. Vérifiez que vous avez assez d\'ADA dans votre wallet pour couvrir le montant et les frais de transaction.';
    }

    return {
      txHash: '',
      status: 'failed',
      network,
      message: errorMessage
    };
  }
};
