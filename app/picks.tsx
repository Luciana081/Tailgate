import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FilterChips from '../components/FilterChips';
import PickCard from '../components/PickCard';
import { picks as mockPicks, leagues } from '../lib/mockData';
import { Pick } from '../lib/types';

const filterOptions = ['All', 'NFL', 'NBA', 'MLB', 'NHL', 'Soccer'];

export default function PicksScreen() {
  const [selected, setSelected] = useState('All');
  const [localPicks, setLocalPicks] = useState<Pick[]>(mockPicks);

  const filteredPicks = selected === 'All'
    ? localPicks
    : localPicks.filter((p) => {
        const league = leagues.find((l) => l.id === p.leagueId);
        return league?.shortName === selected;
      });

  const handleLike = (id: string) => {
    setLocalPicks((prev) =>
      prev.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p))
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>⭐ Picks & Insights</Text>
      </View>
      <FilterChips options={filterOptions} selected={selected} onSelect={setSelected} />
      <FlatList
        data={filteredPicks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PickCard pick={item} onLike={handleLike} />}
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
