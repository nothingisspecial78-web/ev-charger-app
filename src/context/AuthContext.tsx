import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, UserRole } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface AuthContextType {
  user: Profile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  signup: (
    name: string,
    email: string,
    pass: string,
    role: 'driver' | 'admin',
    phone?: string
  ) => Promise<{ success: boolean; error?: string; role?: UserRole }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'voltspot_active_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return null;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      const client = supabase;

      // 1. Load active session on start
      client.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          client
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle()
            .then(({ data }) => {
              if (data) {
                setUser(data as Profile);
                localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
              }
            });
        }
      });

      // 2. Real-time auth state synchronization
      const { data: { subscription } } = client.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT' || !session?.user) {
          setUser(null);
          localStorage.removeItem(AUTH_STORAGE_KEY);
        } else if (session?.user) {
          const { data: prof } = await client
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (prof) {
            setUser(prof as Profile);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(prof));
          } else {
            const fallbackProf: Profile = {
              id: session.user.id,
              display_name: session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || 'User',
              role: (session.user.user_metadata?.role as UserRole) || 'driver',
              phone: session.user.user_metadata?.phone,
            };
            setUser(fallbackProf);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(fallbackProf));
          }
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string; role?: UserRole }> => {
    setLoading(true);
    try {
      const cleanEmail = email.toLowerCase().trim();

      // 1. Real Supabase Authentication (Functional Mode)
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: pass,
        });

        if (!error && data.user) {
          const { data: prof } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();

          if (prof) {
            setUser(prof as Profile);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(prof));
            return { success: true, role: prof.role };
          } else {
            const newProf: Profile = {
              id: data.user.id,
              display_name: data.user.user_metadata?.display_name || cleanEmail.split('@')[0],
              role: (data.user.user_metadata?.role as UserRole) || 'driver',
              phone: data.user.user_metadata?.phone,
            };
            await supabase.from('profiles').upsert(newProf);
            setUser(newProf);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newProf));
            return { success: true, role: newProf.role };
          }
        }
      }

      return { success: false, error: 'Invalid credentials or user not found. Please verify your email and password.' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (
    name: string,
    email: string,
    pass: string,
    role: 'driver' | 'admin',
    phone?: string
  ): Promise<{ success: boolean; error?: string; role?: UserRole }> => {
    setLoading(true);
    try {
      const safeRole: UserRole = role === 'admin' ? 'admin' : 'driver';

      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: pass,
          options: {
            data: {
              display_name: name.trim(),
              role: safeRole,
              phone: phone?.trim(),
            },
          },
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          const newProfile: Profile = {
            id: data.user.id,
            display_name: name.trim(),
            role: safeRole,
            phone: phone?.trim(),
          };

          await supabase.from('profiles').upsert(newProfile);
          setUser(newProfile);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newProfile));
          return { success: true, role: safeRole };
        }
      }

      // Offline resilient profile creation
      const localId = 'u' + Math.random().toString(16).slice(2, 10) + '-4000-8000-' + Math.random().toString(16).slice(2, 14);
      const offlineProf: Profile = {
        id: localId,
        display_name: name.trim(),
        role: safeRole,
        phone: phone?.trim(),
      };
      setUser(offlineProf);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(offlineProf));
      return { success: true, role: safeRole };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Signup failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
