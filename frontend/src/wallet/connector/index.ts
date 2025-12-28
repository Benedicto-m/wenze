/**
 * Wallet Connector - API publique unifiée pour connexion Cardano
 * Supporte CIP-30 (desktop) et WalletConnect v2 / CIP-45 (mobile)
 */

import {
  ConnectedWallet,
  WalletConnectorInterface,
  WalletConnectorConfig,
  WalletInfo,
  WalletConnectionState,
} from './types';
import { detectDevice, getAvailableWallets, getRecommendedConnectionMethod, debugLog, debugError } from './detect';
import { connectCIP30, isCIP30Connected, disconnectCIP30 } from './cip30';
import { connectMobile, isMobileConnected, disconnectMobile, getQRCodeURI } from './mobile';
import { parseCborBalance } from '../../blockchain/walletUtils';

class WalletConnector implements WalletConnectorInterface {
  private connectedWallet: ConnectedWallet | null = null;
  private connectionState: WalletConnectionState = 'idle';
  private config: WalletConnectorConfig;
  private isConnecting = false; // Lock pour éviter les doubles connexions

  constructor(config?: WalletConnectorConfig) {
    this.config = {
      timeout: 60000,
      debug: import.meta.env.VITE_DEBUG_WALLET === 'true' || import.meta.env.DEV,
      ...config,
    };
  }

