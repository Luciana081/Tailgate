import AsyncStorage from '@react-native-async-storage/async-storage';
import { Game, LiveGame, OddsBookmaker, SportOption } from './types';

declare const process: {
  env?: {
    EXPO_PUBLIC_ODDS_PROXY_URL?: string;
  };
};

const SPORT_KEYS: Record<string, string[]> = {
  NFL: ['americanfootball_nfl'],
  NBA: ['basketball_nba'],
  MLB: ['baseball_mlb'],
  NHL: ['icehockey_nhl'],
  Soccer: ['soccer_epl', 'soccer_fifa_world_cup'],
  Tennis: ['tennis_atp_italian_open', 'tennis_wta_italian_open'],
};

const FALLBACK_TENNIS_TOURNAMENTS: SportOption[] = [
  {
    key: 'tennis_atp_italian_open',
    group: 'Tennis',
    title: 'ATP Italian Open',
    description: "Men's Singles",
    active: true,
    has_outrights: false,
  },
  {
    key: 'tennis_wta_italian_open',
    group: 'Tennis',
    title: 'WTA Italian Open',
    description: "Women's Singles",
    active: true,
    has_outrights: false,
  },
];

type ScoreResponse = {
  id: string;
  sport_key: string;
  sport_title?: string;
  commence_time: string;
  completed?: boolean;
  home_team: string;
  away_team: string;
  scores?: { name: string; score: string }[] | null;
};

type OddsResponse = {
  id: string;
  sport_key: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers?: OddsBookmaker[];
};

const leagueBySportKey: Record<string, string> = {
  americanfootball_nfl: 'nfl',
  basketball_nba: 'nba',
  baseball_mlb: 'mlb',
  icehockey_nhl: 'nhl',
  soccer_epl: 'soccer',
  soccer_fifa_world_cup: 'world-cup',
  tennis_atp_italian_open: 'tennis',
  tennis_wta_italian_open: 'tennis',
};

const ODDS_CACHE_KEY = 'tailgate:last-known-odds';

function getProxyUrl() {
  return process.env?.EXPO_PUBLIC_ODDS_PROXY_URL?.replace(/\/$/, '') ?? 'http://localhost:8787';
}

function getScore(scores: ScoreResponse['scores'], teamName: string) {
  const score = scores?.find((item) => item.name === teamName)?.score;
  return score ? Number(score) : 0;
}

function getScoreSummary(scores: ScoreResponse['scores'], awayTeam: string, homeTeam: string) {
  if (!scores?.length) {
    return undefined;
  }

  const awayScore = scores.find((item) => item.name === awayTeam)?.score;
  const homeScore = scores.find((item) => item.name === homeTeam)?.score;

  if (!awayScore || !homeScore) {
    return undefined;
  }

  return `${awayScore} - ${homeScore}`;
}

function formatDateTime(value: string) {
  const date = new Date(value);

  return {
    date: date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'America/New_York',
    }),
    time: `${date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'America/New_York',
    })} ET`,
  };
}

function getStatus(event: ScoreResponse) {
  if (event.completed) {
    return 'final' as const;
  }

  const hasScores = Boolean(event.scores?.length);
  const hasStarted = new Date(event.commence_time).getTime() <= Date.now();

  return hasScores || hasStarted ? ('live' as const) : ('upcoming' as const);
}

function formatOutcomePrice(name: string, price?: number, point?: number) {
  const priceText = typeof price === 'number' && price > 0 ? `+${price}` : `${price ?? ''}`;
  const pointText = typeof point === 'number' ? ` ${point > 0 ? '+' : ''}${point}` : '';
  return `${name}${pointText} ${priceText}`.trim();
}

function americanOddsToProbability(price?: number) {
  if (typeof price !== 'number') {
    return undefined;
  }

  return price > 0 ? 100 / (price + 100) : Math.abs(price) / (Math.abs(price) + 100);
}

