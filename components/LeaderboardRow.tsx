import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LeaderboardEntry } from '../lib/types';

interface Props {
  entry: LeaderboardEntry;
}

export default function LeaderboardRow({ entry }: Props) {
  const movement = entry.previousRank - entry.rank;
  const movementIcon = movement > 0 ? '▲' : movement < 0 ? '▼' : '—';
  const movementColor = movement > 0 ? '#2ecc71' : movement < 0 ? '#e74c3c' : '#666';

  return (
    <View style={styles.row}>
      <Text style={styles.rankNum}>{entry.rank}</Text>
      <Text style={[styles.movement, { color: movementColor }]}>{movementIcon}</Text>
      <View style={styles.info}>
        <Text style={styles.name}>{entry.analystName}</Text>
        <View style={styles.perfRow}>
          {entry.recentPerformance.map((p, i) => (
            <View key={i} style={[styles.dot, p === 'W' ? styles.dotWin : p === 'D' ? styles.dotDraw : styles.dotLoss]} />
          ))}
        </View>
      </View>
      <View style={styles.stats}>
        <Text style={styles.accuracy}>{entry.accuracy}%</Text>
        <Text style={styles.subStat}>{entry.totalPicks} picks</Text>
        <Text style={styles.subStat}>{(entry.followers / 1000).toFixed(1)}k followers</Text>
      </View>
      <View style={[styles.streakBadge, entry.streak > 0 ? styles.streakPos : styles.streakNeg]}>
        <Text style={styles.streakText}>{entry.streak > 0 ? `+${entry.streak}` : entry.streak}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  rankNum: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    width: 30,
    textAlign: 'center',
  },
  movement: {
    fontSize: 12,
    width: 18,
    textAlign: 'center',
    marginLeft: 4,
  },
  info: {
    flex: 1,
    marginLeft: 10,
  },
  name: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  perfRow: { flexDirection: 'row' },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 2,
  },
  dotWin: { backgroundColor: '#2ecc71' },
  dotLoss: { backgroundColor: '#e74c3c' },
  dotDraw: { backgroundColor: '#e67e22' },
  stats: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  accuracy: {
    color: '#6c63ff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  subStat: {
    color: '#a0a0a0',
    fontSize: 10,
    marginTop: 1,
  },
  streakBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  streakPos: { backgroundColor: '#1a4731' },
  streakNeg: { backgroundColor: '#4a1a1a' },
  streakText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