  /**
   * Connecte un wallet
   */
  async connect(walletId?: string): Promise<ConnectedWallet | null> {
    if (this.isConnecting) {
      debugError('Connexion déjà en cours');
      throw new Error('Une connexion est déjà en cours');
    }

    if (this.connectedWallet) {
      debugLog('Wallet déjà connecté:', this.connectedWallet);
      return this.connectedWallet;
    }

    this.isConnecting = true;
    this.setState('detecting');

    try {
      const device = detectDevice();
      const method = getRecommendedConnectionMethod(device);

      if (!method) {
        this.setState('error');
        throw new Error(
          device.isDesktop
            ? 'Aucun wallet détecté. Installez une extension wallet (Nami, Eternl, etc.)'
            : 'Connexion mobile non disponible. Utilisez un wallet desktop.'
        );
      }

      this.setState('connecting');

      let wallet: ConnectedWallet | null = null;

      if (method === 'cip30') {
        // Desktop: utiliser CIP-30
        if (!walletId) {
          // Si aucun wallet spécifié, prendre le premier disponible
          const available = await this.getAvailableWallets();
          const firstCIP30 = available.find(w => w.method === 'cip30');
          if (!firstCIP30) {
            throw new Error('Aucun wallet CIP-30 disponible');
          }
          walletId = firstCIP30.id;
        }

        wallet = await connectCIP30(walletId, this.config);
      } else if (method === 'walletconnect' || method === 'cip45') {
        // Mobile: utiliser WalletConnect ou CIP-45
        if (!walletId) {
          walletId = 'eternl'; // Par défaut, Eternl sur mobile
        }

        wallet = await connectMobile(walletId, this.config);
      }

      if (!wallet) {
        throw new Error('Échec de la connexion');
      }

      this.connectedWallet = wallet;
      this.setState('connected');
      debugLog('Wallet connecté avec succès:', wallet);

      return wallet;
    } catch (error: any) {
      this.setState('error');
      debugError('Erreur de connexion:', error);
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  /**
   * Déconnecte le wallet
   */
  async disconnect(): Promise<void> {
    if (!this.connectedWallet) {
      return;
    }

    try {
      if (this.connectedWallet.method === 'cip30') {
        await disconnectCIP30(this.connectedWallet.walletId);
      } else if (this.connectedWallet.method === 'walletconnect' || this.connectedWallet.method === 'cip45') {
        await disconnectMobile();
      }
    } catch (error) {
      debugError('Erreur lors de la déconnexion:', error);
    } finally {
      this.connectedWallet = null;
      this.setState('disconnected');
    }
  }

  /**
   * Vérifie si un wallet est connecté
   */
  isConnected(): boolean {
    return this.connectedWallet !== null;
  }

  /**
   * Obtient le wallet connecté
   */
  getConnectedWallet(): ConnectedWallet | null {
    return this.connectedWallet;
  }

  /**
   * Obtient l'adresse du wallet connecté
   */
  async getAddress(): Promise<string | null> {
    if (!this.connectedWallet) {
      return null;
    }

    return this.connectedWallet.addressBech32 || this.connectedWallet.address;
  }

  /**
   * Obtient le solde du wallet connecté
   */
  async getBalance(): Promise<number> {
    if (!this.connectedWallet) {
      return 0;
    }

    // Si on a déjà le solde en cache, le retourner
    if (this.connectedWallet.balance !== undefined) {
      // Rafraîchir le solde si on a l'API
      if (this.connectedWallet.api && this.connectedWallet.method === 'cip30') {
        try {
          const balanceHex = await this.connectedWallet.api.getBalance?.();
          if (balanceHex) {
            const balanceLovelace = parseCborBalance(balanceHex);
            const balanceAda = balanceLovelace / 1_000_000;
            this.connectedWallet.balance = balanceAda;
            return balanceAda;
          }
        } catch (error) {
          debugError('Erreur lors de la récupération du solde:', error);
        }
      }
    }

    return this.connectedWallet.balance || 0;
  }

  /**
   * Signe une transaction
   */
  async signTx(tx: string): Promise<string | null> {
    if (!this.connectedWallet) {
      throw new Error('Aucun wallet connecté');
    }

    if (this.connectedWallet.method === 'cip30' && this.connectedWallet.api) {
      try {
        // CIP-30 signTx attend un objet transaction
        // Ici, on assume que tx est déjà au bon format
        const signedTx = await this.connectedWallet.api.signTx?.(tx, true);
        return signedTx || null;
      } catch (error: any) {
        debugError('Erreur lors de la signature:', error);
        if (error.code === 1 || error.message?.includes('rejected')) {
          throw new Error('Signature refusée par l\'utilisateur');
        }
        throw error;
      }
    } else if (this.connectedWallet.method === 'walletconnect' || this.connectedWallet.method === 'cip45') {
      // TODO: Implémenter la signature via WalletConnect/CIP-45
      throw new Error('Signature mobile non encore implémentée');
    }

    throw new Error('Méthode de signature non supportée');
  }

  /**
   * Obtient la liste des wallets disponibles
   */
  async getAvailableWallets(): Promise<WalletInfo[]> {
    return getAvailableWallets();
  }

  /**
   * Obtient l'URI QR code pour connexion mobile (fallback)
   */
  getQRCodeURI(walletId: string): string {
    return getQRCodeURI(walletId);
  }

  /**
   * Obtient l'état actuel de la connexion
   */
  getState(): WalletConnectionState {
    return this.connectionState;
  }

  /**
   * Met à jour l'état interne
   */
  private setState(state: WalletConnectionState): void {
    this.connectionState = state;
    if (this.config.onStateChange) {
      this.config.onStateChange(state);
    }
  }
}

// Instance singleton
let connectorInstance: WalletConnector | null = null;

/**
 * Obtient ou crée l'instance du Wallet Connector
 */
export function getWalletConnector(config?: WalletConnectorConfig): WalletConnector {
  if (!connectorInstance) {
    connectorInstance = new WalletConnector(config);
  }
  return connectorInstance;
}

/**
 * Réinitialise l'instance (utile pour les tests)
 */
export function resetWalletConnector(): void {
  connectorInstance = null;
}

// Export des types et utilitaires
export * from './types';
export * from './detect';
export { connectCIP30, isCIP30Connected } from './cip30';
export { connectMobile, getQRCodeURI } from './mobile';

