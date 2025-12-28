import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { WalletData } from '../components/WalletModal';
import { parseCborBalance, verifyNetwork } from '../blockchain/walletUtils';
import { checkNetwork } from '../blockchain/config';
import { initLucid, resetLucid } from '../blockchain/lucidService';
import { Lucid } from 'lucid-cardano';
import { getWalletConnector, ConnectedWallet } from '../wallet/connector';

interface BlockchainContextType {
  wallet: WalletData | null;
  isConnected: boolean;
  network: 'mainnet' | 'testnet' | null;
  connectWallet: (walletData: WalletData) => void;
  disconnectWallet: () => void;
  refreshBalance: () => Promise<void>;
  walletApi: any | null; // API CIP-30 du wallet
  lucid: Lucid | null; // Instance Lucid (null si non initialisé)
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

export const BlockchainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [network, setNetwork] = useState<'mainnet' | 'testnet' | null>(null);
  const [walletApi, setWalletApi] = useState<any | null>(null);
  const [lucid, setLucid] = useState<Lucid | null>(null);

  // Charger le wallet depuis localStorage au démarrage
  useEffect(() => {
    const loadWallet = async () => {
      try {
        const connector = getWalletConnector();
        
        // Vérifier si le connector a déjà un wallet connecté
        if (connector.isConnected()) {
          const connectedWallet = connector.getConnectedWallet();
          if (connectedWallet) {
            await syncWalletFromConnector(connectedWallet);
            return;
          }
        }

        // Fallback: charger depuis localStorage (ancien système)
        const savedWalletId = localStorage.getItem('wenze-wallet-id');
        const savedWalletData = localStorage.getItem('wenze-wallet-data');
        
        if (savedWalletId && savedWalletData) {
          try {
            // Essayer de reconnecter via le connector
            if (savedWalletId && window.cardano?.[savedWalletId]) {
              const api = await window.cardano[savedWalletId].enable();
              const walletData: WalletData = JSON.parse(savedWalletData);
              
              const addresses = await api.getUsedAddresses();
              if (addresses && addresses.length > 0) {
                setWalletApi(api);
                setWallet(walletData);
                const address = walletData.addressBech32 || addresses[0];
                const detectedNetwork = checkNetwork(address) ? 'testnet' : 'mainnet';
                setNetwork(detectedNetwork);
                
                const networkCheck = verifyNetwork(walletData);
                if (!networkCheck.valid) {
                  console.warn('⚠️ Network warning:', networkCheck.message);
                }
                
                initLucid(api, detectedNetwork)
                  .then((lucidInstance) => {
                    setLucid(lucidInstance);
                    console.log('✅ Lucid initialisé avec succès');
                  })
                  .catch((error: any) => {
                    console.warn('⚠️ Lucid ne peut pas être initialisé:', error?.message || error);
                    setLucid(null);
                  });
                
                refreshBalance(api, walletData).catch((error) => {
                  console.warn('Error refreshing balance:', error);
                });
              }
            }
          } catch (error) {
            localStorage.removeItem('wenze-wallet-id');
            localStorage.removeItem('wenze-wallet-data');
          }
        }
      } catch (error) {
        console.error('Error loading wallet:', error);
      }
    };

    loadWallet();
  }, []);

