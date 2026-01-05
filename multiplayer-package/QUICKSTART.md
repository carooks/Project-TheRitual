# Quick Start Guide

## 5-Minute Setup

### 1. Install Dependencies (1 min)
```bash
npm install @supabase/supabase-js react-qr-code
```

### 2. Set Up Supabase (2 min)
1. Go to https://supabase.com and create a new project
2. Open SQL Editor in Supabase dashboard
3. Copy and paste the contents of `database/schema.sql`
4. Click "Run" to execute the schema

### 3. Configure Environment Variables (1 min)
Create a `.env` file in your project root:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Get these values from: Supabase Dashboard → Settings → API

⚠️ **Important:** Use the `anon` public key, NOT the `service_role` key!

### 4. Copy Files to Your Project (1 min)
Copy these folders to your `src/` directory:
```
src/
  components/
    ModeSelection.tsx
    HostLobby.tsx
    PlayerJoin.tsx
  hooks/
    useSupabaseMultiplayer.ts
  lib/
    supabaseBrowser.ts
    supabase.ts
```

Add the CSS to your main stylesheet:
```css
@import './styles/multiplayer.css';
```

### 5. Use in Your App (1 min)
```tsx
import { useState } from 'react';
import { ModeSelection } from './components/ModeSelection';
import { HostLobby } from './components/HostLobby';
import { PlayerJoin } from './components/PlayerJoin';
import { useSupabaseMultiplayer } from './hooks/useSupabaseMultiplayer';

function App() {
  const [mode, setMode] = useState('selection');
  const multiplayer = useSupabaseMultiplayer();

  const handleModeSelect = async (selectedMode) => {
    if (selectedMode === 'host') {
      const { roomCode } = await multiplayer.createRoom('Host Name');
      setMode('host');
    } else if (selectedMode === 'join') {
      setMode('join');
    }
  };

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
          multiplayer.joinRoom(code, name);
          // Handle successful join
        }}
        onBack={() => setMode('selection')}
      />
    );
  }

  return null;
}
```

## Done! 🎉

You now have a working multiplayer lobby system with:
- ✅ QR code scanning
- ✅ Phone code entry
- ✅ Real-time player sync
- ✅ Session persistence

## Test It Out

1. Run your app: `npm run dev`
2. Click "Host Game" to create a room
3. Open another browser/device and enter the room code
4. Or scan the QR code with your phone

## Next Steps

- See `examples/App.tsx` for advanced features (URL routing, session restoration)
- Read `README.md` for full API documentation
- Customize colors in `styles/multiplayer.css`

## Troubleshooting

**"Supabase credentials not found"**
- Check your `.env` file has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart your dev server after adding environment variables

**"Room not found"**
- Make sure you ran the SQL schema in Supabase
- Check that RLS policies are enabled (they're in the schema)

**QR code not working**
- Ensure your app is accessible on the network (not just localhost)
- Use `0.0.0.0` instead of `localhost` in Vite config

**Need help?**
- Check the full `README.md` for detailed documentation
- Review the example integration in `examples/App.tsx`
