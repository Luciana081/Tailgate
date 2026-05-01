-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      TEXT UNIQUE NOT NULL,
  avatar_url    TEXT,
  bio           TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE INDEX idx_profiles_username ON public.profiles (username);

-- ============================================================
-- FOLLOWS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.follows (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (follower_id, following_id)
);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "follows_select_all"  ON public.follows FOR SELECT USING (true);
CREATE POLICY "follows_insert_own"  ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "follows_delete_own"  ON public.follows FOR DELETE USING (auth.uid() = follower_id);

CREATE INDEX idx_follows_follower   ON public.follows (follower_id);
CREATE INDEX idx_follows_following  ON public.follows (following_id);

-- ============================================================
-- LEAGUES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.leagues (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  short_name  TEXT NOT NULL UNIQUE,
  color       TEXT NOT NULL,
  emoji       TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leagues_select_all"  ON public.leagues FOR SELECT USING (true);
CREATE POLICY "leagues_insert_admin" ON public.leagues FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "leagues_update_admin" ON public.leagues FOR UPDATE USING (auth.role() = 'service_role');

-- ============================================================
-- TEAMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.teams (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_id   UUID NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  short_name  TEXT NOT NULL,
  emoji       TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teams_select_all"    ON public.teams FOR SELECT USING (true);
CREATE POLICY "teams_insert_admin"  ON public.teams FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE INDEX idx_teams_league ON public.teams (league_id);

-- ============================================================
-- GAMES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.games (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_id               UUID NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  home_team_id            UUID NOT NULL REFERENCES public.teams(id),
  away_team_id            UUID NOT NULL REFERENCES public.teams(id),
  home_score              INTEGER NOT NULL DEFAULT 0,
  away_score              INTEGER NOT NULL DEFAULT 0,
  status                  TEXT NOT NULL CHECK (status IN ('upcoming', 'live', 'final')) DEFAULT 'upcoming',
  game_date               DATE NOT NULL,
  game_time               TIME NOT NULL,
  home_win_probability    NUMERIC(5,2) NOT NULL DEFAULT 50,
  away_win_probability    NUMERIC(5,2) NOT NULL DEFAULT 50,
  key_trend               TEXT,
  odds                    TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "games_select_all"   ON public.games FOR SELECT USING (true);
CREATE POLICY "games_insert_admin" ON public.games FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "games_update_admin" ON public.games FOR UPDATE USING (auth.role() = 'service_role');

CREATE INDEX idx_games_league     ON public.games (league_id);
CREATE INDEX idx_games_date       ON public.games (game_date);
CREATE INDEX idx_games_status     ON public.games (status);

-- ============================================================
-- PICKS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.picks (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analyst_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  league_id       UUID NOT NULL REFERENCES public.leagues(id),
  game_id         UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  prediction      TEXT NOT NULL,
  confidence      INTEGER NOT NULL CHECK (confidence BETWEEN 1 AND 10),
  reasoning       TEXT NOT NULL,
  result          TEXT NOT NULL CHECK (result IN ('pending', 'win', 'loss', 'push')) DEFAULT 'pending',
  likes_count     INTEGER NOT NULL DEFAULT 0,
  comments_count  INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.picks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "picks_select_all"   ON public.picks FOR SELECT USING (true);
CREATE POLICY "picks_insert_own"   ON public.picks FOR INSERT WITH CHECK (auth.uid() = analyst_id);
CREATE POLICY "picks_update_own"   ON public.picks FOR UPDATE USING (auth.uid() = analyst_id);
CREATE POLICY "picks_delete_own"   ON public.picks FOR DELETE USING (auth.uid() = analyst_id);

CREATE INDEX idx_picks_analyst  ON public.picks (analyst_id);
CREATE INDEX idx_picks_league   ON public.picks (league_id);
CREATE INDEX idx_picks_game     ON public.picks (game_id);
CREATE INDEX idx_picks_result   ON public.picks (result);

-- ============================================================
-- POSTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.posts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic           TEXT NOT NULL,
  league_id       UUID REFERENCES public.leagues(id),
  content         TEXT NOT NULL,
  likes_count     INTEGER NOT NULL DEFAULT 0,
  comments_count  INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "posts_select_all"   ON public.posts FOR SELECT USING (true);
CREATE POLICY "posts_insert_own"   ON public.posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "posts_update_own"   ON public.posts FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "posts_delete_own"   ON public.posts FOR DELETE USING (auth.uid() = author_id);

CREATE INDEX idx_posts_author    ON public.posts (author_id);
CREATE INDEX idx_posts_league    ON public.posts (league_id);
CREATE INDEX idx_posts_created   ON public.posts (created_at DESC);

-- ============================================================
-- COMMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.comments (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id   UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  pick_id   UUID REFERENCES public.picks(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content   TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT comments_target_check CHECK (
    (post_id IS NOT NULL AND pick_id IS NULL) OR
    (post_id IS NULL AND pick_id IS NOT NULL)
  )
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comments_select_all"  ON public.comments FOR SELECT USING (true);
CREATE POLICY "comments_insert_own"  ON public.comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "comments_delete_own"  ON public.comments FOR DELETE USING (auth.uid() = author_id);

CREATE INDEX idx_comments_post    ON public.comments (post_id);
CREATE INDEX idx_comments_pick    ON public.comments (pick_id);
CREATE INDEX idx_comments_author  ON public.comments (author_id);

-- ============================================================
-- LIKES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.likes (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pick_id   UUID REFERENCES public.picks(id) ON DELETE CASCADE,
  post_id   UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT likes_target_check CHECK (
    (pick_id IS NOT NULL AND post_id IS NULL) OR
    (pick_id IS NULL AND post_id IS NOT NULL)
  ),
  UNIQUE (user_id, pick_id),
  UNIQUE (user_id, post_id)
);

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "likes_select_all"  ON public.likes FOR SELECT USING (true);
CREATE POLICY "likes_insert_own"  ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes_delete_own"  ON public.likes FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_likes_user    ON public.likes (user_id);
CREATE INDEX idx_likes_pick    ON public.likes (pick_id);
CREATE INDEX idx_likes_post    ON public.likes (post_id);

-- ============================================================
-- ANALYST STATS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.analyst_stats (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analyst_id        UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_picks       INTEGER NOT NULL DEFAULT 0,
  wins              INTEGER NOT NULL DEFAULT 0,
  losses            INTEGER NOT NULL DEFAULT 0,
  pushes            INTEGER NOT NULL DEFAULT 0,
  win_rate          NUMERIC(5,2) NOT NULL DEFAULT 0,
  performance_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.analyst_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "analyst_stats_select_all"  ON public.analyst_stats FOR SELECT USING (true);
CREATE POLICY "analyst_stats_update_own"  ON public.analyst_stats FOR UPDATE USING (auth.uid() = analyst_id);

CREATE INDEX idx_analyst_stats_analyst   ON public.analyst_stats (analyst_id);
CREATE INDEX idx_analyst_stats_win_rate  ON public.analyst_stats (win_rate DESC);
