import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FilterChips from '../components/FilterChips';
import LeaderboardRow from '../components/LeaderboardRow';
import { fetchAllUserPicks } from '../lib/adminData';
import { buildLeaderboardFromPicks } from '../lib/leaderboardStats';
import { Pick } from '../lib/types';

const filterOptions = ['Overall', 'NFL', 'NBA', 'MLB', 'NHL', 'Soccer', 'Tennis'];
const leagueByFilter: Record<string, string> = {
  NFL: 'nfl',
  NBA: 'nba',
  MLB: 'mlb',
  NHL: 'nhl',
  Soccer: 'soccer',
  Tennis: 'tennis',
};

export default function LeaderboardScreen() {
  const [selected, setSelected] = useState('Overall');
  const [picks, setPicks] = useState<Pick[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isActive = true;

    async function loadLeaderboardPicks() {
      setIsLoading(true);
      const { picks: nextPicks, error } = await fetchAllUserPicks();

      if (isActive) {
        setPicks(nextPicks);
        setErrorMessage(error);
        setIsLoading(false);
      }
    }

    loadLeaderboardPicks();

    return () => {
      isActive = false;
    };
  }, []);

  const filteredEntries = useMemo(() => {
    return buildLeaderboardFromPicks(picks, selected === 'Overall' ? 'Overall' : leagueByFilter[selected]);
  }, [picks, selected]);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>🏆 Leaderboard</Text>
        <Text style={styles.subtitle}>Ranked from real settled user picks.</Text>
      </View>
      <FilterChips options={filterOptions} selected={selected} onSelect={setSelected} />
      {isLoading && (
        <View style={styles.notice}>
          <ActivityIndicator color="#6c63ff" />
          <Text style={styles.noticeText}>Loading leaderboard...</Text>
        </View>
      )}
      {!isLoading && errorMessage ? (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>Run database/admin_tools.sql in Supabase to enable real leaderboard access. {errorMessage}</Text>
        </View>
      ) : null}
      <FlatList
        data={filteredEntries}
        keyExtractor={(item) => item.analystId}
        renderItem={({ item }) => <LeaderboardRow entry={item} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>No settled picks yet</Text>
              <Text style={styles.emptyText}>Once users create picks and games finish, this leaderboard will fill in automatically.</Text>
            </View>
          ) : null
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
  notice: {
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderColor: '#0f3460',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    marginHorizontal: 16,
    padding: 12,
  },
  noticeText: { color: '#a0a0a0', flex: 1, fontSize: 12, lineHeight: 17 },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  emptyBox: {
    backgroundColor: '#16213e',
    borderColor: '#0f3460',
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  emptyTitle: { color: '#ffffff', fontSize: 16, fontWeight: '800', marginBottom: 4 },
  emptyText: { color: '#a0a0a0', fontSize: 13, lineHeight: 18 },
});
