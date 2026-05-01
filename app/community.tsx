import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CommunitySectionComponent from '../components/CommunitySectionComponent';
import { posts as mockPosts } from '../lib/mockData';
import { Post } from '../lib/types';

export default function CommunityScreen() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');

  const handlePost = () => {
    if (!topic.trim() || !content.trim()) return;
    const newPost: Post = {
      id: `post_${Date.now()}`,
      authorId: 'me',
      authorName: 'You',
      topic: topic.trim(),
      leagueId: 'nfl',
      content: content.trim(),
      timestamp: 'Just now',
      commentCount: 0,
      likes: 0,
    };
    setPosts((prev) => [newPost, ...prev]);
    setTopic('');
    setContent('');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>💬 Community</Text>
      </View>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CommunitySectionComponent post={item} />}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.createCard}>
            <Text style={styles.createTitle}>Share Your Thoughts</Text>
            <TextInput
              style={styles.input}
              placeholder="Topic..."
              placeholderTextColor="#666"
              value={topic}
              onChangeText={setTopic}
            />
            <TextInput
              style={[styles.input, styles.contentInput]}
              placeholder="What's on your mind?"
              placeholderTextColor="#666"
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={3}
            />
            <TouchableOpacity style={styles.postBtn} onPress={handlePost}>
              <Text style={styles.postBtnText}>Post</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1a1a2e' },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#ffffff' },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  createCard: {
    backgroundColor: '#16213e',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  createTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#0f3460',
    color: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 10,
  },
  contentInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  postBtn: {
    backgroundColor: '#6c63ff',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  postBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
