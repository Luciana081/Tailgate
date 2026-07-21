import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import PickCard from '../components/PickCard';
import { leagues, picks as communityPicks } from '../lib/mockData';
import { usePicks } from '../lib/PicksContext';
import { Game, OddsBookmaker, OddsMarket } from '../lib/types';
import {
  formatDateTime,
  formatOutcome,
  getMarketTitle,
  getPickOptions,
  PickOption,
} from '../lib/oddsFormatting';

function parseGameParam(raw?: string | string[]) {
  const value = Array.isArray(raw) ? raw[0] : raw;

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(decodeURIComponent(value)) as Game;
  } catch {
    return null;
  }
}

function getBookmakerUpdate(bookmaker: OddsBookmaker) {
  return formatDateTime(bookmaker.lastUpdate ?? bookmaker.last_update);
}

function MarketBlock({ market }: { market: OddsMarket }) {
  return (
    <View style={styles.marketBlock}>
      <Text style={styles.marketTitle}>{getMarketTitle(market.key)}</Text>
      {market.outcomes.map((outcome) => (
        <View key={`${market.key}-${outcome.name}-${outcome.point ?? 'na'}`} style={styles.outcomeRow}>
          <Text style={styles.outcomeName}>{outcome.name}</Text>
          <Text style={styles.outcomeValue}>{formatOutcome(market, outcome)}</Text>
        </View>
      ))}
    </View>
  );
}

