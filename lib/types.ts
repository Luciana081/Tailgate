export type League = 'NFL' | 'NBA' | 'MLB' | 'NHL' | 'Soccer';

export interface Team {
  id: string;
  name: string;
  abbreviation: string;
  league: League;
  record?: string;
  color: string;
}

export interface Game {
  id: string;
  league: League;
  homeTeam: Team;
  awayTeam: Team;
  date: string;
  time?: string;
  homeScore?: number;
  awayScore?: number;
  status: 'upcoming' | 'live' | 'final';
  homeWinProbability: number;
  homeRecentForm: string;
  awayRecentForm: string;
  keyTrend: string;
  venue?: string;
}

export interface Analyst {
  id: string;
  name: string;
  bio: string;
  leagues: League[];
  followers: number;
  totalPicks: number;
  winRate: number;
  performanceScore: number;
  recentRecord: string;
  badges: string[];
  isFollowing?: boolean;
}

export interface Pick {
  id: string;
  analystId: string;
  analystName: string;
  league: League;
  game: string;
  pick: string;
  confidence: number;
  reasoning: string;
  result: 'pending' | 'win' | 'loss' | 'push';
  likes: number;
  comments: number;
  timestamp: string;
  isLiked?: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  previousRank: number;
  analyst: Analyst;
  accuracy: number;
  totalPicks: number;
  recentRecord: string;
  followers: number;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  topic: string;
  content: string;
  league: League | 'General';
  timestamp: string;
  commentCount: number;
  likes: number;
}

export type LeaderboardFilter = 'Overall' | League;
