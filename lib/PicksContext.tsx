import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Pick, PickInput } from './types';
import { useAuth } from './AuthContext';
import { isSupabaseConfigured, supabase } from './supabase';
import { settlePickFromGame } from './pickSettlement';
import { Game } from './types';

type UserPickRow = {
  id: string;
  user_id: string;
  league_id: string;
  game_id: string;
  game_description: string;
  prediction: string;
  confidence: number;
  reasoning: string;
  result: 'pending' | 'win' | 'loss' | 'push';
  likes_count: number;
  comments_count: number;
  odds_bookmaker?: string | null;
  odds_market?: string | null;
  created_at: string;
};

type PicksContextValue = {
  userPicks: Pick[];
  addPick: (input: PickInput) => Promise<void>;
  likeUserPick: (id: string) => Promise<void>;
  settlePicks: (games: Game[]) => Promise<void>;
};

const PicksContext = createContext<PicksContextValue | undefined>(undefined);

function getStorageKey(userId?: string) {
  return userId ? `tailgate:user-picks:${userId}` : 'tailgate:user-picks:guest';
}

function rowToPick(row: UserPickRow, email?: string): Pick {
  return {
    id: row.id,
    analystId: row.user_id,
    analystName: email ?? 'You',
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
    isUserPick: true,
    oddsBookmaker: row.odds_bookmaker ?? undefined,
    oddsMarket: row.odds_market ?? undefined,
  };
}

function inputToPick(input: PickInput, userId?: string, email?: string): Pick {
  return {
    id: `user-pick-${Date.now()}`,
    analystId: userId ?? 'local-user',
    analystName: email ?? 'You',
    leagueId: input.leagueId,
    gameId: input.gameId,
    gameDescription: input.gameDescription,
    prediction: input.prediction,
    confidence: input.confidence,
    reasoning: input.reasoning,
    result: 'pending',
    likes: 0,
    comments: 0,
    createdAt: new Date().toISOString(),
    isUserPick: true,
    oddsBookmaker: input.oddsBookmaker,
    oddsMarket: input.oddsMarket,
  };
}

export function PicksProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [userPicks, setUserPicks] = useState<Pick[]>([]);

  useEffect(() => {
    let isActive = true;

    async function loadPicks() {
      let nextPicks: Pick[] = [];
      let didLoadFromSupabase = false;

      if (isSupabaseConfigured && user?.id) {
        const { data, error } = await supabase
          .from('user_picks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          nextPicks = (data as UserPickRow[]).map((row) => rowToPick(row, user.email));
          didLoadFromSupabase = true;
        }
      }

      if (!didLoadFromSupabase) {
        const rawPicks = await AsyncStorage.getItem(getStorageKey(user?.id));
        nextPicks = rawPicks ? JSON.parse(rawPicks) as Pick[] : [];
      }

      if (isActive) {
        setUserPicks(nextPicks);
      }
    }

    loadPicks();

    return () => {
      isActive = false;
    };
  }, [user?.email, user?.id]);

  const persistPicks = useCallback(async (nextPicks: Pick[]) => {
    setUserPicks(nextPicks);
    await AsyncStorage.setItem(getStorageKey(user?.id), JSON.stringify(nextPicks));
  }, [user?.id]);

  const addPick = useCallback(async (input: PickInput) => {
    let nextPick = inputToPick(input, user?.id, user?.email);

    if (isSupabaseConfigured && user?.id) {
      const { data, error } = await supabase
        .from('user_picks')
        .insert({
          user_id: user.id,
          league_id: input.leagueId,
          game_id: input.gameId,
          game_description: input.gameDescription,
          prediction: input.prediction,
          confidence: input.confidence,
          reasoning: input.reasoning,
          result: 'pending',
          likes_count: 0,
          comments_count: 0,
          odds_bookmaker: input.oddsBookmaker,
          odds_market: input.oddsMarket,
        })
        .select('*')
        .single();

      if (!error && data) {
        nextPick = rowToPick(data as UserPickRow, user.email);
      }
    }

    await persistPicks([nextPick, ...userPicks]);
  }, [persistPicks, user?.email, user?.id, userPicks]);

  const likeUserPick = useCallback(async (id: string) => {
    const nextPicks = userPicks.map((pick) =>
      pick.id === id ? { ...pick, likes: pick.likes + 1 } : pick,
    );

    if (isSupabaseConfigured && user?.id) {
      const nextPick = nextPicks.find((pick) => pick.id === id);

      if (nextPick) {
        await supabase
          .from('user_picks')
          .update({ likes_count: nextPick.likes })
          .eq('id', id)
          .eq('user_id', user.id);
      }
    }

    await persistPicks(nextPicks);
  }, [persistPicks, user?.id, userPicks]);

  const settlePicks = useCallback(async (games: Game[]) => {
    if (!games.length || !userPicks.some((pick) => pick.result === 'pending')) {
      return;
    }

    const gameById = new Map(games.map((game) => [game.id, game]));
    const settledPicks = userPicks.map((pick) => {
      const game = gameById.get(pick.gameId);
      const result = game ? settlePickFromGame(pick, game) : null;

      return result ? { ...pick, result } : pick;
    });

    const changedPicks = settledPicks.filter((pick, index) => pick.result !== userPicks[index].result);

    if (!changedPicks.length) {
      return;
    }

    if (isSupabaseConfigured && user?.id) {
      await Promise.all(changedPicks.map((pick) =>
        supabase
          .from('user_picks')
          .update({ result: pick.result })
          .eq('id', pick.id)
          .eq('user_id', user.id),
      ));
    }

    await persistPicks(settledPicks);
  }, [persistPicks, user?.id, userPicks]);

  const value = useMemo<PicksContextValue>(() => ({
    userPicks,
    addPick,
    likeUserPick,
    settlePicks,
  }), [addPick, likeUserPick, settlePicks, userPicks]);

  return <PicksContext.Provider value={value}>{children}</PicksContext.Provider>;
}

export function usePicks() {
  const context = useContext(PicksContext);

  if (!context) {
    throw new Error('usePicks must be used inside PicksProvider');
  }

  return context;
}
