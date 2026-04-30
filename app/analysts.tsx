import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { mockAnalysts } from '../lib/mockData';
import { Analyst, League } from '../lib/types';
import AnalystCard from '../components/AnalystCard';
import FilterChips from '../components/FilterChips';

const COLORS = {
  BACKGROUND: '#0f0e17',
  CARD: '#16213e',
  TEXT_PRIMARY: '#e8e8e8',
  TEXT_SECONDARY: '#8892b0',
  ACCENT: '#e94560',
  BORDER: '#2d2d2d',
};

const LEAGUE_FILTERS = ['All', 'NFL', 'NBA', 'MLB', 'NHL', 'Soccer'];

export default function AnalystsScreen() {
  const [search, setSearch] = useState('');
  const [selectedLeague, setSelectedLeague] = useState('All');
  const [analysts, setAnalysts] = useState<Analyst[]>(mockAnalysts);

  const filtered = analysts.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.bio.toLowerCase().includes(search.toLowerCase());
    const matchesLeague =
      selectedLeague === 'All' || a.leagues.includes(selectedLeague as League);
    return matchesSearch && matchesLeague;
  });

  function handleFollowToggle(id: string) {
    setAnalysts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isFollowing: !a.isFollowing } : a))
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.title}>Analysts</Text>
        <Text style={styles.subtitle}>{filtered.length} analysts</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={COLORS.TEXT_SECONDARY} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search analysts..."
          placeholderTextColor={COLORS.TEXT_SECONDARY}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FilterChips
        options={LEAGUE_FILTERS}
        selected={selectedLeague}
        onSelect={setSelectedLeague}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AnalystCard analyst={item} onFollowToggle={handleFollowToggle} />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No analysts found</Text>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.CARD,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 42,
    color: COLORS.TEXT_PRIMARY,
    fontSize: 14,
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
