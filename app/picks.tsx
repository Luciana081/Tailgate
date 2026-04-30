import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { mockPicks } from '../lib/mockData';
import { League, Pick } from '../lib/types';
import PickCard from '../components/PickCard';
import FilterChips from '../components/FilterChips';

const COLORS = {
  BACKGROUND: '#0f0e17',
  TEXT_PRIMARY: '#e8e8e8',
  TEXT_SECONDARY: '#8892b0',
  ACCENT: '#e94560',
};

const RESULT_FILTERS = ['All', 'pending', 'win', 'loss', 'push'];
const LEAGUE_FILTERS = ['All', 'NFL', 'NBA', 'MLB', 'NHL', 'Soccer'];

export default function PicksScreen() {
  const [resultFilter, setResultFilter] = useState('All');
  const [leagueFilter, setLeagueFilter] = useState('All');
  const [picks, setPicks] = useState<Pick[]>(mockPicks);

  const filtered = picks.filter((p) => {
    const matchesResult = resultFilter === 'All' || p.result === resultFilter;
    const matchesLeague = leagueFilter === 'All' || p.league === (leagueFilter as League);
    return matchesResult && matchesLeague;
  });

  function handleLike(id: string) {
    setPicks((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.title}>Picks</Text>
        <Text style={styles.subtitle}>{filtered.length} picks</Text>
      </View>

      <FilterChips
        options={RESULT_FILTERS}
        selected={resultFilter}
        onSelect={setResultFilter}
      />
      <FilterChips
        options={LEAGUE_FILTERS}
        selected={leagueFilter}
        onSelect={setLeagueFilter}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PickCard pick={item} onLike={handleLike} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No picks match your filters</Text>
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
