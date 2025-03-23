import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { User as SupabaseUser, AuthError } from '@supabase/supabase-js'
import axios from 'axios'

const API_URL = import.meta.env.VITE_BACKEND_URL;

interface AppUser {
  id: string | undefined;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthState {
  user: AppUser | null;
  loading: boolean;
  error: string | null;
  accessToken: string | null; // Add access token
  refreshToken: string | null; // Add refresh token
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initializeAuth: () => void;
}

const mapSupabaseUser = (user: SupabaseUser | null): AppUser | null => {
  if (!user) return null;
  
  return {
    id: user.id,
    email: user.email ?? '',
    firstName: user.user_metadata?.first_name ?? '',
    lastName: user.user_metadata?.last_name ?? ''
  };
};

const syncUserWithBackend = async (user: SupabaseUser | null) => {
  if (!user) {
    return null;
  }
  
  try {
    const response = await axios.post(
      `${API_URL}/auth/sync`,
      {
        authId: user.id,
        email: user.email,
        firstName: user.user_metadata?.first_name,
        lastName: user.user_metadata?.last_name
      }
    );
    return response.data;
  } catch  {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,
  accessToken: null, // Initialize access token
  refreshToken: null, // Initialize refresh token

  signUp: async (email, password, firstName, lastName) => {
    set({ loading: true, error: null });
    try {
      const {  error }: { data: { user: SupabaseUser | null }, error: AuthError | null } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
          emailRedirectTo: window.location.origin, // Redirect to your app after verification
        }
      });
      if (error) {
        throw error;
      }
      set({ loading: false });
      alert('Please check your email to verify your account.');
    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : 'An unknown error occurred';
      set({ error: errorMessage, loading: false });
    }
  },

  signIn: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data, error }: { data: { user: SupabaseUser | null }, error: AuthError | null } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        throw error;
      }

      const { data: userDetails, error: userDetailsError } = await supabase.auth.getUser();
      if (userDetailsError) {
        throw userDetailsError;
      }

      let userWithDetails: SupabaseUser | null = null;

      if (userDetails?.user && data.user) {
        userWithDetails = {
          ...data.user,
          user_metadata: {
            ...data.user.user_metadata,
            first_name: userDetails.user.user_metadata?.first_name,
            last_name: userDetails.user.user_metadata?.last_name
          }
        } as SupabaseUser;
      } else {
        userWithDetails = data.user;
      }

      if (userWithDetails) {
        await syncUserWithBackend(userWithDetails);
      }

      const mappedUser = userWithDetails ? mapSupabaseUser(userWithDetails) : null;
      set({ user: mappedUser, loading: false, error: null });
    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : 'An unknown error occurred';
      set({ error: errorMessage, loading: false });
    }
  },

  signOut: async () => {
    set({ loading: true });
    try {
      const { error }: { error: AuthError | null } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, loading: false, accessToken: null, refreshToken: null });
    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : 'An unknown error occurred';
      set({ error: errorMessage, loading: false });
    }
  },   
  initializeAuth: () => {
    console.log('initializeAuth called');
    set({ loading: true });
  
    // Handle the email verification redirect
    const handleEmailVerification = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error fetching session:', error.message);
        set({ loading: false });
        return;
      }
  
      if (data.session) {
        console.log('Session found, storing tokens...');
        set({
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
        });
  
        if (data.session.user) {
          console.log('User found in session, syncing with backend...', data);
          await syncUserWithBackend(data.session.user);
        }
  
        const mappedUser = mapSupabaseUser(data.session.user || null);
        console.log('Mapped user:', mappedUser);
        set({ user: mappedUser, loading: false });
      } else {
        set({ loading: false });
      }
    };
  
    // Check for tokens in the URL (email verification redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');
  
    if (accessToken && refreshToken) {
      console.log('Tokens found in URL, setting session...');
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      }).then(() => {
        handleEmailVerification();
        // Clear tokens from URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }).catch(() => {
        set({ loading: false });
      });
    } else {
      // Normal session initialization
      supabase.auth.getSession().then(handleEmailVerification).catch(() => {
        set({ loading: false });
      });
    }
  
    // Listen for auth state changes
    supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Auth state changed:', _event, session);
      if (session) {
        console.log('Session found, storing tokens...');
        set({
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
        });
  
        const mappedUser = mapSupabaseUser(session.user || null);
        console.log('Mapped user after auth state change:', mappedUser);
        set({ user: mappedUser, loading: false });
      } else {
        set({ loading: false });
      }
    });
  
    // Add a timer to refresh the token before it expires
    const refreshTokenBeforeExpiry = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) return;
  
      const expiresAt = sessionData?.session?.expires_at ? sessionData.session.expires_at * 1000 : 0; // Convert to milliseconds if defined
      const now = Date.now();
      const timeUntilExpiry = expiresAt - now;
  
      // Refresh the token 5 minutes before it expires
      if (timeUntilExpiry > 0 && timeUntilExpiry < 5 * 60 * 1000) {
        console.log('Refreshing token before expiry...');
        const { data: refreshedSession, error } = await supabase.auth.refreshSession();
        if (error) {
          console.error('Error refreshing session:', error.message);
          return;
        }
  
        console.log('Token refreshed successfully:', refreshedSession);
        set({
          accessToken: refreshedSession?.session?.access_token,
          refreshToken: refreshedSession?.session?.refresh_token,
        });
      }
    };
  
    // Set up a periodic check for token expiry
    const tokenRefreshInterval = setInterval(refreshTokenBeforeExpiry, 60 * 1000);
  
    // Clean up the interval when the component unmounts
    return () => clearInterval(tokenRefreshInterval);
  },
}))