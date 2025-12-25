import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-auto bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800">
      <div className="container mx-auto px-4 py-3 max-w-7xl">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          {/* Brand */}
          <Link to="/" className="inline-flex items-center gap-1.5 group">
            <div className="bg-gradient-to-br from-violet-600 to-fuchsia-600 p-1 rounded">
              <ShoppingBag className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              WENZE
            </span>
          </Link>
          
          {/* Links */}
          <div className="flex items-center gap-3 text-xs">
            <Link 
              to="/products" 
              className="text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
            >
              Produits
            </Link>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <Link 
              to="/products/new" 
              className="text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
            >
              Vendre
            </Link>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <a 
              href="mailto:contact@wenze.cd" 
              className="text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
            >
              Contact
            </a>
          </div>

          {/* Copyright */}
          <p className="text-xs text-gray-400 dark:text-gray-500">
            © {new Date().getFullYear()} WENZE
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;