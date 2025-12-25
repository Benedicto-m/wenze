/**
 * Service Lucid pour les transactions Cardano
 * Gère l'initialisation de Lucid et les interactions avec la blockchain
 */

import { Lucid, Blockfrost, WalletApi, Data, TxHash } from 'lucid-cardano';
import { BLOCKCHAIN_CONFIG, getBlockfrostUrl, getBlockfrostProjectId } from './config';

// Instance globale de Lucid
let lucidInstance: Lucid | null = null;

/**
 * Vérifie si une erreur Blockfrost est liée à une clé API invalide ou manquante
 */
const isBlockfrostAuthError = (error: any): boolean => {
  const errorMessage = error?.message?.toLowerCase() || '';
  const errorString = String(error).toLowerCase();
  
  // Détecter les erreurs d'authentification courantes
  return (
    errorMessage.includes('403') ||
    errorMessage.includes('401') ||
    errorMessage.includes('unauthorized') ||
    errorMessage.includes('forbidden') ||
    errorMessage.includes('invalid api key') ||
    errorMessage.includes('api key') ||
    errorString.includes('403') ||
    errorString.includes('401') ||
    error?.status === 403 ||
    error?.status === 401
  );
};

/**
 * Vérifie si une erreur est liée à une valeur undefined convertie en BigInt
 */
const isBigIntConversionError = (error: any): boolean => {
  const errorMessage = error?.message || '';
  return (
    errorMessage.includes('Cannot convert undefined to a BigInt') ||
    errorMessage.includes('BigInt') ||
    error?.name === 'TypeError'
  );
};

/**
 * Initialise Lucid avec un wallet connecté
 */
export const initLucid = async (walletApi: WalletApi, network: 'mainnet' | 'testnet' = 'testnet'): Promise<Lucid> => {
  try {
    // Configuration Blockfrost (optionnel, pour lire la blockchain)
    const blockfrostUrl = getBlockfrostUrl(network);
    const projectId = getBlockfrostProjectId(network);

    // Vérifier que la clé API est présente
    if (!projectId || projectId.trim() === '') {
      const envVarName = network === 'testnet' ? 'VITE_BLOCKFROST_PROJECT_ID' : 'VITE_BLOCKFROST_MAINNET_PROJECT_ID';
      console.warn('⚠️ Blockfrost non configuré. Lucid ne peut pas être initialisé.');
      console.warn(`💡 Pour utiliser Lucid, configurez ${envVarName} dans les variables d'environnement.`);
      console.warn('📝 Sur Vercel: Allez dans Settings > Environment Variables et ajoutez la variable.');
      throw new Error(
        `Blockfrost non configuré. Veuillez configurer ${envVarName} dans les variables d'environnement. ` +
        `Sur Vercel, ajoutez cette variable dans Settings > Environment Variables.`
      );
    }

    // Initialiser Lucid
    let lucid: Lucid;
    const networkName = network === 'testnet' ? 'Preprod' : 'Mainnet';

    console.log('🔧 Tentative d\'initialisation de Lucid avec Blockfrost...');
    console.log('📡 URL Blockfrost:', blockfrostUrl);
    console.log('🔑 Project ID:', projectId.substring(0, 10) + '...');
    
    try {
      // Utiliser Blockfrost si la clé API est configurée
      lucid = await Lucid.new(
        new Blockfrost(blockfrostUrl, projectId),
        networkName
      );
      console.log('✅ Lucid initialisé avec Blockfrost avec succès');
    } catch (blockfrostError: any) {
      console.error('❌ Erreur avec Blockfrost:', blockfrostError);
      console.error('📋 Détails:', blockfrostError?.message || blockfrostError);
      
      // Détecter les erreurs d'authentification spécifiques
      if (isBlockfrostAuthError(blockfrostError) || isBigIntConversionError(blockfrostError)) {
        const envVarName = network === 'testnet' ? 'VITE_BLOCKFROST_PROJECT_ID' : 'VITE_BLOCKFROST_MAINNET_PROJECT_ID';
        const errorMsg = 
          `Clé API Blockfrost invalide ou manquante (erreur 403/401). ` +
          `Vérifiez que ${envVarName} est correctement configurée dans les variables d'environnement de Vercel. ` +
          `Allez dans Vercel > Settings > Environment Variables et assurez-vous que la variable est définie pour tous les environnements (Production, Preview, Development).`;
        console.error('🔐 Erreur d\'authentification Blockfrost détectée');
        console.error('💡 Solution:', errorMsg);
        throw new Error(errorMsg);
      }
      
      // Autres erreurs Blockfrost
      throw new Error(`Blockfrost non disponible: ${blockfrostError?.message || 'Erreur inconnue'}`);
    }

    // Sélectionner le wallet
    lucid.selectWallet(walletApi);

    // Sauvegarder l'instance
    lucidInstance = lucid;

    return lucid;
  } catch (error: any) {
    console.error('❌ Erreur lors de l\'initialisation de Lucid:', error);
    console.error('Détails de l\'erreur:', error?.message || error);
    
    // Propager l'erreur avec le message amélioré
    throw error;
  }
};

/**
 * Obtient l'instance Lucid actuelle
 */
export const getLucid = (): Lucid => {
  if (!lucidInstance) {
    throw new Error('Lucid n\'est pas initialisé. Appelez initLucid() d\'abord.');
  }
  return lucidInstance;
};

/**
 * Réinitialise Lucid (utile lors de la déconnexion du wallet)
 */
export const resetLucid = (): void => {
  lucidInstance = null;
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
 * Vérifie si une transaction est confirmée
 */
export const waitForConfirmation = async (txHash: TxHash, confirmations: number = 2): Promise<boolean> => {
  const lucid = getLucid();
  
  try {
    // Attendre les confirmations
    // Note: awaitTx attend jusqu'à ce que la transaction soit confirmée
    await lucid.awaitTx(txHash);
    return true;
  } catch (error) {
    console.error('Error waiting for confirmation:', error);
    return false;
  }
};

/**
 * Formate un hash de transaction pour l'affichage
 */
export const formatTxHash = (txHash: TxHash): string => {
  return `${txHash.slice(0, 10)}...${txHash.slice(-10)}`;
};

/**
 * Obtient l'URL de l'explorateur pour une transaction
 */
export const getExplorerUrl = (txHash: TxHash, network: 'mainnet' | 'testnet' = 'testnet'): string => {
  if (network === 'testnet') {
    return `https://preprod.cardanoscan.io/transaction/${txHash}`;
  } else {
    return `https://cardanoscan.io/transaction/${txHash}`;
  }
};

