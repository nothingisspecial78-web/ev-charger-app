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

// Demo profile references from seed.sql
const DEMO_USERS: Record<UserRole, Profile> = {
  driver: {
    id: 'd1111111-1111-1111-1111-111111111111',
    display_name: 'Rahul Driver',
    role: 'driver',
    phone: '+91 98765 43210',
  },
  admin: {
    id: 'a2222222-2222-2222-2222-222222222222',
    display_name: 'Kiran (Host & Charger Owner)',
    role: 'admin',
    phone: '+91 98450 12345',
  },
  superadmin: {
    id: 's3333333-3333-3333-3333-333333333333',
    display_name: 'Ananya (Platform Superadmin)',
    role: 'superadmin',
    phone: '+91 94470 99999',
  },
};

const AUTH_STORAGE_KEY = 'voltspot_active_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(() => {
    // Check saved session in localStorage
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    // Default to seeded demo driver for instant discovery preview
    return DEMO_USERS.driver;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      const client = supabase;
      client.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          client
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
            .then(({ data }) => {
              if (data) {
                setUser(data as Profile);
                localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
              }
            });
        }
      });
    }
  }, []);

  const login = async (email: string, _pass: string) => {
    setLoading(true);
    try {
      const cleanEmail = email.toLowerCase().trim();

      // Demo quick accounts detection
      if (cleanEmail.includes('owner') || cleanEmail.includes('admin@voltspot')) {
        setUser(DEMO_USERS.admin);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEMO_USERS.admin));
        return { success: true };
      }
      if (cleanEmail.includes('superadmin') || cleanEmail.includes('super')) {
        setUser(DEMO_USERS.superadmin);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEMO_USERS.superadmin));
        return { success: true };
      }
      if (cleanEmail.includes('driver')) {
        setUser(DEMO_USERS.driver);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEMO_USERS.driver));
        return { success: true };
      }

      // If Supabase is connected
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: _pass,
        });
        if (error) throw error;
        if (data.user) {
          const { data: prof } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
          if (prof) {
            setUser(prof as Profile);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(prof));
            return { success: true };
          }
        }
      }

      // Standard fallback user
      const customUser: Profile = {
        id: 'u-' + Math.random().toString(36).substring(2, 9),
        display_name: cleanEmail.split('@')[0],
        role: 'driver',
      };
      setUser(customUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(customUser));
      return { success: true };
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
      // Security rule: never permit superadmin self-registration
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
        if (error) throw error;
        if (data.user) {
          const newProfile: Profile = {
            id: data.user.id,
            display_name: name.trim(),
            role: safeRole,
            phone: phone?.trim(),
          };
          setUser(newProfile);
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newProfile));
          return { success: true };
        }
      }

      // Local persistent registration
      const newProfile: Profile = {
        id: 'u-' + Math.random().toString(36).substring(2, 9),
        display_name: name.trim(),
        role: safeRole,
        phone: phone?.trim(),
      };
      setUser(newProfile);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newProfile));
      return { success: true };
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
