/**
 * Composant de connexion wallet adaptatif
 * S'adapte automatiquement selon l'appareil (desktop/mobile)
 */

import React, { useState, useEffect } from 'react';
import { Wallet, Loader2, X, QrCode, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getWalletConnector, WalletInfo, WalletConnectionState } from '../wallet/connector';
import { detectDevice } from '../wallet/connector/detect';
import { useToast } from './Toast';

interface WalletConnectButtonProps {
  onConnect?: (wallet: any) => void;
  onDisconnect?: () => void;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
}

const WalletConnectButton: React.FC<WalletConnectButtonProps> = ({
  onConnect,
  onDisconnect,
  className = '',
  variant = 'default',
}) => {
  const [state, setState] = useState<WalletConnectionState>('idle');
  const [availableWallets, setAvailableWallets] = useState<WalletInfo[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrUri, setQrUri] = useState<string>('');
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [connectedWallet, setConnectedWallet] = useState<any>(null);
  const toast = useToast();

  const device = detectDevice();
  const connector = getWalletConnector({
    onStateChange: (newState) => {
      setState(newState);
    },
  });

  // Charger les wallets disponibles au montage
  useEffect(() => {
    loadAvailableWallets();
    checkConnection();
  }, []);

  const loadAvailableWallets = async () => {
    try {
      const wallets = await connector.getAvailableWallets();
      setAvailableWallets(wallets);
    } catch (error) {
      console.error('Erreur lors du chargement des wallets:', error);
    }
  };

  const checkConnection = () => {
    if (connector.isConnected()) {
      const wallet = connector.getConnectedWallet();
      setConnectedWallet(wallet);
      setState('connected');
    }
  };

  const handleConnect = async (walletId?: string) => {
    try {
      setShowModal(false);
      setState('connecting');
      setSelectedWallet(walletId || null);

      const wallet = await connector.connect(walletId);

      if (wallet) {
        setConnectedWallet(wallet);
        setState('connected');
        toast.success('Wallet connecté', `${wallet.walletName} est maintenant connecté`);
        if (onConnect) {
          onConnect(wallet);
        }
      }
    } catch (error: any) {
      setState('error');
      const errorMessage = error.message || 'Erreur lors de la connexion';
      toast.error('Erreur de connexion', errorMessage);

      // Si c'est mobile et que le deeplink a échoué, afficher le QR
      if (device.isMobile && (errorMessage.includes('QR code') || errorMessage.includes('QR_CODE_NEEDED'))) {
        try {
          // Extraire l'URI de l'erreur si elle contient QR_CODE_NEEDED:uri
          const uriMatch = errorMessage.match(/QR_CODE_NEEDED:(.+)/);
          const uri = uriMatch ? uriMatch[1] : connector.getQRCodeURI(walletId || 'eternl');
          setQrUri(uri);
          setShowQR(true);
        } catch (qrError) {
          console.error('Erreur génération QR:', qrError);
        }
      }
    } finally {
      setSelectedWallet(null);
    }
  };

  const handleDisconnect = async () => {
    try {
      await connector.disconnect();
      setConnectedWallet(null);
      setState('idle');
      toast.info('Déconnecté', 'Wallet déconnecté avec succès');
      if (onDisconnect) {
        onDisconnect();
      }
    } catch (error: any) {
      toast.error('Erreur', 'Impossible de se déconnecter');
    }
  };

  const handleOpenModal = () => {
    if (state === 'connected') {
      return; // Ne rien faire si déjà connecté
    }
    setShowModal(true);
    loadAvailableWallets();
  };

  // Si déjà connecté, afficher le bouton de déconnexion
  if (state === 'connected' && connectedWallet) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
          <img src={connectedWallet.icon} alt={connectedWallet.walletName} className="w-5 h-5 rounded" />
          <span className="text-sm font-medium text-emerald-400">
            {connectedWallet.walletName}
          </span>
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
        </div>
        <button
          onClick={handleDisconnect}
          className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg text-sm font-medium transition"
        >
          Déconnecter
        </button>
      </div>
    );
  }

  // Bouton principal
  const buttonClasses = {
    default: 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white',
    outline: 'bg-transparent border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500/10',
    ghost: 'bg-transparent text-cyan-400 hover:bg-cyan-500/10',
  };

  return (
    <>
      <button
        onClick={handleOpenModal}
        disabled={state === 'connecting' || state === 'detecting'}
        className={`
          px-4 py-2 rounded-lg font-medium transition-all duration-200
          flex items-center gap-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${buttonClasses[variant]}
          ${className}
        `}
      >
        {state === 'connecting' || state === 'detecting' ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Connexion...</span>
          </>
        ) : (
          <>
            <Wallet className="w-4 h-4" />
            <span>Connecter Wallet</span>
          </>
        )}
      </button>

      {/* Modal de sélection wallet */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-gradient-to-b from-[#101827] to-[#0a0f18] rounded-2xl shadow-2xl border border-cyan-500/20 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">Sélectionner un Wallet</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setShowQR(false);
                }}
                className="p-1.5 hover:bg-white/10 rounded-lg transition text-gray-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              {device.isMobile ? (
                // Vue mobile
                <div className="space-y-3">
                  <p className="text-sm text-gray-400 mb-4">
                    Sur mobile, connectez-vous via votre wallet installé
                  </p>
                  {availableWallets.map((wallet) => (
                    <button
                      key={wallet.id}
                      onClick={() => handleConnect(wallet.id)}
                      disabled={state === 'connecting'}
                      className="w-full p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center gap-3 transition disabled:opacity-50"
                    >
                      <img src={wallet.icon} alt={wallet.name} className="w-10 h-10 rounded-lg" />
                      <div className="flex-1 text-left">
                        <p className="font-medium text-white">{wallet.name}</p>
                        <p className="text-xs text-gray-400">Appuyer pour ouvrir</p>
                      </div>
                      {state === 'connecting' && selectedWallet === wallet.id ? (
                        <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                      ) : (
                        <ExternalLink className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  ))}
                  {availableWallets.length === 0 && (
                    <div className="text-center py-6 text-gray-400">
                      <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Aucun wallet mobile détecté</p>
                      <p className="text-xs mt-2">Installez Eternl ou un autre wallet Cardano</p>
                    </div>
                  )}
                </div>
              ) : (
                // Vue desktop
                <div className="space-y-3">
                  <p className="text-sm text-gray-400 mb-4">
                    Sélectionnez un wallet installé dans votre navigateur
                  </p>
                  {availableWallets.length > 0 ? (
                    availableWallets.map((wallet) => (
                      <button
                        key={wallet.id}
                        onClick={() => handleConnect(wallet.id)}
                        disabled={state === 'connecting' || !wallet.isInstalled}
                        className={`
                          w-full p-3 rounded-xl flex items-center gap-3 transition
                          ${wallet.isInstalled
                            ? 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/50'
                            : 'bg-white/[0.02] border border-white/5 opacity-40 cursor-not-allowed'
                          }
                          ${state === 'connecting' && selectedWallet === wallet.id ? 'border-cyan-500 bg-cyan-500/10' : ''}
                        `}
                      >
                        <img src={wallet.icon} alt={wallet.name} className="w-10 h-10 rounded-lg" />
                        <div className="flex-1 text-left">
                          <p className="font-medium text-white">{wallet.name}</p>
                          <p className="text-xs text-gray-400">
                            {wallet.isInstalled ? 'Installé' : 'Non installé'}
                          </p>
                        </div>
                        {wallet.isInstalled && (
                          <div className="flex items-center gap-2">
                            {state === 'connecting' && selectedWallet === wallet.id ? (
                              <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
                            ) : (
                              <CheckCircle className="w-5 h-5 text-emerald-400" />
                            )}
                          </div>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-400">
                      <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Aucun wallet détecté</p>
                      <p className="text-xs mt-2">
                        Installez une extension wallet (Nami, Eternl, Lace, etc.)
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal QR Code (fallback mobile) */}
      {showQR && qrUri && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-gradient-to-b from-[#101827] to-[#0a0f18] rounded-2xl shadow-2xl border border-cyan-500/20 overflow-hidden p-6">
            <h3 className="text-lg font-semibold text-white mb-4 text-center">
              Scanner le QR Code
            </h3>
            <div className="bg-white p-4 rounded-lg mb-4 flex flex-col items-center justify-center">
              {qrUri && (
                <QRCodeSVG value={qrUri} size={192} level="M" />
              )}
              {!qrUri && (
                <QrCode className="w-48 h-48 text-gray-400" />
              )}
            </div>
            <p className="text-sm text-gray-400 text-center mb-4">
              Scannez ce code avec votre wallet mobile pour vous connecter
            </p>
            <button
              onClick={() => {
                setShowQR(false);
                setQrUri('');
              }}
              className="w-full px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default WalletConnectButton;

