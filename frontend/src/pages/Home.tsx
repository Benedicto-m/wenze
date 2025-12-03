import React from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  ArrowRight,
  ShoppingBag,
  Smartphone,
  Zap,
  Globe,
  CreditCard,
  TrendingUp,
  CheckCircle,
  PlayCircle,
  Lock,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const Home = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-12 pb-12">
      {/* 1. HERO SECTION HYBRIDE (Tech + Humain) */}
      <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 shadow-2xl shadow-primary/10 dark:shadow-primary/20 min-h-[600px] flex items-center transition-all duration-500 ring-1 ring-slate-200 dark:ring-white/5 group/hero">
        {/* --- 1. BACKGROUND ANIMÉ (Adaptatif Light/Dark) --- */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Blobs plus doux en mode clair, plus vibrants en mode sombre */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 dark:bg-primary/30 rounded-full blur-[100px] animate-blob opacity-60 dark:opacity-50" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-400/20 dark:bg-cyan-500/20 rounded-full blur-[100px] animate-blob animation-delay-2000 opacity-60 dark:opacity-50" />

          {/* Texture grille */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] dark:opacity-[0.05] bg-center" />
        </div>

        <div className="relative z-10 container mx-auto px-6 py-12 lg:px-16">
          {/* 
       flex-col-reverse : Met l'image (2ème élément) en PREMIER sur mobile
       lg:flex-row : Remet le texte à gauche et l'image à droite sur grand écran 
    */}
          <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-24">
            {/* --- 2. CONTENU TEXTE (Gauche sur Desktop, Bas sur Mobile) --- */}
            <div className="flex-1 text-center lg:text-left animate-fade-in-up">
              {/* Badge V2 - Couleurs adaptatives */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-white/5 border border-primary/20 dark:border-white/10 text-primary dark:text-primary-200 text-xs font-bold uppercase tracking-wider mb-8 shadow-sm backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                {t("home.badge") || "Marketplace N°1 en RDC"}
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight leading-[1.1]">
                {t("home.title") || "Le Commerce"} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-600 to-cyan-500 dark:from-primary-300 dark:via-blue-200 dark:to-cyan-300 relative">
                  {t("home.subtitle") || "Réinventé en RDC"}
                  <svg
                    className="absolute w-full h-3 -bottom-2 left-0 text-primary/20 dark:text-primary-500/50 -z-10"
                    viewBox="0 0 100 10"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0 5 Q 50 10 100 5"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                  </svg>
                </span>
              </h1>

              <p className="text-lg text-slate-600 dark:text-slate-300 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
                {t("home.description") ||
                  "Fini les arnaques. Avec notre système Escrow, l'argent est bloqué jusqu'à la livraison. Achetez, vendez, respirez."}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/products"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-primary-600 hover:scale-[1.02] shadow-xl shadow-primary/25 transition-all duration-300"
                >
                  <ShoppingBag className="w-5 h-5 text-white" />
                  {t("home.start") || "Acheter"}
                </Link>
                <Link
                  to="/signup"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white dark:bg-white/10 text-slate-700 dark:text-white border border-slate-200 dark:border-white/10 px-8 py-4 rounded-2xl font-bold text-lg backdrop-blur-sm hover:bg-slate-50 dark:hover:bg-white/20 transition-all duration-300"
                >
                  <Smartphone className="w-5 h-5" />
                  {t("nav.join") || "Vendre"}
                </Link>
              </div>

              <div className="mt-10 flex items-center justify-center lg:justify-start gap-8 text-sm text-slate-500 dark:text-slate-400 font-medium border-t border-slate-200 dark:border-white/5 pt-6 lg:border-none lg:pt-0">
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-green-500" />
                  Mobile Money
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={18} className="text-green-500" />
                  Vendeurs Vérifiés
                </div>
              </div>
            </div>

            {/* --- 3. VISUEL IMAGE (Droite sur Desktop, Haut sur Mobile) --- */}
            <div className="flex-1 relative w-full max-w-[500px] animate-float lg:translate-x-10 perspective-1000 mb-8 lg:mb-0">
              {/* Cadre de l'image */}
              <div className="relative rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-800 border-4 border-white dark:border-slate-700 shadow-2xl dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] aspect-[4/5] group transform transition-transform duration-500 hover:rotate-1 ring-1 ring-slate-200 dark:ring-transparent">
                <img
                  src="/image.png"
                  alt="Expérience Wenze"
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />

                {/* Overlay Gradient (Seulement en bas pour lisibilité texte) */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-90" />

                {/* BADGES FLOTTANTS */}

                {/* Badge 1 : Prix (Bas) */}
                <div className="absolute bottom-6 left-6 right-6 z-20">
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-500 p-2 rounded-xl">
                        <ShieldCheck size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">Sécurisé</p>
                        <p className="text-[11px] text-slate-200">
                          Fonds bloqués
                        </p>
                      </div>
                    </div>
                    <div className="text-white font-mono font-bold bg-black/20 px-2 py-1 rounded-lg">
                      $120.00
                    </div>
                  </div>
                </div>

                {/* Badge 2 : Notification (Haut) */}
                <div className="absolute top-6 right-6 z-20">
                  <div className="flex items-center gap-2 bg-slate-900/60 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full shadow-lg">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                    <span className="text-xs font-bold text-white">
                      En direct
                    </span>
                  </div>
                </div>
              </div>

              {/* Halo décoratif derrière l'image */}
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-primary/10 dark:bg-primary/20 blur-[80px] rounded-full pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. STATS STRIP (Design "Skewed" de Version A) */}
      <div className="relative -mt-20 mx-4 lg:mx-20 z-20">
        <div className="bg-primary hover:bg-primary-600 transition-colors duration-500 rounded-3xl shadow-xl shadow-primary/20 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
          <div className="py-8 px-4 sm:px-12 flex flex-wrap justify-between items-center gap-8 text-white transform rotate-1 hover:rotate-0 transition-transform duration-300">
            <StatItem
              label={t("home.stats.users") || "Utilisateurs"}
              value="10K+"
            />
            <div className="hidden sm:block w-px h-12 bg-white/20" />
            <StatItem
              label={t("home.stats.transactions") || "Transactions"}
              value="50K+"
            />
            <div className="hidden sm:block w-px h-12 bg-white/20" />
            <StatItem label="Escrow" value="100%" />
            <div className="hidden sm:block w-px h-12 bg-white/20" />
            <StatItem label="Support" value="24/7" />
          </div>
        </div>
      </div>

      {/* 3. BENTO GRID FEATURES (Version B - Adapté) */}
      <div className="py-10">
        <div className="text-center max-w-3xl mx-auto mb-16 px-4">
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6">
            Une plateforme. <br />
            <span className="text-primary">Toutes les possibilités.</span>
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400">
            Wenze combine la simplicité des réseaux sociaux avec la puissance
            d'un e-commerce sécurisé.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[320px]">
          {/* Card 1: Sécurité (Large) */}
          <div className="md:col-span-2 bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] p-8 relative overflow-hidden group border border-slate-200 dark:border-slate-700 hover:shadow-2xl hover:shadow-slate-200 dark:hover:shadow-black/50 transition-all duration-300 flex flex-col justify-between">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-primary/30">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Sécurité Escrow
              </h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm text-sm sm:text-base">
                Ne payez jamais à l'aveugle. Votre argent reste bloqué sur la
                plateforme jusqu'à ce que vous confirmiez la réception.
              </p>
            </div>
            <div className="relative z-10 flex gap-3 mt-4">
              <Badge text="Anti-Fraude" />
              <Badge text="Remboursable" />
            </div>
            <div className="absolute right-0 bottom-0 w-64 h-64 bg-gradient-to-tl from-primary/10 to-transparent rounded-tl-full translate-x-10 translate-y-10 group-hover:scale-110 transition-transform duration-500" />
          </div>

          {/* Card 2: Mobile (Tall) - CORRIGÉE */}
          <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 relative overflow-hidden group hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 flex flex-col">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <Zap className="text-yellow-400 w-8 h-8" />
                <span className="bg-green-500/20 text-green-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                  Live
                </span>
              </div>

              <h3 className="text-xl font-bold mb-1">Ultra Rapide</h3>
              <p className="text-slate-400 text-xs mb-4">
                Optimisé 3G/4G en RDC.
              </p>

              {/* Liste compactée avec flex-1 pour occuper l'espace restant */}
              <div className="space-y-2 mt-auto">
                <div className="flex items-center gap-3 text-xs text-slate-300 bg-white/5 p-2 rounded-xl backdrop-blur-sm border border-white/5">
                  <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center font-bold text-[8px]">
                    A
                  </div>
                  <span>Airtel Money</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-300 bg-white/5 p-2 rounded-xl backdrop-blur-sm border border-white/5">
                  <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center font-bold text-[8px]">
                    O
                  </div>
                  <span>Orange Money</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-300 bg-white/5 p-2 rounded-xl backdrop-blur-sm border border-white/5">
                  <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center font-bold text-[8px]">
                    M
                  </div>
                  <span>M-Pesa</span>
                </div>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-slate-900/80 pointer-events-none" />
          </div>

          {/* Card 3: Global (Standard) */}
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 relative overflow-hidden group border border-slate-200 dark:border-slate-700 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
            <div>
              <Globe className="text-cyan-500 mb-6 w-10 h-10" />
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                National
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
                Vendez à Kinshasa depuis Goma. Achetez à Lubumbashi depuis
                Matadi.
              </p>
            </div>
          </div>

          {/* Card 4: Business (Standard) */}
          <div className="md:col-span-2 bg-gradient-to-r from-blue-600 to-primary text-white rounded-[2.5rem] p-8 relative overflow-hidden group flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <TrendingUp className="text-white/80 w-8 h-8" />
                <h3 className="text-2xl font-bold">Vendeurs Pro</h3>
              </div>
              <p className="text-blue-100 max-w-sm text-sm sm:text-base">
                Gérez votre stock, suivez vos commandes et boostez votre
                visibilité avec nos outils pro.
              </p>
            </div>
            <Link
              to="/signup"
              className="relative z-10 px-6 py-3 bg-white text-primary font-bold rounded-xl shadow-lg hover:bg-blue-50 transition-colors whitespace-nowrap"
            >
              Devenir Vendeur
            </Link>
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
          </div>
        </div>
      </div>

      {/* 4. HOW IT WORKS (Steps simplifiées et élégantes) */}
      <div className="py-16 border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
          <StepItem
            num="01"
            title="Créez un compte"
            desc="Gratuit et rapide."
          />
          <ArrowRight className="hidden md:block text-slate-300 dark:text-slate-700 w-8 h-8" />
          <StepItem num="02" title="Commandez" desc="Fonds sécurisés." />
          <ArrowRight className="hidden md:block text-slate-300 dark:text-slate-700 w-8 h-8" />
          <StepItem num="03" title="Validez" desc="Vendeur payé." />
        </div>
      </div>

      {/* 5. CTA FINAL (Grand Impact) */}
      <div className="relative rounded-[3rem] overflow-hidden bg-slate-900 px-6 py-20 lg:py-28 text-center shadow-2xl group isolate">
        {/* --- 1. FOND ABSTRAIT TECH (Plus d'image stock floue) --- */}
        {/* Dégradé de base */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-slate-900 to-black" />

        {/* Texture Grille (Pour le côté Tech) */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 bg-center mask-radial-faded" />

        {/* Effets de Lumière (Glow) qui bougent */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/40 rounded-full blur-[120px] opacity-60 animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-cyan-500/20 rounded-full blur-[100px]" />

        {/* --- 2. CONTENU --- */}
        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Titre */}
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-8 tracking-tight drop-shadow-lg">
            Prêt à faire de <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-white to-blue-200 animate-shimmer bg-[length:200%_auto]">
              bonnes affaires ?
            </span>
          </h2>

          {/* Description */}
          <p className="text-lg md:text-xl text-blue-100/80 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
            Rejoignez la communauté Wenze dès aujourd'hui.{" "}
            <br className="hidden sm:block" />
            Sécurité garantie, paiements mobiles acceptés.
          </p>

          {/* Boutons Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            {/* Bouton 1 : Blanc (Contraste fort sur fond sombre) */}
            <Link
              to="/signup"
              className="w-full sm:w-auto px-10 py-4 bg-white text-primary hover:bg-blue-50 rounded-full font-bold text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:-translate-y-1 transition-all duration-300"
            >
              Créer mon compte
            </Link>

            {/* Bouton 2 : Glassmorphism */}
            <Link
              to="/products"
              className="w-full sm:w-auto px-10 py-4 bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-full font-bold text-lg hover:bg-white/10 hover:border-white/30 transition-all duration-300 flex items-center justify-center gap-2 group/btn"
            >
              Explorer le marché
              <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Preuve Sociale Discrète en bas */}
          <div className="mt-12 pt-8 border-t border-white/5 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-medium text-blue-200/60">
            <span className="flex items-center gap-2">
              ✨ Inscription Gratuite
            </span>
            <span className="flex items-center gap-2">
              🔒 Paiement Sécurisé
            </span>
            <span className="flex items-center gap-2">🚀 Livraison Rapide</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Composants Helpers Styled ---

const StatItem = ({ label, value }: { label: string; value: string }) => (
  <div className="text-center group min-w-[100px]">
    <div className="text-3xl sm:text-4xl font-black mb-1 group-hover:-translate-y-1 transition-transform duration-300">
      {value}
    </div>
    <div className="text-xs sm:text-sm font-medium opacity-80 uppercase tracking-widest">
      {label}
    </div>
  </div>
);

const Badge = ({ text }: { text: string }) => (
  <span className="px-3 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300">
    {text}
  </span>
);

const StepItem = ({
  num,
  title,
  desc,
}: {
  num: string;
  title: string;
  desc: string;
}) => (
  <div className="flex items-center gap-4">
    <div className="text-5xl font-black text-slate-200 dark:text-slate-800">
      {num}
    </div>
    <div>
      <h4 className="text-lg font-bold text-slate-900 dark:text-white">
        {title}
      </h4>
      <p className="text-sm text-slate-500 dark:text-slate-400">{desc}</p>
    </div>
  </div>
);

export default Home;
