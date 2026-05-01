import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import StatCard from '../../components/StatCard';
import PickCard from '../../components/PickCard';
import { analysts, picks as mockPicks } from '../../lib/mockData';
import { Pick } from '../../lib/types';

export default function AnalystDetail() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const analyst = analysts.find((a) => a.id === id);
  const [localPicks, setLocalPicks] = useState<Pick[]>(mockPicks.filter((p) => p.analystId === id));

  const handleLike = (pickId: string) => {
    setLocalPicks((prev) =>
      prev.map((p) => (p.id === pickId ? { ...p, likes: p.likes + 1 } : p))
    );
  };

  if (!analyst) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.notFound}>Analyst not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.name}>{analyst.name}</Text>
        <Text style={styles.bio}>{analyst.bio}</Text>
        <Text style={styles.scoreLabel}>Performance Score: <Text style={styles.scoreValue}>{analyst.performanceScore}</Text></Text>

        <View style={styles.statsRow}>
          <StatCard label="Win Rate" value={`${analyst.winRate}%`} emoji="📈" />
          <StatCard label="Total Picks" value={analyst.totalPicks} emoji="⭐" />
          <StatCard label="Followers" value={`${(analyst.followers / 1000).toFixed(1)}k`} emoji="👥" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Favorite Leagues</Text>
          <View style={styles.leaguesRow}>
            {analyst.favoriteLeagues.map((l) => (
              <View key={l} style={styles.leagueBadge}>
                <Text style={styles.leagueText}>{l}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Picks</Text>
          {localPicks.length === 0 ? (
            <Text style={styles.noPicks}>No picks yet.</Text>
          ) : (
            localPicks.map((pick) => (
              <PickCard key={pick.id} pick={pick} onLike={handleLike} />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1a1a2e' },
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  content: { padding: 20, paddingBottom: 40 },
  backBtn: { marginBottom: 16 },
  backText: { color: '#6c63ff', fontSize: 16, fontWeight: '600' },
  name: { color: '#ffffff', fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  bio: { color: '#a0a0a0', fontSize: 13, lineHeight: 20, marginBottom: 12 },
  scoreLabel: { color: '#a0a0a0', fontSize: 13, marginBottom: 16 },
  scoreValue: { color: '#6c63ff', fontWeight: 'bold' },
  statsRow: { flexDirection: 'row', marginBottom: 20 },
  section: { marginTop: 16 },
  sectionTitle: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  leaguesRow: { flexDirection: 'row', flexWrap: 'wrap' },
  leagueBadge: {
    backgroundColor: '#0f3460',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  leagueText: { color: '#6c63ff', fontSize: 12, fontWeight: '600' },
  noPicks: { color: '#666', fontSize: 13 },
  notFound: { color: '#fff', fontSize: 18, padding: 20 },
});
