/*
# Create HoloMeet database schema (single-tenant, no auth)

1. New Tables
- `meetings`: Represents a meeting room. Has id, title, host_name, created_at, and a `presenter_model` JSONB storing the generative 3D model parameters (geometry type, colors, params).
- `participants`: Represents a participant in a meeting. Has id, meeting_id (FK to meetings), name, avatar_color, is_presenter, is_muted, is_video_on, joined_at, last_seen (for presence tracking). A unique constraint on (meeting_id, name) prevents duplicate names in the same room.
- `chat_messages`: Chat messages in a meeting. Has id, meeting_id (FK), participant_name, content, created_at.

2. Security
- Enable RLS on all tables.
- Allow anon + authenticated CRUD on all tables because the data is intentionally shared/public (no-auth demo app).
- All policies use `USING (true)` / `WITH CHECK (true)` because there is no user ownership concept — this is a shared meeting space.

3. Important Notes
- This is a single-tenant no-auth app. All data is shared across participants in a meeting room.
- Presence is tracked via `last_seen` timestamp on `participants` — the frontend heartbeats and queries for recently-seen participants.
- The `presenter_model` JSONB on `meetings` stores the generative 3D model configuration so all participants see the same 3D presentation.
*/

CREATE TABLE IF NOT EXISTS meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  host_name text NOT NULL,
  presenter_model jsonb NOT NULL DEFAULT '{"type":"crystal","color":"#4f8cff","complexity":0.6,"speed":0.5}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_meetings" ON meetings;
CREATE POLICY "anon_select_meetings" ON meetings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_meetings" ON meetings;
CREATE POLICY "anon_insert_meetings" ON meetings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_meetings" ON meetings;
CREATE POLICY "anon_update_meetings" ON meetings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_meetings" ON meetings;
CREATE POLICY "anon_delete_meetings" ON meetings FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  name text NOT NULL,
  avatar_color text NOT NULL DEFAULT '#4f8cff',
  is_presenter boolean NOT NULL DEFAULT false,
  is_muted boolean NOT NULL DEFAULT false,
  is_video_on boolean NOT NULL DEFAULT true,
  joined_at timestamptz DEFAULT now(),
  last_seen timestamptz DEFAULT now(),
  UNIQUE (meeting_id, name)
);

ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_participants" ON participants;
CREATE POLICY "anon_select_participants" ON participants FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_participants" ON participants;
CREATE POLICY "anon_insert_participants" ON participants FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_participants" ON participants;
CREATE POLICY "anon_update_participants" ON participants FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_participants" ON participants;
CREATE POLICY "anon_delete_participants" ON participants FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_participants_meeting_id ON participants (meeting_id);
CREATE INDEX IF NOT EXISTS idx_participants_last_seen ON participants (last_seen);

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  participant_name text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_chat_messages" ON chat_messages;
CREATE POLICY "anon_select_chat_messages" ON chat_messages FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_chat_messages" ON chat_messages;
CREATE POLICY "anon_insert_chat_messages" ON chat_messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_chat_messages" ON chat_messages;
CREATE POLICY "anon_delete_chat_messages" ON chat_messages FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_chat_messages_meeting_id ON chat_messages (meeting_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages (created_at);