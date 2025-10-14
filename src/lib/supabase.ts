import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are properly configured
const isSupabaseConfigured = supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-ref.supabase.co' && 
  supabaseAnonKey !== 'your-anon-key-here' &&
  supabaseUrl.includes('supabase.co');

// Export configuration status for other components to check
export { isSupabaseConfigured };

let supabase: ReturnType<typeof createClient<Database>>;

if (!isSupabaseConfigured) {
  console.warn('⚠️ Supabase not configured properly. Using mock client.');
  console.warn('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
  
  // Create a mock client to prevent errors during development
  const createMockQuery = () => ({
    select: (columns?: string) => createMockQuery(),
    insert: (data: any) => createMockQuery(),
    update: (data: any) => createMockQuery(),
    delete: () => createMockQuery(),
    eq: (column: string, value: any) => createMockQuery(),
    order: (column: string, options?: any) => createMockQuery(),
    limit: (count: number) => createMockQuery(),
    single: () => Promise.resolve({ data: null, error: null }),
    then: (resolve: any) => resolve({ data: [], error: null }),
    catch: (reject: any) => Promise.resolve({ data: [], error: null })
  });

  supabase = {
    auth: {
      signUp: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
      signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: (callback: any) => {
        // Immediately call callback with signed out state to prevent hanging
        setTimeout(() => callback('SIGNED_OUT', null), 0);
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null })
    },
    from: (table: string) => createMockQuery(),
    storage: {
      from: (bucket: string) => ({
        upload: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        download: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        remove: () => Promise.resolve({ data: null, error: null }),
        list: () => Promise.resolve({ data: [], error: null })
      })
    }
  } as any;
} else {
  try {
    supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    // Fallback to mock client if initialization fails
    supabase = {
      auth: {
        signUp: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase initialization failed' } }),
        signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase initialization failed' } }),
        signOut: () => Promise.resolve({ error: null }),
        onAuthStateChange: (callback: any) => {
          setTimeout(() => callback('SIGNED_OUT', null), 0);
          return { data: { subscription: { unsubscribe: () => {} } } };
        },
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null })
      },
      from: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () => Promise.resolve({ data: null, error: { message: 'Supabase initialization failed' } }),
        update: () => Promise.resolve({ data: null, error: { message: 'Supabase initialization failed' } }),
        delete: () => Promise.resolve({ data: null, error: { message: 'Supabase initialization failed' } })
      })
    } as any;
  }
}


export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          role: string;
          full_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role: string;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: string;
          full_name?: string | null;
          updated_at?: string;
        };
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          protocol_id: string;
          pre_calm: number;
          pre_clarity: number;
          pre_energy: number;
          post_calm: number | null;
          post_clarity: number | null;
          post_energy: number | null;
          completed: boolean;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          protocol_id: string;
          pre_calm: number;
          pre_clarity: number;
          pre_energy: number;
          post_calm?: number | null;
          post_clarity?: number | null;
          post_energy?: number | null;
          completed?: boolean;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          post_calm?: number | null;
          post_clarity?: number | null;
          post_energy?: number | null;
          completed?: boolean;
          completed_at?: string | null;
        };
      };
    };
  };
};

export { supabase };