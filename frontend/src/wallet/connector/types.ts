/**
 * Types pour le Wallet Connector Cardano
 * Supporte CIP-30 (desktop) et WalletConnect v2 / CIP-45 (mobile)
 */

export type WalletConnectionMethod = 'cip30' | 'walletconnect' | 'cip45';

export type WalletConnectionState = 
  | 'idle'
  | 'detecting'
  | 'connecting'
  | 'awaitingApproval'
  | 'connected'
  | 'error'
  | 'disconnected';

export interface WalletInfo {
  id: string;
  name: string;
  icon: string;
  method: WalletConnectionMethod;
  isInstalled?: boolean;
}

export interface ConnectedWallet {
  walletId: string;
  walletName: string;
  address: string;
  addressBech32: string;
  balance: number;
  icon: string;
  method: WalletConnectionMethod;
  api?: any; // API CIP-30 ou WalletConnect session
}

export interface WalletConnectorConfig {
  timeout?: number; // Timeout en ms (défaut: 60000)
  debug?: boolean; // Mode debug (défaut: depuis VITE_DEBUG_WALLET)
  onStateChange?: (state: WalletConnectionState) => void;
}

export interface WalletConnectorInterface {
  connect(walletId?: string): Promise<ConnectedWallet | null>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  getConnectedWallet(): ConnectedWallet | null;
  getAddress(): Promise<string | null>;
  getBalance(): Promise<number>;
  signTx(tx: string): Promise<string | null>;
  getAvailableWallets(): Promise<WalletInfo[]>;
}

export interface WalletConnectSession {
  topic: string;
  peer: {
    metadata: {
      name: string;
      description: string;
      url: string;
      icons: string[];
    };
  };
}

export interface WalletConnectError {
  code: number;
  message: string;
  data?: any;
}

