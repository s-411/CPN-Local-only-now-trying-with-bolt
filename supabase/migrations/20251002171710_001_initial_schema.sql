/*
  # Initial CPN Database Schema

  ## Overview
  This migration creates the foundational database schema for the CPN (Cost Per Nut) application,
  transitioning from localStorage to a production-ready PostgreSQL database.

  ## Tables Created

  ### 1. users
  - Stores user account information and session data
  - Supports both anonymous sessions (temporary) and authenticated users (future Clerk integration)
  - Includes subscription tier management for free/premium features
  
  Fields:
  - id (uuid, primary key): Unique user identifier
  - session_token (text, unique): Anonymous session identifier for pre-auth users
  - auth_provider_id (text, unique): Future Clerk user ID
  - email (text): User email (optional for anonymous users)
  - subscription_tier (text): 'free', 'premium', or 'lifetime'
  - is_anonymous (boolean): Whether user is in anonymous session
  - created_at (timestamptz): Account creation timestamp
  - updated_at (timestamptz): Last update timestamp

  ### 2. girls
  - Stores profile information for tracked individuals
  - One-to-many relationship with data_entries
  - Supports demographic fields for analytics
  
  Fields:
  - id (uuid, primary key): Unique profile identifier
  - user_id (uuid, foreign key): Owner of this profile
  - name (text): Profile name
  - age (integer): Age (must be 18+)
  - nationality (text): Nationality/ethnicity field
  - ethnicity (text): Structured ethnicity option
  - hair_color (text): Hair color option
  - location_city (text): City location
  - location_country (text): Country location
  - rating (numeric): Hotness rating (5.0-10.0)
  - is_active (boolean): Active status for filtering
  - created_at (timestamptz): Profile creation timestamp
  - updated_at (timestamptz): Last update timestamp

  ### 3. data_entries
  - Stores activity/expense entries for each profile
  - Many-to-one relationship with girls
  - Contains raw data for metric calculations
  
  Fields:
  - id (uuid, primary key): Unique entry identifier
  - user_id (uuid, foreign key): Owner of this entry
  - girl_id (uuid, foreign key): Associated profile
  - date (date): Date of activity
  - amount_spent (numeric): Money spent
  - duration_minutes (integer): Duration in minutes
  - number_of_nuts (integer): Count metric
  - created_at (timestamptz): Entry creation timestamp
  - updated_at (timestamptz): Last update timestamp

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Users can only access their own data
  - Policies enforce user_id matching for all operations
  - Cascade deletes maintain referential integrity

  ## Indexes
  - Primary keys on all tables
  - Foreign key indexes for join performance
  - Composite index on user_id + created_at for list queries
  - Composite index on user_id + girl_id + date for entry queries

  ## Notes
  - All timestamp fields use timestamptz for timezone awareness
  - UUID generation uses gen_random_uuid() for security
  - Numeric fields use appropriate precision for money and ratings
  - Check constraints enforce business rules (age 18+, rating range, positive values)
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token text UNIQUE,
  auth_provider_id text UNIQUE,
  email text,
  subscription_tier text NOT NULL DEFAULT 'free',
  is_anonymous boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_subscription_tier CHECK (subscription_tier IN ('free', 'premium', 'lifetime'))
);

-- Create girls table
CREATE TABLE IF NOT EXISTS girls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  age integer NOT NULL,
  nationality text NOT NULL DEFAULT '',
  ethnicity text,
  hair_color text,
  location_city text,
  location_country text,
  rating numeric(3, 1) NOT NULL DEFAULT 6.0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_age CHECK (age >= 18),
  CONSTRAINT valid_rating CHECK (rating >= 5.0 AND rating <= 10.0)
);

-- Create data_entries table
CREATE TABLE IF NOT EXISTS data_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  girl_id uuid NOT NULL REFERENCES girls(id) ON DELETE CASCADE,
  date date NOT NULL,
  amount_spent numeric(10, 2) NOT NULL DEFAULT 0,
  duration_minutes integer NOT NULL DEFAULT 0,
  number_of_nuts integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_amount CHECK (amount_spent >= 0),
  CONSTRAINT valid_duration CHECK (duration_minutes >= 0),
  CONSTRAINT valid_nuts CHECK (number_of_nuts >= 0)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_girls_user_id ON girls(user_id);
CREATE INDEX IF NOT EXISTS idx_girls_user_created ON girls(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_data_entries_user_id ON data_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_data_entries_girl_id ON data_entries(girl_id);
CREATE INDEX IF NOT EXISTS idx_data_entries_user_girl_date ON data_entries(user_id, girl_id, date DESC);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE girls ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for girls table
CREATE POLICY "Users can view own girls"
  ON girls FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own girls"
  ON girls FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own girls"
  ON girls FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own girls"
  ON girls FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for data_entries table
CREATE POLICY "Users can view own data entries"
  ON data_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own data entries"
  ON data_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own data entries"
  ON data_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own data entries"
  ON data_entries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_girls_updated_at
  BEFORE UPDATE ON girls
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_data_entries_updated_at
  BEFORE UPDATE ON data_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();