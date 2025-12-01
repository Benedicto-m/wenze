import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { prepareAdaPayment } from '../blockchain/prepareAdaPayment';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Star, 
  Shield, 
  ShoppingCart,
  CheckCircle,
  MessageCircle,
  Share2,
  Heart,
  ChevronRight
} from 'lucide-react';

interface Product {
  id: string;
  title: string;
  description: string;
  price_ada: number;
  image_url: string;
  seller_id: string;
  status: string;
  category: string;
  location: string;
  created_at: string;
  profiles: {
    username: string;
    full_name: string;
    avatar_url: string;
    reputation_score: number;
    is_verified: boolean;
  };
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [sellerProductsCount, setSellerProductsCount] = useState(0);

  useEffect(() => {
    if (id) fetchProduct(id);
  }, [id]);

  const fetchProduct = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, profiles:seller_id(username, full_name, avatar_url, reputation_score, is_verified)')
        .eq('id', productId)
        .single();

      if (error) throw error;
      setProduct(data);

      // Fetch seller's other products count
      if (data?.seller_id) {
        const { count } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('seller_id', data.seller_id)
          .eq('status', 'available');
        setSellerProductsCount(count || 0);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!product) return;

    if (user.id === product.seller_id) {
      alert("Vous ne pouvez pas acheter votre propre produit !");
      return;
    }

    setProcessing(true);

    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{
          buyer_id: user.id,
          seller_id: product.seller_id,
          product_id: product.id,
          amount_ada: product.price_ada,
          status: 'pending'
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      const paymentPrep = await prepareAdaPayment(orderData.id, product.price_ada);

      await supabase
        .from('orders')
        .update({ status: 'escrow_web2', escrow_hash: paymentPrep.txHash })
        .eq('id', orderData.id);
      
      await supabase
        .from('products')
        .update({ status: 'sold' })
        .eq('id', product.id);

      alert(`Commande créée ! Fonds bloqués en Escrow.`);
      navigate('/orders');

    } catch (error) {
      console.error('Error creating order:', error);
      alert('Erreur lors de la commande.');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-primary mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-dark mb-2">Produit introuvable</h2>
        <Link to="/products" className="text-primary hover:underline">
          Retour au marché
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-1 sm:px-0">
      {/* Back Button */}
      <Link 
        to="/products" 
        className="inline-flex items-center gap-2 text-gray-500 hover:text-dark mb-4 sm:mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour au marché
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Image Section */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-100 aspect-square">
            {product.image_url ? (
              <img 
                src={product.image_url} 
                alt={product.title} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                Pas d'image
              </div>
            )}
          </div>

          {/* Quick Actions Mobile */}
          <div className="flex gap-2 lg:hidden">
            <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 rounded-xl text-gray-600 font-medium">
              <Heart className="w-5 h-5" />
              Favoris
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 rounded-xl text-gray-600 font-medium">
              <Share2 className="w-5 h-5" />
              Partager
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="space-y-5 sm:space-y-6">
          {/* Title & Meta */}
          <div>
            <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
              <Clock className="w-4 h-4" />
              <span>Publié le {formatDate(product.created_at)}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-dark mb-2">
              {product.title}
            </h1>
            <div className="flex items-center gap-2 text-gray-500">
              <MapPin className="w-4 h-4" />
              <span>{product.location || 'Goma, RDC'}</span>
            </div>
          </div>

          {/* Price */}
          <div className="bg-gradient-to-r from-primary/5 to-blue-500/5 rounded-2xl p-5 sm:p-6 border border-primary/10">
            <div className="flex items-end gap-2 mb-2">
              <span className="text-4xl sm:text-5xl font-bold text-primary">{product.price_ada}</span>
              <span className="text-xl text-gray-400 mb-1">ADA</span>
            </div>
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <Shield className="w-4 h-4" />
              <span>Protection Escrow garantie</span>
            </div>
          </div>

          {/* Seller Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Vendeur</p>
            
            <Link 
              to={`/seller/${product.seller_id}`}
              className="flex items-center gap-3 group"
            >
              {product.profiles?.avatar_url ? (
                <img 
                  src={product.profiles.avatar_url} 
                  alt={product.profiles.full_name}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover"
                />
              ) : (
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white text-lg font-bold">
                  {product.profiles?.full_name?.charAt(0) || 'V'}
                </div>
              )}
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-dark group-hover:text-primary transition">
                    {product.profiles?.full_name || 'Vendeur'}
                  </p>
                  {product.profiles?.is_verified && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    {product.profiles?.reputation_score || 0} pts
                  </span>
                  <span>{sellerProductsCount} produits</span>
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition" />
            </Link>

            <Link
              to={`/seller/${product.seller_id}`}
              className="block mt-4 text-center py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              Voir la boutique
            </Link>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-dark mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
              {product.description}
            </p>
          </div>

          {/* Buy Button */}
          <div className="sticky bottom-4 sm:static bg-white sm:bg-transparent p-4 sm:p-0 -mx-4 sm:mx-0 border-t sm:border-0 border-gray-100">
            {product.status === 'available' ? (
              <button 
                onClick={handleBuy}
                disabled={processing}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-primary to-blue-600 text-white font-semibold py-4 rounded-xl sm:rounded-2xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-50 text-lg"
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
                    <ShoppingCart className="w-5 h-5" />
                    Acheter maintenant
                  </>
                )}
              </button>
            ) : (
              <button 
                disabled 
                className="w-full py-4 bg-gray-200 text-gray-500 font-semibold rounded-xl sm:rounded-2xl cursor-not-allowed"
              >
                Produit indisponible
              </button>
            )}

            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" />
                Paiement sécurisé
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                Escrow garanti
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
