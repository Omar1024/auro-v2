-- ============================================================================
-- AURO PLATFORM - COMPLETE DATABASE SETUP
-- Run this ENTIRE file in Supabase SQL Editor (in order)
-- ============================================================================

-- ============================================================================
-- STEP 1: CREATE CORE TABLES
-- ============================================================================

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user' NOT NULL,
  profile_picture TEXT,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT users_role_check CHECK (role IN ('user', 'admin', 'banned'))
);

CREATE INDEX IF NOT EXISTS users_username_idx ON users(username);
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS users_is_verified_idx ON users(is_verified);

-- Inboxes Table
CREATE TABLE IF NOT EXISTS inboxes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  prompt_text TEXT,
  visibility TEXT DEFAULT 'public' NOT NULL CHECK (visibility IN ('public', 'private')),
  password TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, name)
);

CREATE INDEX IF NOT EXISTS inboxes_user_id_idx ON inboxes(user_id);
CREATE INDEX IF NOT EXISTS inboxes_visibility_idx ON inboxes(visibility);

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inbox_id UUID NOT NULL REFERENCES inboxes(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  anon_id TEXT NOT NULL,
  is_replied BOOLEAN DEFAULT false,
  is_flagged BOOLEAN DEFAULT false,
  flag_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS messages_inbox_id_idx ON messages(inbox_id);
CREATE INDEX IF NOT EXISTS messages_anon_id_idx ON messages(anon_id);
CREATE INDEX IF NOT EXISTS messages_is_replied_idx ON messages(is_replied);
CREATE INDEX IF NOT EXISTS messages_is_flagged_idx ON messages(is_flagged);

-- Replies Table
CREATE TABLE IF NOT EXISTS replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS replies_message_id_idx ON replies(message_id);
CREATE INDEX IF NOT EXISTS replies_is_public_idx ON replies(is_public);

-- ============================================================================
-- STEP 2: ENABLE ROW LEVEL SECURITY ON CORE TABLES
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE inboxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE replies ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 3: CREATE SUPPLEMENTARY TABLES
-- ============================================================================

-- Blocked Users Table (per-inbox blocking)
CREATE TABLE IF NOT EXISTS blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inbox_id UUID NOT NULL REFERENCES inboxes(id) ON DELETE CASCADE,
  anon_id TEXT NOT NULL,
  anon_ip TEXT, -- Store hashed IP for blocking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(inbox_id, anon_id)
);

CREATE INDEX IF NOT EXISTS blocked_users_inbox_id_idx ON blocked_users(inbox_id);
CREATE INDEX IF NOT EXISTS blocked_users_anon_id_idx ON blocked_users(anon_id);
CREATE INDEX IF NOT EXISTS blocked_users_anon_ip_idx ON blocked_users(anon_ip);

-- Banned Users Table (global platform ban)
CREATE TABLE IF NOT EXISTS banned_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anon_id TEXT NOT NULL UNIQUE,
  banned_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS banned_users_anon_id_idx ON banned_users(anon_id);

-- Reports Table (for admin moderation)
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS reports_message_id_idx ON reports(message_id);
CREATE INDEX IF NOT EXISTS reports_created_at_idx ON reports(created_at DESC);

-- Hidden Words Table (content filtering per user)
CREATE TABLE IF NOT EXISTS hidden_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, word)
);

CREATE INDEX IF NOT EXISTS hidden_words_user_id_idx ON hidden_words(user_id);


-- ============================================================================
-- STEP 4: CREATE ADMIN HELPER FUNCTION (prevents RLS recursion)
-- ============================================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'admin'
    FROM users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 5: DROP ALL OLD POLICIES (clean slate)
-- ============================================================================

-- Users table
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "admins_can_view_all_users" ON users;
DROP POLICY IF EXISTS "admins_can_update_all_users" ON users;
DROP POLICY IF EXISTS "admins_select_all" ON users;
DROP POLICY IF EXISTS "admins_update_all" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;

