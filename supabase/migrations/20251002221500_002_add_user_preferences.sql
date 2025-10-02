/*
  # Add User Preferences and Extended Features

  ## Overview
  This migration adds support for user settings, achievements, onboarding tracking, and leaderboards.
  All new tables follow the same security model as the initial schema with RLS policies.

  ## New Tables

  ### 1. user_settings
  - Stores all user preferences (theme, notifications, privacy, date/time settings)
  - One-to-one relationship with users table
  - JSON columns for flexible settings storage

  Fields:
  - id (uuid, primary key): Unique settings record identifier
  - user_id (uuid, foreign key): Owner of these settings
  - display_name (text): User's display name
  - avatar_url (text): Profile avatar URL
  - theme (text): UI theme preference ('dark', 'darker', 'midnight')
  - accent_color (text): UI accent color ('yellow', 'blue', 'green', 'red')
  - compact_mode (boolean): Compact UI mode
  - animations_enabled (boolean): Enable/disable animations
  - date_format (text): Date format preference
  - time_format (text): Time format preference ('12h', '24h')
  - week_start (text): Week start day ('sunday', 'monday')
  - privacy_settings (jsonb): Privacy preferences object
  - notification_settings (jsonb): Notification preferences object
  - created_at (timestamptz): Settings creation timestamp
  - updated_at (timestamptz): Last update timestamp

  ### 2. achievements
  - Tracks unlocked achievements for each user
  - Supports tiered achievement system (bronze, silver, gold, platinum)

  Fields:
  - id (uuid, primary key): Unique achievement record identifier
  - user_id (uuid, foreign key): User who unlocked the achievement
  - achievement_type (text): Achievement category/type
  - achievement_id (text): Specific achievement identifier
  - tier (text): Achievement tier ('bronze', 'silver', 'gold', 'platinum')
  - title (text): Achievement title
  - description (text): Achievement description
  - icon (text): Achievement icon/emoji
  - points (integer): Points awarded
  - unlocked_at (timestamptz): When achievement was unlocked
  - created_at (timestamptz): Record creation timestamp

  ### 3. achievement_progress
  - Tracks progress toward next achievement tiers
  - Cached metrics for performance

  Fields:
  - id (uuid, primary key): Unique progress record identifier
  - user_id (uuid, foreign key): User tracking progress
  - achievement_type (text): Achievement category/type
  - current_value (numeric): Current metric value
  - target_value (numeric): Target value for next tier
  - last_checked (timestamptz): Last progress calculation
  - created_at (timestamptz): Record creation timestamp
  - updated_at (timestamptz): Last update timestamp

  ### 4. onboarding_state
  - Tracks user progress through onboarding flow
  - Enables resume functionality and conversion tracking

  Fields:
  - id (uuid, primary key): Unique onboarding record identifier
  - user_id (uuid, foreign key): User in onboarding flow
  - current_step (integer): Current onboarding step (1-5)
  - completed_steps (jsonb): Array of completed step numbers
  - onboarding_data (jsonb): Temporary data collected during onboarding
  - is_completed (boolean): Whether onboarding is finished
  - completed_at (timestamptz): When onboarding was completed
  - created_at (timestamptz): Onboarding start timestamp
  - updated_at (timestamptz): Last update timestamp

  ### 5. leaderboard_groups
  - Private leaderboard groups for friend competitions
  - Shareable via invite tokens

  Fields:
  - id (uuid, primary key): Unique group identifier
  - name (text): Group name
  - created_by (uuid, foreign key): User who created the group
  - invite_token (text, unique): Shareable invite code
  - is_private (boolean): Privacy setting (always true for now)
  - member_count (integer): Cached member count
  - created_at (timestamptz): Group creation timestamp
  - updated_at (timestamptz): Last update timestamp

  ### 6. leaderboard_memberships
  - Tracks users in leaderboard groups
  - Stores cached stats for performance

  Fields:
  - id (uuid, primary key): Unique membership identifier
  - group_id (uuid, foreign key): Leaderboard group
  - user_id (uuid, foreign key): Member user
  - username (text): Anonymous display name
  - stats_cache (jsonb): Cached user statistics
  - joined_at (timestamptz): When user joined group
  - last_updated (timestamptz): Last stats update
  - created_at (timestamptz): Record creation timestamp

  ## Security
  - Row Level Security (RLS) enabled on all new tables
  - Users can only access their own data
  - Leaderboard groups: members can view group data, only creator can modify
  - All policies enforce proper authentication and ownership checks

  ## Indexes
  - Foreign key indexes for all relationships
  - Unique constraints on user_settings.user_id (one-to-one)
  - Unique constraint on invite_token for leaderboard groups
  - Composite indexes for common query patterns

  ## Notes
  - JSON columns used for flexible nested settings structures
  - Cached statistics in leaderboards for performance
  - Onboarding data temporary and cleaned after completion
  - Achievement system supports extensibility with new types
*/

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT 'CPN User',
  avatar_url text,
  theme text NOT NULL DEFAULT 'dark',
  accent_color text NOT NULL DEFAULT 'yellow',
  compact_mode boolean NOT NULL DEFAULT false,
  animations_enabled boolean NOT NULL DEFAULT true,
  date_format text NOT NULL DEFAULT 'MM/DD/YYYY',
  time_format text NOT NULL DEFAULT '12h',
  week_start text NOT NULL DEFAULT 'monday',
  privacy_settings jsonb NOT NULL DEFAULT '{
    "leaderboardVisibility": "friends",
    "showRealName": false,
    "showProfileStats": true,
    "allowInvitations": true,
    "shareAchievements": true,
    "shareSpendingData": true,
    "shareEfficiencyMetrics": true,
    "shareActivityFrequency": false,
    "anonymousMode": false
  }'::jsonb,
  notification_settings jsonb NOT NULL DEFAULT '{
    "leaderboardUpdates": true,
    "achievementUnlocks": true,
    "weeklySummaries": true,
    "monthlySummaries": true,
    "emailNotifications": false
  }'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_theme CHECK (theme IN ('dark', 'darker', 'midnight')),
  CONSTRAINT valid_accent_color CHECK (accent_color IN ('yellow', 'blue', 'green', 'red')),
  CONSTRAINT valid_time_format CHECK (time_format IN ('12h', '24h')),
  CONSTRAINT valid_week_start CHECK (week_start IN ('sunday', 'monday'))
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_type text NOT NULL,
  achievement_id text NOT NULL,
  tier text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT '🏆',
  points integer NOT NULL DEFAULT 0,
  unlocked_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_tier CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  CONSTRAINT valid_points CHECK (points >= 0),
  UNIQUE(user_id, achievement_id)
);

