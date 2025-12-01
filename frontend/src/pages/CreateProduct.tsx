import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Camera, Upload, ArrowLeft, Package, DollarSign, Tag, FileText } from 'lucide-react';

const CreateProduct = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price_ada: '',
    category: 'electronics',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      alert("Erreur lors de l'upload de l'image.");
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      let finalImageUrl = '';

      if (imageFile) {
        const url = await uploadImage(imageFile);
        if (url) finalImageUrl = url;
        else {
          setLoading(false);
          return;
        }
      }

      const { error } = await supabase
        .from('products')
        .insert([
          {
            seller_id: user.id,
            title: formData.title,
            description: formData.description,
            price_ada: parseFloat(formData.price_ada),
            category: formData.category,
            image_url: finalImageUrl,
            status: 'available'
          }
        ]);

      if (error) throw error;
      navigate('/products');
    } catch (error: any) {
      console.error('Error creating product:', error);
      alert(`Erreur: ${error.message || 'Impossible de créer le produit'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-1 sm:px-0">
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Link 
          to="/products" 
          className="p-2 hover:bg-gray-100 active:bg-gray-200 rounded-xl transition"
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-dark">Vendre un produit</h1>
          <p className="text-gray-500 mt-0.5 sm:mt-1 text-sm sm:text-base">Publiez votre annonce</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Image Upload Section */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <h2 className="font-semibold text-dark flex items-center gap-2 text-sm sm:text-base">
              <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              Photo du produit
            </h2>
          </div>
          
          <div className="p-4 sm:p-6">
            <div className="relative border-2 border-dashed border-gray-200 rounded-xl sm:rounded-2xl p-6 sm:p-8 bg-gray-50 hover:bg-gray-100 hover:border-primary/50 transition-all cursor-pointer group active:bg-gray-200">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              {previewUrl ? (
                <div className="relative aspect-video max-h-56 sm:max-h-72 mx-auto">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-contain rounded-lg sm:rounded-xl" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition rounded-lg sm:rounded-xl">
                    <span className="text-white font-semibold text-sm sm:text-base">Changer l'image</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 sm:py-8">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-primary/10 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-primary/20 transition">
                    <Upload className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
                  </div>
                  <p className="font-semibold text-dark mb-1 text-sm sm:text-base">Cliquez pour ajouter une photo</p>
                  <p className="text-xs sm:text-sm text-gray-400">PNG, JPG jusqu'à 10MB</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-100">
            <h2 className="font-semibold text-dark flex items-center gap-2 text-sm sm:text-base">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              Détails du produit
            </h2>
          </div>
          
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
            <div>
              <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                <Tag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                Titre
              </label>
              <input 
                type="text" 
                name="title" 
                required
                className="w-full px-3 sm:px-4 py-3 sm:py-3.5 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition outline-none text-sm sm:text-base"
                value={formData.title}
                onChange={handleChange}
                placeholder="Ex: iPhone 13 Pro Max 256GB"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                Description
              </label>
              <textarea 
                name="description" 
                required
                rows={4}
                className="w-full px-3 sm:px-4 py-3 sm:py-3.5 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition outline-none resize-none text-sm sm:text-base"
                value={formData.description}
                onChange={handleChange}
                placeholder="Décrivez votre produit en détail..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                  <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                  Prix (ADA)
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    name="price_ada" 
                    required
                    min="0"
                    step="0.1"
                    className="w-full px-3 sm:px-4 py-3 sm:py-3.5 pr-14 sm:pr-16 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition outline-none text-sm sm:text-base"
                    value={formData.price_ada}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                  <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">ADA</span>
                </div>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2 block">Catégorie</label>
                <select 
                  name="category" 
                  className="w-full px-3 sm:px-4 py-3 sm:py-3.5 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition outline-none text-sm sm:text-base appearance-none"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="electronics">Électronique</option>
                  <option value="fashion">Mode</option>
                  <option value="home">Maison</option>
                  <option value="digital">Digital</option>
                  <option value="other">Autre</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-gradient-to-r from-primary to-blue-600 text-white font-semibold py-3.5 sm:py-4 px-6 rounded-xl hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Publication en cours...
            </>
          ) : (
            'Publier le produit'
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateProduct;
