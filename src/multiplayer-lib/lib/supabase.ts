// Back-compat module.
// New code should import from `src/lib/supabaseBrowser.ts`.
export {
  supabaseBrowser as supabase,
  supabaseBrowserConfigError as supabaseConfigError,
  getSupabaseBrowserClient as getSupabaseClient,
} from './supabaseBrowser';

export type { Room, Player, GameState } from './supabaseBrowser';
