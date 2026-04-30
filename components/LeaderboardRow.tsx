import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LeaderboardEntry } from '../lib/types';

const COLORS = {
  CARD: '#16213e',
  TEXT_PRIMARY: '#e8e8e8',
  TEXT_SECONDARY: '#8892b0',
  ACCENT: '#e94560',
  SUCCESS: '#00b894',
  WARNING: '#fdcb6e',
  BORDER: '#2d2d2d',
  SECONDARY: '#0f3460',
};

const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  isTop3?: boolean;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export default function LeaderboardRow({ entry, isTop3 }: LeaderboardRowProps) {
  const rankColor = isTop3 ? RANK_COLORS[(entry.rank - 1) % 3] : COLORS.TEXT_SECONDARY;
  const movement = entry.previousRank - entry.rank;
  const movementColor = movement > 0 ? COLORS.SUCCESS : movement < 0 ? COLORS.ACCENT : COLORS.TEXT_SECONDARY;
  const movementSymbol = movement > 0 ? '▲' : movement < 0 ? '▼' : '—';

  return (
    <View style={[styles.row, isTop3 && styles.rowTop3]}>
      {/* Rank */}
      <View style={styles.rankSection}>
        <Text style={[styles.rank, { color: rankColor }]}>{entry.rank}</Text>
        <Text style={[styles.movement, { color: movementColor }]}>{movementSymbol}</Text>
      </View>

      {/* Avatar */}
      <View style={[styles.avatar, isTop3 && { borderColor: rankColor }]}>
        <Text style={[styles.avatarText, isTop3 && { color: rankColor }]}>
          {getInitials(entry.analyst.name)}
        </Text>
      </View>

      {/* Name & Record */}
      <View style={styles.nameSection}>
        <Text style={styles.name} numberOfLines={1}>{entry.analyst.name}</Text>
        <Text style={styles.record}>{entry.recentRecord} recent</Text>
        <View style={styles.badgesRow}>
          {entry.analyst.badges.slice(0, 2).map((badge) => (
            <Text key={badge} style={styles.badge}>{badge}</Text>
          ))}
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsSection}>
        <Text style={[styles.accuracy, { color: isTop3 ? rankColor : COLORS.SUCCESS }]}>
          {(entry.accuracy * 100).toFixed(1)}%
        </Text>
        <Text style={styles.statSub}>{entry.totalPicks} picks</Text>
        <Text style={styles.statSub}>{formatNumber(entry.followers)} followers</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.CARD,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    gap: 12,
  },
  rowTop3: {
    borderColor: COLORS.WARNING + '44',
    backgroundColor: COLORS.CARD,
  },
  rankSection: {
    width: 28,
    alignItems: 'center',
  },
  rank: {
    fontSize: 18,
    fontWeight: '800',
  },
  movement: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.ACCENT + '22',
    borderWidth: 2,
    borderColor: COLORS.ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.ACCENT,
    fontSize: 14,
    fontWeight: '800',
  },
  nameSection: {
    flex: 1,
  },
  name: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  record: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 11,
    marginBottom: 4,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  badge: {
    fontSize: 10,
    color: COLORS.TEXT_SECONDARY,
  },
  statsSection: {
    alignItems: 'flex-end',
  },
  accuracy: {
    fontSize: 16,
    fontWeight: '800',
  },
  statSub: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 10,
    marginTop: 2,
  },
});
