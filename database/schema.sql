-- ============================================================
-- Tailgate – PostgreSQL Schema (Supabase-ready)
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Users & Profiles ─────────────────────────────────────────

CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       TEXT UNIQUE NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE profiles (
  id           UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  username     TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio          TEXT,
  avatar_url   TEXT,
  is_analyst   BOOLEAN NOT NULL DEFAULT FALSE,
  followers    INTEGER NOT NULL DEFAULT 0,
  following    INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE follows (
  follower_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id <> following_id)
);

-- ── Sports Data ───────────────────────────────────────────────

CREATE TYPE league_type AS ENUM ('NFL', 'NBA', 'MLB', 'NHL', 'Soccer');

CREATE TABLE leagues (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       league_type UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE teams (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  abbreviation TEXT NOT NULL,
  league       league_type NOT NULL,
  color        TEXT NOT NULL DEFAULT '#888888',
  logo_url     TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE game_status AS ENUM ('upcoming', 'live', 'final');

CREATE TABLE games (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league                league_type NOT NULL,
  home_team_id          UUID NOT NULL REFERENCES teams(id),
  away_team_id          UUID NOT NULL REFERENCES teams(id),
  scheduled_at          TIMESTAMPTZ NOT NULL,
  status                game_status NOT NULL DEFAULT 'upcoming',
  home_score            INTEGER,
  away_score            INTEGER,
  home_win_probability  NUMERIC(4,3) CHECK (home_win_probability BETWEEN 0 AND 1),
  home_recent_form      TEXT,
  away_recent_form      TEXT,
  key_trend             TEXT,
  venue                 TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (home_team_id <> away_team_id)
);

-- ── Analyst Stats ─────────────────────────────────────────────

CREATE TABLE analyst_stats (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analyst_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  league            league_type,               -- NULL = overall
  total_picks       INTEGER NOT NULL DEFAULT 0,
  wins              INTEGER NOT NULL DEFAULT 0,
  losses            INTEGER NOT NULL DEFAULT 0,
  pushes            INTEGER NOT NULL DEFAULT 0,
  win_rate          NUMERIC(5,4) GENERATED ALWAYS AS (
                      CASE WHEN (wins + losses) = 0 THEN 0
                           ELSE wins::NUMERIC / (wins + losses)
                      END
                    ) STORED,
  performance_score NUMERIC(6,2) NOT NULL DEFAULT 0,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (analyst_id, league)
);

-- ── Picks ─────────────────────────────────────────────────────

CREATE TYPE pick_result AS ENUM ('pending', 'win', 'loss', 'push');

CREATE TABLE picks (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analyst_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  game_id     UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  league      league_type NOT NULL,
  pick_text   TEXT NOT NULL,
  confidence  SMALLINT NOT NULL CHECK (confidence BETWEEN 1 AND 100),
  reasoning   TEXT,
  result      pick_result NOT NULL DEFAULT 'pending',
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Posts & Comments ──────────────────────────────────────────

CREATE TYPE post_league AS ENUM ('NFL', 'NBA', 'MLB', 'NHL', 'Soccer', 'General');

CREATE TABLE posts (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  topic          TEXT NOT NULL,
  content        TEXT NOT NULL,
  league         post_league NOT NULL DEFAULT 'General',
  likes_count    INTEGER NOT NULL DEFAULT 0,
  comment_count  INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE comments (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id    UUID REFERENCES posts(id) ON DELETE CASCADE,
  pick_id    UUID REFERENCES picks(id) ON DELETE CASCADE,
  author_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (
    (post_id IS NOT NULL AND pick_id IS NULL) OR
    (post_id IS NULL AND pick_id IS NOT NULL)
  )
);

-- ── Likes ─────────────────────────────────────────────────────

CREATE TABLE likes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id    UUID REFERENCES posts(id) ON DELETE CASCADE,
  pick_id    UUID REFERENCES picks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (
    (post_id IS NOT NULL AND pick_id IS NULL) OR
    (post_id IS NULL AND pick_id IS NOT NULL)
  ),
  UNIQUE (user_id, post_id),
  UNIQUE (user_id, pick_id)
);

-- ── Indexes ───────────────────────────────────────────────────

CREATE INDEX idx_games_league        ON games(league);
CREATE INDEX idx_games_status        ON games(status);
CREATE INDEX idx_games_scheduled_at  ON games(scheduled_at DESC);
CREATE INDEX idx_picks_analyst_id    ON picks(analyst_id);
CREATE INDEX idx_picks_game_id       ON picks(game_id);
CREATE INDEX idx_picks_result        ON picks(result);
CREATE INDEX idx_picks_league        ON picks(league);
CREATE INDEX idx_posts_author_id     ON posts(author_id);
CREATE INDEX idx_posts_league        ON posts(league);
CREATE INDEX idx_posts_created_at    ON posts(created_at DESC);
CREATE INDEX idx_comments_post_id    ON comments(post_id);
CREATE INDEX idx_comments_pick_id    ON comments(pick_id);
CREATE INDEX idx_likes_user_id       ON likes(user_id);
CREATE INDEX idx_analyst_stats_analyst ON analyst_stats(analyst_id);
CREATE INDEX idx_follows_follower    ON follows(follower_id);
CREATE INDEX idx_follows_following   ON follows(following_id);

-- ── Row Level Security (Supabase) ─────────────────────────────

ALTER TABLE users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows        ENABLE ROW LEVEL SECURITY;
ALTER TABLE picks          ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyst_stats  ENABLE ROW LEVEL SECURITY;

-- Public read access for non-sensitive tables
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (TRUE);

CREATE POLICY "Public games are viewable by everyone"
  ON games FOR SELECT USING (TRUE);

CREATE POLICY "Public picks are viewable by everyone"
  ON picks FOR SELECT USING (TRUE);

CREATE POLICY "Public posts are viewable by everyone"
  ON posts FOR SELECT USING (TRUE);

CREATE POLICY "Public comments are viewable by everyone"
  ON comments FOR SELECT USING (TRUE);

-- Authenticated write access
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Analysts can insert picks"
  ON picks FOR INSERT WITH CHECK (auth.uid() = analyst_id);

CREATE POLICY "Analysts can update own picks"
  ON picks FOR UPDATE USING (auth.uid() = analyst_id);

CREATE POLICY "Users can insert posts"
  ON posts FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "Users can insert comments"
  ON comments FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "Users can manage own likes"
  ON likes FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own follows"
  ON follows FOR ALL USING (auth.uid() = follower_id);
