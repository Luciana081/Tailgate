import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PickCard from '../components/PickCard';
import { useAuth } from '../lib/AuthContext';
import { usePicks } from '../lib/PicksContext';
import { supabase } from '../lib/supabase';

const sportOptions = ['NFL', 'NBA', 'MLB', 'NHL', 'Soccer', 'Tennis'];

type ProfileMetadata = {
  username?: string;
  avatarUrl?: string;
  favoriteSports?: string[];
};

function getInitial(email?: string, username?: string) {
  const source = username || email || 'T';
  return source.trim().charAt(0).toUpperCase();
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { userPicks, likeUserPick } = usePicks();
  const metadata = user?.user_metadata as ProfileMetadata | undefined;
  const [username, setUsername] = useState(metadata?.username ?? '');
  const [avatarUrl, setAvatarUrl] = useState(metadata?.avatarUrl ?? '');
  const [favoriteSports, setFavoriteSports] = useState<string[]>(metadata?.favoriteSports ?? []);
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setUsername(metadata?.username ?? '');
    setAvatarUrl(metadata?.avatarUrl ?? '');
    setFavoriteSports(metadata?.favoriteSports ?? []);
  }, [metadata?.avatarUrl, metadata?.favoriteSports, metadata?.username]);

  const stats = useMemo(() => {
    const total = userPicks.length;
    const wins = userPicks.filter((pick) => pick.result === 'win').length;
    const losses = userPicks.filter((pick) => pick.result === 'loss').length;
    const pushes = userPicks.filter((pick) => pick.result === 'push').length;
    const pending = userPicks.filter((pick) => pick.result === 'pending').length;
    const graded = wins + losses;
    const accuracy = graded ? Math.round((wins / graded) * 100) : 0;

    return { total, wins, losses, pushes, pending, accuracy };
  }, [userPicks]);

  const recentPicks = userPicks.slice(0, 3);

  const handleSportToggle = (sport: string) => {
    setFavoriteSports((current) =>
      current.includes(sport)
        ? current.filter((item) => item !== sport)
        : [...current, sport],
    );
  };

  const handleSave = async () => {
    setMessage('');
    setIsSaving(true);

    const { error } = await supabase.auth.updateUser({
      data: {
        username: username.trim(),
        avatarUrl: avatarUrl.trim(),
        favoriteSports,
      },
    });

    setIsSaving(false);
    setMessage(error ? error.message : 'Profile saved.');
  };

  const handleSignOut = async () => {
    const errorMessage = await signOut();
    setMessage(errorMessage ?? '');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarInitial}>{getInitial(user?.email, username)}</Text>
            )}
          </View>
          <View style={styles.identity}>
            <Text style={styles.title}>{username.trim() || 'Your Profile'}</Text>
            <Text numberOfLines={1} style={styles.email}>{user?.email}</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Picks</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.accuracy}%</Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        <View style={styles.recordRow}>
          <View style={styles.recordPill}>
            <Text style={styles.recordWin}>W {stats.wins}</Text>
          </View>
          <View style={styles.recordPill}>
            <Text style={styles.recordLoss}>L {stats.losses}</Text>
          </View>
          <View style={styles.recordPill}>
            <Text style={styles.recordPush}>P {stats.pushes}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Details</Text>
          <Text style={styles.fieldLabel}>Username</Text>
          <TextInput
            onChangeText={setUsername}
            placeholder="Choose a username"
            placeholderTextColor="#7f86a3"
            style={styles.input}
            value={username}
          />
          <Text style={styles.fieldLabel}>Avatar URL</Text>
          <TextInput
            autoCapitalize="none"
            onChangeText={setAvatarUrl}
            placeholder="https://example.com/avatar.png"
            placeholderTextColor="#7f86a3"
            style={styles.input}
            value={avatarUrl}
          />

          <Text style={styles.fieldLabel}>Favorite Sports</Text>
          <View style={styles.sportsGrid}>
            {sportOptions.map((sport) => {
              const isSelected = favoriteSports.includes(sport);

              return (
                <Pressable
                  key={sport}
                  onPress={() => handleSportToggle(sport)}
                  style={[styles.sportChip, isSelected && styles.sportChipSelected]}
                >
                  <Text style={[styles.sportChipText, isSelected && styles.sportChipTextSelected]}>
                    {sport}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {!favoriteSports.length && <Text style={styles.emptyText}>No favorite sports selected yet.</Text>}

          {message ? <Text style={styles.message}>{message}</Text> : null}

          <Pressable disabled={isSaving} onPress={handleSave} style={[styles.saveButton, isSaving && styles.disabledButton]}>
            {isSaving ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.saveButtonText}>Save Profile</Text>}
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Picks</Text>
          {recentPicks.length ? recentPicks.map((pick) => (
            <PickCard key={pick.id} pick={pick} onLike={likeUserPick} />
          )) : <Text style={styles.emptyText}>Create a pick from the Games tab to start building your record.</Text>}
        </View>

        <Pressable onPress={handleSignOut} style={styles.signOutButton}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1a1a2e' },
  content: { padding: 20, paddingBottom: 36 },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 20,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: '#6c63ff',
    borderColor: '#aeb4ff',
    borderRadius: 34,
    borderWidth: 1,
    height: 68,
    justifyContent: 'center',
    overflow: 'hidden',
    width: 68,
  },
  avatarImage: { height: '100%', width: '100%' },
  avatarInitial: { color: '#ffffff', fontSize: 28, fontWeight: '900' },
  identity: { flex: 1, marginLeft: 14 },
  title: { color: '#ffffff', fontSize: 28, fontWeight: '900' },
  email: { color: '#a0a0a0', fontSize: 13, marginTop: 4 },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  statCard: {
    backgroundColor: '#16213e',
    borderColor: '#0f3460',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    padding: 14,
  },
  statValue: { color: '#ffffff', fontSize: 22, fontWeight: '900' },
  statLabel: { color: '#a0a0a0', fontSize: 11, fontWeight: '700', marginTop: 4 },
  recordRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  recordPill: {
    backgroundColor: '#16213e',
    borderColor: '#0f3460',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  recordWin: { color: '#2ecc71', fontWeight: '900' },
  recordLoss: { color: '#e74c3c', fontWeight: '900' },
  recordPush: { color: '#e67e22', fontWeight: '900' },
  section: {
    backgroundColor: '#16213e',
    borderColor: '#0f3460',
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 18,
    padding: 16,
  },
  sectionTitle: { color: '#ffffff', fontSize: 18, fontWeight: '900', marginBottom: 14 },
  fieldLabel: {
    color: '#d8d8ff',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
    marginTop: 8,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#1a1a2e',
    borderColor: '#0f3460',
    borderRadius: 12,
    borderWidth: 1,
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  sportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  sportChip: {
    backgroundColor: '#1a1a2e',
    borderColor: '#0f3460',
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  sportChipSelected: {
    backgroundColor: '#6c63ff',
    borderColor: '#6c63ff',
  },
  sportChipText: { color: '#d8d8ff', fontSize: 12, fontWeight: '800' },
  sportChipTextSelected: { color: '#ffffff' },
  message: { color: '#d8d8ff', fontSize: 13, marginBottom: 12 },
  emptyText: { color: '#a0a0a0', fontSize: 13, lineHeight: 19 },
  saveButton: {
    alignItems: 'center',
    backgroundColor: '#6c63ff',
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 48,
  },
  disabledButton: { opacity: 0.6 },
  saveButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '900' },
  signOutButton: {
    alignItems: 'center',
    backgroundColor: '#0f3460',
    borderRadius: 12,
    justifyContent: 'center',
    minHeight: 46,
  },
  signOutText: { color: '#ffffff', fontSize: 14, fontWeight: '800' },
});
