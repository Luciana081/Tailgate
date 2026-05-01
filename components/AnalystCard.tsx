import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Analyst } from '../lib/types';

interface Props {
  analyst: Analyst;
  onFollowToggle: (id: string) => void;
}

export default function AnalystCard({ analyst, onFollowToggle }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{analyst.name.charAt(0)}</Text>
        </View>
        <View style={styles.nameBlock}>
          <Text style={styles.name}>{analyst.name}</Text>
          <Text style={styles.bio} numberOfLines={2}>{analyst.bio}</Text>
        </View>
        <TouchableOpacity
          style={[styles.followBtn, analyst.isFollowing && styles.followingBtn]}
          onPress={() => onFollowToggle(analyst.id)}
        >
          <Text style={[styles.followText, analyst.isFollowing && styles.followingText]}>
            {analyst.isFollowing ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{analyst.winRate}%</Text>
          <Text style={styles.statLabel}>Win Rate</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{analyst.totalPicks}</Text>
          <Text style={styles.statLabel}>Picks</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{(analyst.followers / 1000).toFixed(1)}k</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{analyst.performanceScore}</Text>
          <Text style={styles.statLabel}>Score</Text>
        </View>
      </View>

      <View style={styles.leaguesRow}>
        {analyst.favoriteLeagues.map((l) => (
          <View key={l} style={styles.leagueBadge}>
            <Text style={styles.leagueBadgeText}>{l}</Text>
          </View>
        ))}
      </View>
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
    width: 280,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#6c63ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  nameBlock: {
    flex: 1,
  },
  name: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  bio: {
    color: '#a0a0a0',
    fontSize: 11,
    lineHeight: 16,
  },
  followBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#6c63ff',
    marginLeft: 8,
  },
  followingBtn: {
    backgroundColor: '#6c63ff',
  },
  followText: {
    color: '#6c63ff',
    fontSize: 12,
    fontWeight: '600',
  },
  followingText: {
    color: '#fff',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  stat: { alignItems: 'center' },
  statValue: { color: '#ffffff', fontSize: 14, fontWeight: 'bold' },
  statLabel: { color: '#a0a0a0', fontSize: 10, marginTop: 1 },
  leaguesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  leagueBadge: {
    backgroundColor: '#0f3460',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 6,
    marginBottom: 4,
  },
  leagueBadgeText: {
    color: '#6c63ff',
    fontSize: 10,
    fontWeight: '600',
  },
});
