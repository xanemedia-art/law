import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = (typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_SUPABASE_URL : '') || 
  (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_URL || 
  'https://stgwfcanxhbqvolfpmft.supabase.co';

const supabaseKey = (typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY : '') || 
  (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
  'sb_publishable_S8g3NfVeu6JGCEiyJgYrwQ_sH4MN99S';

export const createClient = () =>
  createBrowserClient(
    supabaseUrl!,
    supabaseKey!,
  );

export default createClient;
