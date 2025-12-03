import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Mail, 
  ArrowRight, 
  Heart, 
  MapPin, 
  ShieldCheck 
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 mt-auto transition-colors duration-300 relative overflow-hidden">
      
      {/* Effet de fond subtil (optionnel) */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />

      <div className="container mx-auto px-4 py-12 md:py-16 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12">
          
          {/* Colonne 1 : Marque & Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                <img
                  src="/logo.png"
                  alt="Wenze"
                  className="h-8 w-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextElementSibling?.classList.remove("hidden");
                  }}
                />
                <span className="hidden text-xl font-bold text-primary">W</span>
              </div>
              <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                WENZE
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xs">
              La première marketplace sécurisée de la RDC. Achetez et vendez en toute confiance grâce à notre système d'Escrow intégré.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <SocialIcon icon={<Facebook size={18} />} href="#" />
              <SocialIcon icon={<Twitter size={18} />} href="#" />
              <SocialIcon icon={<Instagram size={18} />} href="#" />
              <SocialIcon icon={<Linkedin size={18} />} href="#" />
            </div>
          </div>

          {/* Colonne 2 : Liens Rapides */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-6">Marché</h3>
            <ul className="space-y-4">
              <FooterLink to="/products">Explorer les produits</FooterLink>
              <FooterLink to="/login">Vendre un article</FooterLink>
              <FooterLink to="/categories">Toutes les catégories</FooterLink>
              <FooterLink to="/security">Sécurité & Escrow</FooterLink>
            </ul>
          </div>

          {/* Colonne 3 : Aide & Support */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-6">Support</h3>
            <ul className="space-y-4">
              <FooterLink to="/help">Centre d'aide</FooterLink>
              <FooterLink to="/faq">Questions fréquentes</FooterLink>
              <FooterLink to="/contact">Nous contacter</FooterLink>
              <FooterLink to="/terms">Conditions d'utilisation</FooterLink>
            </ul>
          </div>

          {/* Colonne 4 : Newsletter */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-6">Restez informé</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
              Recevez nos meilleures offres et actualités directement dans votre boîte mail.
            </p>
            <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                <input 
                  type="email" 
                  placeholder="votre@email.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-slate-900 dark:text-white"
                />
              </div>
              <button className="w-full bg-primary hover:bg-primary-600 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 group shadow-lg shadow-primary/20">
                S'inscrire
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>
        </div>

        {/* Séparateur */}
        <div className="border-t border-slate-200 dark:border-slate-800 my-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
          <p className="text-slate-500 dark:text-slate-400 text-center md:text-left">
            © {currentYear} WENZE. Tous droits réservés.
          </p>
          
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-full border border-slate-100 dark:border-slate-800">
            <span>Fait avec</span>
            <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
            <span>à Goma</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">Confidentialité</Link>
            <Link to="/legal" className="text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">Mentions légales</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Composant pour les liens de liste
const FooterLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <li>
    <Link 
      to={to} 
      className="text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary-400 transition-colors duration-200 flex items-center gap-2 group"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 group-hover:bg-primary transition-colors"></span>
      {children}
    </Link>
  </li>
);

// Composant pour les icônes sociales
const SocialIcon = ({ icon, href }: { icon: React.ReactNode; href: string }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer"
    className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-primary hover:text-white hover:-translate-y-1 transition-all duration-300"
  >
    {icon}
  </a>
);

export default Footer;