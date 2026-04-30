import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { mockAnalysts, mockPicks } from '../../lib/mockData';
import PickCard from '../../components/PickCard';

const COLORS = {
  BACKGROUND: '#0f0e17',
  SURFACE: '#1a1a2e',
  CARD: '#16213e',
  ACCENT: '#e94560',
  TEXT_PRIMARY: '#e8e8e8',
  TEXT_SECONDARY: '#8892b0',
  SUCCESS: '#00b894',
  BORDER: '#2d2d2d',
  SECONDARY: '#0f3460',
};

const LEAGUE_COLORS: Record<string, string> = {
  NFL: '#e94560',
  NBA: '#f39c12',
  MLB: '#3498db',
  NHL: '#1abc9c',
  Soccer: '#2ecc71',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export default function AnalystProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const analyst = mockAnalysts.find((a) => a.id === id);
  const [isFollowing, setIsFollowing] = useState(analyst?.isFollowing ?? false);
  const [likedPicks, setLikedPicks] = useState<Record<string, boolean>>({});

  if (!analyst) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Analyst not found</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const analystPicks = mockPicks
    .filter((p) => p.analystId === analyst.id)
    .map((p) => ({
      ...p,
      isLiked: likedPicks[p.id] ?? p.isLiked ?? false,
    }));

  function handleLike(pickId: string) {
    setLikedPicks((prev) => {
      const current = prev[pickId] ?? mockPicks.find((p) => p.id === pickId)?.isLiked ?? false;
      return { ...prev, [pickId]: !current };
    });
  }

  // Mock league accuracy bars
  const leagueAccuracy: Array<{ league: string; accuracy: number }> = analyst.leagues.map((league) => ({
    league,
    accuracy: 0.55 + Math.random() * 0.15,
  }));

  const wins = analystPicks.filter((p) => p.result === 'win').length;
  const losses = analystPicks.filter((p) => p.result === 'loss').length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Back Button */}
        <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={COLORS.ACCENT} />
          <Text style={styles.backLabel}>Back</Text>
        </TouchableOpacity>

        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(analyst.name)}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{analyst.name}</Text>
            <Text style={styles.bio}>{analyst.bio}</Text>
            <View style={styles.leaguesRow}>
              {analyst.leagues.map((league) => (
                <View
                  key={league}
                  style={[styles.leaguePill, { backgroundColor: (LEAGUE_COLORS[league] ?? COLORS.ACCENT) + '22' }]}
                >
                  <Text style={[styles.leaguePillText, { color: LEAGUE_COLORS[league] ?? COLORS.ACCENT }]}>
                    {league}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Follow Button */}
        <TouchableOpacity
          style={[styles.followBtn, isFollowing && styles.followingBtn]}
          onPress={() => setIsFollowing((f) => !f)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isFollowing ? 'person-remove' : 'person-add'}
            size={16}
            color={isFollowing ? COLORS.ACCENT : '#fff'}
          />
          <Text style={[styles.followBtnText, isFollowing && { color: COLORS.ACCENT }]}>
            {isFollowing ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>

        {/* Badges */}
        <View style={styles.badgesRow}>
          {analyst.badges.map((badge) => (
            <Text key={badge} style={styles.badge}>{badge}</Text>
          ))}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{(analyst.winRate * 100).toFixed(1)}%</Text>
            <Text style={styles.statLabel}>Win Rate</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{analyst.totalPicks}</Text>
            <Text style={styles.statLabel}>Total Picks</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{formatNumber(analyst.followers)}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: COLORS.SUCCESS }]}>{analyst.recentRecord}</Text>
            <Text style={styles.statLabel}>Recent Record</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: COLORS.ACCENT }]}>{analyst.performanceScore}</Text>
            <Text style={styles.statLabel}>Perf. Score</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{wins}-{losses}</Text>
            <Text style={styles.statLabel}>W-L (All)</Text>
          </View>
        </View>

        {/* Accuracy by League */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accuracy by League</Text>
          {leagueAccuracy.map(({ league, accuracy }) => {
            const pct = Math.round(accuracy * 100);
            const leagueColor = LEAGUE_COLORS[league] ?? COLORS.ACCENT;
            return (
              <View key={league} style={styles.leagueBar}>
                <Text style={[styles.leagueBarLabel, { color: leagueColor }]}>{league}</Text>
                <View style={styles.leagueBarTrack}>
                  <View style={[styles.leagueBarFill, { width: `${pct}%`, backgroundColor: leagueColor }]} />
                </View>
                <Text style={[styles.leagueBarPct, { color: leagueColor }]}>{pct}%</Text>
              </View>
            );
          })}
        </View>

        {/* Recent Picks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Picks</Text>
          {analystPicks.length === 0 ? (
            <Text style={styles.emptyText}>No picks from this analyst yet.</Text>
          ) : (
            analystPicks.map((pick) => (
              <PickCard key={pick.id} pick={pick} onLike={handleLike} />
            ))
          )}
        </View>

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
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 18,
    marginBottom: 16,
  },
  backBtn: {
    backgroundColor: COLORS.ACCENT,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  backBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  backLabel: {
    color: COLORS.ACCENT,
    fontSize: 14,
    fontWeight: '600',
  },
  profileHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 16,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.ACCENT + '33',
    borderWidth: 3,
    borderColor: COLORS.ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.ACCENT,
    fontSize: 24,
    fontWeight: '800',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  bio: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  leaguesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  leaguePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  leaguePillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.ACCENT,
    marginBottom: 14,
  },
  followingBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.ACCENT,
  },
  followBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  badge: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    backgroundColor: COLORS.CARD,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 20,
  },
  statBox: {
    backgroundColor: COLORS.CARD,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    width: '30%',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    flexGrow: 1,
  },
  statValue: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 10,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  leagueBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  leagueBarLabel: {
    fontSize: 12,
    fontWeight: '700',
    width: 52,
  },
  leagueBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.BORDER,
    borderRadius: 4,
    overflow: 'hidden',
  },
  leagueBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  leagueBarPct: {
    fontSize: 12,
    fontWeight: '700',
    width: 36,
    textAlign: 'right',
  },
  emptyText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 14,
  },
  bottomSpacer: {
    height: 30,
  },
});
