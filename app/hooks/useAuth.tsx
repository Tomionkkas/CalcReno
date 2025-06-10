import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../utils/supabase';
import type { User, Session } from '@supabase/supabase-js';
import { PushNotificationService } from '../utils/pushNotifications';

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
  const [error, setError] = useState<string | null>(null);

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
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password,
      });

      if (error) throw error;

      // Register for push notifications after successful login
      await PushNotificationService.registerForPushNotifications();
      
      return { success: true };
    } catch (error: any) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (error) throw error;

      if (data?.user && !data?.session) {
        return { 
          success: true, 
          message: 'Sprawdź swoją skrzynkę email i potwierdź rejestrację' 
        };
      }

      // Register for push notifications after successful registration
      await PushNotificationService.registerForPushNotifications();
      
      return { success: true };
    } catch (error: any) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
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