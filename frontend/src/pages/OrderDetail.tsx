import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChatBox from '../components/ChatBox';
import { prepareAdaRelease } from '../blockchain/prepareAdaRelease';
import { prepareAdaPayment } from '../blockchain/prepareAdaPayment';
import { useToast } from '../components/Toast';
import { convertFCToADA, convertADAToFC, formatFC, formatADA } from '../utils/currencyConverter';
import { CheckCircle, X, DollarSign, ShoppingCart, AlertCircle, MessageSquare, TrendingDown, RotateCcw, Smartphone, Clock as ClockIcon } from 'lucide-react';

const OrderDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showNewNegotiationModal, setShowNewNegotiationModal] = useState(false);
  const [newNegotiatePriceFC, setNewNegotiatePriceFC] = useState<string>('');
  const [newNegotiating, setNewNegotiating] = useState(false);

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  // Bloquer le scroll du body quand la modal est ouverte
  useEffect(() => {
    if (showNewNegotiationModal) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px';
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [showNewNegotiationModal]);

  const fetchOrder = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
          *,
          products:product_id(*),
          buyer:buyer_id(*),
          seller:seller_id(*)
      `)
      .eq('id', id)
      .single();

    if (!error) {
      setOrder(data);
    } else {
      console.error('Error fetching order:', error);
    }
    setLoading(false);
  };

  const updateStatus = async (newStatus: string) => {
    const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', id);
    
    if (!error) {
        fetchOrder();
        
        // Simuler la libération des fonds si complété
        if (newStatus === 'completed') {
            await prepareAdaRelease(id!);
            
            // Marquer le produit comme vendu (retirer du marché)
            if (order?.product_id) {
              const { error: productError } = await supabase
                .from('products')
                .update({ status: 'sold' })
                .eq('id', order.product_id);
              
              if (productError) {
                console.error('Error updating product status:', productError);
              } else {
                console.log('Product marked as sold:', order.product_id);
              }
            }
            
            // Simuler récompense WZP
            await supabase.from('wzp_transactions').insert([
                { user_id: order.buyer_id, amount: 2.5, type: 'earn_buy' },
                { user_id: order.seller_id, amount: 2.5, type: 'earn_sell' }
            ]);
            toast.success('Commande terminée !', 'Les fonds ont été libérés, le produit a été retiré du marché et les WZP distribués.');
        }
    }
  };

  // Accepter la proposition de négociation (vendeur)
  const handleAcceptNegotiation = async () => {
    if (!order || !user) return;
    
    setProcessing(true);
    try {
      const finalPrice = order.proposed_price || order.amount_ada;
      
      const { error } = await supabase
        .from('orders')
        .update({ 
          final_price: finalPrice,
          amount_ada: finalPrice
        })
        .eq('id', id);

      if (error) throw error;

      // Envoyer un message automatique à l'acheteur
      await supabase
        .from('messages')
        .insert([{
          order_id: id!,
          sender_id: user.id,
          content: `✅ Proposition acceptée ! Le prix final est de ${formatADA(finalPrice)} ADA. Vous pouvez maintenant procéder au paiement.`
        }]);

      toast.success('Proposition acceptée !', 'L\'acheteur a été notifié et peut maintenant payer.');
      fetchOrder();
    } catch (error: any) {
      console.error('Error accepting negotiation:', error);
      toast.error('Erreur', 'Impossible d\'accepter la proposition.');
    } finally {
      setProcessing(false);
    }
  };

  // Refuser la proposition de négociation (vendeur)
  const handleRejectNegotiation = async () => {
    if (!order || !user) return;
    
    if (!confirm('Êtes-vous sûr de vouloir refuser cette proposition ?')) {
      return;
    }

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          escrow_status: 'cancelled',
          status: 'disputed'
        })
        .eq('id', id);

      if (error) throw error;

      // Envoyer un message automatique à l'acheteur
      await supabase
        .from('messages')
        .insert([{
          order_id: id!,
          sender_id: user.id,
          content: '❌ Proposition refusée. Vous pouvez discuter et proposer un nouveau prix si nécessaire.'
        }]);

      toast.info('Proposition refusée', 'La négociation a été annulée.');
      fetchOrder();
    } catch (error: any) {
      console.error('Error rejecting negotiation:', error);
      toast.error('Erreur', 'Impossible de refuser la proposition.');
    } finally {
      setProcessing(false);
    }
  };

  // Payer après acceptation de la négociation (acheteur)
  const handlePayAfterNegotiation = async () => {
    if (!order || !user) return;
    
    setProcessing(true);
    try {
      const priceToPay = order.final_price || order.proposed_price || order.amount_ada;
      
      // Préparer le paiement
      const paymentPrep = await prepareAdaPayment(id!, priceToPay);

      // Mettre à jour la commande : escrow ouvert
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status: 'escrow_web2',
          escrow_hash: paymentPrep.txHash,
          escrow_status: 'open'
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Marquer le produit comme vendu (retirer du marché)
      if (order?.product_id) {
        await supabase
          .from('products')
          .update({ status: 'sold' })
          .eq('id', order.product_id);
      }

      // Envoyer un message automatique au vendeur
      const priceInFC = convertADAToFC(priceToPay);
      await supabase
        .from('messages')
        .insert([{
          order_id: id!,
          sender_id: user.id,
          content: `💰 Paiement effectué ! ${formatFC(priceInFC)} FC (≈ ${formatADA(priceToPay)} ADA) sont maintenant en escrow. Vous pouvez expédier le produit.`
        }]);

      toast.success('Paiement effectué !', `Le vendeur a été notifié que ${formatFC(priceInFC)} FC sont en escrow.`);
      fetchOrder();
    } catch (error: any) {
      console.error('Error processing payment:', error);
      toast.error('Erreur', 'Impossible de procéder au paiement.');
    } finally {
      setProcessing(false);
    }
  };

  // Proposer un nouveau prix après refus (acheteur)
  const handleProposeNewPrice = async () => {
    if (!order || !user) return;

    const proposedPriceFC = parseFloat(newNegotiatePriceFC);
    if (isNaN(proposedPriceFC) || proposedPriceFC <= 0) {
      toast.warning('Prix invalide', 'Veuillez entrer un prix valide.');
      return;
    }

    const currentPriceFC = order.products?.price_fc || convertADAToFC(order.amount_ada);
    if (proposedPriceFC >= currentPriceFC) {
      toast.warning('Prix invalide', 'Le prix proposé doit être inférieur au prix actuel.');
      return;
    }

    setNewNegotiating(true);

    try {
      // Calculer le prix proposé en ADA
      const proposedPriceADA = convertFCToADA(proposedPriceFC);

      // Mettre à jour la commande avec la nouvelle proposition (réinitialiser le refus)
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          proposed_price: proposedPriceADA,
          amount_ada: proposedPriceADA,
          final_price: null, // Réinitialiser
          escrow_status: null, // Réinitialiser le refus
          status: 'pending' // Remettre en pending
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Envoyer un message automatique au vendeur
      await supabase
        .from('messages')
        .insert([{
          order_id: id!,
          sender_id: user.id,
          content: `💰 Nouvelle proposition de prix : ${formatFC(proposedPriceFC)} FC (≈ ${formatADA(proposedPriceADA)} ADA)`
        }]);

      toast.success('Nouvelle proposition envoyée !', 'Le vendeur a été notifié de votre nouvelle proposition.');
      setShowNewNegotiationModal(false);
      setNewNegotiatePriceFC('');
      fetchOrder();
    } catch (error: any) {
      console.error('Error proposing new price:', error);
      toast.error('Erreur', error.message || 'Impossible d\'envoyer la nouvelle proposition.');
    } finally {
      setNewNegotiating(false);
    }
  };

  if (loading || !order) return <div className="text-center py-10">Chargement...</div>;

  const isBuyer = user?.id === order.buyer_id;
  const isSeller = user?.id === order.seller_id;

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Colonne Gauche: Détails Commande */}
      <div className="lg:col-span-2 space-y-6">
        <div className="card">
            <h1 className="text-2xl font-bold mb-4">Commande #{order.id.slice(0, 8)}</h1>
            
            {/* Steps Progress */}
            <div className="flex items-center justify-between mb-8 text-sm">
                <div className={`flex flex-col items-center ${['pending', 'escrow_web2', 'shipped', 'completed'].includes(order.status) ? 'text-primary' : 'text-gray-300'}`}>
                    <div className="w-8 h-8 rounded-full bg-current flex items-center justify-center text-white font-bold mb-1">1</div>
                    <span>Créée</span>
                </div>
                <div className={`h-1 flex-1 mx-2 ${['escrow_web2', 'shipped', 'completed'].includes(order.status) ? 'bg-primary' : 'bg-gray-200'}`} />
                
                <div className={`flex flex-col items-center ${['escrow_web2', 'shipped', 'completed'].includes(order.status) ? 'text-primary' : 'text-gray-300'}`}>
                    <div className="w-8 h-8 rounded-full bg-current flex items-center justify-center text-white font-bold mb-1">2</div>
                    <span>Escrow</span>
                </div>
                <div className={`h-1 flex-1 mx-2 ${['shipped', 'completed'].includes(order.status) ? 'bg-primary' : 'bg-gray-200'}`} />

                <div className={`flex flex-col items-center ${['shipped', 'completed'].includes(order.status) ? 'text-primary' : 'text-gray-300'}`}>
                    <div className="w-8 h-8 rounded-full bg-current flex items-center justify-center text-white font-bold mb-1">3</div>
                    <span>Expédiée</span>
                </div>
                <div className={`h-1 flex-1 mx-2 ${['completed'].includes(order.status) ? 'bg-primary' : 'bg-gray-200'}`} />

                <div className={`flex flex-col items-center ${['completed'].includes(order.status) ? 'text-primary' : 'text-gray-300'}`}>
                    <div className="w-8 h-8 rounded-full bg-current flex items-center justify-center text-white font-bold mb-1">4</div>
                    <span>Reçue</span>
                </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg flex gap-4">
                <img src={order.products.image_url} className="w-20 h-20 object-cover rounded bg-white" />
                <div className="flex-1">
                    <h3 className="font-bold text-dark dark:text-white">{order.products.title}</h3>
                    
                    {/* Affichage du prix selon le mode */}
                    {order.order_mode === 'negotiation' ? (
                        <div className="space-y-1">
                            {order.final_price ? (
                                <p className="text-primary font-bold text-lg">
                                    {formatADA(order.final_price)} ADA
                                    {order.products?.price_fc && (
                                        <span className="text-sm text-gray-500 ml-2">
                                            (≈ {formatFC(convertADAToFC(order.final_price))} FC)
                                        </span>
                                    )}
                                </p>
                            ) : (
                                <div>
                                    <p className="text-primary font-bold">
                                        {formatADA(order.proposed_price || order.amount_ada)} ADA
                                        {order.products?.price_fc && (
                                            <span className="text-xs text-gray-500 ml-2">
                                                (proposé)
                                            </span>
                                        )}
                                    </p>
                                    {order.products?.price_fc && (
                                        <p className="text-xs text-gray-400 line-through">
                                            Prix initial: {formatFC(order.products.price_fc)} FC
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-primary font-bold">
                            {formatADA(order.amount_ada)} ADA
                            {order.products?.price_fc && (
                                <span className="text-sm text-gray-500 ml-2">
                                    (≈ {formatFC(convertADAToFC(order.amount_ada))} FC)
                                </span>
                            )}
                        </p>
                    )}
                    
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Status: {order.status}
                        {order.order_mode === 'negotiation' && (
                            <span className="ml-2 text-orange-600 dark:text-orange-400 font-medium">
                                • Négociation
                            </span>
                        )}
                    </p>
                </div>
            </div>

            {/* Actions Zone */}
            <div className="mt-6 border-t pt-6">
                <h3 className="font-bold mb-3">Actions requises</h3>
                
                {/* Négociation en attente - Vendeur peut accepter/refuser */}
                {order.order_mode === 'negotiation' && 
                 order.status === 'pending' && 
                 order.proposed_price && 
                 !order.final_price && 
                 isSeller && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-5 rounded-xl border-2 border-amber-200 dark:border-amber-800">
                        <div className="flex items-start gap-3 mb-4">
                            <MessageSquare className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" />
                            <div className="flex-1">
                                <h4 className="font-bold text-amber-900 dark:text-amber-100 mb-1">
                                    Nouvelle proposition de prix
                                </h4>
                                <p className="text-sm text-amber-700 dark:text-amber-300">
                                    L'acheteur propose un nouveau prix pour ce produit.
                                </p>
                            </div>
                        </div>
                        
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border border-amber-200 dark:border-amber-700">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Prix proposé :</span>
                                <span className="text-lg font-bold text-primary">
                                    {formatADA(order.proposed_price)} ADA
                                    {order.products?.price_fc && (
                                        <span className="text-sm text-gray-500 ml-2">
                                            (≈ {formatFC(convertADAToFC(order.proposed_price))} FC)
                                        </span>
                                    )}
                                </span>
                            </div>
                            {order.products?.price_fc && (
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>Prix initial :</span>
                                    <span className="line-through">
                                        {formatFC(order.products.price_fc)} FC
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleRejectNegotiation}
                                disabled={processing}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-700 border-2 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition font-medium disabled:opacity-50"
                            >
                                <X className="w-5 h-5" />
                                Refuser
                            </button>
                            <button
                                onClick={handleAcceptNegotiation}
                                disabled={processing}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium disabled:opacity-50 shadow-lg shadow-green-500/30"
                            >
                                {processing ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                        </svg>
                                        Traitement...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        Accepter
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Négociation acceptée - Acheteur peut payer */}
                {order.order_mode === 'negotiation' && 
                 order.status === 'pending' && 
                 order.final_price && 
                 !order.escrow_status && 
                 isBuyer && (
                    <div className="bg-green-50 dark:bg-green-900/20 p-5 rounded-xl border-2 border-green-200 dark:border-green-800">
                        <div className="flex items-start gap-3 mb-4">
                            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                            <div className="flex-1">
                                <h4 className="font-bold text-green-900 dark:text-green-100 mb-1">
                                    Proposition acceptée !
                                </h4>
                                <p className="text-sm text-green-700 dark:text-green-300">
                                    Le vendeur a accepté votre proposition. Procédez au paiement pour mettre les fonds en escrow.
                                </p>
                            </div>
                        </div>
                        
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-4 border border-green-200 dark:border-green-700">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Prix à payer :</span>
                                <span className="text-xl font-bold text-primary">
                                    {formatADA(order.final_price)} ADA
                                    {order.products?.price_fc && (
                                        <span className="text-sm text-gray-500 ml-2">
                                            (≈ {formatFC(convertADAToFC(order.final_price))} FC)
                                        </span>
                                    )}
                                </span>
                            </div>
                        </div>

                        {/* Méthodes de paiement */}
                        <div className="space-y-3 mb-4">
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Méthode de paiement</p>
                            
                            {/* Option ADA */}
                            <button
                                onClick={handlePayAfterNegotiation}
                                disabled={processing}
                                className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl hover:bg-primary/90 transition font-medium disabled:opacity-50 shadow-lg shadow-primary/30"
                            >
                                <div className="flex items-center gap-3">
                                    {processing ? (
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                        </svg>
                                    ) : (
                                        <ShoppingCart className="w-5 h-5" />
                                    )}
                                    <span>{processing ? 'Traitement...' : 'Payer avec ADA'}</span>
                                </div>
                                <span className="text-xs bg-white/20 px-2 py-1 rounded-lg font-medium">Disponible</span>
                            </button>

                            {/* Option Mobile Money */}
                            <div className="relative">
                                <button 
                                    disabled
                                    className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-xl cursor-not-allowed opacity-60"
                                >
                                    <div className="flex items-center gap-3">
                                        <Smartphone className="w-5 h-5" />
                                        <span>Payer avec Mobile Money</span>
                                    </div>
                                    <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-lg font-medium flex items-center gap-1">
                                        <ClockIcon className="w-3 h-3" />
                                        Vient bientôt
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Négociation refusée - Acheteur peut proposer un nouveau prix */}
                {order.order_mode === 'negotiation' && 
                 order.escrow_status === 'cancelled' && (
                    <div className="bg-red-50 dark:bg-red-900/20 p-5 rounded-xl border-2 border-red-200 dark:border-red-800">
                        <div className="flex items-start gap-3 mb-4">
                            <X className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                            <div className="flex-1">
                                <h4 className="font-bold text-red-900 dark:text-red-100 mb-1">
                                    Proposition refusée
                                </h4>
                                <p className="text-sm text-red-700 dark:text-red-300">
                                    La négociation a été annulée par le vendeur. Vous pouvez discuter dans le chat et proposer un nouveau prix si nécessaire.
                                </p>
                            </div>
                        </div>
                        {isBuyer && (
                            <button
                                onClick={() => {
                                    const currentPriceFC = order.products?.price_fc || convertADAToFC(order.amount_ada);
                                    setNewNegotiatePriceFC(currentPriceFC.toString());
                                    setShowNewNegotiationModal(true);
                                }}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition font-medium"
                            >
                                <RotateCcw className="w-5 h-5" />
                                Proposer un nouveau prix
                            </button>
                        )}
                    </div>
                )}

                {/* Escrow ouvert - Vendeur peut expédier */}
                {order.status === 'escrow_web2' && isSeller && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                        <div className="flex items-start gap-3 mb-4">
                            <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                            <div className="flex-1">
                                <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-1">
                                    Argent en escrow
                                </h4>
                                <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                                    L'acheteur a payé. Les fonds sont sécurisés en escrow. Vous pouvez maintenant expédier le produit.
                                </p>
                                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Montant en escrow :</span>
                                        <span className="text-lg font-bold text-primary">
                                            {formatADA(order.final_price || order.amount_ada)} ADA
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => updateStatus('shipped')} 
                            className="w-full bg-primary text-white py-3 rounded-xl hover:bg-primary/90 transition font-medium"
                        >
                            Confirmer l'expédition
                        </button>
                    </div>
                )}

                {/* Produit expédié - Acheteur peut confirmer réception */}
                {order.status === 'shipped' && isBuyer && (
                    <div className="bg-violet-50 dark:bg-violet-900/20 p-5 rounded-xl border-2 border-violet-200 dark:border-violet-800">
                        <div className="flex items-start gap-3 mb-4">
                            <CheckCircle className="w-6 h-6 text-violet-600 dark:text-violet-400 flex-shrink-0 mt-1" />
                            <div className="flex-1">
                                <h4 className="font-bold text-violet-900 dark:text-violet-100 mb-1">
                                    Produit expédié
                                </h4>
                                <p className="text-sm text-violet-700 dark:text-violet-300">
                                    Le vendeur a expédié le colis. Confirmez la réception pour libérer les fonds en escrow.
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={() => updateStatus('completed')} 
                            className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition font-medium shadow-lg shadow-green-500/30"
                        >
                            Confirmer la réception (Libérer Escrow)
                        </button>
                    </div>
                )}

                {/* Commande terminée */}
                {order.status === 'completed' && (
                    <div className="text-center p-5 bg-green-50 dark:bg-green-900/20 rounded-xl border-2 border-green-200 dark:border-green-800">
                        <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-2" />
                        <p className="font-semibold text-green-900 dark:text-green-100">
                            Commande terminée
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                            Les fonds ont été libérés.
                        </p>
                    </div>
                )}
                
                {/* En attente de paiement (mode direct) */}
                {order.status === 'pending' && 
                 order.order_mode === 'direct' && (
                    <div className="text-center p-5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                        <p className="text-gray-600 dark:text-gray-400">
                            En attente de paiement Escrow (étape automatique).
                        </p>
                    </div>
                )}

                {/* En attente de réponse du vendeur (acheteur) */}
                {order.order_mode === 'negotiation' && 
                 order.status === 'pending' && 
                 order.proposed_price && 
                 !order.final_price && 
                 isBuyer && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-5 rounded-xl border-2 border-amber-200 dark:border-amber-800">
                        <div className="flex items-start gap-3">
                            <MessageSquare className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" />
                            <div className="flex-1">
                                <h4 className="font-bold text-amber-900 dark:text-amber-100 mb-1">
                                    Proposition envoyée
                                </h4>
                                <p className="text-sm text-amber-700 dark:text-amber-300">
                                    En attente de la réponse du vendeur concernant votre proposition de {formatADA(order.proposed_price)} ADA.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Colonne Droite: Chat */}
      <div className="lg:col-span-1">
        <ChatBox orderId={id!} order={order} />
        
        <div className="mt-6 card bg-gray-50">
            <h3 className="font-bold text-sm text-gray-500 uppercase mb-3">Détails techniques (Simulés)</h3>
            <div className="space-y-2 text-xs text-gray-600 break-all">
                <p><strong>Order ID:</strong> {order.id}</p>
                <p><strong>Escrow Hash:</strong> {order.escrow_hash || 'Pending...'}</p>
                <p><strong>Buyer:</strong> {order.buyer.wallet_address || 'Not connected'}</p>
                <p><strong>Seller:</strong> {order.seller.wallet_address || 'Not connected'}</p>
            </div>
        </div>
      </div>

      {/* Modal de nouvelle proposition après refus */}
      {showNewNegotiationModal && order && (
        <div 
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-md p-0 sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !newNegotiating) {
              setShowNewNegotiationModal(false);
            }
          }}
          style={{ 
            overscrollBehavior: 'contain',
            touchAction: 'none'
          }}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md overflow-hidden shadow-2xl animate-slide-up sm:animate-scale-in mx-auto flex flex-col"
            style={{ 
              maxHeight: '90vh',
              maxWidth: '100vw'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag indicator (mobile) */}
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header - Fixed */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-dark dark:text-white text-lg">Nouvelle proposition</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Proposez un nouveau prix</p>
                </div>
              </div>
              <button 
                onClick={() => !newNegotiating && setShowNewNegotiationModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
                disabled={newNegotiating}
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-6 space-y-6" style={{ maxHeight: 'calc(90vh - 200px)' }}>
              {/* Product Info */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Produit</p>
                <p className="font-semibold text-dark dark:text-white text-base">{order.products?.title}</p>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-xl font-bold text-primary">
                    {order.products?.price_fc ? formatFC(order.products.price_fc) : formatFC(convertADAToFC(order.amount_ada))}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">FC</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    (≈ {formatADA(order.amount_ada)} ADA)
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">Prix actuel du vendeur</p>
              </div>

              {/* Previous proposal info */}
              {order.proposed_price && (
                <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <X className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-red-700 dark:text-red-300 mb-1.5 font-medium">Proposition précédente (refusée)</p>
                      <p className="text-base font-bold text-red-900 dark:text-red-100">
                        {formatADA(order.proposed_price)} ADA
                        {order.products?.price_fc && (
                          <span className="text-sm text-red-600 dark:text-red-400 ml-2 font-medium">
                            (≈ {formatFC(convertADAToFC(order.proposed_price))} FC)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Price Input */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2.5">
                  <DollarSign className="w-4 h-4 text-primary" />
                  Votre nouvelle proposition (FC)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={newNegotiatePriceFC}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                        setNewNegotiatePriceFC(value);
                      }
                    }}
                    disabled={newNegotiating}
                    min="0"
                    step="100"
                    className="w-full px-4 py-3.5 pr-16 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary/30 focus:border-primary transition outline-none text-lg font-semibold text-dark dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Entrez votre prix"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 font-medium">FC</span>
                </div>
                {newNegotiatePriceFC && !isNaN(parseFloat(newNegotiatePriceFC)) && parseFloat(newNegotiatePriceFC) > 0 && (
                  <div className="mt-3 p-3 bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/30 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <TrendingDown className="w-4 h-4 text-primary" />
                        <span>Équivalent en ADA :</span>
                      </span>
                      <span className="font-bold text-primary text-base">
                        {formatADA(convertFCToADA(parseFloat(newNegotiatePriceFC)))} ADA
                      </span>
                    </p>
                  </div>
                )}
                
                {/* Discount calculation */}
                {newNegotiatePriceFC && !isNaN(parseFloat(newNegotiatePriceFC)) && (
                  (() => {
                    const proposed = parseFloat(newNegotiatePriceFC);
                    const current = order.products?.price_fc || convertADAToFC(order.amount_ada);
                    const discount = current - proposed;
                    const discountPercent = ((discount / current) * 100).toFixed(0);
                    if (proposed < current && proposed > 0) {
                      return (
                        <div className="mt-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-0.5">Réduction</p>
                              <p className="text-lg font-bold text-green-700 dark:text-green-300">
                                {formatFC(discount)} FC
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-0.5">Pourcentage</p>
                              <p className="text-lg font-bold text-green-700 dark:text-green-300">
                                -{discountPercent}%
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    } else if (proposed >= current) {
                      return (
                        <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-700 dark:text-amber-300">
                              Le prix proposé doit être <strong>inférieur</strong> au prix actuel ({formatFC(current)} FC) pour pouvoir négocier.
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()
                )}
              </div>

              {/* Info */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-blue-900 dark:text-blue-100 text-sm mb-2">Conseil</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                      Après discussion avec le vendeur dans le chat, vous pouvez proposer un nouveau prix. Le vendeur pourra l'accepter ou le refuser. N'hésitez pas à négocier !
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer - Fixed */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 flex gap-3 flex-shrink-0">
              <button
                onClick={() => setShowNewNegotiationModal(false)}
                disabled={newNegotiating}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-[0.98] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>
              <button
                onClick={handleProposeNewPrice}
                disabled={newNegotiating || !newNegotiatePriceFC || isNaN(parseFloat(newNegotiatePriceFC)) || parseFloat(newNegotiatePriceFC) <= 0 || (order.products?.price_fc && parseFloat(newNegotiatePriceFC) >= order.products.price_fc) || (!order.products?.price_fc && parseFloat(newNegotiatePriceFC) >= convertADAToFC(order.amount_ada))}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-primary to-blue-600 text-white rounded-xl hover:from-primary/90 hover:to-blue-600/90 active:scale-[0.98] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/30"
              >
                {newNegotiating ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Envoi...
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-5 h-5" />
                    Envoyer la proposition
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default OrderDetail;


