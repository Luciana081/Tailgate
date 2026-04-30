import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { mockAnalysts, mockGames, mockPicks } from '../lib/mockData';
import GameCard from '../components/GameCard';
import PickCard from '../components/PickCard';
import StatCard from '../components/StatCard';

const COLORS = {
  BACKGROUND: '#0f0e17',
  SURFACE: '#1a1a2e',
  CARD: '#16213e',
  ACCENT: '#e94560',
  TEXT_PRIMARY: '#e8e8e8',
  TEXT_SECONDARY: '#8892b0',
  SUCCESS: '#00b894',
  BORDER: '#2d2d2d',
};

export default function DashboardScreen() {
  const [likedPicks, setLikedPicks] = React.useState<Record<string, boolean>>({});

  const featuredGames = mockGames.slice(0, 3);
  const trendingAnalysts = mockAnalysts
    .sort((a, b) => b.performanceScore - a.performanceScore)
    .slice(0, 5);
  const recentPicks = mockPicks.slice(0, 3).map((p) => ({
    ...p,
    isLiked: likedPicks[p.id] ?? p.isLiked ?? false,
    likes: (likedPicks[p.id] === true && !(p.isLiked ?? false)) ? p.likes + 1
      : (likedPicks[p.id] === false && (p.isLiked ?? false)) ? p.likes - 1
      : p.likes,
  }));

  function handleLike(id: string) {
    setLikedPicks((prev) => {
      const current = prev[id] ?? mockPicks.find((p) => p.id === id)?.isLiked ?? false;
      return { ...prev, [id]: !current };
    });
  }

  const totalPicks = mockPicks.length;
  const avgAccuracy = mockAnalysts.reduce((sum, a) => sum + a.winRate, 0) / mockAnalysts.length;
  const activeAnalysts = mockAnalysts.length;
  const liveGames = mockGames.filter((g) => g.status === 'live').length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logoText}>TAILGATE</Text>
            <Text style={styles.tagline}>Sports Analytics & Community</Text>
          </View>
          <Link href="/analysts" asChild>
            <TouchableOpacity style={styles.headerBtn}>
              <Ionicons name="people" size={20} color={COLORS.ACCENT} />
            </TouchableOpacity>
          </Link>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <StatCard label="Total Picks" value={totalPicks} icon="bar-chart" color={COLORS.ACCENT} />
          <StatCard label="Avg Accuracy" value={`${(avgAccuracy * 100).toFixed(1)}%`} icon="trending-up" color={COLORS.SUCCESS} />
          <StatCard label="Analysts" value={activeAnalysts} icon="person" color="#f39c12" />
          <StatCard label="Live Games" value={liveGames} icon="radio-button-on" color={COLORS.SUCCESS} />
        </View>

        {/* Featured Games */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Games</Text>
          <Link href="/games" asChild>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </Link>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
          {featuredGames.map((game) => (
            <View key={game.id} style={styles.featuredGameCard}>
              <GameCard game={game} />
            </View>
          ))}
        </ScrollView>

        {/* Trending Analysts */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending Analysts</Text>
          <Link href="/analysts" asChild>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </Link>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
          {trendingAnalysts.map((analyst) => (
            <Link key={analyst.id} href={`/analyst/${analyst.id}`} asChild>
              <TouchableOpacity style={styles.analystChip} activeOpacity={0.8}>
                <View style={styles.analystChipAvatar}>
                  <Text style={styles.analystChipAvatarText}>
                    {analyst.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </Text>
                </View>
                <Text style={styles.analystChipName} numberOfLines={1}>{analyst.name}</Text>
                <Text style={styles.analystChipRate}>{(analyst.winRate * 100).toFixed(0)}%</Text>
                <Text style={styles.analystChipLabel}>Win Rate</Text>
              </TouchableOpacity>
            </Link>
          ))}
        </ScrollView>

        {/* Recent Picks */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Picks</Text>
          <Link href="/picks" asChild>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </Link>
        </View>
        {recentPicks.map((pick) => (
          <PickCard key={pick.id} pick={pick} onLike={handleLike} />
        ))}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  logoText: {
    color: COLORS.ACCENT,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 3,
  },
  tagline: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 12,
    marginTop: 2,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.CARD,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: '700',
  },
  seeAll: {
    color: COLORS.ACCENT,
    fontSize: 13,
    fontWeight: '600',
  },
  horizontalList: {
    paddingRight: 16,
    marginBottom: 20,
  },
  featuredGameCard: {
    width: 300,
    marginRight: 12,
  },
  analystChip: {
    backgroundColor: COLORS.CARD,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    width: 110,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  analystChipAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.ACCENT + '33',
    borderWidth: 2,
    borderColor: COLORS.ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  analystChipAvatarText: {
    color: COLORS.ACCENT,
    fontSize: 14,
    fontWeight: '800',
  },
  analystChipName: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  analystChipRate: {
    color: COLORS.SUCCESS,
    fontSize: 18,
    fontWeight: '800',
  },
  analystChipLabel: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 10,
  },
  bottomSpacer: {
    height: 20,
  },
});
