import { isSupabaseConfigured, supabase } from './supabase';
import { Pick } from './types';

export type AdminPickRow = {
  id: string;
  user_id: string;
  league_id: string;
  game_id: string;
  game_description: string;
  prediction: string;
  confidence: number;
  reasoning: string;
  result: Pick['result'];
  likes_count: number;
  comments_count: number;
  odds_bookmaker?: string | null;
  odds_market?: string | null;
  created_at: string;
};

export function rowToPublicPick(row: AdminPickRow): Pick {
  return {
    id: row.id,
    analystId: row.user_id,
    analystName: `User ${row.user_id.slice(0, 8)}`,
    leagueId: row.league_id,
    gameId: row.game_id,
    gameDescription: row.game_description,
    prediction: row.prediction,
    confidence: row.confidence,
    reasoning: row.reasoning,
    result: row.result,
    likes: row.likes_count,
    comments: row.comments_count,
    createdAt: row.created_at,
    oddsBookmaker: row.odds_bookmaker ?? undefined,
    oddsMarket: row.odds_market ?? undefined,
  };
}

export async function fetchAllUserPicks() {
  if (!isSupabaseConfigured) {
    return { picks: [] as Pick[], error: 'Supabase is not configured.' };
  }

  const { data, error } = await supabase
    .from('user_picks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return { picks: [] as Pick[], error: error.message };
  }

  return {
    picks: (data as AdminPickRow[]).map(rowToPublicPick),
    error: '',
  };
}

export async function updateUserPickResult(id: string, result: Pick['result']) {
  if (!isSupabaseConfigured) {
    return 'Supabase is not configured.';
  }

  const { error } = await supabase
    .from('user_picks')
    .update({ result })
    .eq('id', id);

  return error?.message ?? '';
}
