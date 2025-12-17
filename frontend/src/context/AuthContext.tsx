import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // S'assurer que chaque utilisateur auth a un profil dans la table "profiles"
  const ensureUserProfile = async (authUser: User) => {
    try {
      const fullName =
        (authUser.user_metadata as any)?.full_name ||
        (authUser.user_metadata as any)?.name ||
        '';

      const { error } = await supabase
        .from('profiles')
        .upsert(
          {
            id: authUser.id,
            email: authUser.email,
            full_name: fullName,
          },
          { onConflict: 'id' }
        );

      if (error) {
        console.warn('⚠️ Erreur lors de la création/mise à jour du profil:', error);
      }
    } catch (err) {
      console.warn('⚠️ Exception lors de ensureUserProfile:', err);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await ensureUserProfile(currentUser);
      }

      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          // Ne pas bloquer l'UI si ça échoue
          ensureUserProfile(currentUser).finally(() => setLoading(false));
        } else {
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};