function getMoneylineProbabilities(bookmakers: OddsBookmaker[] | undefined, homeTeam: string, awayTeam: string) {
  const h2h = bookmakers?.[0]?.markets.find((market) => market.key === 'h2h');
  const homeOutcome = h2h?.outcomes.find((outcome) => outcome.name === homeTeam);
  const awayOutcome = h2h?.outcomes.find((outcome) => outcome.name === awayTeam);
  const homeRaw = americanOddsToProbability(homeOutcome?.price);
  const awayRaw = americanOddsToProbability(awayOutcome?.price);

  if (!homeRaw || !awayRaw) {
    return undefined;
  }

  const total = homeRaw + awayRaw;
  const homeWinProbability = Math.round((homeRaw / total) * 100);

  return {
    homeWinProbability,
    awayWinProbability: 100 - homeWinProbability,
  };
}

async function loadCachedOdds() {
  try {
    const rawCache = await AsyncStorage.getItem(ODDS_CACHE_KEY);
    const parsed = rawCache ? JSON.parse(rawCache) : {};
    return parsed as Record<string, OddsResponse>;
  } catch {
    return {};
  }
}

async function saveCachedOdds(nextOdds: OddsResponse[]) {
  if (!nextOdds.length) {
    return;
  }

  const cachedOdds = await loadCachedOdds();
  const mergedOdds = nextOdds.reduce<Record<string, OddsResponse>>((acc, event) => {
    if (event.bookmakers?.length) {
      acc[event.id] = event;
    }

    return acc;
  }, { ...cachedOdds });

  await AsyncStorage.setItem(ODDS_CACHE_KEY, JSON.stringify(mergedOdds));
}

function summarizeOdds(bookmakers?: OddsBookmaker[]) {
  const bookmaker = bookmakers?.[0];
  const h2h = bookmaker?.markets.find((market) => market.key === 'h2h');
  const spread = bookmaker?.markets.find((market) => market.key === 'spreads');
  const total = bookmaker?.markets.find((market) => market.key === 'totals');

  const moneyline = h2h?.outcomes
    .map((outcome) => formatOutcomePrice(outcome.name, outcome.price))
    .join(' | ');

  const spreadText = spread?.outcomes
    .map((outcome) => formatOutcomePrice(outcome.name, outcome.price, outcome.point))
    .join(' | ');

  const totalText = total?.outcomes
    .map((outcome) => formatOutcomePrice(outcome.name, outcome.price, outcome.point))
    .join(' | ');

  return {
    bookmaker: bookmaker?.title,
    moneyline,
    spread: spreadText,
    total: totalText,
    odds: moneyline ?? spreadText ?? totalText ?? 'Odds unavailable',
  };
}

function toLiveGame(score: ScoreResponse, odds?: OddsResponse): LiveGame {
  const { date, time } = formatDateTime(score.commence_time);
  const oddsSummary = summarizeOdds(odds?.bookmakers);
  const probabilities = getMoneylineProbabilities(
    odds?.bookmakers,
    score.home_team,
    score.away_team,
  );
  const hasOdds = Boolean(oddsSummary.moneyline || oddsSummary.spread || oddsSummary.total);
  const hasMoneylineProbabilities = Boolean(probabilities);
  const scoreSummary = getScoreSummary(score.scores, score.away_team, score.home_team);
  const hasScoreData = Boolean(scoreSummary);

  return {
    id: score.id,
    leagueId: leagueBySportKey[score.sport_key] ?? score.sport_key,
    homeTeamId: score.home_team,
    awayTeamId: score.away_team,
    homeTeamName: score.home_team,
    awayTeamName: score.away_team,
    homeTeamRecord: 'Live data',
    awayTeamRecord: 'Live data',
    homeScore: getScore(score.scores, score.home_team),
    awayScore: getScore(score.scores, score.away_team),
    status: getStatus(score),
    date,
    time,
    homeWinProbability: probabilities?.homeWinProbability ?? 0,
    awayWinProbability: probabilities?.awayWinProbability ?? 0,
    showProbability: hasMoneylineProbabilities,
    recentFormHome: [],
    recentFormAway: [],
    keyTrend: oddsSummary.bookmaker
      ? `Market snapshot from ${oddsSummary.bookmaker}`
      : 'Live score data from The Odds API',
    source: 'live',
    sportKey: score.sport_key,
    commenceTime: score.commence_time,
    completed: score.completed,
    bookmakers: odds?.bookmakers,
    oddsLastUpdated: odds?.bookmakers?.[0]?.lastUpdate ?? odds?.bookmakers?.[0]?.last_update,
    sportTitle: score.sport_title,
    hasScoreData,
    scoreSummary,
    ...oddsSummary,
    odds: hasOdds ? oddsSummary.odds : '',
  };
}

