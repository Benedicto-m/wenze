/**
 * Libère les fonds de l'escrow au vendeur après confirmation de réception
 *
 * Implémentation 100% Lucid + script Plutus V2 minimal (escrow sous contrôle).
 */

import { getLucid } from './lucidService';
import { releaseFundsFromEscrow, getEscrowUtxos } from './escrowContract';
import { Lucid } from 'lucid-cardano';

export interface ReleaseResult {
  success: boolean;
  txHash?: string;
  message: string;
  explorerUrl?: string;
}

/**
 * Libère les fonds de l'escrow au vendeur
 * 
 * @param orderId - ID de la commande
 * @param sellerAddress - Adresse du vendeur (destinataire)
 * @param lucidInstance - Instance Lucid optionnelle
 * @param expectedAmountAda - Montant attendu en ADA (pour filtrer le bon UTXO)
 */
export const prepareAdaRelease = async (
  orderId: string,
  sellerAddress?: string,
  lucidInstance?: Lucid | null,
  expectedAmountAda?: number,
  wallet?: any, // Conservé pour compatibilité, non utilisé dans la version Lucid-only
  escrowTxHash?: string // Conservé pour compatibilité, non utilisé dans la version Lucid-only
): Promise<ReleaseResult> => {
  try {
    const lucid = lucidInstance || getLucid();
    
    // Si l'adresse du vendeur n'est pas fournie
    if (!sellerAddress) {
      return {
        success: false,
        message: 'Adresse du vendeur requise pour libérer les fonds',
      };
    }

    // Récupérer les UTXOs de l'escrow pour cette commande
    const escrowUtxos = await getEscrowUtxos(orderId, lucid);
    
    if (escrowUtxos.length === 0) {
      return {
        success: false,
        message:
          'Aucun fonds en escrow trouvé pour cette commande. Les fonds ont peut-être déjà été libérés ou l’escrow n’existe pas.',
      };
    }

    // Filtrer l'UTXO par montant attendu si fourni
    let escrowUtxo = escrowUtxos[0];
    if (expectedAmountAda && escrowUtxos.length > 1) {
      const expectedLovelace = BigInt(Math.floor(expectedAmountAda * 1_000_000));
      // Tolérance de 0.5 ADA pour les frais de transaction
      const tolerance = 500_000n; // 0.5 ADA
      
      const matchingUtxo = escrowUtxos.find(utxo => {
        const utxoLovelace = utxo.assets?.lovelace || 0n;
        const diff =
          utxoLovelace > expectedLovelace
          ? utxoLovelace - expectedLovelace 
          : expectedLovelace - utxoLovelace;
        return diff <= tolerance;
      });
      
      if (matchingUtxo) {
        escrowUtxo = matchingUtxo;
      } else if (escrowUtxos.length > 1) {
        console.warn('Aucun UTXO ne correspond au montant attendu. Utilisation du premier UTXO.');
      }
    }
    
    // Adresse de l'acheteur (nécessaire pour signer la transaction de libération)
    const buyerAddress = await lucid.wallet.address();
    if (!buyerAddress) {
      return {
        success: false,
        message: "Impossible d'obtenir l'adresse du wallet connecté (acheteur).",
      };
    }

    // Libérer les fonds via le script V2 minimal
    const txHash = await releaseFundsFromEscrow(escrowUtxo, sellerAddress, buyerAddress, lucid);

    const network = lucid.network === 'Preprod' ? 'testnet' : 'mainnet';
    const explorerUrl =
      network === 'testnet'
      ? `https://preprod.cardanoscan.io/transaction/${txHash}`
      : `https://cardanoscan.io/transaction/${txHash}`;

    return {
      success: true,
      txHash,
      message: 'Fonds libérés avec succès',
      explorerUrl,
    };
  } catch (error: any) {
    const errorMessage = error?.message || String(error);
    console.error('❌ Erreur lors de la libération des fonds avec Lucid:', error);
    
    // Gérer spécifiquement les erreurs de signature
    if (
      errorMessage.includes('declined') ||
      errorMessage.includes('user declined') ||
      errorMessage.includes('rejected')
    ) {
      return {
        success: false,
        message: 'Transaction annulée. Vous avez refusé de signer la transaction dans votre wallet.',
      };
    }

    return {
      success: false,
      message: errorMessage || 'Erreur lors de la libération des fonds',
    };
  }
};



