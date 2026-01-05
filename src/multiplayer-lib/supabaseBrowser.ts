import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Browser-safe Supabase client.
// Uses Vite's build-time env vars and defends against accidentally bundling admin keys.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKeyRaw = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

function decodeJwtPayload(token: string): any | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function detectSupabaseBrowserKeyProblem(key: string): string | null {
  const trimmed = key.trim();
  if (!trimmed) return null;

  // Supabase secret keys are prefixed and MUST never be shipped to browsers.
  if (trimmed.startsWith('sb_secret_')) {
    return 'Supabase misconfigured: VITE_SUPABASE_ANON_KEY is set to a secret key (sb_secret_*). Use the public anon key from Supabase Project Settings → API, and rotate/delete the leaked secret key immediately.';
  }

  // Also detect JWT-style keys that carry a service role.
  const payload = decodeJwtPayload(trimmed);
  const role = payload?.role;
  if (role === 'service_role' || role === 'supabase_admin') {
    return 'Supabase misconfigured: VITE_SUPABASE_ANON_KEY appears to be a service role key. Use the public anon key (role: anon) for browser clients.';
  }

  return null;
}

export const supabaseBrowserConfigError: string | null = (() => {
  if (!supabaseUrl || !supabaseAnonKeyRaw) {
    return 'Supabase credentials not found. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.';
  }
  return detectSupabaseBrowserKeyProblem(supabaseAnonKeyRaw);
})();

if (supabaseBrowserConfigError) {
  console.warn(supabaseBrowserConfigError);
}

function createMisconfiguredClient(message: string): SupabaseClient {
  const errorFactory = () => new Error(message);
  return new Proxy({} as SupabaseClient, {
    get() {
      throw errorFactory();
    },
    apply() {
      throw errorFactory();
    },
  });
}

export const supabaseBrowser: SupabaseClient = supabaseBrowserConfigError
  ? createMisconfiguredClient(supabaseBrowserConfigError)
  : createClient(supabaseUrl, supabaseAnonKeyRaw, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });

export function getSupabaseBrowserClient(): SupabaseClient {
  return supabaseBrowser;
}

// Database types
export interface Room {
  id: string;
  code: string;
  host_id: string;
  created_at: string;
  max_players: number;
  status: 'lobby' | 'in-progress' | 'finished';
}

export interface Player {
  id: string;
  room_id: string;
  name: string;
  faction: string;
  color: string;
  is_ready: boolean;
  is_host: boolean;
  joined_at: string;
}

export interface GameState {
  id: string;
  room_id: string;
  state_json: any;
  updated_at: string;
}
