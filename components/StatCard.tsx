import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  label: string;
  value: string | number;
  emoji?: string;
}

export default function StatCard({ label, value, emoji }: Props) {
  return (
    <View style={styles.card}>
      {emoji && <Text style={styles.emoji}>{emoji}</Text>}
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0f3460',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  emoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  label: {
    fontSize: 11,
    color: '#a0a0a0',
    marginTop: 2,
    textAlign: 'center',
  },
});
