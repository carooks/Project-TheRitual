# Multiplayer Setup Instructions

## ✅ Completed
- [x] Dependencies installed (@supabase/supabase-js, react-qr-code)
- [x] Multiplayer components copied to src/components
- [x] Hooks copied to src/hooks
- [x] Supabase lib files copied to src/multiplayer-lib
- [x] CSS styles added to src/styles.css
- [x] App.tsx integrated with multiplayer mode selection
- [x] .env file created

## 🔧 You Need to Do

### 1. Set Up Supabase (5 minutes)

1. Go to https://supabase.com and create a new project
2. Wait for the project to be ready
3. Go to **SQL Editor** in the Supabase dashboard
4. Copy the contents of `multiplayer-package/database/schema.sql`
5. Paste into SQL Editor and click **Run**

### 2. Configure Environment Variables (1 minute)

1. Get your Supabase credentials:
   - Go to **Settings → API** in Supabase dashboard
   - Copy your **Project URL**
   - Copy your **anon/public key** (⚠️ NOT the service_role key!)

2. Edit `.env` file in your project root:
   ```env
   VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### 3. Test It Out

Run the dev server:
```bash
npm run dev
```

You should see a mode selection screen with three options:
- 🖥️ Solo Mode (your original local game)
- 🎮 Host Game (create multiplayer room with QR code)
- 📱 Join Game (join with room code)

## 📱 How Multiplayer Works

- **Host creates a room** → Gets a 6-digit code (e.g., ABC123)
- **Host shares QR code or link** → Players scan or click
- **Players join** → Enter their name and select faction/color
- **Everyone marks ready** → Host starts the game
- **Game syncs in real-time** → All players see updates via Supabase

## 🔗 Join Links

Direct join URLs work automatically:
- `http://localhost:5173/join/ABC123`
- Share this link and players jump straight to join screen

## 🎯 Next Steps

After Supabase is configured, you may want to:
- Customize the faction/role selection for your game
- Sync game state updates across all players
- Add player-specific views for different roles
- Implement game phase synchronization

Need help? Check `multiplayer-package/README.md` for full documentation!
