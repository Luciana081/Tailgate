export interface League {
  id: string;
  name: string;
  shortName: string;
  color: string;
  emoji: string;
}

export interface Team {
  id: string;
  leagueId: string;
  name: string;
  shortName: string;
  record: string;
  emoji: string;
}

export interface Game {
  id: string;
  leagueId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  homeTeamRecord: string;
  awayTeamRecord: string;
  homeScore: number;
  awayScore: number;
  status: 'upcoming' | 'live' | 'final';
  date: string;
  time: string;
  homeWinProbability: number;
  awayWinProbability: number;
  recentFormHome: string[];
  recentFormAway: string[];
  keyTrend: string;
  odds: string;
}

export interface Analyst {
  id: string;
  name: string;
  bio: string;
  favoriteLeagues: string[];
  followers: number;
  totalPicks: number;
  winRate: number;
  performanceScore: number;
  isFollowing: boolean;
}

export interface Pick {
  id: string;
  analystId: string;
  analystName: string;
  leagueId: string;
  gameId: string;
  gameDescription: string;
  prediction: string;
  confidence: number;
  reasoning: string;
  result: 'pending' | 'win' | 'loss' | 'push';
  likes: number;
  comments: number;
  createdAt: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  topic: string;
  leagueId: string;
  content: string;
  timestamp: string;
  commentCount: number;
  likes: number;
}

export interface LeaderboardEntry {
  rank: number;
  previousRank: number;
  analystId: string;
  analystName: string;
  accuracy: number;
  totalPicks: number;
  followers: number;
  recentPerformance: string[];
  streak: number;
}