export default function GameDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ game?: string }>();
  const game = useMemo(() => parseGameParam(params.game), [params.game]);
  const { addPick, likeUserPick, settlePicks, userPicks } = usePicks();
  const [isPickFormOpen, setIsPickFormOpen] = useState(false);
  const [selectedPickOption, setSelectedPickOption] = useState<PickOption | null>(null);
  const [confidence, setConfidence] = useState('6');
  const [reasoning, setReasoning] = useState('');
  const [isSavingPick, setIsSavingPick] = useState(false);

  const pickOptions = useMemo(() => (game ? getPickOptions(game) : []), [game]);
  const gamePicks = useMemo(() => {
    if (!game) {
      return [];
    }

    return [...userPicks, ...communityPicks].filter((pick) => pick.gameId === game.id);
  }, [game, userPicks]);

  const league = game ? leagues.find((item) => item.id === game.leagueId) : undefined;
  const hasScore = Boolean(game && game.status !== 'upcoming' && game.hasScoreData !== false);
  const latestOddsUpdate = game?.oddsLastUpdated ? formatDateTime(game.oddsLastUpdated) : '';

  useEffect(() => {
    if (game?.status === 'final') {
      void settlePicks([game]);
    }
  }, [game, settlePicks]);

  const openPickForm = () => {
    if (!pickOptions.length) {
      Alert.alert('No odds available', 'This game does not have selectable odds from the API right now.');
      return;
    }

    setSelectedPickOption((current) => current ?? pickOptions[0]);
    setIsPickFormOpen(true);
  };

  const handleSavePick = async () => {
    if (!game || !selectedPickOption) {
      return;
    }

    const parsedConfidence = Number(confidence);

    if (!Number.isFinite(parsedConfidence) || parsedConfidence < 1 || parsedConfidence > 10) {
      Alert.alert('Check confidence', 'Confidence must be a number from 1 to 10.');
      return;
    }

    if (!reasoning.trim()) {
      Alert.alert('Add reasoning', 'Add a short note explaining why you like this pick.');
      return;
    }

    setIsSavingPick(true);
    await addPick({
      gameId: game.id,
      leagueId: game.leagueId,
      gameDescription: `${game.awayTeamName} vs ${game.homeTeamName}`,
      prediction: selectedPickOption.prediction,
      confidence: parsedConfidence,
      reasoning: reasoning.trim(),
      oddsBookmaker: selectedPickOption.bookmaker,
      oddsMarket: selectedPickOption.market,
    });
    setIsSavingPick(false);
    setIsPickFormOpen(false);
    setReasoning('');
    router.push('/picks');
  };

  if (!game) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.errorPanel}>
          <Text style={styles.errorTitle}>Game not found</Text>
          <Text style={styles.mutedText}>Go back to Games and open this matchup again.</Text>
          <Pressable onPress={() => router.back()} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Back to Games</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        <View style={styles.hero}>
          <View style={styles.heroTopRow}>
            <Text style={styles.leagueBadge}>
              {league?.emoji ?? ''} {league?.shortName ?? game.leagueId.toUpperCase()}
            </Text>
            <View style={[styles.statusBadge, styles[`status_${game.status}`]]}>
              <Text style={styles.statusText}>{game.status.toUpperCase()}</Text>
            </View>
          </View>

          <Text style={styles.matchup}>{game.awayTeamName}</Text>
          <Text style={styles.versus}>at</Text>
          <Text style={styles.matchup}>{game.homeTeamName}</Text>

          <View style={styles.scoreRow}>
            {hasScore ? (
              <>
                <Text style={styles.scoreText}>{game.awayScore}</Text>
                <Text style={styles.scoreDash}>-</Text>
                <Text style={styles.scoreText}>{game.homeScore}</Text>
              </>
            ) : (
              <Text style={styles.mutedText}>Score unavailable before live updates begin</Text>
            )}
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Date and Time</Text>
              <Text style={styles.infoValue}>{game.date} at {game.time}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>{game.leagueId === 'tennis' ? 'Tournament' : 'Market'}</Text>
              <Text style={styles.infoValue}>{game.sportTitle ?? game.keyTrend}</Text>
            </View>
            {latestOddsUpdate ? (
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Odds Updated</Text>
                <Text style={styles.infoValue}>{latestOddsUpdate}</Text>
              </View>
            ) : null}
          </View>

          <Pressable
            disabled={!pickOptions.length}
            onPress={openPickForm}
            style={[styles.primaryButton, !pickOptions.length && styles.disabledButton]}
          >
            <Text style={styles.primaryButtonText}>Make Pick</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Markets and Bookmakers</Text>
          {game.bookmakers?.length ? (
            game.bookmakers.map((bookmaker) => (
              <View key={bookmaker.key} style={styles.bookmakerCard}>
                <View style={styles.bookmakerHeader}>
                  <Text style={styles.bookmakerTitle}>{bookmaker.title}</Text>
                  {getBookmakerUpdate(bookmaker) ? (
                    <Text style={styles.bookmakerUpdate}>{getBookmakerUpdate(bookmaker)}</Text>
                  ) : null}
                </View>
                {bookmaker.markets?.length ? (
                  bookmaker.markets.map((market) => (
                    <MarketBlock key={`${bookmaker.key}-${market.key}`} market={market} />
                  ))
                ) : (
                  <Text style={styles.mutedText}>No markets available from this bookmaker.</Text>
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptyBox}>
              <Text style={styles.mutedText}>No bookmaker markets available right now.</Text>
            </View>
          )}
        </View>

        {isPickFormOpen && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Create Pick</Text>
            <Text style={styles.fieldLabel}>Choose odds</Text>
            {pickOptions.map((option) => (
              <Pressable
                key={option.id}
                onPress={() => setSelectedPickOption(option)}
                style={[
                  styles.oddsOption,
                  selectedPickOption?.id === option.id && styles.oddsOptionSelected,
                ]}
              >
                <Text style={styles.oddsOptionText}>{option.label}</Text>
                {option.bookmaker ? <Text style={styles.oddsBookmaker}>{option.bookmaker}</Text> : null}
              </Pressable>
            ))}

            <Text style={styles.fieldLabel}>Confidence (1-10)</Text>
            <TextInput
              keyboardType="number-pad"
              maxLength={2}
              onChangeText={setConfidence}
              style={styles.input}
              value={confidence}
            />

            <Text style={styles.fieldLabel}>Reasoning</Text>
            <TextInput
              multiline
              onChangeText={setReasoning}
              placeholder="Why do you like this pick?"
              placeholderTextColor="#7f86a3"
              style={[styles.input, styles.reasoningInput]}
              value={reasoning}
            />

            <Pressable
              disabled={isSavingPick}
              onPress={handleSavePick}
              style={[styles.primaryButton, isSavingPick && styles.disabledButton]}
            >
              {isSavingPick ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.primaryButtonText}>Save Pick</Text>
              )}
            </Pressable>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Picks For This Game</Text>
            <Text style={styles.countBadge}>{gamePicks.length}</Text>
          </View>
          {gamePicks.length ? (
            gamePicks.map((pick) => (
              <PickCard key={pick.id} pick={pick} onLike={(id) => { void likeUserPick(id); }} />
            ))
          ) : (
            <View style={styles.emptyBox}>
              <Text style={styles.mutedText}>No picks have been posted for this game yet.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1a1a2e' },
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  content: { padding: 16, paddingBottom: 28 },
  backButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#0f3460',
    borderRadius: 10,
    justifyContent: 'center',
    marginBottom: 12,
    minHeight: 38,
    paddingHorizontal: 14,
  },
  backText: { color: '#ffffff', fontSize: 13, fontWeight: '800' },
  hero: {
    backgroundColor: '#16213e',
    borderColor: '#0f3460',
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  heroTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  leagueBadge: { color: '#a0a0a0', fontSize: 13, fontWeight: '800' },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  status_live: { backgroundColor: '#ff4444' },
  status_final: { backgroundColor: '#333333' },
  status_upcoming: { backgroundColor: '#0f3460' },
  statusText: { color: '#ffffff', fontSize: 10, fontWeight: '900' },
  matchup: { color: '#ffffff', fontSize: 24, fontWeight: '900', lineHeight: 31 },
  versus: { color: '#7f86a3', fontSize: 12, fontWeight: '800', marginVertical: 2, textTransform: 'uppercase' },
  scoreRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    minHeight: 50,
  },
  scoreText: { color: '#6c63ff', fontSize: 34, fontWeight: '900' },
  scoreDash: { color: '#7f86a3', fontSize: 28, fontWeight: '900', marginHorizontal: 18 },
  infoGrid: { gap: 8, marginTop: 14 },
  infoBox: {
    backgroundColor: '#101935',
    borderColor: '#0f3460',
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
  },
  infoLabel: { color: '#7f86a3', fontSize: 11, fontWeight: '900', marginBottom: 3, textTransform: 'uppercase' },
  infoValue: { color: '#ffffff', fontSize: 13, fontWeight: '700', lineHeight: 18 },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#6c63ff',
    borderRadius: 12,
    justifyContent: 'center',
    marginTop: 14,
    minHeight: 46,
    paddingHorizontal: 14,
  },
  primaryButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '900' },
  disabledButton: { opacity: 0.5 },
  section: { marginTop: 18 },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: { color: '#ffffff', fontSize: 18, fontWeight: '900', marginBottom: 10 },
  countBadge: {
    backgroundColor: '#0f3460',
    borderRadius: 10,
    color: '#d8d8ff',
    fontSize: 12,
    fontWeight: '900',
    minWidth: 28,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 4,
    textAlign: 'center',
  },
  bookmakerCard: {
    backgroundColor: '#16213e',
    borderColor: '#0f3460',
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    padding: 14,
  },
  bookmakerHeader: {
    alignItems: 'flex-start',
    borderBottomColor: '#0f3460',
    borderBottomWidth: 1,
    marginBottom: 12,
    paddingBottom: 10,
  },
  bookmakerTitle: { color: '#ffffff', fontSize: 15, fontWeight: '900' },
  bookmakerUpdate: { color: '#7f86a3', fontSize: 11, marginTop: 4 },
  marketBlock: { marginBottom: 12 },
  marketTitle: { color: '#C9FF3D', fontSize: 12, fontWeight: '900', marginBottom: 6, textTransform: 'uppercase' },
  outcomeRow: {
    alignItems: 'center',
    backgroundColor: '#101935',
    borderRadius: 9,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  outcomeName: { color: '#ffffff', flex: 1, fontSize: 13, fontWeight: '700', paddingRight: 10 },
  outcomeValue: { color: '#d8d8ff', fontSize: 13, fontWeight: '900', textAlign: 'right' },
  emptyBox: {
    backgroundColor: '#16213e',
    borderColor: '#0f3460',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  mutedText: { color: '#a0a0a0', fontSize: 13, lineHeight: 19 },
  fieldLabel: {
    color: '#d8d8ff',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 8,
    marginTop: 10,
    textTransform: 'uppercase',
  },
  oddsOption: {
    backgroundColor: '#16213e',
    borderColor: '#0f3460',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    padding: 12,
  },
  oddsOptionSelected: { backgroundColor: '#24285a', borderColor: '#6c63ff' },
  oddsOptionText: { color: '#ffffff', fontSize: 14, fontWeight: '800' },
  oddsBookmaker: { color: '#a0a0a0', fontSize: 11, marginTop: 4 },
  input: {
    backgroundColor: '#16213e',
    borderColor: '#0f3460',
    borderRadius: 12,
    borderWidth: 1,
    color: '#ffffff',
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  reasoningInput: { minHeight: 84, textAlignVertical: 'top' },
  errorPanel: { flex: 1, justifyContent: 'center', padding: 20 },
  errorTitle: { color: '#ffffff', fontSize: 24, fontWeight: '900', marginBottom: 8 },
});
