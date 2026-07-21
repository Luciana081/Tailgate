-- Tailgate user-created picks from live odds.
-- Run this in Supabase SQL Editor after creating your Supabase project.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.user_picks (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  league_id       TEXT NOT NULL,
  game_id         TEXT NOT NULL,
  game_description TEXT NOT NULL,
  prediction      TEXT NOT NULL,
  confidence      INTEGER NOT NULL CHECK (confidence BETWEEN 1 AND 10),
  reasoning       TEXT NOT NULL,
  result          TEXT NOT NULL CHECK (result IN ('pending', 'win', 'loss', 'push')) DEFAULT 'pending',
  likes_count     INTEGER NOT NULL DEFAULT 0,
  comments_count  INTEGER NOT NULL DEFAULT 0,
  odds_bookmaker  TEXT,
  odds_market     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_picks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_picks_select_own" ON public.user_picks;
DROP POLICY IF EXISTS "user_picks_insert_own" ON public.user_picks;
DROP POLICY IF EXISTS "user_picks_update_own" ON public.user_picks;
DROP POLICY IF EXISTS "user_picks_delete_own" ON public.user_picks;

CREATE POLICY "user_picks_select_own"
  ON public.user_picks
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "user_picks_insert_own"
  ON public.user_picks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_picks_update_own"
  ON public.user_picks
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "user_picks_delete_own"
  ON public.user_picks
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_picks_user_created
  ON public.user_picks (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_picks_game
  ON public.user_picks (game_id);
