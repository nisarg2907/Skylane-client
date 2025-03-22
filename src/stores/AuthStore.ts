import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Session, User as SupabaseUser, AuthError } from '@supabase/supabase-js'

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initializeAuth: () => void;
}

const mapSupabaseUser = (user: SupabaseUser | null): User | null => {
  return user ? { 
    id: user.id, 
    email: user.email ?? '', 
    firstName: user.user_metadata?.first_name ?? '', 
    lastName: user.user_metadata?.last_name ?? ''    
  } : null;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,

  signUp: async (email, password, firstName, lastName) => {
    console.log('signUp called with:', { email, firstName, lastName });
    set({ loading: true, error: null })
    try {
      const { data, error }: { data: { user: SupabaseUser | null }, error: AuthError | null } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,  // Use snake_case
            last_name: lastName     // Use snake_case
          }
        }
      })
      if (error) throw error
      console.log('signUp successful:', data.user);
      set({ user: mapSupabaseUser(data.user), loading: false })
    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : 'An unknown error occurred';
      console.error('signUp error:', errorMessage);
      set({ error: errorMessage, loading: false })
    }
  },

  signIn: async (email, password) => {
    console.log('signIn called with:', { email });
    set({ loading: true, error: null })
    try {
      const { data, error }: { data: { user: SupabaseUser | null }, error: AuthError | null } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error

      // Fetch user details to ensure firstName and lastName are set
      const { data: userDetails, error: userDetailsError } = await supabase.auth.getUser()
      if (userDetailsError) throw userDetailsError

      const userWithDetails = userDetails?.user ? {
        ...data.user,
        user_metadata: {
          ...data.user?.user_metadata,
          first_name: userDetails.user.user_metadata?.first_name,
          last_name: userDetails.user.user_metadata?.last_name
        }
      } : data.user

      const mappedUser = userWithDetails ? {
        id: userWithDetails.id,
        email: userWithDetails.email ?? '',
        firstName: userWithDetails.user_metadata?.first_name ?? '',
        lastName: userWithDetails.user_metadata?.last_name ?? ''
      } : null;

      console.log('signIn successful:', mappedUser,userDetails);
      set({ user: mappedUser as User, loading: false, error: null })
    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : 'An unknown error occurred';
      console.error('signIn error:', errorMessage);
      set({ error: errorMessage, loading: false })
    }
  },

  signOut: async () => {
    console.log('signOut called');
    set({ loading: true });
    try {
      const { error }: { error: AuthError | null } = await supabase.auth.signOut();
      if (error) throw error;
      console.log('signOut successful');    
      set({ user: null, loading: false });
    } catch (err) {
      const errorMessage = (err instanceof Error) ? err.message : 'An unknown error occurred';
      console.error('signOut error:', errorMessage);
      set({ error: errorMessage, loading: false });
    }
  },

  initializeAuth: () => {
    set({ loading: true })
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      set({ user: mapSupabaseUser(session?.user || null), loading: false })
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: mapSupabaseUser(session?.user || null) })
    })
  },
}))