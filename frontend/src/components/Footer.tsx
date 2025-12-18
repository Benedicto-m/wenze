import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Shield, MessageCircle, Facebook, Twitter, Instagram, Mail, MapPin, Phone, Sparkles } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-auto bg-gradient-to-br from-gray-50 via-white to-violet-50/30 dark:from-slate-900 dark:via-slate-950 dark:to-violet-950/20 border-t border-gray-200 dark:border-slate-800">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12 sm:py-16 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          
          {/* Brand Section */}
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative bg-gradient-to-br from-violet-600 to-fuchsia-600 p-2 rounded-xl">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                WENZE
              </span>
            </Link>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              L'avenir du commerce sécurisé & rapide à Goma. 
              Achetez, vendez, échangez avec une garantie de sécurité totale grâce à la blockchain Cardano. 💙
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a 
                href="#" 
                className="p-2 bg-white dark:bg-slate-800 rounded-lg text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-all duration-200 hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="p-2 bg-white dark:bg-slate-800 rounded-lg text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-all duration-200 hover:scale-110"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="p-2 bg-white dark:bg-slate-800 rounded-lg text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-all duration-200 hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-500" />
              Liens Rapides
            </h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/products" 
                  className="text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors text-sm flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  Produits
                </Link>
              </li>
              <li>
                <Link 
                  to="/dashboard" 
                  className="text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors text-sm flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  Mon Tableau de bord
                </Link>
              </li>
              <li>
                <Link 
                  to="/products/new" 
                  className="text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors text-sm flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  Vendre un produit
                </Link>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors text-sm flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  À propos de WENZE
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-violet-500" />
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="#" 
                  className="text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors text-sm flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  Centre d'aide
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors text-sm flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  Nous contacter
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors text-sm flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  Politique de confidentialité
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors text-sm flex items-center gap-2 group"
                >
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  Conditions d'utilisation
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-violet-500" />
              Contact
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                <MapPin className="w-5 h-5 text-violet-500 shrink-0 mt-0.5" />
                <span>Goma, République Démocratique du Congo</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                <Mail className="w-5 h-5 text-violet-500 shrink-0" />
                <a 
                  href="mailto:contact@wenze.cd" 
                  className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                >
                  contact@wenze.cd
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                <Phone className="w-5 h-5 text-violet-500 shrink-0" />
                <a 
                  href="tel:+243900000000" 
                  className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                >
                  +243 900 000 000
                </a>
              </li>
            </ul>
            <div className="pt-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-950/30 dark:to-fuchsia-950/30 rounded-lg border border-violet-200 dark:border-violet-800">
                <Shield className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                <span className="text-xs font-medium text-violet-700 dark:text-violet-300">
                  Sécurisé par Cardano
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
              © {new Date().getFullYear()} WENZE. Fait avec{' '}
              <Heart className="w-4 h-4 text-red-500 inline-block animate-pulse" />{' '}
              à Goma, RDC
            </p>
            <div className="flex items-center gap-6 text-sm">
              <a 
                href="#" 
                className="text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
              >
                Mentions légales
              </a>
              <a 
                href="#" 
                className="text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
              >
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;