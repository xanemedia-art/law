import { createClient, SupabaseClient } from '@supabase/supabase-js';

const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_URL || 'https://stgwfcanxhbqvolfpmft.supabase.co';
const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_ANON_KEY || (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_S8g3NfVeu6JGCEiyJgYrwQ_sH4MN99S';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  if (envUrl && envUrl !== 'https://your-project.supabase.co' && envKey && envKey !== 'your-anon-public-key') {
    try {
      supabaseInstance = createClient(envUrl, envKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      });
      return supabaseInstance;
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
    }
  }

  return null;
}

export async function fetchServerConfig(): Promise<{ supabaseUrl: string; supabaseAnonKey: string; agoraAppId: string }> {
  try {
    const res = await fetch('/api/config');
    if (res.ok) {
      const data = await res.json();
      if (data.supabaseUrl && data.supabaseAnonKey && !supabaseInstance) {
        if (data.supabaseUrl !== 'https://your-project.supabase.co' && data.supabaseAnonKey !== 'your-anon-public-key') {
          supabaseInstance = createClient(data.supabaseUrl, data.supabaseAnonKey, {
            auth: {
              persistSession: true,
              autoRefreshToken: true
            }
          });
        }
      }
      return data;
    }
  } catch (e) {
    // Ignore in offline mode
  }
  return { supabaseUrl: '', supabaseAnonKey: '', agoraAppId: '' };
}

export const supabase = getSupabaseClient();
