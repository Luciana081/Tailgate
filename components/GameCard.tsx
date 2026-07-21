import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Game } from '../lib/types';
import { leagues } from '../lib/mockData';

interface Props {
  game: Game;
  onViewDetails?: (game: Game) => void;
  onMakePick?: (game: Game) => void;
  canMakePick?: boolean;
}

export default function GameCard({ game, onViewDetails, onMakePick, canMakePick = true }: Props) {
  const league = leagues.find((l) => l.id === game.leagueId);
  const hasOdds = Boolean(game.odds || game.moneyline || game.spread || game.total);
  const isTennis = game.leagueId === 'tennis';
  const shouldShowScore = game.status !== 'upcoming' && game.hasScoreData !== false;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.leagueBadge}>
          {league?.emoji ?? '🏅'} {league?.shortName ?? game.leagueId.toUpperCase()}
        </Text>
        <View style={[styles.statusBadge, game.status === 'live' ? styles.statusLive : game.status === 'final' ? styles.statusFinal : styles.statusUpcoming]}>
          <Text style={styles.statusText}>{game.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.teams}>
        <View style={styles.teamBlock}>
          <Text style={styles.teamName}>{game.awayTeamName}</Text>
          {!isTennis && <Text style={styles.record}>{game.awayTeamRecord}</Text>}
          {shouldShowScore && <Text style={styles.score}>{game.awayScore}</Text>}
        </View>
        <View style={styles.vsSep}>
          <Text style={styles.vsText}>{game.status === 'upcoming' ? 'vs' : '-'}</Text>
          {(game.status === 'upcoming' || !shouldShowScore) && <Text style={styles.timeText}>{game.time}</Text>}
        </View>
        <View style={styles.teamBlock}>
          <Text style={styles.teamName}>{game.homeTeamName}</Text>
          {!isTennis && <Text style={styles.record}>{game.homeTeamRecord}</Text>}
          {shouldShowScore && <Text style={styles.score}>{game.homeScore}</Text>}
        </View>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>Date</Text>
        <Text style={styles.metaValue}>{game.date}</Text>
        <Text style={styles.metaDivider}>|</Text>
        <Text style={styles.metaValue}>{game.time}</Text>
      </View>

      {isTennis && (
        <View style={styles.tennisScoreBox}>
          <Text style={styles.tennisTournament}>{game.sportTitle ?? 'Tennis'}</Text>
          {game.hasScoreData ? (
            <Text style={styles.tennisScore}>Match score: {game.scoreSummary}</Text>
          ) : (
            <Text style={styles.tennisScoreMuted}>Set/game/point score unavailable from this feed</Text>
          )}
        </View>
      )}

      {(game.recentFormAway.length > 0 || game.recentFormHome.length > 0) && (
        <View style={styles.formRow}>
          <View style={styles.formGroup}>
            {game.recentFormAway.map((r, i) => (
              <View key={i} style={[styles.dot, r === 'W' ? styles.dotWin : r === 'D' ? styles.dotDraw : styles.dotLoss]} />
            ))}
          </View>
          <View style={styles.formGroup}>
            {game.recentFormHome.map((r, i) => (
              <View key={i} style={[styles.dot, r === 'W' ? styles.dotWin : r === 'D' ? styles.dotDraw : styles.dotLoss]} />
            ))}
          </View>
        </View>
      )}

      <Text style={styles.trend}>Market: {game.keyTrend}</Text>
      {hasOdds ? <Text style={styles.odds}>Odds: {game.odds}</Text> : null}
      {game.oddsLastUpdated && <Text style={styles.oddsTimestamp}>Last odds update: {new Date(game.oddsLastUpdated).toLocaleString()}</Text>}
      {game.moneyline && <Text style={styles.oddsDetail}>Moneyline: {game.moneyline}</Text>}
      {game.spread && <Text style={styles.oddsDetail}>Spread: {game.spread}</Text>}
      {game.total && <Text style={styles.oddsDetail}>Total: {game.total}</Text>}

      <View style={styles.actionRow}>
        <Pressable onPress={() => onViewDetails?.(game)} style={[styles.actionButton, styles.secondaryButton]}>
          <Text style={styles.secondaryButtonText}>View Details</Text>
        </Pressable>
        <Pressable
          disabled={!canMakePick}
          onPress={() => onMakePick?.(game)}
          style={[styles.actionButton, styles.primaryButton, !canMakePick && styles.disabledButton]}
        >
          <Text style={styles.primaryButtonText}>Make Pick</Text>
        </Pressable>
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
    width: '100%',
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  leagueBadge: {
    color: '#a0a0a0',
    fontSize: 13,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusLive: { backgroundColor: '#ff4444' },
  statusFinal: { backgroundColor: '#333' },
  statusUpcoming: { backgroundColor: '#0f3460' },
  statusText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  teams: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  teamBlock: {
    flex: 1,
    alignItems: 'center',
  },
  teamName: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  record: {
    color: '#a0a0a0',
    fontSize: 11,
    marginTop: 2,
  },
  score: {
    color: '#6c63ff',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 4,
  },
  vsSep: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  vsText: {
    color: '#666',
    fontSize: 14,
    fontWeight: 'bold',
  },
  timeText: {
    color: '#a0a0a0',
    fontSize: 10,
    marginTop: 2,
  },
  metaRow: {
    alignItems: 'center',
    backgroundColor: '#101935',
    borderColor: '#0f3460',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  metaLabel: {
    color: '#7f86a3',
    fontSize: 11,
    fontWeight: '800',
    marginRight: 8,
    textTransform: 'uppercase',
  },
  metaValue: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  metaDivider: {
    color: '#7f86a3',
    marginHorizontal: 8,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  tennisScoreBox: {
    backgroundColor: '#101935',
    borderColor: '#0f3460',
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
  },
  tennisTournament: {
    color: '#C9FF3D',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },
  tennisScore: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  tennisScoreMuted: {
    color: '#a0a0a0',
    fontSize: 12,
    lineHeight: 17,
  },
  formGroup: {
    flexDirection: 'row',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 3,
  },
  dotWin: { backgroundColor: '#2ecc71' },
  dotLoss: { backgroundColor: '#e74c3c' },
  dotDraw: { backgroundColor: '#e67e22' },
  trend: {
    color: '#a0a0a0',
    fontSize: 11,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  odds: {
    color: '#6c63ff',
    fontSize: 12,
    fontWeight: '600',
  },
  oddsDetail: {
    color: '#d8d8ff',
    fontSize: 11,
    marginTop: 3,
  },
  oddsTimestamp: {
    color: '#7f86a3',
    fontSize: 10,
    marginTop: 3,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: 12,
  },
  secondaryButton: {
    backgroundColor: '#0f3460',
  },
  primaryButton: {
    backgroundColor: '#6c63ff',
  },
  disabledButton: {
    opacity: 0.45,
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
});
