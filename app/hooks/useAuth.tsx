import { useState, useEffect, createContext, useContext } from 'react';
import { supabase, sharedSupabase } from '../utils/supabase';
import type { User, Session } from '@supabase/supabase-js';
import { StorageService } from '../utils/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/logger';
import { rateLimiter, sanitizeEmail } from '../utils/security';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: any }>;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ success: boolean; error?: any; message?: string }>;
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
      const { data, error } = await sharedSupabase
        .from('profiles')
        .select('first_name, last_name, full_name')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setUserProfile({
          firstName: data.first_name || undefined,
          lastName: data.last_name || undefined,
        });
      } else if (error) {
        setUserProfile(null);
      }
    } catch (error) {
      // Silently handle error
    }
  };

  // Validate user ID format
  const validateUserId = (userId: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(userId);
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      // Handle session errors (like invalid refresh token)
      if (error) {
        logger.log('Session error detected:', error.message);
        // Clear invalid session
        setSession(null);
        setUser(null);
        setLoading(false);
        return;
      }

      setSession(session);
      
      if (session?.user) {
        // Validate user ID format
        if (!validateUserId(session.user.id)) {
          // Don't set invalid user
          setUser(null);
        } else {
          setUser(session.user);
          fetchUserProfile(session.user.id);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      logger.log('Auth state change:', event);
      
      // Handle auth errors (like TOKEN_REFRESHED failure)
      if (event === 'TOKEN_REFRESHED' && !session) {
        logger.log('Token refresh failed, signing out...');
        // Force sign out when token refresh fails
        setSession(null);
        setUser(null);
        setIsGuest(false);
        setUserProfile(null);
        setLoading(false);
        return;
      }

      // Handle sign out events
      if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setIsGuest(false);
        setUserProfile(null);
        setLoading(false);
        return;
      }
      
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
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password,
      });

      if (error) throw error;
      
      return { success: true };
    } catch (error: any) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const createUserProfile = async (userId: string, email: string, firstName?: string, lastName?: string) => {
    try {
      // Use upsert to insert OR update if profile already exists
      const { error } = await sharedSupabase
        .from('profiles')
        .upsert({
          id: userId,
          email: email.toLowerCase(),
          first_name: firstName || null,
          last_name: lastName || null,
          full_name: firstName && lastName ? `${firstName} ${lastName}` : null,
        }, {
          onConflict: 'id' // Handle conflict on id column
        });

      if (error) {
        logger.error('Error creating user profile:', error);
      }
    } catch (error) {
      logger.error('Error creating user profile:', error);
    }
  };

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
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

      // Create profile in shared schema
      if (data?.user) {
        await createUserProfile(data.user.id, email, firstName, lastName);
      }

      if (data?.user && !data?.session) {
        return { 
          success: true, 
          message: 'Sprawdź swoją skrzynkę email i potwierdź rejestrację' 
        };
      }
      
      return { success: true };
    } catch (error: any) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    const currentUserId = user?.id;
    
    // Force clear local state immediately
    setUser(null);
    setSession(null);
    setIsGuest(false);
    setUserProfile(null);
    
    // Call Supabase signOut first to invalidate the session on the server
    const { error } = await supabase.auth.signOut();
    if (error) {
      // Log the error but proceed with client-side cleanup
      logger.error('Error during Supabase signOut:', error);
    }
    
    // Now, clear all user-specific data from local storage
    if (currentUserId) {
      try {
        await StorageService.clearUserData(currentUserId);
        logger.log(`🧹 Successfully cleared data for user: ${currentUserId}`);
      } catch (storageError) {
        logger.error('Error clearing user data from storage on logout:', storageError);
      }
    }
    
    // Also try to clear any generic auth tokens from AsyncStorage just in case
    try {
      // Supabase's key for the session.
      const sessionKey = 'supabase.auth.token';
      // This is a common library used for AsyncStorage, check if your project uses a different key.
      const rawSession = await AsyncStorage.getItem(sessionKey);
      if (rawSession) {
        await AsyncStorage.removeItem(sessionKey);
        logger.log('🗑️ Forcefully removed raw session token from AsyncStorage.');
      }
    } catch (e) {
      logger.error('Could not forcefully remove session from AsyncStorage:', e);
    }

    return { error: null };
  };

  const setGuestMode = (guest: boolean) => {
    setIsGuest(guest);
  };

  const signOutGuest = () => {
    setIsGuest(false);
  };

  const resetPassword = async (email: string) => {
    // Rate limit password reset requests
    const identifier = sanitizeEmail(email);
    const rateLimitResult = await rateLimiter.checkAndRecord('auth:password_reset', identifier);

    if (!rateLimitResult.allowed) {
      return {
        error: {
          message: rateLimitResult.message || 'Zbyt wiele prób resetowania hasła. Spróbuj później.',
        },
      };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim());
    return { error };
  };

  const resendConfirmation = async (email: string) => {
    // Rate limit confirmation email resends
    const identifier = sanitizeEmail(email);
    const rateLimitResult = await rateLimiter.checkAndRecord('auth:resend_confirmation', identifier);

    if (!rateLimitResult.allowed) {
      return {
        error: {
          message: rateLimitResult.message || 'Zbyt wiele prób. Spróbuj później.',
        },
      };
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.toLowerCase().trim(),
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