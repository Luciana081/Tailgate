import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AnalystCard from '../components/AnalystCard';
import { analysts as mockAnalysts } from '../lib/mockData';
import { Analyst } from '../lib/types';

export default function AnalystsScreen() {
  const router = useRouter();
  const [analysts, setAnalysts] = useState<Analyst[]>(mockAnalysts);

  const handleFollowToggle = (id: string) => {
    setAnalysts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isFollowing: !a.isFollowing } : a))
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>👥 Analysts</Text>
      </View>
      <FlatList
        data={analysts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/analyst/${item.id}`)}
            style={styles.cardWrapper}
          >
            <AnalystCard analyst={item} onFollowToggle={handleFollowToggle} />
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1a1a2e' },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#ffffff' },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  cardWrapper: { width: '100%' },
});
