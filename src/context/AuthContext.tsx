import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, UserRole } from '@/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface AuthContextType {
  user: Profile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signup: (
    name: string,
    email: string,
    pass: string,
    role: 'driver' | 'admin',
    phone?: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  switchDemoRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Fictional realistic demo profile references with valid hexadecimal UUIDs
export const DEMO_USERS: Record<UserRole, Profile> = {
  driver: {
    id: 'd1111111-1111-4111-8111-111111111111',
    display_name: 'Rahul Driver',
    role: 'driver',
    phone: '+91 98765 43210',
  },
  admin: {
    id: 'a2222222-2222-4222-8222-222222222222',
    display_name: 'Kiran (Host & Charger Owner)',
    role: 'admin',
    phone: '+91 98450 12345',
  },
  superadmin: {
    id: 'e3333333-3333-4333-8333-333333333333',
    display_name: 'Abdulla (Platform Superadmin)',
    role: 'superadmin',
    phone: '+91 94470 99999',
  },
};

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

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const cleanEmail = email.toLowerCase().trim();

      // Real Supabase Authentication (Functional Mode)
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: pass,
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          const { data: prof } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();

          if (prof) {
            setUser(prof as Profile);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(prof));
            return { success: true };
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
            return { success: true };
          }
        }
      }

      // Offline fallback only when Supabase is disconnected
      if (cleanEmail === 'nothingisspecial78@gmail.com') {
        if (pass !== 'abdu@1027') return { success: false, error: 'Incorrect password' };
        setUser(DEMO_USERS.superadmin);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEMO_USERS.superadmin));
        return { success: true };
      }

      return { success: false, error: 'Supabase authentication service unavailable' };
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
  ) => {
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
          return { success: true };
        }
      }

      return { success: false, error: 'Unable to connect to registration service' };
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

  const switchDemoRole = (role: UserRole) => {
    const selected = DEMO_USERS[role];
    setUser(selected);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(selected));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        switchDemoRole,
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
