/**
 * Libère les fonds de l'escrow au vendeur après confirmation de réception
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
  expectedAmountAda?: number
): Promise<ReleaseResult> => {
  try {
    const lucid = lucidInstance || getLucid();
    
    // Si l'adresse du vendeur n'est pas fournie, essayer de la récupérer depuis la commande
    if (!sellerAddress) {
      throw new Error('Adresse du vendeur requise pour libérer les fonds');
    }

    // Récupérer l'UTXO de l'escrow pour cette commande
    const escrowUtxos = await getEscrowUtxos(orderId, lucid);
    
    if (escrowUtxos.length === 0) {
      return {
        success: false,
        message: 'Aucun fonds en escrow trouvé pour cette commande. Les fonds ont peut-être déjà été libérés ou l\'escrow n\'existe pas.'
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
        const diff = utxoLovelace > expectedLovelace 
          ? utxoLovelace - expectedLovelace 
          : expectedLovelace - utxoLovelace;
        return diff <= tolerance;
      });
      
      if (matchingUtxo) {
        escrowUtxo = matchingUtxo;
        // UTXO filtré par montant attendu
      } else if (escrowUtxos.length > 1) {
        console.warn('Aucun UTXO ne correspond au montant attendu. Utilisation du premier UTXO.');
      }
    }
    
    // Obtenir l'adresse de l'acheteur (nécessaire pour signer la transaction de libération)
    const buyerAddress = await lucid.wallet.address();
    

    const txHash = await releaseFundsFromEscrow(escrowUtxo, sellerAddress, buyerAddress, lucid);

    // Obtenir l'URL de l'explorateur
    const network = lucid.network === 'Preprod' ? 'testnet' : 'mainnet';
    const explorerUrl = network === 'testnet' 
      ? `https://preprod.cardanoscan.io/transaction/${txHash}`
      : `https://cardanoscan.io/transaction/${txHash}`;

    return {
      success: true,
      txHash,
      message: 'Fonds libérés avec succès',
      explorerUrl
    };

  } catch (error: any) {
    console.error('❌ Erreur lors de la libération des fonds:', error);
    
    // Gérer spécifiquement les erreurs de signature
    if (error.message?.includes('declined') || error.message?.includes('user declined') || error.message?.includes('rejected')) {
      return {
        success: false,
        message: 'Transaction annulée. Vous avez refusé de signer la transaction dans votre wallet.'
      };
    }

    return {
      success: false,
      message: error.message || 'Erreur lors de la libération des fonds'
    };
  }
};



