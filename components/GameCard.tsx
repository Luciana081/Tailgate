import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Game } from '../lib/types';
import { leagues } from '../lib/mockData';

interface Props {
  game: Game;
}

export default function GameCard({ game }: Props) {
  const league = leagues.find((l) => l.id === game.leagueId);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.leagueBadge}>
          {league?.emoji ?? '🏅'} {league?.shortName ?? game.leagueId.toUpperCase()}
        </Text>
        <View style={[styles.statusBadge, game.status === 'live' ? styles.statusLive : game.status === 'final' ? styles.statusFinal : styles.statusUpcoming]}>
          <Text style={styles.statusText}>{game.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.teams}>
        <View style={styles.teamBlock}>
          <Text style={styles.teamName}>{game.awayTeamName}</Text>
          <Text style={styles.record}>{game.awayTeamRecord}</Text>
          {game.status !== 'upcoming' && <Text style={styles.score}>{game.awayScore}</Text>}
        </View>
        <View style={styles.vsSep}>
          <Text style={styles.vsText}>{game.status === 'upcoming' ? 'vs' : '-'}</Text>
          {game.status === 'upcoming' && <Text style={styles.timeText}>{game.time}</Text>}
        </View>
        <View style={styles.teamBlock}>
          <Text style={styles.teamName}>{game.homeTeamName}</Text>
          <Text style={styles.record}>{game.homeTeamRecord}</Text>
          {game.status !== 'upcoming' && <Text style={styles.score}>{game.homeScore}</Text>}
        </View>
      </View>

      <View style={styles.probRow}>
        <Text style={styles.probLabel}>{game.awayWinProbability}%</Text>
        <View style={styles.probBar}>
          <View style={[styles.probAway, { flex: game.awayWinProbability }]} />
          <View style={[styles.probHome, { flex: game.homeWinProbability }]} />
        </View>
        <Text style={styles.probLabel}>{game.homeWinProbability}%</Text>
      </View>

      <View style={styles.formRow}>
        <View style={styles.formGroup}>
          {game.recentFormAway.map((r, i) => (
            <View key={i} style={[styles.dot, r === 'W' ? styles.dotWin : styles.dotLoss]} />
          ))}
        </View>
        <View style={styles.formGroup}>
          {game.recentFormHome.map((r, i) => (
            <View key={i} style={[styles.dot, r === 'W' ? styles.dotWin : styles.dotLoss]} />
          ))}
        </View>
      </View>

      <Text style={styles.trend}>📊 {game.keyTrend}</Text>
      <Text style={styles.odds}>Odds: {game.odds}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#16213e',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    marginRight: 12,
    width: 300,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  leagueBadge: {
    color: '#a0a0a0',
    fontSize: 13,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusLive: { backgroundColor: '#ff4444' },
  statusFinal: { backgroundColor: '#333' },
  statusUpcoming: { backgroundColor: '#0f3460' },
  statusText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  teams: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  teamBlock: {
    flex: 1,
    alignItems: 'center',
  },
  teamName: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  record: {
    color: '#a0a0a0',
    fontSize: 11,
    marginTop: 2,
  },
  score: {
    color: '#6c63ff',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 4,
  },
  vsSep: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  vsText: {
    color: '#666',
    fontSize: 14,
    fontWeight: 'bold',
  },
  timeText: {
    color: '#a0a0a0',
    fontSize: 10,
    marginTop: 2,
  },
  probRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  probLabel: {
    color: '#a0a0a0',
    fontSize: 11,
    width: 32,
    textAlign: 'center',
  },
  probBar: {
    flex: 1,
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginHorizontal: 4,
  },
  probAway: { backgroundColor: '#e74c3c' },
  probHome: { backgroundColor: '#2ecc71' },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  formGroup: {
    flexDirection: 'row',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 3,
  },
  dotWin: { backgroundColor: '#2ecc71' },
  dotLoss: { backgroundColor: '#e74c3c' },
  trend: {
    color: '#a0a0a0',
    fontSize: 11,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  odds: {
    color: '#6c63ff',
    fontSize: 12,
    fontWeight: '600',
  },
});
