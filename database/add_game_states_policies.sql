-- Enable RLS on game_states table (if not already enabled)
ALTER TABLE game_states ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to read game states for rooms they have access to
-- This allows players to view the game state of rooms they're in
CREATE POLICY "Allow read game_states for room members"
ON game_states
FOR SELECT
USING (true);

-- Policy: Allow anyone to insert game states
-- The host will create the initial game state
CREATE POLICY "Allow insert game_states"
ON game_states
FOR INSERT
WITH CHECK (true);

-- Policy: Allow anyone to update game states
-- This allows the host to update game state as the game progresses
CREATE POLICY "Allow update game_states"
ON game_states
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Policy: Allow anyone to delete game states (for cleanup)
CREATE POLICY "Allow delete game_states"
ON game_states
FOR DELETE
USING (true);

-- Optional: Create index for faster lookups by room_id
CREATE INDEX IF NOT EXISTS idx_game_states_room_id ON game_states(room_id);
CREATE INDEX IF NOT EXISTS idx_game_states_updated_at ON game_states(updated_at);
