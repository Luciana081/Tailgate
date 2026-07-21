import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FilterChips from '../components/FilterChips';
import PickCard from '../components/PickCard';
import { picks as mockPicks, leagues } from '../lib/mockData';
import { Pick } from '../lib/types';
import { usePicks } from '../lib/PicksContext';

const filterOptions = ['All', 'NFL', 'NBA', 'MLB', 'NHL', 'Soccer', 'Tennis'];
const sourceOptions = ['My Picks', 'Community Picks'];
const resultOptions = ['All', 'Pending', 'Final', 'Win', 'Loss', 'Push'];

export default function PicksScreen() {
  const [selected, setSelected] = useState('All');
  const [selectedSource, setSelectedSource] = useState('My Picks');
  const [selectedResult, setSelectedResult] = useState('All');
  const [localMockPicks, setLocalMockPicks] = useState<Pick[]>(mockPicks);
  const { userPicks, likeUserPick } = usePicks();
  const visibleSourcePicks = selectedSource === 'My Picks' ? userPicks : localMockPicks;

  const filteredPicks = visibleSourcePicks.filter((pick) => {
    const matchesSport = selected === 'All' || (() => {
      const league = leagues.find((l) => l.id === pick.leagueId);
      return league?.shortName === selected;
    })();
    const matchesResult =
      selectedResult === 'All' ||
      (selectedResult === 'Final' && pick.result !== 'pending') ||
      pick.result === selectedResult.toLowerCase();

    return matchesSport && matchesResult;
  });

  const pendingCount = visibleSourcePicks.filter((pick) => pick.result === 'pending').length;
  const finalCount = visibleSourcePicks.length - pendingCount;

  const handleLike = (id: string) => {
    if (userPicks.some((pick) => pick.id === id)) {
      likeUserPick(id);
      return;
    }

    setLocalMockPicks((prev) =>
      prev.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p))
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>⭐ Picks & Insights</Text>
        <Text style={styles.subtitle}>
          {selectedSource === 'My Picks'
            ? userPicks.length
              ? `${userPicks.length} tracked pick${userPicks.length === 1 ? '' : 's'} from your account`
              : 'Create a tracked pick from the Games tab'
            : 'Browse analyst and community picks'}
        </Text>
      </View>
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>View</Text>
        <FilterChips options={sourceOptions} selected={selectedSource} onSelect={setSelectedSource} />
      </View>
      <FilterChips options={filterOptions} selected={selected} onSelect={setSelected} />
      <View style={styles.filterGroup}>
        <View style={styles.resultHeader}>
          <Text style={styles.filterLabel}>Result</Text>
          <Text style={styles.resultSummary}>{pendingCount} pending | {finalCount} final</Text>
        </View>
        <FilterChips options={resultOptions} selected={selectedResult} onSelect={setSelectedResult} />
      </View>
      <FlatList
        data={filteredPicks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PickCard pick={item} onLike={handleLike} />}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No picks found</Text>
            <Text style={styles.emptyText}>Try changing the view, sport, or result filter.</Text>
          </View>
        }
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1a1a2e' },
  header: { paddingHorizontal: 20, paddingTop: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#ffffff' },
  subtitle: { color: '#a0a0a0', fontSize: 13, marginTop: 6 },
  filterGroup: { marginTop: 4 },
  filterLabel: {
    color: '#7f86a3',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: -6,
    marginLeft: 20,
    textTransform: 'uppercase',
  },
  resultHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 20,
  },
  resultSummary: {
    color: '#a0a0a0',
    fontSize: 11,
    fontWeight: '700',
  },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  emptyBox: {
    backgroundColor: '#16213e',
    borderColor: '#0f3460',
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  emptyText: {
    color: '#a0a0a0',
    fontSize: 13,
    lineHeight: 18,
  },
});
