-- Tailgate admin and leaderboard access.
-- Run this in Supabase SQL Editor after user_picks.sql.
--
-- IMPORTANT:
-- Replace lucianagalvez106@gmail.com below if your admin email changes.

CREATE OR REPLACE FUNCTION public.is_tailgate_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT LOWER(COALESCE(auth.jwt() ->> 'email', '')) IN (
    'lucianagalvez106@gmail.com'
  );
$$;

DROP POLICY IF EXISTS "user_picks_select_all_authenticated" ON public.user_picks;
DROP POLICY IF EXISTS "user_picks_admin_update_any" ON public.user_picks;
DROP POLICY IF EXISTS "user_picks_admin_delete_any" ON public.user_picks;

-- Lets authenticated users build real community leaderboards from submitted picks.
CREATE POLICY "user_picks_select_all_authenticated"
  ON public.user_picks
  FOR SELECT
  TO authenticated
  USING (true);

-- Lets your admin account settle or correct any pick result.
CREATE POLICY "user_picks_admin_update_any"
  ON public.user_picks
  FOR UPDATE
  TO authenticated
  USING (public.is_tailgate_admin())
  WITH CHECK (public.is_tailgate_admin());

-- Lets your admin account remove abusive/spam picks if needed.
CREATE POLICY "user_picks_admin_delete_any"
  ON public.user_picks
  FOR DELETE
  TO authenticated
  USING (public.is_tailgate_admin());
