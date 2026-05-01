import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Pick } from '../lib/types';

interface Props {
  pick: Pick;
  onLike: (id: string) => void;
}

export default function PickCard({ pick, onLike }: Props) {
  const resultColors: Record<Pick['result'], string> = {
    pending: '#666',
    win: '#2ecc71',
    loss: '#e74c3c',
    push: '#e67e22',
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.analystInfo}>
          <Text style={styles.analystName}>{pick.analystName}</Text>
          <Text style={styles.gameDesc}>{pick.gameDescription}</Text>
        </View>
        <View style={[styles.resultBadge, { backgroundColor: resultColors[pick.result] }]}>
          <Text style={styles.resultText}>{pick.result.toUpperCase()}</Text>
        </View>
      </View>

      <Text style={styles.prediction}>{pick.prediction}</Text>

      <View style={styles.confidenceRow}>
        <Text style={styles.confidenceLabel}>Confidence: {pick.confidence}/10</Text>
        <View style={styles.confidenceDots}>
          {Array.from({ length: 10 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.confidenceDot,
                i < pick.confidence ? styles.confidenceDotFilled : styles.confidenceDotEmpty,
              ]}
            />
          ))}
        </View>
      </View>

      <Text style={styles.reasoning}>{pick.reasoning}</Text>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onLike(pick.id)}>
          <Text style={styles.actionText}>❤️ {pick.likes}</Text>
        </TouchableOpacity>
        <Text style={styles.actionText}>💬 {pick.comments}</Text>
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  analystInfo: { flex: 1 },
  analystName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  gameDesc: {
    color: '#a0a0a0',
    fontSize: 12,
    marginTop: 2,
  },
  resultBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginLeft: 8,
  },
  resultText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  prediction: {
    color: '#6c63ff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  confidenceRow: {
    marginBottom: 8,
  },
  confidenceLabel: {
    color: '#a0a0a0',
    fontSize: 11,
    marginBottom: 4,
  },
  confidenceDots: {
    flexDirection: 'row',
  },
  confidenceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 3,
  },
  confidenceDotFilled: { backgroundColor: '#6c63ff' },
  confidenceDotEmpty: { backgroundColor: '#333' },
  reasoning: {
    color: '#c0c0c0',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    marginRight: 16,
  },
  actionText: {
    color: '#a0a0a0',
    fontSize: 13,
  },
});
