import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FilterChips from '../components/FilterChips';
import GameCard from '../components/GameCard';
import { games, leagues } from '../lib/mockData';
import { Game } from '../lib/types';

const filterOptions = ['All', 'NFL', 'NBA', 'MLB', 'NHL', 'Soccer'];

export default function GamesScreen() {
  const [selected, setSelected] = useState('All');

  const filteredGames = selected === 'All'
    ? games
    : games.filter((g) => {
        const league = leagues.find((l) => l.id === g.leagueId);
        return league?.shortName === selected;
      });

  const handleGamePress = (game: Game) => {
    Alert.alert(
      `${game.awayTeamName} vs ${game.homeTeamName}`,
      `Status: ${game.status.toUpperCase()}\nDate: ${game.date} ${game.time}\nOdds: ${game.odds}\n${game.keyTrend}`,
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>🏈 Games</Text>
      </View>
      <FilterChips options={filterOptions} selected={selected} onSelect={setSelected} />
      <FlatList
        data={filteredGames}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleGamePress(item)} style={styles.cardWrapper}>
            <GameCard game={item} />
          </TouchableOpacity>
        )}
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
  cardWrapper: { width: '100%' },
});
