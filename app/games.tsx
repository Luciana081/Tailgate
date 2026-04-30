import React, { useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { mockGames } from '../lib/mockData';
import { Game, League } from '../lib/types';
import GameCard from '../components/GameCard';
import FilterChips from '../components/FilterChips';

const COLORS = {
  BACKGROUND: '#0f0e17',
  TEXT_PRIMARY: '#e8e8e8',
  TEXT_SECONDARY: '#8892b0',
  ACCENT: '#e94560',
};

const LEAGUE_FILTERS = ['All', 'NFL', 'NBA', 'MLB', 'NHL', 'Soccer'];

export default function GamesScreen() {
  const [selectedLeague, setSelectedLeague] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  const filteredGames: Game[] =
    selectedLeague === 'All'
      ? mockGames
      : mockGames.filter((g) => g.league === (selectedLeague as League));

  function handleRefresh() {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.title}>Games</Text>
        <Text style={styles.subtitle}>{filteredGames.length} games</Text>
      </View>

      <FilterChips
        options={LEAGUE_FILTERS}
        selected={selectedLeague}
        onSelect={setSelectedLeague}
      />

      <FlatList
        data={filteredGames}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <GameCard game={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.ACCENT}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No games found</Text>
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
