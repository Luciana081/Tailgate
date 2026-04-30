import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  CARD: '#16213e',
  TEXT_PRIMARY: '#e8e8e8',
  TEXT_SECONDARY: '#8892b0',
  ACCENT: '#e94560',
  BORDER: '#2d2d2d',
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
}

export default function StatCard({ label, value, icon, color }: StatCardProps) {
  const iconColor = color ?? COLORS.ACCENT;
  return (
    <View style={styles.card}>
      {icon && (
        <Ionicons name={icon} size={22} color={iconColor} style={styles.icon} />
      )}
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.CARD,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    flex: 1,
    minWidth: 80,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  icon: {
    marginBottom: 6,
  },
  value: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  label: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 11,
    textAlign: 'center',
  },
});
