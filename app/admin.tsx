import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchAllUserPicks, updateUserPickResult } from '../lib/adminData';
import { useAuth } from '../lib/AuthContext';
import { fetchLiveGames } from '../lib/oddsApi';
import { games as mockGames, posts as mockPosts } from '../lib/mockData';
import { Game, Pick, Post } from '../lib/types';

const resultOptions: Pick['result'][] = ['pending', 'win', 'loss', 'push'];
const HIDDEN_POSTS_KEY = 'tailgate:admin-hidden-posts';
const FEATURED_GAMES_KEY = 'tailgate:admin-featured-games';

export default function AdminScreen() {
  const { isAdmin, user } = useAuth();
  const [allPicks, setAllPicks] = useState<Pick[]>([]);
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [games, setGames] = useState<Game[]>([]);
  const [featuredGameIds, setFeaturedGameIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadAdminData = async () => {
    setIsLoading(true);
    setMessage('');

    const [{ picks, error }] = await Promise.all([
      fetchAllUserPicks(),
      AsyncStorage.getItem(HIDDEN_POSTS_KEY).then((raw) => {
        const hiddenIds = raw ? JSON.parse(raw) as string[] : [];
        setPosts(mockPosts.filter((post) => !hiddenIds.includes(post.id)));
      }),
      AsyncStorage.getItem(FEATURED_GAMES_KEY).then((raw) => {
        setFeaturedGameIds(raw ? JSON.parse(raw) as string[] : []);
      }),
    ]);

    setAllPicks(picks);
    setMessage(error ? `Run database/admin_tools.sql in Supabase first. ${error}` : '');

    try {
      const nextGames = await fetchLiveGames('All');
      setGames(nextGames.length ? nextGames : mockGames);
    } catch {
      setGames(mockGames);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (isAdmin) {
      void loadAdminData();
    }
  }, [isAdmin]);

  const handleSetPickResult = async (pick: Pick, result: Pick['result']) => {
    const error = await updateUserPickResult(pick.id, result);

    if (error) {
      Alert.alert('Could not update pick', error);
      return;
    }

    setAllPicks((prev) => prev.map((item) => (item.id === pick.id ? { ...item, result } : item)));
  };

  const handleHidePost = async (postId: string) => {
    const rawHiddenIds = await AsyncStorage.getItem(HIDDEN_POSTS_KEY);
    const hiddenIds = rawHiddenIds ? JSON.parse(rawHiddenIds) as string[] : [];
    const nextHiddenIds = Array.from(new Set([...hiddenIds, postId]));

    await AsyncStorage.setItem(HIDDEN_POSTS_KEY, JSON.stringify(nextHiddenIds));
    setPosts((prev) => prev.filter((post) => post.id !== postId));
  };

  const toggleFeaturedGame = async (gameId: string) => {
    const nextIds = featuredGameIds.includes(gameId)
      ? featuredGameIds.filter((id) => id !== gameId)
      : [gameId, ...featuredGameIds].slice(0, 5);

    setFeaturedGameIds(nextIds);
    await AsyncStorage.setItem(FEATURED_GAMES_KEY, JSON.stringify(nextIds));
  };

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.locked}>
          <Text style={styles.title}>Admin Access</Text>
          <Text style={styles.subtitle}>
            {user?.email ?? 'This account'} is signed in, but it is not listed as an admin.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const pendingPicks = allPicks.filter((pick) => pick.result === 'pending');

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Admin Console</Text>
        <Text style={styles.subtitle}>Manage picks, featured games, and community moderation.</Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Administrator</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <Pressable onPress={loadAdminData} style={styles.refreshButton}>
          <Text style={styles.refreshButtonText}>{isLoading ? 'Refreshing...' : 'Refresh Admin Data'}</Text>
        </Pressable>

        {isLoading && (
          <View style={styles.notice}>
            <ActivityIndicator color="#6c63ff" />
            <Text style={styles.noticeText}>Loading admin tools...</Text>
          </View>
        )}

        {message ? (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>{message}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All User Picks</Text>
            <Text style={styles.badge}>{allPicks.length}</Text>
          </View>
          <Text style={styles.sectionNote}>{pendingPicks.length} pending picks need settlement.</Text>
          {allPicks.slice(0, 30).map((pick) => (
            <View key={pick.id} style={styles.pickRow}>
              <View style={styles.pickTopRow}>
                <Text style={styles.pickTitle}>{pick.gameDescription}</Text>
                <Text style={[styles.resultBadge, styles[`result_${pick.result}`]]}>{pick.result.toUpperCase()}</Text>
              </View>
              <Text style={styles.pickMeta}>{pick.analystName} | {pick.oddsMarket ?? 'Market'} | {pick.oddsBookmaker ?? 'Book'}</Text>
              <Text style={styles.pickPrediction}>{pick.prediction}</Text>
              <Text style={styles.pickReasoning}>{pick.reasoning}</Text>
              <View style={styles.actionRow}>
                {resultOptions.map((result) => (
                  <Pressable
                    key={result}
                    onPress={() => void handleSetPickResult(pick, result)}
                    style={[styles.smallButton, pick.result === result && styles.smallButtonActive]}
                  >
                    <Text style={styles.smallButtonText}>{result}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Games</Text>
            <Text style={styles.badge}>{featuredGameIds.length}/5</Text>
          </View>
          <Text style={styles.sectionNote}>This saves featured game choices locally until we add a featured_games table.</Text>
          {games.length ? (
            games.slice(0, 20).map((game) => {
              const isFeatured = featuredGameIds.includes(game.id);

              return (
                <View key={game.id} style={styles.gameRow}>
                  <View style={styles.gameInfo}>
                    <Text style={styles.pickTitle}>{game.awayTeamName} vs {game.homeTeamName}</Text>
                    <Text style={styles.pickMeta}>{game.date} at {game.time} | {game.status.toUpperCase()}</Text>
                  </View>
                  <Pressable
                    onPress={() => void toggleFeaturedGame(game.id)}
                    style={[styles.featureButton, isFeatured && styles.featureButtonActive]}
                  >
                    <Text style={styles.featureButtonText}>{isFeatured ? 'Featured' : 'Feature'}</Text>
                  </Pressable>
                </View>
              );
            })
          ) : (
            <Text style={styles.sectionNote}>No live game data loaded. Make sure the odds proxy is running.</Text>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Community Moderation</Text>
            <Text style={styles.badge}>{posts.length}</Text>
          </View>
          <Text style={styles.sectionNote}>Post removal is local until community posts are moved to Supabase.</Text>
          {posts.slice(0, 12).map((post) => (
            <View key={post.id} style={styles.postRow}>
              <Text style={styles.pickTitle}>{post.topic}</Text>
              <Text style={styles.pickMeta}>{post.authorName} | {post.timestamp}</Text>
              <Text style={styles.pickReasoning}>{post.content}</Text>
              <Pressable onPress={() => void handleHidePost(post.id)} style={styles.removeButton}>
                <Text style={styles.removeButtonText}>Remove Post</Text>
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1a1a2e' },
  content: { padding: 20, paddingBottom: 32 },
  locked: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { color: '#ffffff', fontSize: 28, fontWeight: '800', marginBottom: 8 },
  subtitle: { color: '#a0a0a0', fontSize: 14, lineHeight: 20, marginBottom: 18 },
  card: {
    backgroundColor: '#16213e',
    borderColor: '#0f3460',
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16,
  },
  cardLabel: { color: '#a0a0a0', fontSize: 12, fontWeight: '700', marginBottom: 4, textTransform: 'uppercase' },
  email: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  refreshButton: {
    alignItems: 'center',
    backgroundColor: '#6c63ff',
    borderRadius: 12,
    justifyContent: 'center',
    marginBottom: 14,
    minHeight: 44,
  },
  refreshButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '900' },
  notice: {
    alignItems: 'center',
    backgroundColor: '#201f3a',
    borderColor: '#6c63ff',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    padding: 14,
  },
  noticeText: { color: '#d8d8ff', flex: 1, fontSize: 13, lineHeight: 19 },
  section: {
    backgroundColor: '#16213e',
    borderColor: '#0f3460',
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 18,
    padding: 16,
  },
  sectionHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  sectionTitle: { color: '#ffffff', fontSize: 18, fontWeight: '800' },
  sectionNote: { color: '#a0a0a0', fontSize: 12, lineHeight: 17, marginTop: 6, marginBottom: 12 },
  badge: {
    backgroundColor: '#0f3460',
    borderRadius: 10,
    color: '#d8d8ff',
    fontSize: 12,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pickRow: {
    backgroundColor: '#101935',
    borderColor: '#0f3460',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    padding: 12,
  },
  pickTopRow: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  pickTitle: { color: '#ffffff', flex: 1, fontSize: 14, fontWeight: '800' },
  resultBadge: {
    borderRadius: 9,
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  result_pending: { backgroundColor: '#666666' },
  result_win: { backgroundColor: '#2ecc71' },
  result_loss: { backgroundColor: '#e74c3c' },
  result_push: { backgroundColor: '#e67e22' },
  pickMeta: { color: '#7f86a3', fontSize: 11, lineHeight: 16, marginTop: 4 },
  pickPrediction: { color: '#6c63ff', fontSize: 15, fontWeight: '900', marginTop: 8 },
  pickReasoning: { color: '#c0c0c0', fontSize: 12, lineHeight: 18, marginTop: 6 },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  smallButton: {
    backgroundColor: '#1a1a2e',
    borderColor: '#0f3460',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  smallButtonActive: { backgroundColor: '#6c63ff', borderColor: '#6c63ff' },
  smallButtonText: { color: '#ffffff', fontSize: 12, fontWeight: '800', textTransform: 'capitalize' },
  gameRow: {
    alignItems: 'center',
    backgroundColor: '#101935',
    borderColor: '#0f3460',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 10,
    padding: 12,
  },
  gameInfo: { flex: 1, paddingRight: 10 },
  featureButton: {
    backgroundColor: '#0f3460',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  featureButtonActive: { backgroundColor: '#6c63ff' },
  featureButtonText: { color: '#ffffff', fontSize: 12, fontWeight: '900' },
  postRow: {
    backgroundColor: '#101935',
    borderColor: '#0f3460',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    padding: 12,
  },
  removeButton: {
    alignItems: 'center',
    backgroundColor: '#4a1a1a',
    borderRadius: 10,
    marginTop: 10,
    paddingVertical: 9,
  },
  removeButtonText: { color: '#ffffff', fontSize: 12, fontWeight: '900' },
});
