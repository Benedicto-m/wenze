import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if we have a valid session from the reset link
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsValidSession(!!session);
    };
    checkSession();

    // Listen for auth state changes (when user clicks the reset link)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsValidSession(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
  };

  // Loading state
  if (isValidSession === null) {
    return (
      <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
        <div className="text-center relative z-10">
          <svg className="animate-spin h-10 w-10 text-violet-400 mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          <p className="text-white/60">Vérification en cours...</p>
        </div>
      </div>
    );
  }

  // Invalid or expired link
  if (!isValidSession) {
    return (
      <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#0a0a0a] px-4 py-8 sm:px-6">
        {/* Animated gradient background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-950/40 via-transparent to-cyan-950/30" />
          <div className="absolute top-0 left-1/4 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-violet-600/20 rounded-full blur-[80px] sm:blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[250px] sm:w-[500px] h-[250px] sm:h-[500px] bg-cyan-500/15 rounded-full blur-[60px] sm:blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 w-full max-w-[400px] sm:max-w-[420px]">
          <div 
            className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-2xl shadow-2xl p-8 text-center"
            style={{ 
              boxShadow: '0 0 60px -20px rgba(139, 92, 246, 0.15), 0 25px 50px -12px rgba(0, 0, 0, 0.5)' 
            }}
          >
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2 tracking-tight">Lien invalide ou expiré</h2>
            <p className="text-white/60 mb-6 text-sm">
              Ce lien de réinitialisation n'est plus valide. Veuillez demander un nouveau lien.
            </p>
            <Link
              to="/forgot-password"
              className="block w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium py-3 px-4 rounded-xl hover:from-violet-500 hover:to-fuchsia-500 transition-all duration-300 shadow-lg shadow-violet-500/25"
            >
              Demander un nouveau lien
            </Link>
            <Link
              to="/login"
              className="block mt-4 text-white/60 hover:text-white transition-colors text-sm"
            >
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#0a0a0a] px-4 py-8 sm:px-6">
      {/* Animated gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/40 via-transparent to-cyan-950/30" />
        <div className="absolute top-0 left-1/4 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-violet-600/20 rounded-full blur-[80px] sm:blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[250px] sm:w-[500px] h-[250px] sm:h-[500px] bg-cyan-500/15 rounded-full blur-[60px] sm:blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[800px] h-[400px] sm:h-[800px] bg-fuchsia-600/10 rounded-full blur-[100px] sm:blur-[150px]" />
      </div>

      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '48px 48px'
        }}
      />

      <div className="relative z-10 w-full max-w-[400px] sm:max-w-[420px]">
        {/* Card */}
        <div 
          className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-2xl shadow-2xl p-6 sm:p-8 animate-slide-up"
          style={{ 
            boxShadow: '0 0 60px -20px rgba(139, 92, 246, 0.15), 0 25px 50px -12px rgba(0, 0, 0, 0.5)' 
          }}
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-6 sm:p-8 bg-white/95 dark:bg-white/95 backdrop-blur-xl rounded-3xl border-2 border-white/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.1)] mb-6 relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 via-transparent to-fuchsia-500/20 rounded-3xl blur-xl -z-10" />
              <img src="/logo.png" alt="Wenze" className="h-14 sm:h-16 w-auto drop-shadow-lg relative z-10" />
            </div>

            {!success ? (
              <>
                <div className="w-16 h-16 bg-violet-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-violet-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white tracking-tight">Nouveau mot de passe</h2>
                <p className="text-white/60 mt-2 text-sm">
                  Choisissez un nouveau mot de passe sécurisé pour votre compte.
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white tracking-tight">Mot de passe modifié !</h2>
                <p className="text-white/60 mt-2 text-sm">
                  Votre mot de passe a été mis à jour avec succès.
                </p>
              </>
            )}
          </div>

          {!success ? (
            <>
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm animate-slide-up">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[10px] sm:text-xs font-medium text-white/60 mb-1.5 sm:mb-2 uppercase tracking-wider">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 pr-10 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 text-sm sm:text-base"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-white/40 mt-2">Minimum 6 caractères</p>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-medium text-white/60 mb-1.5 sm:mb-2 uppercase tracking-wider">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 pr-10 bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all duration-200 text-sm sm:text-base"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </button>
                  </div>
                </div>

                {/* Password match indicator */}
                {confirmPassword && (
                  <div className={`flex items-center gap-2 text-sm ${password === confirmPassword ? 'text-green-400' : 'text-red-400'}`}>
                    {password === confirmPassword ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Les mots de passe correspondent
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4" />
                        Les mots de passe ne correspondent pas
                      </>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || password !== confirmPassword}
                  className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium py-2.5 sm:py-3 px-4 rounded-xl hover:from-violet-500 hover:to-fuchsia-500 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/25 text-sm sm:text-base"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Mise à jour...
                    </span>
                  ) : (
                    'Réinitialiser le mot de passe'
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-sm text-green-400">
                <p className="font-medium mb-1 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Succès !
                </p>
                <p>Vous allez être redirigé vers la page de connexion dans quelques secondes...</p>
              </div>

              <Link
                to="/login"
                className="block w-full text-center bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium py-3 px-4 rounded-xl hover:from-violet-500 hover:to-fuchsia-500 transition-all duration-300 shadow-lg shadow-violet-500/25"
              >
                Se connecter maintenant
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
















