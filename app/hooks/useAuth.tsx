import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../utils/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ error: any; success?: boolean }>;
  signOut: () => Promise<{ error: any }>;
  signOutGuest: () => void;
  isGuest: boolean;
  setGuestMode: (guest: boolean) => void;
  userProfile: { firstName?: string; lastName?: string } | null;
  resetPassword: (email: string) => Promise<{ error: any }>;
  resendConfirmation: (email: string) => Promise<{ error: any }>;
  needsOnboarding: boolean;
  setNeedsOnboarding: (needs: boolean) => void;
  showSignupSuccess: boolean;
  setShowSignupSuccess: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [userProfile, setUserProfile] = useState<{ firstName?: string; lastName?: string } | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [showSignupSuccess, setShowSignupSuccess] = useState(false);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('first_name, last_name')
        .eq('user_id', userId)
        .single();

      if (!error && data) {
        setUserProfile({
          firstName: data.first_name || undefined,
          lastName: data.last_name || undefined,
        });
      } else if (error) {
        console.log('Error fetching user profile:', error);
        setUserProfile(null);
      }
    } catch (error) {
      console.log('Error fetching user profile:', error);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // If user logs in, exit guest mode and fetch profile
      if (session?.user) {
        setIsGuest(false);
        fetchUserProfile(session.user.id);
        // Check if user needs onboarding (will be set by main app when projects are loaded)
      } else {
        setUserProfile(null);
        setNeedsOnboarding(false);
        setShowSignupSuccess(false);
        // Always ensure guest mode is false when no session
        setIsGuest(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      console.log('Attempting signup for:', email, 'with metadata:', { firstName, lastName });
      
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      console.log('Signup result:', { 
        error: error?.message, 
        userId: data?.user?.id, 
        userEmail: data?.user?.email,
        userMetadata: data?.user?.user_metadata 
      });

      if (error) {
        console.error('Signup error details:', error);
        
        if (error.message.includes('User already registered')) {
          return { 
            error: { 
              message: 'Użytkownik już istnieje. Użyj opcji "Zaloguj się" lub zresetuj hasło.' 
            } 
          };
        }
        if (error.message.includes('Invalid email')) {
          return { 
            error: { 
              message: 'Nieprawidłowy format adresu email.' 
            } 
          };
        }
        if (error.message.includes('Password should be at least')) {
          return { 
            error: { 
              message: 'Hasło musi mieć co najmniej 6 znaków.' 
            } 
          };
        }
        
        return { error: { message: error.message } };
      }

      if (data?.user) {
        console.log('User created successfully:', data.user.id);
        console.log('Setting showSignupSuccess to true');
        setShowSignupSuccess(true);
        return { error: null, success: true };
      }

      return { error };
    } catch (err: any) {
      console.error('Signup exception:', err);
      return { error: { message: err.message || 'Wystąpił nieoczekiwany błąd' } };
    }
  };

  const signOut = async () => {
    // Force clear local state immediately
    setUser(null);
    setSession(null);
    setIsGuest(false);
    setUserProfile(null);
    
    // Call Supabase signOut (don't wait for it or check errors)
    supabase.auth.signOut().catch(() => {
      // Ignore any errors from Supabase
    });
    
    return { error: null };
  };

  const setGuestMode = (guest: boolean) => {
    setIsGuest(guest);
  };

  const signOutGuest = () => {
    setIsGuest(false);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
  };

  const resendConfirmation = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    signOutGuest,
    isGuest,
    setGuestMode,
    userProfile,
    resetPassword,
    resendConfirmation,
    needsOnboarding,
    setNeedsOnboarding,
    showSignupSuccess,
    setShowSignupSuccess,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 