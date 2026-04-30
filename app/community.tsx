import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { mockPosts } from '../lib/mockData';
import { League, Post } from '../lib/types';
import FilterChips from '../components/FilterChips';

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

const LEAGUE_FILTERS = ['All', 'General', 'NFL', 'NBA', 'MLB', 'NHL', 'Soccer'];
const LEAGUE_OPTIONS: Array<League | 'General'> = ['General', 'NFL', 'NBA', 'MLB', 'NHL', 'Soccer'];

const LEAGUE_COLORS: Record<string, string> = {
  NFL: '#e94560',
  NBA: '#f39c12',
  MLB: '#3498db',
  NHL: '#1abc9c',
  Soccer: '#2ecc71',
  General: '#8892b0',
};

interface PostCardProps {
  post: Post;
  onLike: (id: string) => void;
}

function PostCard({ post, onLike }: PostCardProps) {
  const leagueColor = LEAGUE_COLORS[post.league] ?? COLORS.ACCENT;
  const date = new Date(post.timestamp);
  const timeStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <View style={postStyles.card}>
      <View style={postStyles.header}>
        <View style={postStyles.authorRow}>
          <View style={postStyles.avatar}>
            <Text style={postStyles.avatarText}>{post.authorName.slice(0, 2).toUpperCase()}</Text>
          </View>
          <View>
            <Text style={postStyles.authorName}>{post.authorName}</Text>
            <Text style={postStyles.timestamp}>{timeStr}</Text>
          </View>
        </View>
        <View style={[postStyles.leagueBadge, { backgroundColor: leagueColor + '22', borderColor: leagueColor }]}>
          <Text style={[postStyles.leagueBadgeText, { color: leagueColor }]}>{post.league}</Text>
        </View>
      </View>

      <Text style={postStyles.topic}>{post.topic}</Text>
      <Text style={postStyles.content}>{post.content}</Text>

      <View style={postStyles.footer}>
        <TouchableOpacity style={postStyles.actionBtn} onPress={() => onLike(post.id)}>
          <Ionicons name="heart-outline" size={15} color={COLORS.TEXT_SECONDARY} />
          <Text style={postStyles.actionText}>{post.likes}</Text>
        </TouchableOpacity>
        <View style={postStyles.actionBtn}>
          <Ionicons name="chatbubble-outline" size={15} color={COLORS.TEXT_SECONDARY} />
          <Text style={postStyles.actionText}>{post.commentCount}</Text>
        </View>
        <View style={postStyles.actionBtn}>
          <Ionicons name="share-outline" size={15} color={COLORS.TEXT_SECONDARY} />
          <Text style={postStyles.actionText}>Share</Text>
        </View>
      </View>
    </View>
  );
}

const postStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.CARD,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.SECONDARY + '88',
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 11,
    fontWeight: '700',
  },
  authorName: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 13,
    fontWeight: '700',
  },
  timestamp: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 11,
  },
  leagueBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  leagueBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  topic: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  content: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    gap: 14,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 12,
  },
});

export default function CommunityScreen() {
  const [leagueFilter, setLeagueFilter] = useState('All');
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [modalVisible, setModalVisible] = useState(false);

  // New post form state
  const [newTopic, setNewTopic] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newLeague, setNewLeague] = useState<League | 'General'>('General');

  const filteredPosts = posts.filter((p) => {
    if (leagueFilter === 'All') return true;
    return p.league === leagueFilter;
  });

  function handleLike(id: string) {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p))
    );
  }

  function handleSubmitPost() {
    if (!newTopic.trim() || !newContent.trim()) return;
    const post: Post = {
      id: `post-${Date.now()}`,
      authorId: 'user-me',
      authorName: 'You',
      topic: newTopic.trim(),
      content: newContent.trim(),
      league: newLeague,
      timestamp: new Date().toISOString(),
      commentCount: 0,
      likes: 0,
    };
    setPosts((prev) => [post, ...prev]);
    setNewTopic('');
    setNewContent('');
    setNewLeague('General');
    setModalVisible(false);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Community</Text>
          <Text style={styles.subtitle}>{filteredPosts.length} discussions</Text>
        </View>
        <TouchableOpacity
          style={styles.newPostBtn}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.newPostBtnText}>New Post</Text>
        </TouchableOpacity>
      </View>

      <FilterChips options={LEAGUE_FILTERS} selected={leagueFilter} onSelect={setLeagueFilter} />

      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PostCard post={item} onLike={handleLike} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No posts yet. Start the conversation!</Text>
          </View>
        }
      />

      {/* New Post Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Post</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.TEXT_SECONDARY} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>Topic</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Post topic..."
                placeholderTextColor={COLORS.TEXT_SECONDARY}
                value={newTopic}
                onChangeText={setNewTopic}
              />

              <Text style={styles.fieldLabel}>League</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.leagueSelector}>
                {LEAGUE_OPTIONS.map((league) => (
                  <TouchableOpacity
                    key={league}
                    style={[
                      styles.leagueOption,
                      newLeague === league && {
                        backgroundColor: (LEAGUE_COLORS[league] ?? COLORS.ACCENT) + '33',
                        borderColor: LEAGUE_COLORS[league] ?? COLORS.ACCENT,
                      },
                    ]}
                    onPress={() => setNewLeague(league)}
                  >
                    <Text
                      style={[
                        styles.leagueOptionText,
                        newLeague === league && { color: LEAGUE_COLORS[league] ?? COLORS.ACCENT },
                      ]}
                    >
                      {league}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.fieldLabel}>Content</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Share your thoughts..."
                placeholderTextColor={COLORS.TEXT_SECONDARY}
                value={newContent}
                onChangeText={setNewContent}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={[styles.submitBtn, (!newTopic.trim() || !newContent.trim()) && styles.submitBtnDisabled]}
                onPress={handleSubmitPost}
                activeOpacity={0.8}
              >
                <Text style={styles.submitBtnText}>Post to Community</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  newPostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.ACCENT,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
  },
  newPostBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.SURFACE,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 20,
    fontWeight: '800',
  },
  fieldLabel: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  textInput: {
    backgroundColor: COLORS.CARD,
    borderRadius: 10,
    padding: 12,
    color: COLORS.TEXT_PRIMARY,
    fontSize: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  leagueSelector: {
    marginBottom: 16,
  },
  leagueOption: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    backgroundColor: COLORS.CARD,
    marginRight: 8,
  },
  leagueOptionText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 12,
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: COLORS.ACCENT,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
