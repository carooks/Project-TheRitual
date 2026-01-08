-- Fix for 406 errors - Add missing DELETE policies and ensure all operations are allowed

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access to rooms" ON rooms;
DROP POLICY IF EXISTS "Allow public insert to rooms" ON rooms;
DROP POLICY IF EXISTS "Allow public update to rooms" ON rooms;
DROP POLICY IF EXISTS "Allow public delete to rooms" ON rooms;

DROP POLICY IF EXISTS "Allow public read access to players" ON players;
DROP POLICY IF EXISTS "Allow public insert to players" ON players;
DROP POLICY IF EXISTS "Allow public update to players" ON players;
DROP POLICY IF EXISTS "Allow public delete to players" ON players;

DROP POLICY IF EXISTS "Allow public read access to game_states" ON game_states;
DROP POLICY IF EXISTS "Allow public insert to game_states" ON game_states;
DROP POLICY IF EXISTS "Allow public update to game_states" ON game_states;
DROP POLICY IF EXISTS "Allow public delete to game_states" ON game_states;

-- Create comprehensive policies for all tables

-- ROOMS policies
CREATE POLICY "Allow all operations on rooms" ON rooms
  FOR ALL USING (true) WITH CHECK (true);

-- PLAYERS policies
CREATE POLICY "Allow all operations on players" ON players
  FOR ALL USING (true) WITH CHECK (true);

-- GAME_STATES policies
CREATE POLICY "Allow all operations on game_states" ON game_states
  FOR ALL USING (true) WITH CHECK (true);

-- Alternatively, if you want more granular control:
/*
-- ROOMS
CREATE POLICY "Allow read rooms" ON rooms FOR SELECT USING (true);
CREATE POLICY "Allow insert rooms" ON rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update rooms" ON rooms FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete rooms" ON rooms FOR DELETE USING (true);

-- PLAYERS
CREATE POLICY "Allow read players" ON players FOR SELECT USING (true);
CREATE POLICY "Allow insert players" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update players" ON players FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete players" ON players FOR DELETE USING (true);

-- GAME_STATES
CREATE POLICY "Allow read game_states" ON game_states FOR SELECT USING (true);
CREATE POLICY "Allow insert game_states" ON game_states FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update game_states" ON game_states FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete game_states" ON game_states FOR DELETE USING (true);
*/
