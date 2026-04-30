import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { mockLeaderboard } from '../lib/mockData';
import { League, LeaderboardEntry } from '../lib/types';
import LeaderboardRow from '../components/LeaderboardRow';
import FilterChips from '../components/FilterChips';

const COLORS = {
  BACKGROUND: '#0f0e17',
  CARD: '#16213e',
  TEXT_PRIMARY: '#e8e8e8',
  TEXT_SECONDARY: '#8892b0',
  ACCENT: '#e94560',
  WARNING: '#fdcb6e',
  BORDER: '#2d2d2d',
};

const FILTER_OPTIONS = ['Overall', 'NFL', 'NBA', 'MLB', 'NHL', 'Soccer'];

export default function LeaderboardScreen() {
  const [filter, setFilter] = useState('Overall');

  // For non-Overall filters, simulate a re-sorted subset
  const filteredEntries: LeaderboardEntry[] = mockLeaderboard
    .filter((entry) => {
      if (filter === 'Overall') return true;
      return entry.analyst.leagues.includes(filter as League);
    })
    .map((entry, idx) => ({ ...entry, rank: idx + 1 }));

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
        <Text style={styles.subtitle}>Top analysts ranked by accuracy</Text>
      </View>

      <FilterChips options={FILTER_OPTIONS} selected={filter} onSelect={setFilter} />

      {/* Top 3 Legend */}
      <View style={styles.legendRow}>
        <Text style={styles.legendItem}>🥇 Gold</Text>
        <Text style={styles.legendItem}>🥈 Silver</Text>
        <Text style={styles.legendItem}>🥉 Bronze</Text>
      </View>

      <FlatList
        data={filteredEntries}
        keyExtractor={(item) => item.analyst.id}
        renderItem={({ item }) => (
          <LeaderboardRow entry={item} isTop3={item.rank <= 3} />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No analysts for this league</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  title: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 13,
    marginTop: 2,
  },
  legendRow: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  legendItem: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 12,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 4,
  },
  empty: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 15,
  },
});
