import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useBlockchain } from '../context/BlockchainContext';
import { useToast } from '../components/Toast';
import {
  getAllRewardClaims,
  updateRewardClaimStatus,
  bulkUpdateRewardClaimStatus,
  getRewardStats,
  RewardClaimWithUser,
  RewardStats,
} from '../utils/adminRewards';
import { isAdmin } from '../utils/checkAdmin';
import { sendRewardPayment, sendBulkRewardPayments } from '../blockchain/sendRewardPayment';
import { initLucid } from '../blockchain/lucidService';
import WalletModal, { WalletData } from '../components/WalletModal';
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  ExternalLink,
  Gift,
  TrendingUp,
  DollarSign,
  Calendar,
  User,
  Copy,
  Check,
  Send,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Wallet,
} from 'lucide-react';

const AdminRewards = () => {
  const { user } = useAuth();
  const { wallet, connectWallet: connectBlockchainWallet, lucid: blockchainLucid, network } = useBlockchain();
  const toast = useToast();
  const [claims, setClaims] = useState<RewardClaimWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUserAdmin, setIsUserAdmin] = useState<boolean | null>(null);
  const [stats, setStats] = useState<RewardStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'processing' | 'sent' | 'failed'>('all');
  const [monthFilter, setMonthFilter] = useState<number | 'all'>('all');
  const [yearFilter, setYearFilter] = useState<number | 'all'>('all');
  const [updating, setUpdating] = useState<string | null>(null);
  const [selectedClaims, setSelectedClaims] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [txHashInputs, setTxHashInputs] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [sendingRewards, setSendingRewards] = useState(false);
  const [adminLucid, setAdminLucid] = useState<any>(null);

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  useEffect(() => {
    if (user) {
      checkAdminStatus();
      fetchClaims();
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [user, statusFilter, monthFilter, yearFilter]);

  useEffect(() => {
    // Initialiser Lucid si le wallet est connecté
    if (wallet && network && window.cardano) {
      const initializeAdminLucid = async () => {
        try {
          const walletId = localStorage.getItem('wenze-wallet-id');
          if (walletId && window.cardano?.[walletId]) {
            const walletApi = await window.cardano[walletId].enable();
            const lucidInstance = await initLucid(walletApi, network);
            setAdminLucid(lucidInstance);
            console.log('✅ Lucid admin initialisé');
          }
        } catch (error) {
          console.error('Erreur lors de l\'initialisation de Lucid admin:', error);
        }
      };
      initializeAdminLucid();
    }
  }, [wallet, network]);

  const checkAdminStatus = async () => {
    if (!user) return;
    try {
      const adminStatus = await isAdmin(user.id);
      setIsUserAdmin(adminStatus);
      if (!adminStatus) {
        setLoading(false);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du statut admin:', error);
      setIsUserAdmin(false);
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
          <h2 className="text-xl font-bold text-dark mb-2">Accès non autorisé</h2>
          <p className="text-gray-500">Vous devez être connecté pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  if (isUserAdmin === false) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-6 text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Accès refusé</h2>
          <p className="text-gray-500">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
          <p className="text-sm text-gray-400 mt-2">Cette page est réservée aux administrateurs.</p>
        </div>
      </div>
    );
  }

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (monthFilter !== 'all') filters.month = monthFilter;
      if (yearFilter !== 'all') filters.year = yearFilter;

      const data = await getAllRewardClaims(filters);
      setClaims(data);
    } catch (error: any) {
      console.error('Error fetching claims:', error);
      toast.error('❌ Erreur de chargement', 'Impossible de charger les réclamations. ' + (error.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await getRewardStats();
      setStats(data);
    } catch (error: any) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleUpdateStatus = async (
    claimId: string,
    newStatus: 'pending' | 'processing' | 'sent' | 'failed',
    txHash?: string
  ) => {
    try {
      setUpdating(claimId);
      const result = await updateRewardClaimStatus(claimId, newStatus, txHash);

      if (result.success) {
        const statusEmoji = newStatus === 'sent' ? '✅' : newStatus === 'processing' ? '🔄' : newStatus === 'failed' ? '❌' : '⏳';
        toast.success(`${statusEmoji} Statut mis à jour`, result.message || `Le statut a été mis à jour avec succès.`);
        await fetchClaims();
        await fetchStats();
        // Réinitialiser l'input tx_hash pour cette réclamation
        if (txHash) {
          setTxHashInputs(prev => {
            const next = { ...prev };
            delete next[claimId];
            return next;
          });
        }
      } else {
        toast.error('❌ Erreur de mise à jour', result.message || 'Impossible de mettre à jour le statut de la réclamation.');
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error('❌ Erreur de mise à jour', error.message || 'Une erreur est survenue lors de la mise à jour du statut.');
    } finally {
      setUpdating(null);
    }
  };

  const handleBulkUpdateStatus = async (newStatus: 'pending' | 'processing' | 'sent' | 'failed') => {
    if (selectedClaims.size === 0) {
      toast.warning('⚠️ Sélection requise', 'Veuillez sélectionner au moins une réclamation avant de continuer.');
      return;
    }

    try {
      setUpdating('bulk');
      const result = await bulkUpdateRewardClaimStatus(Array.from(selectedClaims), newStatus);

      if (result.success) {
        const statusEmoji = newStatus === 'sent' ? '✅' : newStatus === 'processing' ? '🔄' : newStatus === 'failed' ? '❌' : '⏳';
        toast.success(`${statusEmoji} ${selectedClaims.size} réclamation(s) mise(s) à jour`, result.message || `${selectedClaims.size} réclamation(s) ont été mises à jour avec succès.`);
        setSelectedClaims(new Set());
        setShowBulkActions(false);
        await fetchClaims();
        await fetchStats();
      } else {
        toast.error('❌ Erreur de mise à jour', result.message || 'Impossible de mettre à jour les réclamations sélectionnées.');
      }
    } catch (error: any) {
      console.error('Error bulk updating:', error);
      toast.error('❌ Erreur de mise à jour', error.message || 'Une erreur est survenue lors de la mise à jour en masse.');
    } finally {
      setUpdating(null);
    }
  };

  const handleSendSelectedRewards = async () => {
    if (selectedClaims.size === 0) {
      toast.warning('⚠️ Sélection requise', 'Veuillez sélectionner au moins une réclamation avant d\'envoyer les récompenses.');
      return;
    }

    if (!adminLucid && !blockchainLucid) {
      toast.warning('🔐 Wallet requis', 'Veuillez connecter votre wallet Cardano pour envoyer les récompenses.');
      setIsWalletModalOpen(true);
      return;
    }

    const selectedClaimsData = claims.filter(c => selectedClaims.has(c.id) && c.status === 'pending');
    
    if (selectedClaimsData.length === 0) {
      toast.warning('⚠️ Aucune réclamation en attente', 'Aucune réclamation en attente n\'a été sélectionnée. Veuillez sélectionner des réclamations avec le statut "En attente".');
      return;
    }

    const totalAmount = selectedClaimsData.reduce((sum, c) => sum + c.reward_ada, 0);
    
    if (!confirm(`Vous êtes sur le point d'envoyer ${selectedClaimsData.length} récompense(s) pour un total de ${totalAmount.toFixed(2)} ADA. Continuer ?`)) {
      return;
    }

    try {
      setSendingRewards(true);
      const lucidToUse = adminLucid || blockchainLucid;

      // Préparer les paiements
      const payments = selectedClaimsData.map(claim => ({
        address: claim.cardano_address,
        amountAda: claim.reward_ada,
      }));

      // Envoyer en batch si plusieurs, sinon envoi unique
      let txHash: string;
      if (payments.length === 1) {
        const result = await sendRewardPayment(payments[0].address, payments[0].amountAda, lucidToUse);
        if (!result.success) {
          throw new Error(result.error || 'Erreur lors de l\'envoi');
        }
        txHash = result.txHash;
        
        // Mettre à jour la première réclamation (l'email est envoyé automatiquement dans updateRewardClaimStatus)
        await updateRewardClaimStatus(selectedClaimsData[0].id, 'sent', txHash, true);
      } else {
        const result = await sendBulkRewardPayments(payments, lucidToUse);
        if (!result.success) {
          throw new Error(result.error || 'Erreur lors de l\'envoi en batch');
        }
        txHash = result.txHash;
        
        // Mettre à jour toutes les réclamations avec le même tx_hash (batch)
        // Les emails sont envoyés automatiquement dans updateRewardClaimStatus
        for (const claim of selectedClaimsData) {
          await updateRewardClaimStatus(claim.id, 'sent', txHash, true);
        }
      }
      
      const totalAmount = selectedClaimsData.reduce((sum, c) => sum + c.reward_ada, 0);
      toast.success(
        `✅ ${selectedClaimsData.length} récompense(s) envoyée(s) avec succès`,
        `Total de ${totalAmount.toFixed(2)} ADA distribué${selectedClaimsData.length > 1 ? 's' : ''}. Transaction: ${txHash.substring(0, 16)}...`
      );
      setSelectedClaims(new Set());
      setShowBulkActions(false);
      await fetchClaims();
      await fetchStats();
    } catch (error: any) {
      console.error('Error sending rewards:', error);
      toast.error('❌ Erreur d\'envoi', error.message || 'Impossible d\'envoyer les récompenses. Vérifiez votre connexion et votre solde.');
    } finally {
      setSendingRewards(false);
    }
  };

  const handleSendSingleReward = async (claim: RewardClaimWithUser) => {
    if (!adminLucid && !blockchainLucid) {
      toast.warning('🔐 Wallet requis', 'Veuillez connecter votre wallet Cardano pour envoyer la récompense.');
      setIsWalletModalOpen(true);
      return;
    }

    if (!confirm(`Envoyer ${claim.reward_ada.toFixed(2)} ADA à ${claim.user?.full_name || claim.user?.username || 'l\'utilisateur'} ?`)) {
      return;
    }

    try {
      setUpdating(claim.id);
      const lucidToUse = adminLucid || blockchainLucid;
      
      const result = await sendRewardPayment(claim.cardano_address, claim.reward_ada, lucidToUse);
      
      if (result.success) {
        // L'email est envoyé automatiquement dans updateRewardClaimStatus
        await updateRewardClaimStatus(claim.id, 'sent', result.txHash, true);
        toast.success(
          `✅ Récompense de ${claim.reward_ada.toFixed(2)} ADA réclamée avec succès`,
          `Transaction envoyée: ${result.txHash.substring(0, 16)}... L'utilisateur a été notifié par email.`
        );
        await fetchClaims();
        await fetchStats();
      } else {
        toast.error('❌ Erreur d\'envoi', result.error || 'Impossible d\'envoyer la récompense. Vérifiez votre connexion et votre solde.');
      }
    } catch (error: any) {
      console.error('Error sending reward:', error);
      toast.error('❌ Erreur d\'envoi', error.message || 'Une erreur est survenue lors de l\'envoi de la récompense.');
    } finally {
      setUpdating(null);
    }
  };

  const toggleClaimSelection = (claimId: string) => {
    const newSelected = new Set(selectedClaims);
    if (newSelected.has(claimId)) {
      newSelected.delete(claimId);
    } else {
      newSelected.add(claimId);
    }
    setSelectedClaims(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const toggleSelectAll = () => {
    if (selectedClaims.size === filteredClaims.length) {
      setSelectedClaims(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedClaims(new Set(filteredClaims.map(c => c.id)));
      setShowBulkActions(true);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleWalletConnect = (walletData: WalletData) => {
    connectBlockchainWallet(walletData);
    setIsWalletModalOpen(false);
    // Lucid sera initialisé dans l'useEffect qui surveille wallet et network
  };

  const filteredClaims = claims.filter((claim) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    const userName = claim.user?.full_name?.toLowerCase() || claim.user?.username?.toLowerCase() || '';
    const userEmail = claim.user?.email?.toLowerCase() || '';
    const address = claim.cardano_address.toLowerCase();

    return (
      userName.includes(query) ||
      userEmail.includes(query) ||
      address.includes(query) ||
      claim.id.toLowerCase().includes(query)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
            <Clock className="w-3 h-3" />
            En attente
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
            <Loader2 className="w-3 h-3 animate-spin" />
            En traitement
          </span>
        );
      case 'sent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Envoyée
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
            <XCircle className="w-3 h-3" />
            Échouée
          </span>
        );
      default:
        return null;
    }
  };

  if (loading && claims.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Gestion des Récompenses WZP
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">Gérez les réclamations de récompenses mensuelles des utilisateurs</p>
          </div>
          <div className="flex items-center gap-4">
            {wallet ? (
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2">
                <div className="text-sm text-green-700 font-medium">Wallet connecté</div>
                <div className="text-xs text-green-600 font-mono">{wallet.addressBech32?.substring(0, 20)}...</div>
                <div className="text-xs text-green-600">Solde: {wallet.balance?.toFixed(2) || '0.00'} ADA</div>
              </div>
            ) : (
              <button
                onClick={() => setIsWalletModalOpen(true)}
                className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-semibold flex items-center gap-2"
              >
                <Wallet className="w-5 h-5" />
                Connecter Wallet
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Statistiques */}
      {stats && showStats && (
        <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-fuchsia-600 rounded-2xl p-6 md:p-8 mb-6 text-white shadow-2xl border border-purple-400/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              Statistiques Globales
            </h2>
            <button
              onClick={() => setShowStats(false)}
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-all"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white/15 backdrop-blur-md rounded-xl p-5 border border-white/20 hover:bg-white/20 transition-all hover:scale-105">
              <div className="text-white/90 text-sm mb-2 font-medium">Total Réclamations</div>
              <div className="text-3xl font-extrabold">{stats.totalClaims}</div>
            </div>
            <div className="bg-white/15 backdrop-blur-md rounded-xl p-5 border border-white/20 hover:bg-white/20 transition-all hover:scale-105">
              <div className="text-white/90 text-sm mb-2 font-medium">En Attente</div>
              <div className="text-3xl font-extrabold">{stats.pendingClaims}</div>
            </div>
            <div className="bg-white/15 backdrop-blur-md rounded-xl p-5 border border-white/20 hover:bg-white/20 transition-all hover:scale-105">
              <div className="text-white/90 text-sm mb-2 font-medium">Envoyées</div>
              <div className="text-3xl font-extrabold">{stats.sentClaims}</div>
            </div>
            <div className="bg-white/15 backdrop-blur-md rounded-xl p-5 border border-white/20 hover:bg-white/20 transition-all hover:scale-105">
              <div className="text-white/90 text-sm mb-2 font-medium">Échouées</div>
              <div className="text-3xl font-extrabold">{stats.failedClaims}</div>
            </div>
            <div className="bg-white/15 backdrop-blur-md rounded-xl p-5 border border-white/20 hover:bg-white/20 transition-all hover:scale-105">
              <div className="text-white/90 text-sm mb-2 font-medium">Total ADA</div>
              <div className="text-3xl font-extrabold">{stats.totalRewardAmount.toFixed(2)}</div>
              <div className="text-white/80 text-xs mt-2 font-medium">
                {stats.pendingRewardAmount.toFixed(2)} ADA en attente
              </div>
            </div>
          </div>
        </div>
      )}

      {!showStats && (
        <button
          onClick={() => setShowStats(true)}
          className="mb-4 text-purple-600 hover:text-purple-700 flex items-center gap-1 text-sm font-medium"
        >
          <ChevronDown className="w-4 h-4" />
          Afficher les statistiques
        </button>
      )}

      {/* Filtres et recherche */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Recherche */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par nom, email, adresse..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Filtre Statut */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="processing">En traitement</option>
              <option value="sent">Envoyées</option>
              <option value="failed">Échouées</option>
            </select>
          </div>

          {/* Filtres Mois/Année */}
          <div className="flex gap-2">
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            >
              <option value="all">Tous les mois</option>
              {monthNames.map((month, index) => (
                <option key={index} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            >
              <option value="all">Toutes les années</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Actions en batch */}
      {showBulkActions && selectedClaims.size > 0 && (
        <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="text-purple-900 font-medium">
              {selectedClaims.size} réclamation{selectedClaims.size > 1 ? 's' : ''} sélectionnée{selectedClaims.size > 1 ? 's' : ''}
            </div>
            <div className="flex gap-2 flex-wrap">
              {wallet && (adminLucid || blockchainLucid) && (
                <button
                  onClick={handleSendSelectedRewards}
                  disabled={sendingRewards || updating === 'bulk'}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2"
                >
                  {sendingRewards ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Envoyer les récompenses
                    </>
                  )}
                </button>
              )}
              <button
                onClick={() => handleBulkUpdateStatus('processing')}
                disabled={updating === 'bulk' || sendingRewards}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {updating === 'bulk' ? (
                  <Loader2 className="w-4 h-4 animate-spin inline" />
                ) : (
                  'Marquer "En traitement"'
                )}
              </button>
              <button
                onClick={() => handleBulkUpdateStatus('sent')}
                disabled={updating === 'bulk' || sendingRewards}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {updating === 'bulk' ? (
                  <Loader2 className="w-4 h-4 animate-spin inline" />
                ) : (
                  'Marquer "Envoyée"'
                )}
              </button>
              <button
                onClick={() => {
                  setSelectedClaims(new Set());
                  setShowBulkActions(false);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Liste des réclamations */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedClaims.size === filteredClaims.length && filteredClaims.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Période
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Rang
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  WZP
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Récompense
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Adresse Cardano
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClaims.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    Aucune réclamation trouvée
                  </td>
                </tr>
              ) : (
                filteredClaims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedClaims.has(claim.id)}
                        onChange={() => toggleClaimSelection(claim.id)}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {claim.user?.full_name || claim.user?.username || 'Utilisateur inconnu'}
                        </div>
                        {claim.user?.email && (
                          <div className="text-sm text-gray-500">{claim.user.email}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {monthNames[claim.month - 1]} {claim.year}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <span className="font-medium">#{claim.rank_position}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {claim.wzp_points.toFixed(1)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-green-600">
                        {claim.reward_ada.toFixed(2)} ADA
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 max-w-xs">
                        <span className="text-xs font-mono text-gray-700 truncate">
                          {claim.cardano_address}
                        </span>
                        <button
                          onClick={() => copyToClipboard(claim.cardano_address, `addr-${claim.id}`)}
                          className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                          title="Copier l'adresse"
                        >
                          {copiedId === `addr-${claim.id}` ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(claim.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {claim.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(claim.id, 'processing')}
                              disabled={updating === claim.id}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50 text-xs font-medium"
                              title="Marquer comme en traitement"
                            >
                              {updating === claim.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                'Traiter'
                              )}
                            </button>
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="tx_hash"
                                value={txHashInputs[claim.id] || ''}
                                onChange={(e) =>
                                  setTxHashInputs({ ...txHashInputs, [claim.id]: e.target.value })
                                }
                                className="w-32 px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter' && txHashInputs[claim.id]) {
                                    handleUpdateStatus(claim.id, 'sent', txHashInputs[claim.id]);
                                  }
                                }}
                              />
                              <button
                                onClick={() =>
                                  handleUpdateStatus(claim.id, 'sent', txHashInputs[claim.id])
                                }
                                disabled={!txHashInputs[claim.id] || updating === claim.id}
                                className="absolute right-1 top-1/2 transform -translate-y-1/2 px-2 py-0.5 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Envoyer"
                              >
                                {updating === claim.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Send className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </>
                        )}
                        {claim.status === 'processing' && (
                          <button
                            onClick={() => {
                              const txHash = prompt('Entrez le hash de transaction:');
                              if (txHash) {
                                handleUpdateStatus(claim.id, 'sent', txHash);
                              }
                            }}
                            disabled={updating === claim.id}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50 text-xs font-medium"
                          >
                            {updating === claim.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              'Marquer envoyée'
                            )}
                          </button>
                        )}
                        {claim.tx_hash && (
                          <a
                            href={`https://preprod.cardanoscan.io/transaction/${claim.tx_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:text-purple-700"
                            title="Voir la transaction"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination (optionnel pour l'instant) */}
      {filteredClaims.length > 0 && (
        <div className="mt-4 text-center text-sm text-gray-600">
          {filteredClaims.length} réclamation{filteredClaims.length > 1 ? 's' : ''} affichée{filteredClaims.length > 1 ? 's' : ''}
        </div>
      )}

      {/* Modal Wallet */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onConnect={handleWalletConnect}
      />
    </div>
  );
};

export default AdminRewards;

