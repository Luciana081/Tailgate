import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FilterChips from '../components/FilterChips';
import LeaderboardRow from '../components/LeaderboardRow';
import { leaderboard as mockLeaderboard, analysts } from '../lib/mockData';
import { LeaderboardEntry } from '../lib/types';

const filterOptions = ['Overall', 'NFL', 'NBA', 'MLB', 'NHL', 'Soccer'];

export default function LeaderboardScreen() {
  const [selected, setSelected] = useState('Overall');

  const filteredEntries: LeaderboardEntry[] = (
    selected === 'Overall'
      ? mockLeaderboard
      : mockLeaderboard.filter((entry) => {
          const analyst = analysts.find((a) => a.id === entry.analystId);
          return analyst?.favoriteLeagues.includes(selected);
        })
  )
    .slice()
    .sort((a, b) => b.accuracy - a.accuracy)
    .map((entry, index) => {
      const newRank = index + 1;
      return {
        ...entry,
        rank: newRank,
        // In filtered views we have no historical rank data, so suppress movement arrows
        previousRank: selected === 'Overall' ? entry.previousRank : newRank,
      };
    });

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>🏆 Leaderboard</Text>
      </View>
      <FilterChips options={filterOptions} selected={selected} onSelect={setSelected} />
      <FlatList
        data={filteredEntries}
        keyExtractor={(item) => item.analystId}
        renderItem={({ item }) => <LeaderboardRow entry={item} />}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1a1a2e' },
  header: { paddingHorizontal: 20, paddingTop: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#ffffff' },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
});