-- Create achievement_progress table
CREATE TABLE IF NOT EXISTS achievement_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_type text NOT NULL,
  current_value numeric NOT NULL DEFAULT 0,
  target_value numeric NOT NULL,
  last_checked timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_type)
);

-- Create onboarding_state table
CREATE TABLE IF NOT EXISTS onboarding_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  current_step integer NOT NULL DEFAULT 1,
  completed_steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  onboarding_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_step CHECK (current_step >= 1 AND current_step <= 5)
);

-- Create leaderboard_groups table
CREATE TABLE IF NOT EXISTS leaderboard_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invite_token text NOT NULL UNIQUE,
  is_private boolean NOT NULL DEFAULT true,
  member_count integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_member_count CHECK (member_count >= 0)
);

-- Create leaderboard_memberships table
CREATE TABLE IF NOT EXISTS leaderboard_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES leaderboard_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  username text NOT NULL,
  stats_cache jsonb NOT NULL DEFAULT '{
    "totalSpent": 0,
    "totalNuts": 0,
    "costPerNut": 0,
    "totalTime": 0,
    "totalGirls": 0,
    "efficiency": 0
  }'::jsonb,
  joined_at timestamptz DEFAULT now(),
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_group_member UNIQUE(group_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user_type ON achievements(user_id, achievement_type);
CREATE INDEX IF NOT EXISTS idx_achievement_progress_user_id ON achievement_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_state_user_id ON onboarding_state(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_groups_created_by ON leaderboard_groups(created_by);
CREATE INDEX IF NOT EXISTS idx_leaderboard_groups_invite_token ON leaderboard_groups(invite_token);
CREATE INDEX IF NOT EXISTS idx_leaderboard_memberships_group_id ON leaderboard_memberships(group_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_memberships_user_id ON leaderboard_memberships(user_id);

-- Enable Row Level Security
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_memberships ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_settings
CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for achievements
CREATE POLICY "Users can view own achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON achievements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for achievement_progress
CREATE POLICY "Users can view own progress"
  ON achievement_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON achievement_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON achievement_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for onboarding_state
CREATE POLICY "Users can view own onboarding state"
  ON onboarding_state FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding state"
  ON onboarding_state FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding state"
  ON onboarding_state FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for leaderboard_groups
CREATE POLICY "Users can view groups they are members of"
  ON leaderboard_groups FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM leaderboard_memberships
      WHERE leaderboard_memberships.group_id = leaderboard_groups.id
      AND leaderboard_memberships.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create leaderboard groups"
  ON leaderboard_groups FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creators can update their groups"
  ON leaderboard_groups FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creators can delete their groups"
  ON leaderboard_groups FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- RLS Policies for leaderboard_memberships
CREATE POLICY "Users can view memberships in their groups"
  ON leaderboard_memberships FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM leaderboard_memberships lm
      WHERE lm.group_id = leaderboard_memberships.group_id
      AND lm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join leaderboard groups"
  ON leaderboard_memberships FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own membership"
  ON leaderboard_memberships FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave leaderboard groups"
  ON leaderboard_memberships FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Triggers to auto-update updated_at
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_achievement_progress_updated_at
  BEFORE UPDATE ON achievement_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_state_updated_at
  BEFORE UPDATE ON onboarding_state
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leaderboard_groups_updated_at
  BEFORE UPDATE ON leaderboard_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update leaderboard group member count
CREATE OR REPLACE FUNCTION update_leaderboard_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE leaderboard_groups
    SET member_count = member_count + 1
    WHERE id = NEW.group_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE leaderboard_groups
    SET member_count = member_count - 1
    WHERE id = OLD.group_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update member count
CREATE TRIGGER update_member_count_on_insert
  AFTER INSERT ON leaderboard_memberships
  FOR EACH ROW
  EXECUTE FUNCTION update_leaderboard_member_count();

CREATE TRIGGER update_member_count_on_delete
  AFTER DELETE ON leaderboard_memberships
  FOR EACH ROW
  EXECUTE FUNCTION update_leaderboard_member_count();
