import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Menu, X, User as UserIcon, Wallet, LogOut, ChevronDown, Copy, Check, Settings, LayoutDashboard, ArrowLeftRight, Camera, Package } from 'lucide-react';
import WalletModal, { WalletData } from './WalletModal';

interface Profile {
  full_name: string | null;
  avatar_url: string | null;
}

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState<WalletData | null>(null);
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [addressCopied, setAddressCopied] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', user?.id)
      .single();
    if (data) setProfile(data);
  };

  const handleWalletConnect = (walletData: WalletData) => {
    setConnectedWallet(walletData);
  };

  const copyWalletAddress = () => {
    if (connectedWallet?.addressBech32) {
      navigator.clipboard.writeText(connectedWallet.addressBech32);
      setAddressCopied(true);
      setTimeout(() => setAddressCopied(false), 2000);
    }
  };

  const handleDisconnectWallet = () => {
    setConnectedWallet(null);
    setShowWalletDropdown(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setConnectedWallet(null);
    navigate('/login');
  };

  const formatAddress = (address: string) => {
    if (address.length > 16) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    return address;
  };

  return (
    <>
      <nav className="bg-primary text-white shadow-lg sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <img 
                src="/logo.png" 
                alt="WENZE" 
                className="h-10 w-auto object-contain bg-white rounded-full p-1 shadow-md" 
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="hidden h-10 w-10 bg-white rounded-full flex items-center justify-center text-primary font-extrabold shadow-md">
                W
              </div>
              <span className="font-bold text-2xl tracking-tight hidden sm:block">WENZE</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/products" className="font-medium hover:text-accent transition">Marché</Link>
              {user && <Link to="/orders" className="font-medium hover:text-accent transition">Commandes</Link>}
              
              {user ? (
                <div className="flex items-center space-x-3 ml-4">
                  {/* AdaEx Exchange Button */}
                  <a
                    href="https://app.adaex.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition shadow-sm bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                    title="Échanger ADA ↔ FC via Momo"
                  >
                    <ArrowLeftRight size={16} />
                    <span className="hidden lg:inline">ADA ↔ FC</span>
                  </a>

                  {/* Wallet Button */}
                  {connectedWallet ? (
                    <div className="relative">
                      <button 
                        onClick={() => setShowWalletDropdown(!showWalletDropdown)}
                        className="flex items-center space-x-2 px-2 py-1.5 rounded-full text-sm font-medium transition shadow-sm bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
                      >
                        <img src={connectedWallet.icon} alt={connectedWallet.name} className="w-5 h-5 rounded-full bg-white/20 p-0.5" />
                        <span>{connectedWallet.balance.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} ₳</span>
                        <ChevronDown className={`w-3 h-3 transition-transform ${showWalletDropdown ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Dropdown - Compact */}
                      {showWalletDropdown && (
                        <div className="absolute right-0 mt-2 w-72 bg-[#0d1421] rounded-xl shadow-2xl border border-white/10 overflow-hidden z-50 animate-fade-in">
                          <div className="p-3 border-b border-white/10">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full" />
                                <span className="text-white text-sm font-medium">{connectedWallet.name}</span>
                              </div>
                              <span className="text-emerald-400 font-bold">{connectedWallet.balance.toLocaleString('fr-FR', { maximumFractionDigits: 4 })} ADA</span>
                            </div>
                            <div className="flex items-center gap-2 bg-black/30 rounded-lg p-2">
                              <code className="flex-1 text-xs text-gray-400 font-mono truncate">
                                {formatAddress(connectedWallet.addressBech32)}
                              </code>
                              <button
                                onClick={copyWalletAddress}
                                className="p-1 hover:bg-white/10 rounded transition"
                              >
                                {addressCopied ? (
                                  <Check className="w-3.5 h-3.5 text-green-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5 text-gray-400" />
                                )}
                              </button>
                            </div>
                          </div>
                          <div className="p-2">
                            <button
                              onClick={handleDisconnectWallet}
                              className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition flex items-center gap-2"
                            >
                              <LogOut className="w-4 h-4" />
                              Déconnecter
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button 
                      onClick={() => setIsWalletModalOpen(true)}
                      className="flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition shadow-sm bg-white text-primary hover:bg-gray-100"
                    >
                      <Wallet size={18} />
                      <span>Wallet</span>
                    </button>
                  )}
                  
                  {/* Profile Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                      className="flex items-center gap-2 p-1.5 hover:bg-white/10 rounded-full transition"
                    >
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt="Profile"
                          className="w-8 h-8 rounded-full object-cover border-2 border-white/30"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                          <UserIcon size={18} />
                        </div>
                      )}
                      <ChevronDown className={`w-4 h-4 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showProfileDropdown && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fade-in">
                        {/* Profile Info */}
                        <div className="p-4 bg-gradient-to-r from-primary to-blue-600">
                          <div className="flex items-center gap-3">
                            {profile?.avatar_url ? (
                              <img
                                src={profile.avatar_url}
                                alt="Profile"
                                className="w-12 h-12 rounded-full object-cover border-2 border-white/50"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                                <UserIcon size={24} className="text-white" />
                              </div>
                            )}
                            <div className="text-white">
                              <p className="font-semibold">{profile?.full_name || 'Utilisateur'}</p>
                              <p className="text-sm text-blue-100 truncate">{user?.email}</p>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="p-2">
                          <Link
                            to="/dashboard"
                            onClick={() => setShowProfileDropdown(false)}
                            className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg transition"
                          >
                            <LayoutDashboard className="w-5 h-5 text-gray-400" />
                            <span className="font-medium">Tableau de bord</span>
                          </Link>
                          <Link
                            to="/profile"
                            onClick={() => setShowProfileDropdown(false)}
                            className="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg transition"
                          >
                            <Settings className="w-5 h-5 text-gray-400" />
                            <span className="font-medium">Modifier le profil</span>
                          </Link>
                        </div>

                        {/* Logout */}
                        <div className="border-t border-gray-100 p-2">
                          <button
                            onClick={() => {
                              setShowProfileDropdown(false);
                              handleSignOut();
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Se déconnecter</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/login" className="font-medium hover:text-accent">Connexion</Link>
                  <Link to="/signup" className="bg-white text-primary font-bold px-5 py-2 rounded-full hover:bg-gray-100 transition shadow-md">
                    Rejoindre
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white text-gray-800 px-4 pt-4 pb-6 space-y-3 shadow-xl border-t border-gray-100 absolute w-full left-0">
             <Link 
               to="/products" 
               className="block px-4 py-3 rounded-lg hover:bg-gray-50 font-medium text-lg"
               onClick={() => setIsMenuOpen(false)}
             >
               Marché
             </Link>
             {user && (
               <Link 
                 to="/orders" 
                 className="block px-4 py-3 rounded-lg hover:bg-gray-50 font-medium text-lg"
                 onClick={() => setIsMenuOpen(false)}
               >
                 Commandes
               </Link>
             )}
             {!user && (
               <div className="grid grid-cols-2 gap-4 mt-4">
                  <Link 
                    to="/login" 
                    className="block text-center py-3 rounded-lg border border-gray-200 font-medium text-primary hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Connexion
                  </Link>
                  <Link 
                    to="/signup" 
                    className="block text-center py-3 rounded-lg bg-primary text-white font-bold shadow-md hover:bg-blue-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    S'inscrire
                  </Link>
               </div>
             )}
             {user && (
               <>
                  {/* Mobile Profile Card */}
                  <div className="bg-gradient-to-r from-primary to-blue-600 rounded-xl p-4 -mx-1">
                    <div className="flex items-center gap-3">
                      {/* Profile Photo */}
                      <div className="relative">
                        {profile?.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt="Profile"
                            className="w-16 h-16 rounded-xl object-cover border-2 border-white/30"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center">
                            <UserIcon size={28} className="text-white" />
                          </div>
                        )}
                        <Link
                          to="/profile"
                          onClick={() => setIsMenuOpen(false)}
                          className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-lg shadow flex items-center justify-center"
                        >
                          <Camera size={14} className="text-primary" />
                        </Link>
                      </div>
                      
                      {/* Profile Info */}
                      <div className="flex-1 min-w-0 text-white">
                        <p className="font-semibold text-lg truncate">
                          {profile?.full_name || 'Utilisateur'}
                        </p>
                        <p className="text-sm text-blue-100 truncate">{user?.email}</p>
                      </div>
                    </div>
                    
                    {/* Quick Profile Actions */}
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <Link
                        to="/profile"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center justify-center gap-2 py-2 bg-white/20 rounded-lg text-white text-sm font-medium active:bg-white/30"
                      >
                        <Settings size={16} />
                        Modifier
                      </Link>
                      <Link
                        to="/dashboard"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center justify-center gap-2 py-2 bg-white/20 rounded-lg text-white text-sm font-medium active:bg-white/30"
                      >
                        <LayoutDashboard size={16} />
                        Dashboard
                      </Link>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 my-3"></div>

                  {/* AdaEx Exchange Button Mobile */}
                  <a
                    href="https://app.adaex.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 text-left font-medium text-orange-600 active:bg-orange-100"
                  >
                    <ArrowLeftRight size={20} />
                    <div>
                      <span className="block">Échanger ADA ↔ FC</span>
                      <span className="text-xs text-orange-400">Via Mobile Money</span>
                    </div>
                  </a>
                  
                  {/* Mobile Wallet Section */}
                  {connectedWallet ? (
                    <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <img src={connectedWallet.icon} alt={connectedWallet.name} className="w-6 h-6 rounded-lg" />
                          <span className="text-sm font-medium text-gray-700">{connectedWallet.name}</span>
                        </div>
                        <span className="font-bold text-emerald-600">{connectedWallet.balance.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} ADA</span>
                      </div>
                      <div className="bg-white/60 rounded-lg p-2 mb-3">
                        <p className="text-xs font-mono text-gray-500 break-all">
                          {formatAddress(connectedWallet.addressBech32)}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          handleDisconnectWallet();
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-center py-2 text-sm text-red-600 hover:bg-red-50 active:bg-red-100 rounded-lg transition"
                      >
                        Déconnecter le wallet
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => { 
                        setIsWalletModalOpen(true); 
                        setIsMenuOpen(false); 
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 text-left font-medium text-primary active:bg-blue-100"
                    >
                       <Wallet size={20} />
                       <span>Connecter Wallet Cardano</span>
                    </button>
                  )}

                  <div className="border-t border-gray-100 my-3"></div>

                  {/* Navigation Links */}
                  <Link 
                    to="/orders" 
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Package size={20} className="text-gray-400" />
                    <span>Mes commandes</span>
                  </Link>

                  <button 
                    onClick={() => { handleSignOut(); setIsMenuOpen(false); }} 
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-red-50 active:bg-red-100 text-red-500 font-medium"
                  >
                    <LogOut size={20} />
                    <span>Déconnexion</span>
                  </button>
               </>
             )}
          </div>
        )}
      </nav>

      {/* Wallet Modal */}
      <WalletModal 
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onConnect={handleWalletConnect}
      />

      {/* Click outside to close dropdowns */}
      {(showWalletDropdown || showProfileDropdown) && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => {
            setShowWalletDropdown(false);
            setShowProfileDropdown(false);
          }}
        />
      )}
    </>
  );
};

export default Navbar;
