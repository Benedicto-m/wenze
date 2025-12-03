import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const translateError = (errorMessage: string): string => {
  if (
    errorMessage.toLowerCase().includes("already") &&
    errorMessage.toLowerCase().includes("email")
  ) {
    return "Cette adresse email est déjà utilisée.";
  }
  if (errorMessage.includes("Password")) return "Mot de passe trop court.";
  return errorMessage;
};

const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (error) {
      setError(translateError(error.message));
      setLoading(false);
    } else if (data?.user?.identities?.length === 0) {
      setError("Cette adresse email est déjà utilisée.");
      setLoading(false);
    } else {
      navigate("/login", { state: { message: "Compte créé !" } });
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) setError(error.message);
  };

  return (
    // h-screen + overflow-hidden = Pas de scroll sur la page principale
    <div className="h-screen w-full overflow-hidden relative flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="absolute -top-[10%] -right-[10%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[120px] opacity-40" />
        <div className="absolute bottom-[10%] -left-[10%] w-[400px] h-[400px] bg-cyan-400/20 rounded-full blur-[120px] opacity-40" />
      </div>

      <div className="relative z-10 w-full max-w-[420px] px-4">
        {/* Header Compact */}
        <div className="text-center mb-5">
          <Link to="/" className="inline-flex items-center gap-2 mb-2 group">
            <img src="/logo.png" alt="Wenze" className="h-7 w-auto" />
            <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              WENZE
            </span>
          </Link>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Créer un compte
          </h1>
        </div>

        {/* Card Principale - max-h pour éviter le débordement sur petits écrans */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 p-6 border border-slate-100 dark:border-slate-700 max-h-[85vh] overflow-y-auto custom-scrollbar">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg mb-4 flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-3">
            {/* Nom */}
            <div>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="Nom complet"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            {/* Email */}
            <div>
              <input
                type="email"
                required
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all pr-10"
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Jauge minimaliste pour le mot de passe */}
              <div className="mt-1 flex items-center gap-1.5">
                <div
                  className={`h-1 flex-1 rounded-full transition-all ${
                    password.length > 0
                      ? password.length >= 6
                        ? "bg-green-500"
                        : "bg-red-500"
                      : "bg-slate-200 dark:bg-slate-700"
                  }`}
                />
                <span className="text-[10px] text-slate-400">Min. 6 car.</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all duration-200 text-sm mt-1"
            >
              {loading ? "Création..." : "S'inscrire"}
            </button>
          </form>

          {/* Divider Compact */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white dark:bg-slate-800 text-[10px] font-medium text-slate-400 uppercase">
                ou
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-medium py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-sm"
          >
            <GoogleIcon />
            Google
          </button>

          <p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-400">
            Déjà un compte ?{" "}
            <Link
              to="/login"
              className="text-primary font-bold hover:text-primary-600"
            >
              Connexion
            </Link>
          </p>
        </div>

        {/* Footer Links (Très discret) */}
        <div className="mt-6 flex justify-center gap-4 text-[10px] text-slate-400">
          <a href="#" className="hover:text-primary">
            Conditions
          </a>
          <a href="#" className="hover:text-primary">
            Confidentialité
          </a>
          <a href="#" className="hover:text-primary">
            Aide
          </a>
        </div>
      </div>
    </div>
  );
};

export default Signup;
