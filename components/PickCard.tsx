import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Pick } from '../lib/types';

const COLORS = {
  CARD: '#16213e',
  TEXT_PRIMARY: '#e8e8e8',
  TEXT_SECONDARY: '#8892b0',
  ACCENT: '#e94560',
  SUCCESS: '#00b894',
  WARNING: '#fdcb6e',
  DANGER: '#d63031',
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

const RESULT_CONFIG: Record<string, { color: string; label: string }> = {
  pending: { color: COLORS.WARNING, label: 'PENDING' },
  win: { color: COLORS.SUCCESS, label: 'WIN ✓' },
  loss: { color: COLORS.DANGER, label: 'LOSS ✗' },
  push: { color: COLORS.TEXT_SECONDARY, label: 'PUSH' },
};

interface PickCardProps {
  pick: Pick;
  onLike: (id: string) => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function PickCard({ pick, onLike }: PickCardProps) {
  const leagueColor = LEAGUE_COLORS[pick.league] ?? COLORS.ACCENT;
  const resultConfig = RESULT_CONFIG[pick.result];

  const date = new Date(pick.timestamp);
  const timeStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.analystRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(pick.analystName)}</Text>
          </View>
          <View>
            <Text style={styles.analystName}>{pick.analystName}</Text>
            <Text style={styles.timestamp}>{timeStr}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <View style={[styles.leagueBadge, { backgroundColor: leagueColor + '22', borderColor: leagueColor }]}>
            <Text style={[styles.leagueBadgeText, { color: leagueColor }]}>{pick.league}</Text>
          </View>
          <View style={[styles.resultBadge, { backgroundColor: resultConfig.color + '22', borderColor: resultConfig.color }]}>
            <Text style={[styles.resultBadgeText, { color: resultConfig.color }]}>{resultConfig.label}</Text>
          </View>
        </View>
      </View>

      {/* Game & Pick */}
      <Text style={styles.game}>{pick.game}</Text>
      <View style={styles.pickRow}>
        <Text style={styles.pickText}>PICK: </Text>
        <Text style={styles.pickValue}>{pick.pick}</Text>
      </View>

      {/* Confidence Bar */}
      <View style={styles.confidenceRow}>
        <Text style={styles.confidenceLabel}>Confidence</Text>
        <View style={styles.confidenceBarBg}>
          <View style={[styles.confidenceBarFill, { width: `${pick.confidence}%`, backgroundColor: leagueColor }]} />
        </View>
        <Text style={[styles.confidenceValue, { color: leagueColor }]}>{pick.confidence}%</Text>
      </View>

      {/* Reasoning */}
      <Text style={styles.reasoning}>{pick.reasoning}</Text>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onLike(pick.id)} activeOpacity={0.7}>
          <Ionicons
            name={pick.isLiked ? 'heart' : 'heart-outline'}
            size={16}
            color={pick.isLiked ? COLORS.ACCENT : COLORS.TEXT_SECONDARY}
          />
          <Text style={[styles.actionText, pick.isLiked && { color: COLORS.ACCENT }]}>{pick.likes}</Text>
        </TouchableOpacity>
        <View style={styles.actionBtn}>
          <Ionicons name="chatbubble-outline" size={16} color={COLORS.TEXT_SECONDARY} />
          <Text style={styles.actionText}>{pick.comments}</Text>
        </View>
        <View style={styles.actionBtn}>
          <Ionicons name="share-outline" size={16} color={COLORS.TEXT_SECONDARY} />
          <Text style={styles.actionText}>Share</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.CARD,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  analystRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.ACCENT + '33',
    borderWidth: 1.5,
    borderColor: COLORS.ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.ACCENT,
    fontSize: 12,
    fontWeight: '800',
  },
  analystName: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 13,
    fontWeight: '700',
  },
  timestamp: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 11,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  leagueBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  leagueBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  resultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  resultBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  game: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 12,
    marginBottom: 4,
  },
  pickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  pickText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 13,
    fontWeight: '600',
  },
  pickValue: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '800',
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  confidenceLabel: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 11,
    width: 72,
  },
  confidenceBarBg: {
    flex: 1,
    height: 5,
    backgroundColor: COLORS.BORDER,
    borderRadius: 3,
    overflow: 'hidden',
  },
  confidenceBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  confidenceValue: {
    fontSize: 12,
    fontWeight: '700',
    width: 36,
    textAlign: 'right',
  },
  reasoning: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 10,
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
