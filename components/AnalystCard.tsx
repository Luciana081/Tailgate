import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Analyst } from '../lib/types';

const COLORS = {
  CARD: '#16213e',
  TEXT_PRIMARY: '#e8e8e8',
  TEXT_SECONDARY: '#8892b0',
  ACCENT: '#e94560',
  SUCCESS: '#00b894',
  BORDER: '#2d2d2d',
  SECONDARY: '#0f3460',
};

const LEAGUE_COLORS: Record<string, string> = {
  NFL: '#e94560',
  NBA: '#f39c12',
  MLB: '#3498db',
  NHL: '#1abc9c',
  Soccer: '#2ecc71',
};

interface AnalystCardProps {
  analyst: Analyst;
  onFollowToggle: (id: string) => void;
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

export default function AnalystCard({ analyst, onFollowToggle }: AnalystCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        {/* Avatar */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(analyst.name)}</Text>
        </View>

        {/* Info */}
        <View style={styles.infoSection}>
          <Text style={styles.name}>{analyst.name}</Text>
          <Text style={styles.bio} numberOfLines={2}>{analyst.bio}</Text>
          {/* Leagues */}
          <View style={styles.leaguesRow}>
            {analyst.leagues.map((league) => (
              <View
                key={league}
                style={[styles.leaguePill, { backgroundColor: (LEAGUE_COLORS[league] ?? COLORS.ACCENT) + '22' }]}
              >
                <Text style={[styles.leaguePillText, { color: LEAGUE_COLORS[league] ?? COLORS.ACCENT }]}>
                  {league}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Follow Button */}
        <TouchableOpacity
          style={[styles.followBtn, analyst.isFollowing && styles.followingBtn]}
          onPress={() => onFollowToggle(analyst.id)}
          activeOpacity={0.7}
        >
          <Text style={[styles.followBtnText, analyst.isFollowing && styles.followingBtnText]}>
            {analyst.isFollowing ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{(analyst.winRate * 100).toFixed(1)}%</Text>
          <Text style={styles.statLabel}>Win Rate</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{analyst.totalPicks}</Text>
          <Text style={styles.statLabel}>Total Picks</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatNumber(analyst.followers)}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: COLORS.SUCCESS }]}>{analyst.recentRecord}</Text>
          <Text style={styles.statLabel}>Recent</Text>
        </View>
      </View>

      {/* Badges */}
      {analyst.badges.length > 0 && (
        <View style={styles.badgesRow}>
          {analyst.badges.map((badge) => (
            <Text key={badge} style={styles.badge}>{badge}</Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.CARD,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
    gap: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.ACCENT + '33',
    borderWidth: 2,
    borderColor: COLORS.ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.ACCENT,
    fontSize: 16,
    fontWeight: '800',
  },
  infoSection: {
    flex: 1,
  },
  name: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  bio: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 6,
  },
  leaguesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  leaguePill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  leaguePillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  followBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.ACCENT,
    alignSelf: 'flex-start',
  },
  followingBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.ACCENT,
  },
  followBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  followingBtnText: {
    color: COLORS.ACCENT,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.SECONDARY + '44',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: '700',
  },
  statLabel: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 10,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.BORDER,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    fontSize: 12,
    backgroundColor: COLORS.SECONDARY + '44',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: 'hidden',
    color: COLORS.TEXT_SECONDARY,
  },
});
