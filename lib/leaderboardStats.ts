import { LeaderboardEntry, Pick } from './types';

const resultToPerformance: Record<Pick['result'], 'W' | 'L' | 'D'> = {
  win: 'W',
  loss: 'L',
  push: 'D',
  pending: 'D',
};

function calculateStreak(picks: Pick[]) {
  let streak = 0;

  for (const pick of picks) {
    if (pick.result === 'push' || pick.result === 'pending') {
      continue;
    }

    if (pick.result === 'win') {
      if (streak < 0) break;
      streak += 1;
      continue;
    }

    if (streak > 0) break;
    streak -= 1;
  }

  return streak;
}

export function buildLeaderboardFromPicks(picks: Pick[], selectedLeague: string): LeaderboardEntry[] {
  const eligiblePicks = picks
    .filter((pick) => pick.result !== 'pending')
    .filter((pick) => selectedLeague === 'Overall' || pick.leagueId === selectedLeague)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const grouped = eligiblePicks.reduce<Record<string, Pick[]>>((acc, pick) => {
    acc[pick.analystId] = acc[pick.analystId] ?? [];
    acc[pick.analystId].push(pick);
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([analystId, analystPicks]) => {
      const gradedPicks = analystPicks.filter((pick) => pick.result === 'win' || pick.result === 'loss');
      const wins = gradedPicks.filter((pick) => pick.result === 'win').length;
      const accuracy = gradedPicks.length ? Math.round((wins / gradedPicks.length) * 100) : 0;

      return {
        rank: 0,
        previousRank: 0,
        analystId,
        analystName: analystPicks[0]?.analystName ?? `User ${analystId.slice(0, 8)}`,
        accuracy,
        totalPicks: analystPicks.length,
        followers: 0,
        recentPerformance: analystPicks.slice(0, 5).map((pick) => resultToPerformance[pick.result]),
        streak: calculateStreak(analystPicks),
      };
    })
    .filter((entry) => entry.totalPicks > 0)
    .sort((a, b) => b.accuracy - a.accuracy || b.totalPicks - a.totalPicks)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
      previousRank: index + 1,
    }));
}
