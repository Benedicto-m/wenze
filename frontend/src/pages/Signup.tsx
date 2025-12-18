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
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (error) setError(error.message);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gray-50 px-4 py-8 sm:px-6">
      {/* Subtle gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 via-white to-cyan-50/30" />
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-[400px] sm:max-w-[420px]">

        {/* Form Card */}
        <div 
          className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-lg animate-slide-up max-h-[85vh] overflow-y-auto"
        >
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
              Créer un compte
            </h1>
            <p className="text-gray-500 mt-1.5 sm:mt-2 text-sm">
              Rejoignez-nous dès aujourd'hui
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl mb-5 sm:mb-6 text-xs sm:text-sm animate-slide-up flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-2.5 sm:gap-3 bg-white text-gray-800 font-medium py-2.5 sm:py-3 px-4 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-sm sm:text-base mb-5 sm:mb-6"
          >
            <GoogleIcon />
            {googleLoading ? 'Connexion...' : 'Continuer avec Google'}
          </button>

          {/* Divider */}
          <div className="relative my-5 sm:my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 sm:px-4 bg-white text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider">ou</span>
            </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-4 sm:space-y-5">
            {/* Nom */}
            <div>
              <label className="block text-[10px] sm:text-xs font-medium text-gray-700 mb-1.5 sm:mb-2 uppercase tracking-wider">
                Nom complet
              </label>
              <input
                type="text"
                required
                className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 text-sm sm:text-base"
                placeholder="Olivier Mwatsi"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[10px] sm:text-xs font-medium text-gray-700 mb-1.5 sm:mb-2 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                required
                className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 text-sm sm:text-base"
                placeholder="olivier@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] sm:text-xs font-medium text-gray-700 mb-1.5 sm:mb-2 uppercase tracking-wider">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 pr-10 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 text-sm sm:text-base"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
              {/* Jauge minimaliste pour le mot de passe */}
              <div className="mt-2 flex items-center gap-1.5">
                <div
                  className={`h-1 flex-1 rounded-full transition-all ${
                    password.length > 0
                      ? password.length >= 6
                        ? "bg-green-500"
                        : "bg-red-500"
                      : "bg-gray-200"
                  }`}
                />
                <span className="text-[10px] text-gray-500">Min. 6 car.</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium py-2.5 sm:py-3 px-4 rounded-xl hover:from-violet-500 hover:to-fuchsia-500 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/25 text-sm sm:text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Création...
                </span>
              ) : (
                "S'inscrire"
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="mt-6 sm:mt-8 text-center text-gray-500 text-xs sm:text-sm">
            Déjà un compte ?{' '}
            <Link 
              to="/login" 
              className="text-violet-600 font-medium hover:text-violet-700 transition-colors"
            >
              Se connecter
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="mt-6 sm:mt-8 text-center text-[10px] sm:text-xs text-gray-400 px-4">
          En continuant, vous acceptez nos{' '}
          <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors">Conditions</a>
          {' '}et{' '}
          <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors">Confidentialité</a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
