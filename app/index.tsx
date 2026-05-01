import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import StatCard from '../components/StatCard';
import GameCard from '../components/GameCard';
import AnalystCard from '../components/AnalystCard';
import PickCard from '../components/PickCard';
import { analysts as mockAnalysts, games, picks } from '../lib/mockData';
import { Analyst, Pick } from '../lib/types';

export default function Dashboard() {
  const router = useRouter();
  const [analysts, setAnalysts] = useState<Analyst[]>(mockAnalysts);
  const [localPicks, setLocalPicks] = useState<Pick[]>(picks);

  const handleFollowToggle = (id: string) => {
    setAnalysts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isFollowing: !a.isFollowing } : a))
    );
  };

  const handleLike = (id: string) => {
    setLocalPicks((prev) =>
      prev.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p))
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.heroBlock}>
          <Text style={styles.title}>🏆 Tailgate</Text>
          <Text style={styles.tagline}>Your AI-powered sports intelligence hub</Text>
        </View>

        <View style={styles.statsRow}>
          <StatCard label="Analysts" value={10} emoji="👤" />
          <StatCard label="Games" value={games.length} emoji="🎮" />
          <StatCard label="Picks" value={picks.length} emoji="⭐" />
          <StatCard label="Win Rate" value="68%" emoji="📈" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Games</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {games.slice(0, 5).map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Analysts</Text>
            <TouchableOpacity onPress={() => router.push('/analysts')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {analysts.slice(0, 4).map((analyst) => (
              <AnalystCard key={analyst.id} analyst={analyst} onFollowToggle={handleFollowToggle} />
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Picks</Text>
          {localPicks.slice(0, 5).map((pick) => (
            <PickCard key={pick.id} pick={pick} onLike={handleLike} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1a1a2e' },
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  content: { paddingBottom: 24 },
  heroBlock: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    color: '#a0a0a0',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  seeAll: {
    color: '#6c63ff',
    fontSize: 14,
    fontWeight: '600',
  },
});