  // Synchronise l'état depuis le connector
  const syncWalletFromConnector = useCallback(async (connectedWallet: ConnectedWallet) => {
    const walletData: WalletData = {
      name: connectedWallet.walletName,
      address: connectedWallet.address,
      addressBech32: connectedWallet.addressBech32,
      balance: connectedWallet.balance || 0,
      walletId: connectedWallet.walletId,
      icon: connectedWallet.icon,
    };

    setWallet(walletData);
    setWalletApi(connectedWallet.api || null);
    
    const detectedNetwork = checkNetwork(connectedWallet.addressBech32) ? 'testnet' : 'mainnet';
    setNetwork(detectedNetwork);
    
    const networkCheck = verifyNetwork(walletData);
    if (!networkCheck.valid) {
      console.warn('⚠️ Network warning:', networkCheck.message);
    }
    
    localStorage.setItem('wenze-wallet-id', connectedWallet.walletId);
    localStorage.setItem('wenze-wallet-data', JSON.stringify(walletData));
    
    if (connectedWallet.api && connectedWallet.method === 'cip30') {
      initLucid(connectedWallet.api, detectedNetwork)
        .then((lucidInstance) => {
          setLucid(lucidInstance);
          console.log('✅ Lucid initialisé avec succès');
        })
        .catch((error: any) => {
          console.warn('⚠️ Lucid ne peut pas être initialisé:', error?.message || error);
          setLucid(null);
        });
    }
    
    if (connectedWallet.api) {
      refreshBalance(connectedWallet.api, walletData).catch((error) => {
        console.warn('Error refreshing balance:', error);
      });
    }
  }, []);

  const refreshBalance = useCallback(async (api?: any, walletData?: WalletData) => {
    const apiToUse = api || walletApi;
    const walletToUpdate = walletData || wallet;
    
    if (!apiToUse || !walletToUpdate) return;

    try {
      const balanceHex = await apiToUse.getBalance();
      const balanceLovelace = parseCborBalance(balanceHex);
      const balanceAda = balanceLovelace / 1_000_000;
      
      if (walletToUpdate) {
        setWallet({ ...walletToUpdate, balance: balanceAda });
      }
    } catch (error) {
      console.warn('Error refreshing balance:', error);
    }
  }, [walletApi, wallet]);

  const connectWallet = useCallback(async (walletData: WalletData | ConnectedWallet) => {
    // Si c'est un ConnectedWallet du connector, le synchroniser
    if ('method' in walletData) {
      await syncWalletFromConnector(walletData as ConnectedWallet);
      return;
    }

    // Sinon, utiliser l'ancien système (compatibilité)
    const data = walletData as WalletData;
    setWallet(data);
    
    const address = data.addressBech32;
    const detectedNetwork = checkNetwork(address) ? 'testnet' : 'mainnet';
    setNetwork(detectedNetwork);
    
    const networkCheck = verifyNetwork(data);
    if (!networkCheck.valid) {
      console.warn('⚠️ Network warning:', networkCheck.message);
    }
    
    localStorage.setItem('wenze-wallet-id', data.walletId);
    localStorage.setItem('wenze-wallet-data', JSON.stringify(data));
    
    if (window.cardano?.[data.walletId]) {
      try {
        const api = await window.cardano[data.walletId].enable();
        setWalletApi(api);
        
        initLucid(api, detectedNetwork)
          .then((lucidInstance) => {
            setLucid(lucidInstance);
            console.log('✅ Lucid initialisé avec succès');
          })
          .catch((error: any) => {
            console.warn('⚠️ Lucid ne peut pas être initialisé:', error?.message || error);
            setLucid(null);
          });
      } catch (error: any) {
        console.error('Error enabling wallet API:', error);
      }
    }
  }, [syncWalletFromConnector]);

  const disconnectWallet = useCallback(async () => {
    // Déconnecter via le connector si connecté
    const connector = getWalletConnector();
    if (connector.isConnected()) {
      try {
        await connector.disconnect();
      } catch (error) {
        console.error('Error disconnecting via connector:', error);
      }
    }
    
    setWallet(null);
    setWalletApi(null);
    setNetwork(null);
    setLucid(null);
    resetLucid();
    localStorage.removeItem('wenze-wallet-id');
    localStorage.removeItem('wenze-wallet-data');
  }, []);

  // Valeur du contexte - toujours définie
  const contextValue: BlockchainContextType = {
    wallet,
    isConnected: !!wallet,
    network,
    connectWallet,
    disconnectWallet,
    refreshBalance: () => refreshBalance(),
    walletApi,
    lucid,
  };

  return (
    <BlockchainContext.Provider value={contextValue}>
      {children}
    </BlockchainContext.Provider>
  );
};

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (context === undefined) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
};

