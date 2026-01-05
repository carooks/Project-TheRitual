# Multiplayer Web App Package - Phone Code Login

A reusable multiplayer lobby system with QR code and phone code login for React applications.

## Features

- 🎮 Host/Join game modes with room codes
- 📱 QR code scanning for mobile devices
- 🔗 Direct join links (e.g., `/join/ABC123`)
- 👥 Real-time player synchronization
- ✅ Ready status and faction selection
- 🔄 Session persistence and reconnection
- 💾 Supabase backend with real-time subscriptions

## Quick Start

### 1. Install Dependencies

```bash
npm install @supabase/supabase-js react-qr-code
```

### 2. Set Up Supabase

Create a Supabase project and run the SQL schema from `database/schema.sql`.

Add environment variables to your `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Copy Files to Your Project

```
src/
  components/
    ModeSelection.tsx      # Game mode selector
    HostLobby.tsx         # Host lobby view with QR code
    PlayerJoin.tsx        # Player join screen
    PlayerView.tsx        # Player game view (optional)
  hooks/
    useSupabaseMultiplayer.ts  # Core multiplayer logic
  lib/
    supabaseBrowser.ts    # Browser-safe Supabase client
    supabase.ts           # Compatibility wrapper
```

### 4. Add CSS Styles

Copy the styles from `styles/multiplayer.css` to your main CSS file.

### 5. Integrate into Your App

See `examples/App.tsx` for a complete integration example.

## File Structure

```
multiplayer-package/
├── README.md              # This file
├── package.json          # NPM dependencies
├── components/           # React components
│   ├── ModeSelection.tsx
│   ├── HostLobby.tsx
│   ├── PlayerJoin.tsx
│   └── PlayerView.tsx
├── hooks/
│   └── useSupabaseMultiplayer.ts
├── lib/
│   ├── supabaseBrowser.ts
│   └── supabase.ts
├── database/
│   └── schema.sql        # Supabase database schema
├── styles/
│   └── multiplayer.css   # CSS styles
└── examples/
    └── App.tsx           # Integration example
```

## Usage Example

```tsx
import { useState } from 'react';
import { ModeSelection } from './components/ModeSelection';
import { HostLobby } from './components/HostLobby';
import { PlayerJoin } from './components/PlayerJoin';
import { useSupabaseMultiplayer } from './hooks/useSupabaseMultiplayer';

function App() {
  const [mode, setMode] = useState<'selection' | 'host' | 'join'>('selection');
  const multiplayer = useSupabaseMultiplayer();

  // Handle mode selection
  const handleModeSelect = (selectedMode: 'solo' | 'host' | 'join') => {
    if (selectedMode === 'host') {
      multiplayer.createRoom('Host Name').then(({ roomCode }) => {
        setMode('host');
      });
    } else if (selectedMode === 'join') {
      setMode('join');
    }
  };

  // Render appropriate view
  if (mode === 'selection') {
    return <ModeSelection onSelectMode={handleModeSelect} />;
  }

  if (mode === 'host' && multiplayer.room) {
    return (
      <HostLobby
        roomCode={multiplayer.room.code}
        players={multiplayer.room.players}
        onStartGame={() => multiplayer.startGame()}
        onCancel={() => setMode('selection')}
      />
    );
  }

  if (mode === 'join') {
    return (
      <PlayerJoin
        onJoin={(code, name) => {
          multiplayer.joinRoom(code, name).then(() => {
            // Handle successful join
          });
        }}
        onBack={() => setMode('selection')}
      />
    );
  }

  return null;
}
```

## API Reference

### useSupabaseMultiplayer Hook

Main hook for managing multiplayer sessions.

#### Returns

```typescript
{
  isConnected: boolean;
  room: MultiplayerRoom | null;
  playerId: string | null;
  roomId: string | null;
  createRoom: (hostName: string) => Promise<{ roomCode: string; playerId: string }>;
  joinRoom: (roomCode: string, playerName: string) => Promise<string>;
  selectFaction: (faction: string, color: string) => Promise<void>;
  toggleReady: () => Promise<void>;
  startGame: () => Promise<void>;
  updateGameState: (gameState: any) => Promise<void>;
  sendAction: (action: string, data?: any) => Promise<void>;
  disconnect: () => void;
}
```

### Components

#### ModeSelection

Displays mode selection screen with Solo, Host, and Join options.

```typescript
interface ModeSelectionProps {
  onSelectMode: (mode: 'solo' | 'host' | 'join') => void;
}
```

#### HostLobby

Displays the host lobby with QR code and room code.

```typescript
interface HostLobbyProps {
  roomCode: string;
  players: MultiplayerPlayer[];
  onStartGame: () => void;
  onCancel: () => void;
}
```

#### PlayerJoin

Player join screen with room code input.

```typescript
interface PlayerJoinProps {
  onJoin: (roomCode: string, playerName: string) => void;
  onBack: () => void;
  initialRoomCode?: string;
}
```

## URL Routing

The system supports direct join links. When a user navigates to `/join/ABC123`, the app automatically:

1. Extracts the room code
2. Shows the player join screen
3. Pre-fills the room code
4. Cleans up the URL

See `examples/App.tsx` for implementation details.

## Session Persistence

The system automatically saves session data to `localStorage` and attempts to reconnect on page reload. Sessions expire after 4 hours.

## Database Schema

The system uses three main tables:

- **rooms** - Game rooms with codes and status
- **players** - Player information and ready states
- **game_states** - Current game state as JSON

See `database/schema.sql` for the complete schema.

## Security Notes

⚠️ **Important**: Never use `VITE_SUPABASE_SERVICE_KEY` or admin keys in browser code. Always use the `VITE_SUPABASE_ANON_KEY` (public anon key).

The package includes built-in detection for accidentally exposed service keys.

## Customization

### Styling

All styles use CSS custom properties and can be easily customized:

```css
:root {
  --phase-strategy: #fbbf24; /* Yellow */
  --phase-action: #14b8a6;   /* Teal */
  --phase-status: #a78bfa;   /* Purple */
}
```

### Room Expiration

By default, rooms are cleaned up after 4 hours. Adjust in the SQL schema or set up a Supabase cron job.

## License

MIT - Feel free to use in your projects!

## Support

For issues or questions, please refer to the original TwilightTracker project.