-- Inboxes table
DROP POLICY IF EXISTS "Users can view their own inboxes" ON inboxes;
DROP POLICY IF EXISTS "Users can create their own inboxes" ON inboxes;
DROP POLICY IF EXISTS "Users can update their own inboxes" ON inboxes;
DROP POLICY IF EXISTS "Users can delete their own inboxes" ON inboxes;
DROP POLICY IF EXISTS "Anyone can view public inboxes" ON inboxes;

-- Messages table
DROP POLICY IF EXISTS "Anyone can send messages to public inboxes" ON messages;
DROP POLICY IF EXISTS "Inbox owners can view their messages" ON messages;
DROP POLICY IF EXISTS "Inbox owners can update their messages" ON messages;
DROP POLICY IF EXISTS "Inbox owners can delete their messages" ON messages;

-- Replies table
DROP POLICY IF EXISTS "Users can view public replies and their own replies" ON replies;
DROP POLICY IF EXISTS "Inbox owners can create replies" ON replies;
DROP POLICY IF EXISTS "Users can update their own replies" ON replies;
DROP POLICY IF EXISTS "Users can delete their own replies" ON replies;

-- ============================================================================
-- STEP 6: CREATE NEW RLS POLICIES
-- ============================================================================

-- --------------------
-- USERS TABLE POLICIES
-- --------------------

-- Users can insert their own profile (for signup)
CREATE POLICY "users_insert_own"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Users can view their own profile
CREATE POLICY "users_select_own"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Anyone can view public user profiles (for profile pages)
CREATE POLICY "Anyone can view public user profiles"
  ON users FOR SELECT
  TO authenticated, anon
  USING (true); -- Allow viewing all profiles for public pages

-- Users can update their own profile (but not their role)
CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "admins_select_all"
  ON users FOR SELECT
  TO authenticated
  USING (is_admin());

-- Admins can update any user
CREATE POLICY "admins_update_all"
  ON users FOR UPDATE
  TO authenticated
  USING (is_admin());

-- --------------------
-- INBOXES TABLE POLICIES
-- --------------------

-- Users can view their own inboxes
CREATE POLICY "Users can view their own inboxes"
  ON inboxes FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Anyone can view public inboxes (for sending messages)
CREATE POLICY "Anyone can view public inboxes"
  ON inboxes FOR SELECT
  TO authenticated, anon
  USING (visibility = 'public');

-- Anyone can view private inboxes (to see password prompt)
CREATE POLICY "Anyone can view private inboxes"
  ON inboxes FOR SELECT
  TO authenticated, anon
  USING (visibility = 'private');

-- Users can create their own inboxes
CREATE POLICY "Users can create their own inboxes"
  ON inboxes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own inboxes
CREATE POLICY "Users can update their own inboxes"
  ON inboxes FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Users can delete their own inboxes
CREATE POLICY "Users can delete their own inboxes"
  ON inboxes FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- --------------------
-- MESSAGES TABLE POLICIES
-- --------------------

-- Inbox owners can view their messages
CREATE POLICY "Inbox owners can view their messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM inboxes
      WHERE inboxes.id = messages.inbox_id
      AND inboxes.user_id = auth.uid()
    )
  );

-- Anyone can send messages to public inboxes
CREATE POLICY "Anyone can send messages to public inboxes"
  ON messages FOR INSERT
  TO authenticated, anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM inboxes
      WHERE inboxes.id = inbox_id
      AND inboxes.visibility = 'public'
    )
  );

-- Anyone can send messages to private inboxes (password verified in app)
CREATE POLICY "Anyone can send messages to private inboxes"
  ON messages FOR INSERT
  TO authenticated, anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM inboxes
      WHERE inboxes.id = inbox_id
      AND inboxes.visibility = 'private'
    )
  );

-- Inbox owners can update their messages (for marking as replied)
CREATE POLICY "Inbox owners can update their messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM inboxes
      WHERE inboxes.id = messages.inbox_id
      AND inboxes.user_id = auth.uid()
    )
  );

-- Inbox owners can delete their messages
CREATE POLICY "Inbox owners can delete their messages"
  ON messages FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM inboxes
      WHERE inboxes.id = messages.inbox_id
      AND inboxes.user_id = auth.uid()
    )
  );

