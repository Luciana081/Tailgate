import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Post } from '../lib/types';

interface Props {
  post: Post;
}

export default function CommunitySectionComponent({ post }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{post.authorName.charAt(0)}</Text>
        </View>
        <View style={styles.meta}>
          <Text style={styles.author}>{post.authorName}</Text>
          <Text style={styles.timestamp}>{post.timestamp}</Text>
        </View>
        <View style={styles.badges}>
          <View style={styles.topicBadge}>
            <Text style={styles.topicText}>{post.topic}</Text>
          </View>
          <View style={styles.leagueBadge}>
            <Text style={styles.leagueText}>{post.leagueId.toUpperCase()}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.content}>{post.content}</Text>
      <View style={styles.footer}>
        <Text style={styles.footerItem}>❤️ {post.likes}</Text>
        <Text style={styles.footerItem}>💬 {post.commentCount}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#16213e',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6c63ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  meta: {
    flex: 1,
  },
  author: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  timestamp: {
    color: '#666',
    fontSize: 11,
    marginTop: 1,
  },
  badges: {
    alignItems: 'flex-end',
  },
  topicBadge: {
    backgroundColor: '#0f3460',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 4,
  },
  topicText: {
    color: '#6c63ff',
    fontSize: 10,
    fontWeight: '600',
  },
  leagueBadge: {
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  leagueText: {
    color: '#a0a0a0',
    fontSize: 10,
    fontWeight: '600',
  },
  content: {
    color: '#c0c0c0',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
  },
  footerItem: {
    color: '#a0a0a0',
    fontSize: 13,
    marginRight: 16,
  },
});
