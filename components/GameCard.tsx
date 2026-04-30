import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Game } from '../lib/types';

const COLORS = {
  CARD: '#16213e',
  TEXT_PRIMARY: '#e8e8e8',
  TEXT_SECONDARY: '#8892b0',
  ACCENT: '#e94560',
  SUCCESS: '#00b894',
  WARNING: '#fdcb6e',
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

interface GameCardProps {
  game: Game;
}

function FormDot({ result }: { result: string }) {
  const color = result === 'W' ? COLORS.SUCCESS : COLORS.ACCENT;
  return <View style={[styles.formDot, { backgroundColor: color }]} />;
}

export default function GameCard({ game }: GameCardProps) {
  const leagueColor = LEAGUE_COLORS[game.league] ?? COLORS.ACCENT;
  const isLive = game.status === 'live';
  const isFinal = game.status === 'final';
  const homeProb = Math.round(game.homeWinProbability * 100);
  const awayProb = 100 - homeProb;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.leagueBadge, { backgroundColor: leagueColor + '22', borderColor: leagueColor }]}>
          <Text style={[styles.leagueBadgeText, { color: leagueColor }]}>{game.league}</Text>
        </View>
        <View style={styles.statusRow}>
          {isLive && <View style={styles.liveDot} />}
          <Text style={[styles.statusText, isLive && styles.liveText]}>
            {isLive ? 'LIVE' : isFinal ? 'FINAL' : game.time ?? game.date}
          </Text>
        </View>
      </View>

      {/* Teams */}
      <View style={styles.teamsRow}>
        {/* Away Team */}
        <View style={styles.teamSection}>
          <View style={[styles.teamCircle, { backgroundColor: game.awayTeam.color + '33', borderColor: game.awayTeam.color }]}>
            <Text style={styles.teamAbbr}>{game.awayTeam.abbreviation}</Text>
          </View>
          <Text style={styles.teamName} numberOfLines={1}>{game.awayTeam.name}</Text>
          {game.awayTeam.record && <Text style={styles.teamRecord}>{game.awayTeam.record}</Text>}
        </View>

        {/* Score or VS */}
        <View style={styles.scoreSection}>
          {(isLive || isFinal) && game.homeScore !== undefined && game.awayScore !== undefined ? (
            <View style={styles.scoreRow}>
              <Text style={styles.scoreText}>{game.awayScore}</Text>
              <Text style={styles.scoreSep}>-</Text>
              <Text style={styles.scoreText}>{game.homeScore}</Text>
            </View>
          ) : (
            <Text style={styles.vs}>VS</Text>
          )}
          {!isFinal && !isLive && (
            <Text style={styles.dateText}>{game.date}</Text>
          )}
        </View>

        {/* Home Team */}
        <View style={[styles.teamSection, styles.teamSectionRight]}>
          <View style={[styles.teamCircle, { backgroundColor: game.homeTeam.color + '33', borderColor: game.homeTeam.color }]}>
            <Text style={styles.teamAbbr}>{game.homeTeam.abbreviation}</Text>
          </View>
          <Text style={styles.teamName} numberOfLines={1}>{game.homeTeam.name}</Text>
          {game.homeTeam.record && <Text style={styles.teamRecord}>{game.homeTeam.record}</Text>}
        </View>
      </View>

      {/* Win Probability Bar */}
      {game.status !== 'final' && (
        <View style={styles.probSection}>
          <Text style={styles.probLabel}>{awayProb}%</Text>
          <View style={styles.probBarContainer}>
            <View style={[styles.probBarAway, { flex: awayProb }]} />
            <View style={[styles.probBarHome, { flex: homeProb }]} />
          </View>
          <Text style={styles.probLabel}>{homeProb}%</Text>
        </View>
      )}

      {/* Recent Form */}
      <View style={styles.formRow}>
        <View style={styles.formSection}>
          {game.awayRecentForm.split('').map((r, i) => (
            <FormDot key={i} result={r} />
          ))}
        </View>
        <Text style={styles.formLabel}>FORM</Text>
        <View style={styles.formSection}>
          {game.homeRecentForm.split('').map((r, i) => (
            <FormDot key={i} result={r} />
          ))}
        </View>
      </View>

      {/* Key Trend */}
      <View style={styles.trendRow}>
        <Text style={styles.trendIcon}>📈</Text>
        <Text style={styles.trendText} numberOfLines={2}>{game.keyTrend}</Text>
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
    marginBottom: 14,
  },
  leagueBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  leagueBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.SUCCESS,
  },
  statusText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 12,
  },
  liveText: {
    color: COLORS.SUCCESS,
    fontWeight: '700',
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  teamSection: {
    alignItems: 'center',
    flex: 2,
  },
  teamSectionRight: {
    alignItems: 'center',
  },
  teamCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    marginBottom: 6,
  },
  teamAbbr: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 13,
    fontWeight: '700',
  },
  teamName: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  teamRecord: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 10,
    marginTop: 2,
  },
  scoreSection: {
    alignItems: 'center',
    flex: 1.5,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scoreText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 24,
    fontWeight: '800',
  },
  scoreSep: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 18,
  },
  vs: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 16,
    fontWeight: '600',
  },
  dateText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 10,
    marginTop: 2,
  },
  probSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  probLabel: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 11,
    width: 30,
    textAlign: 'center',
  },
  probBarContainer: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: COLORS.BORDER,
  },
  probBarAway: {
    backgroundColor: COLORS.ACCENT,
    height: '100%',
  },
  probBarHome: {
    backgroundColor: COLORS.SUCCESS,
    height: '100%',
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  formSection: {
    flexDirection: 'row',
    gap: 4,
  },
  formLabel: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
  },
  formDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: COLORS.SECONDARY + '55',
    borderRadius: 8,
    padding: 8,
  },
  trendIcon: {
    fontSize: 12,
  },
  trendText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 11,
    flex: 1,
    lineHeight: 16,
  },
});