-- --------------------
-- REPLIES TABLE POLICIES
-- --------------------

-- Anyone can view public replies
CREATE POLICY "Anyone can view public replies"
  ON replies FOR SELECT
  TO authenticated, anon
  USING (is_public = TRUE);

-- Users can view their own private replies
CREATE POLICY "Users can view their own private replies"
  ON replies FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN inboxes i ON m.inbox_id = i.id
      WHERE m.id = message_id 
      AND i.user_id = auth.uid()
    )
  );

-- Inbox owners can create replies
CREATE POLICY "Inbox owners can create replies"
  ON replies FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN inboxes i ON m.inbox_id = i.id
      WHERE m.id = message_id 
      AND i.user_id = auth.uid()
    )
  );

-- Inbox owners can update their replies
CREATE POLICY "Users can update their own replies"
  ON replies FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN inboxes i ON m.inbox_id = i.id
      WHERE m.id = message_id 
      AND i.user_id = auth.uid()
    )
  );

-- Inbox owners can delete their replies
CREATE POLICY "Users can delete their own replies"
  ON replies FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN inboxes i ON m.inbox_id = i.id
      WHERE m.id = message_id 
      AND i.user_id = auth.uid()
    )
  );

-- --------------------
-- BLOCKED USERS POLICIES
-- --------------------

ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their blocked users"
  ON blocked_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM inboxes
      WHERE inboxes.id = blocked_users.inbox_id
      AND inboxes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can block users in their inboxes"
  ON blocked_users FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM inboxes
      WHERE inboxes.id = blocked_users.inbox_id
      AND inboxes.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can unblock users from their inboxes"
  ON blocked_users FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM inboxes
      WHERE inboxes.id = blocked_users.inbox_id
      AND inboxes.user_id = auth.uid()
    )
  );

-- --------------------
-- BANNED USERS POLICIES
-- --------------------

ALTER TABLE banned_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all banned users"
  ON banned_users FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can ban users"
  ON banned_users FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can unban users"
  ON banned_users FOR DELETE
  USING (is_admin());

-- --------------------
-- REPORTS POLICIES
-- --------------------

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all reports"
  ON reports FOR SELECT
  USING (is_admin());

CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can delete reports"
  ON reports FOR DELETE
  USING (is_admin());

-- --------------------
-- HIDDEN WORDS POLICIES
-- --------------------

ALTER TABLE hidden_words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own hidden words"
  ON hidden_words FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can add their own hidden words"
  ON hidden_words FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own hidden words"
  ON hidden_words FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- STEP 7: SETUP PROFILE PICTURES STORAGE
-- ============================================================================

-- Create storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Drop old policies
DROP POLICY IF EXISTS "Public profile pictures are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile pictures" ON storage.objects;

-- Allow anyone to view profile pictures
CREATE POLICY "Public profile pictures are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-pictures');

-- Allow authenticated users to upload
CREATE POLICY "Users can upload their own profile pictures"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-pictures' 
  AND auth.role() = 'authenticated'
);

-- Allow users to update
CREATE POLICY "Users can update their own profile pictures"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-pictures' 
  AND auth.role() = 'authenticated'
);

-- Allow users to delete
CREATE POLICY "Users can delete their own profile pictures"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-pictures' 
  AND auth.role() = 'authenticated'
);

-- ============================================================================
-- STEP 8: AUTO-VERIFY ADMINS
-- ============================================================================

UPDATE users 
SET is_verified = true 
WHERE role = 'admin';

-- ============================================================================
-- STEP 9: VERIFY SETUP
-- ============================================================================

-- Check all tables exist
SELECT 
  schemaname, 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'inboxes', 'messages', 'replies', 'blocked_users', 'banned_users', 'reports', 'hidden_words')
ORDER BY tablename;

-- Check all policies are created
SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- ============================================================================
-- SETUP COMPLETE! 🎉
-- ============================================================================

-- Next steps:
-- 1. Set your user as admin: UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
-- 2. Test the application
-- 3. Deploy to production

