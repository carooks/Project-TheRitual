# Multiplayer Package - File Checklist

## Core Files (Required)

### Components
- ✅ `components/ModeSelection.tsx` - Mode selection screen (solo/host/join)
- ✅ `components/HostLobby.tsx` - Host lobby with QR code and room code
- ✅ `components/PlayerJoin.tsx` - Player join screen with room code input
- ✅ `components/PlayerView.tsx` - (Optional) Player game view

### Hooks
- ✅ `hooks/useSupabaseMultiplayer.ts` - Core multiplayer logic and Supabase integration

### Library
- ✅ `lib/supabaseBrowser.ts` - Browser-safe Supabase client with security checks
- ✅ `lib/supabase.ts` - Compatibility wrapper

### Database
- ✅ `database/schema.sql` - Complete Supabase database schema

### Styles
- ✅ `styles/multiplayer.css` - All necessary CSS for multiplayer components

### Documentation & Examples
- ✅ `README.md` - Complete documentation with API reference
- ✅ `examples/App.tsx` - Full integration example
- ✅ `package.json` - NPM dependencies

## Quick Integration Steps

1. **Install dependencies:**
   ```bash
   npm install @supabase/supabase-js react-qr-code
   ```

2. **Set up Supabase:**
   - Create a Supabase project at https://supabase.com
   - Run the SQL from `database/schema.sql` in the SQL Editor
   - Get your project URL and anon key from Settings → API

3. **Add environment variables** (`.env`):
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **Copy files to your project:**
   - Copy the `components/`, `hooks/`, and `lib/` folders
   - Add the CSS from `styles/multiplayer.css` to your main CSS file
   - Reference `examples/App.tsx` for integration

5. **Import and use:**
   ```tsx
   import { ModeSelection } from './components/ModeSelection';
   import { HostLobby } from './components/HostLobby';
   import { PlayerJoin } from './components/PlayerJoin';
   import { useSupabaseMultiplayer } from './hooks/useSupabaseMultiplayer';
   ```

## Key Features

✅ Phone code login (6-character room codes)
✅ QR code scanning for mobile devices
✅ Direct join links (`/join/ABC123`)
✅ Real-time player synchronization
✅ Session persistence and reconnection
✅ Ready status management
✅ Faction/color selection
✅ Automatic room cleanup after 4 hours
✅ Security: Built-in detection for exposed service keys

## Dependencies

- `@supabase/supabase-js` ^2.87.0
- `react-qr-code` ^2.0.18
- `react` ^18.0.0 (peer dependency)
- `react-dom` ^18.0.0 (peer dependency)

## TypeScript Support

All files are written in TypeScript with full type definitions included.

## Customization

### Colors
Edit CSS custom properties in `styles/multiplayer.css`:
```css
:root {
  --phase-strategy: #fbbf24;  /* Yellow */
  --phase-action: #14b8a6;    /* Teal */
  --phase-status: #a78bfa;    /* Purple */
}
```

### Session Duration
Default: 4 hours. Change in both:
- `examples/App.tsx` (client-side check)
- `database/schema.sql` (cleanup function)

## Security Notes

⚠️ **NEVER** use service role keys in browser code!
✅ Always use the public anon key (`VITE_SUPABASE_ANON_KEY`)
✅ The package includes automatic detection for accidentally exposed keys

## Support

Refer to `README.md` for full API documentation and usage examples.