async function fetchJson<T>(path: string): Promise<T> {
  const proxyUrl = getProxyUrl();

  if (!proxyUrl) {
    throw new Error('Missing EXPO_PUBLIC_ODDS_PROXY_URL');
  }

  const response = await fetch(`${proxyUrl}${path}`);
  const body = await response.json();

  if (!response.ok) {
    throw new Error(body?.error ?? 'Unable to load live sports data');
  }

  return body;
}

async function fetchSportGames(sportKey: string): Promise<Game[]> {
  const query = `sport=${encodeURIComponent(sportKey)}`;
  const [scores, odds] = await Promise.all([
    fetchJson<ScoreResponse[]>(`/api/scores?${query}`),
    fetchJson<OddsResponse[]>(`/api/odds?${query}`),
  ]);
  await saveCachedOdds(odds);
  const cachedOdds = await loadCachedOdds();
  const oddsById = new Map([
    ...Object.values(cachedOdds).map((event) => [event.id, event] as const),
    ...odds.map((event) => [event.id, event] as const),
  ]);

  return scores.map((score) => toLiveGame(score, oddsById.get(score.id)));
}

export async function fetchTennisTournaments(): Promise<SportOption[]> {
  try {
    const sports = await fetchJson<SportOption[]>('/api/sports');
    const tennisSports = sports
      .filter((sport) => sport.group === 'Tennis' && sport.active && !sport.has_outrights)
      .sort((a, b) => a.title.localeCompare(b.title));

    return tennisSports.length ? tennisSports : FALLBACK_TENNIS_TOURNAMENTS;
  } catch {
    return FALLBACK_TENNIS_TOURNAMENTS;
  }
}

export function fetchSoccerTournaments(): SportOption[] {
  return [
    {
      key: 'soccer_epl',
      group: 'Soccer',
      title: 'Premier League',
      description: 'English Premier League',
      active: true,
      has_outrights: false,
    },
    {
      key: 'soccer_fifa_world_cup',
      group: 'Soccer',
      title: 'FIFA World Cup',
      description: 'FIFA World Cup 2026',
      active: true,
      has_outrights: false,
    },
  ];
}

export async function fetchLiveGames(selectedLeague: string, selectedSportKey?: string): Promise<Game[]> {
  const sportKeys =
    selectedSportKey
      ? [selectedSportKey]
      : selectedLeague === 'All'
        ? Object.values(SPORT_KEYS).flat()
        : SPORT_KEYS[selectedLeague]
          ? SPORT_KEYS[selectedLeague]
          : [];

  if (!sportKeys.length) {
    return [];
  }

  const gamesByLeague = await Promise.all(sportKeys.map(fetchSportGames));
  return gamesByLeague.flat().sort((a, b) => {
    const aTime = new Date((a as LiveGame).commenceTime ?? `${a.date} ${a.time}`).getTime();
    const bTime = new Date((b as LiveGame).commenceTime ?? `${b.date} ${b.time}`).getTime();
    return aTime - bTime;
  });
}
