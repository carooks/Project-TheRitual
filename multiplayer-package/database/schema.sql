-- The Ritual - Supabase Database Schema
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Rooms table
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(6) UNIQUE NOT NULL,
  host_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  max_players INTEGER DEFAULT 6,
  status VARCHAR(20) DEFAULT 'lobby' CHECK (status IN ('lobby', 'in-progress', 'finished'))
);

-- Players table
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(100),
  color VARCHAR(20),
  is_ready BOOLEAN DEFAULT FALSE,
  is_host BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game states table (stores the current game state as JSON)
CREATE TABLE game_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE UNIQUE,
  state_json JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_rooms_code ON rooms(code);
CREATE INDEX idx_players_room_id ON players(room_id);
CREATE INDEX idx_game_states_room_id ON game_states(room_id);

-- Row Level Security (RLS) - Enable public access for game rooms
-- In production, you might want more restrictive policies
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_states ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read rooms (to join games)
CREATE POLICY "Allow public read access to rooms" ON rooms
  FOR SELECT USING (true);

-- Allow anyone to create rooms
CREATE POLICY "Allow public insert to rooms" ON rooms
  FOR INSERT WITH CHECK (true);

-- Allow updates to rooms (for status changes)
CREATE POLICY "Allow public update to rooms" ON rooms
  FOR UPDATE USING (true);

-- Allow anyone to read players
CREATE POLICY "Allow public read access to players" ON players
  FOR SELECT USING (true);

-- Allow anyone to insert players
CREATE POLICY "Allow public insert to players" ON players
  FOR INSERT WITH CHECK (true);

-- Allow anyone to update players (for role/ready status)
CREATE POLICY "Allow public update to players" ON players
  FOR UPDATE USING (true);

-- Allow anyone to read game states
CREATE POLICY "Allow public read access to game_states" ON game_states
  FOR SELECT USING (true);

-- Allow anyone to insert game states
CREATE POLICY "Allow public insert to game_states" ON game_states
  FOR INSERT WITH CHECK (true);

-- Allow anyone to update game states
CREATE POLICY "Allow public update to game_states" ON game_states
  FOR UPDATE USING (true);

-- Function to clean up old rooms (optional - run as cron job)
CREATE OR REPLACE FUNCTION cleanup_old_rooms()
RETURNS void AS $$
BEGIN
  DELETE FROM rooms
  WHERE created_at < NOW() - INTERVAL '4 hours';
END;
$$ LANGUAGE plpgsql;

-- You can set up a cron job in Supabase to run this function periodically
-- Or call it manually from your app occasionally
