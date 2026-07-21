import { Game, Pick } from './types';

type SettledResult = 'win' | 'loss' | 'push';

function getSelectedTeam(game: Game, prediction: string) {
  if (prediction.startsWith(game.homeTeamName)) {
    return {
      selectedTeam: game.homeTeamName,
      selectedScore: game.homeScore,
      opponentScore: game.awayScore,
    };
  }

  if (prediction.startsWith(game.awayTeamName)) {
    return {
      selectedTeam: game.awayTeamName,
      selectedScore: game.awayScore,
      opponentScore: game.homeScore,
    };
  }

  return null;
}

function settleMoneyline(game: Game, pick: Pick): SettledResult | null {
  const team = getSelectedTeam(game, pick.prediction);

  if (!team) {
    return null;
  }

  if (game.homeScore === game.awayScore) {
    return 'push';
  }

  return team.selectedScore > team.opponentScore ? 'win' : 'loss';
}

function settleSpread(game: Game, pick: Pick): SettledResult | null {
  const team = getSelectedTeam(game, pick.prediction);

  if (!team) {
    return null;
  }

  const spreadText = pick.prediction.slice(team.selectedTeam.length).trim();
  const spreadMatch = spreadText.match(/^([+-]?\d+(?:\.\d+)?)/);
  const spread = spreadMatch ? Number(spreadMatch[1]) : NaN;

  if (!Number.isFinite(spread)) {
    return null;
  }

  const adjustedScore = team.selectedScore + spread;

  if (adjustedScore === team.opponentScore) {
    return 'push';
  }

  return adjustedScore > team.opponentScore ? 'win' : 'loss';
}

function settleTotal(game: Game, pick: Pick): SettledResult | null {
  const totalMatch = pick.prediction.match(/^(Over|Under)\s+(\d+(?:\.\d+)?)/i);

  if (!totalMatch) {
    return null;
  }

  const direction = totalMatch[1].toLowerCase();
  const line = Number(totalMatch[2]);
  const gameTotal = game.homeScore + game.awayScore;

  if (!Number.isFinite(line)) {
    return null;
  }

  if (gameTotal === line) {
    return 'push';
  }

  if (direction === 'over') {
    return gameTotal > line ? 'win' : 'loss';
  }

  return gameTotal < line ? 'win' : 'loss';
}

export function settlePickFromGame(pick: Pick, game: Game): SettledResult | null {
  if (pick.result !== 'pending' || game.status !== 'final' || game.hasScoreData === false) {
    return null;
  }

  const market = pick.oddsMarket?.toLowerCase();

  if (market === 'moneyline') {
    return settleMoneyline(game, pick);
  }

  if (market === 'spread') {
    return settleSpread(game, pick);
  }

  if (market === 'total') {
    return settleTotal(game, pick);
  }

  return null;
}
