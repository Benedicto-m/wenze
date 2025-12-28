/**
 * Implémentation CIP-30 pour connexion desktop via extensions navigateur
 */

import { ConnectedWallet, WalletConnectorConfig } from './types';
import { SUPPORTED_WALLETS, debugLog, debugError, debugWarn } from './detect';
import { parseCborBalance } from '../../blockchain/walletUtils';

declare global {
  interface Window {
    cardano?: Record<string, any>;
  }
}

/**
 * Convertit une adresse hex en Bech32 si nécessaire
 */
function ensureBech32Address(address: string | string[], isTestnet?: boolean): string {
  if (Array.isArray(address)) {
    address = address[0] || '';
  }

  // Si déjà en Bech32, retourner tel quel
  if (typeof address === 'string' && (address.startsWith('addr1') || address.startsWith('addr_test'))) {
    return address;
  }

  // Sinon, essayer de convertir (simplifié - en production utiliser bech32 lib)
  // Pour l'instant, on retourne l'adresse telle quelle et on laisse walletUtils gérer
  return address;
}

/**
 * Connecte un wallet via CIP-30
 */
export async function connectCIP30(
  walletId: string,
  config?: WalletConnectorConfig
): Promise<ConnectedWallet | null> {
  debugLog(`Tentative de connexion CIP-30 avec ${walletId}`);

  if (!window.cardano) {
    debugError('window.cardano non disponible');
    throw new Error('Aucun wallet Cardano détecté. Installez une extension wallet.');
  }

  const walletProvider = window.cardano[walletId];
  if (!walletProvider) {
    debugError(`Wallet ${walletId} non trouvé`);
    throw new Error(`Le wallet ${walletId} n'est pas installé.`);
  }

  try {
    // Timeout pour la connexion
    const timeout = config?.timeout || 60000;
    const enablePromise = walletProvider.enable();

    const api = await Promise.race([
      enablePromise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout de connexion')), timeout)
      ),
    ]);

    if (!api) {
      throw new Error('La connexion au wallet a été refusée.');
    }

    debugLog(`Wallet ${walletId} activé avec succès`);

    // Récupérer les adresses
    const usedAddresses = await api.getUsedAddresses?.() || [];
    const unusedAddresses = await api.getUnusedAddresses?.() || [];
    const addresses = [...usedAddresses, ...unusedAddresses];

    if (addresses.length === 0) {
      throw new Error('Aucune adresse trouvée dans le wallet.');
    }

    const addressRaw = addresses[0];
    let addressBech32 = ensureBech32Address(addressRaw);

    // Si l'adresse n'est pas en Bech32, essayer de détecter le réseau
    if (!addressBech32.startsWith('addr1') && !addressBech32.startsWith('addr_test')) {
      try {
        const networkId = await api.getNetworkId?.();
        const isTestnet = networkId === 0;
        // Pour l'instant, on garde l'adresse hex et on la convertira ailleurs si nécessaire
        addressBech32 = addressRaw;
      } catch (e) {
        debugWarn('Impossible de détecter le réseau, utilisation de l\'adresse brute');
        addressBech32 = addressRaw;
      }
    }

    // Récupérer le solde
    let balance = 0;
    try {
      const balanceHex = await api.getBalance?.();
      if (balanceHex) {
        const balanceLovelace = parseCborBalance(balanceHex);
        balance = balanceLovelace / 1_000_000; // Convertir en ADA
      }
    } catch (e) {
      debugWarn('Impossible de récupérer le solde:', e);
      // On continue même si le solde ne charge pas
    }

    const walletConfig = SUPPORTED_WALLETS.find(w => w.id === walletId);
    if (!walletConfig) {
      throw new Error(`Configuration wallet ${walletId} introuvable`);
    }

    const connectedWallet: ConnectedWallet = {
      walletId,
      walletName: walletConfig.name,
      address: addressRaw,
      addressBech32,
      balance,
      icon: walletConfig.icon,
      method: 'cip30',
      api,
    };

    debugLog('Connexion CIP-30 réussie:', connectedWallet);
    return connectedWallet;
  } catch (error: any) {
    debugError('Erreur connexion CIP-30:', error);
    
    if (error.message === 'User rejected the request' || error.code === 1) {
      throw new Error('Connexion refusée par l\'utilisateur');
    }
    
    if (error.message.includes('Timeout')) {
      throw new Error('Timeout de connexion. Veuillez réessayer.');
    }

    throw new Error(error.message || 'Erreur lors de la connexion au wallet');
  }
}

/**
 * Vérifie si un wallet CIP-30 est déjà connecté
 */
export async function isCIP30Connected(walletId: string): Promise<boolean> {
  if (!window.cardano?.[walletId]) {
    return false;
  }

  try {
    return await window.cardano[walletId].isEnabled?.() || false;
  } catch {
    return false;
  }
}

/**
 * Déconnecte un wallet CIP-30
 */
export async function disconnectCIP30(walletId: string): Promise<void> {
  debugLog(`Déconnexion CIP-30 pour ${walletId}`);
  // CIP-30 n'a pas de méthode de déconnexion explicite
  // On supprime juste les références locales
}

