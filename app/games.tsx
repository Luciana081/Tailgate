import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import FilterChips from '../components/FilterChips';
import GameCard from '../components/GameCard';
import { games, leagues } from '../lib/mockData';
import { Game, SportOption } from '../lib/types';
import { fetchLiveGames, fetchSoccerTournaments, fetchTennisTournaments } from '../lib/oddsApi';
import { usePicks } from '../lib/PicksContext';
import { getPickOptions, PickOption } from '../lib/oddsFormatting';

const filterOptions = ['All', 'NFL', 'NBA', 'MLB', 'NHL', 'Soccer', 'Tennis'];
const statusOptions = ['All', 'Live', 'Upcoming', 'Final'];

export default function GamesScreen() {
  const router = useRouter();
  const { addPick, settlePicks } = usePicks();
  const [selected, setSelected] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [liveGames, setLiveGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [tennisTournaments, setTennisTournaments] = useState<SportOption[]>([]);
  const [selectedTennisTournament, setSelectedTennisTournament] = useState('');
  const [soccerTournaments] = useState<SportOption[]>(fetchSoccerTournaments());
  const [selectedSoccerTournament, setSelectedSoccerTournament] = useState('');
  const [isTournamentMenuOpen, setIsTournamentMenuOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [selectedPickOption, setSelectedPickOption] = useState<PickOption | null>(null);
  const [confidence, setConfidence] = useState('6');
  const [reasoning, setReasoning] = useState('');
  const [isSavingPick, setIsSavingPick] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadTennisTournaments() {
      const nextTournaments = await fetchTennisTournaments();

      if (isActive) {
        setTennisTournaments(nextTournaments);
      }
    }

    loadTennisTournaments();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadGames() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const nextGames = await fetchLiveGames(
          selected,
          selected === 'Tennis' && selectedTennisTournament
            ? selectedTennisTournament
            : selected === 'Soccer' && selectedSoccerTournament
              ? selectedSoccerTournament
              : undefined,
        );

        if (isActive) {
          setLiveGames(nextGames);
        }
      } catch (error) {
        if (isActive) {
          setLiveGames([]);
          setErrorMessage(error instanceof Error ? error.message : 'Unable to load live games');
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadGames();

    return () => {
      isActive = false;
    };
  }, [selected, selectedSoccerTournament, selectedTennisTournament]);

  useEffect(() => {
    setIsTournamentMenuOpen(false);

    if (selected !== 'Tennis') {
      setSelectedTennisTournament('');
    }

    if (selected !== 'Soccer') {
      setSelectedSoccerTournament('');
    }
  }, [selected]);

  const mockFilteredGames = useMemo(() => {
    return selected === 'All'
      ? games
      : games.filter((g) => {
        const league = leagues.find((l) => l.id === g.leagueId);
        return league?.shortName === selected;
      });
  }, [selected]);

  const displayedGames = liveGames.length > 0 ? liveGames : mockFilteredGames;
  const isUsingLiveData = liveGames.length > 0;
  const selectedTournamentTitle = tennisTournaments.find((item) => item.key === selectedTennisTournament)?.title ?? 'All Tennis Tournaments';
  const selectedSoccerTournamentTitle = soccerTournaments.find((item) => item.key === selectedSoccerTournament)?.title ?? 'All Soccer Competitions';
  const selectedSportLabel = selected === 'All' ? 'All sports' : selected;

  const groupedGames = useMemo(() => {
    return {
      live: displayedGames.filter((game) => game.status === 'live'),
      upcoming: displayedGames.filter((game) => game.status === 'upcoming'),
      final: displayedGames.filter((game) => game.status === 'final'),
    };
  }, [displayedGames]);

  useEffect(() => {
    if (groupedGames.final.length) {
      void settlePicks(groupedGames.final);
    }
  }, [groupedGames.final, settlePicks]);

  const closePickModal = () => {
    setSelectedGame(null);
    setSelectedPickOption(null);
    setConfidence('6');
    setReasoning('');
    setIsSavingPick(false);
  };

  const handleMakePick = (game: Game) => {
    const pickOptions = getPickOptions(game);

    if (!pickOptions.length) {
      Alert.alert('No odds available', 'This game does not have selectable odds from the API right now.');
      return;
    }

    setSelectedGame(game);
    setSelectedPickOption(pickOptions[0]);
    setConfidence('6');
    setReasoning('');
  };

  const handleViewGameDetails = (game: Game) => {
    router.push({
      pathname: '/game-details',
      params: { game: encodeURIComponent(JSON.stringify(game)) },
    });
  };

  const handleSavePick = async () => {
    if (!selectedGame || !selectedPickOption) {
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
      gameId: selectedGame.id,
      leagueId: selectedGame.leagueId,
      gameDescription: `${selectedGame.awayTeamName} vs ${selectedGame.homeTeamName}`,
      prediction: selectedPickOption.prediction,
      confidence: parsedConfidence,
      reasoning: reasoning.trim(),
      oddsBookmaker: selectedPickOption.bookmaker,
      oddsMarket: selectedPickOption.market,
    });
    closePickModal();
    router.push('/picks');
  };

  const pickOptions = selectedGame ? getPickOptions(selectedGame) : [];

  const renderGameSection = (title: string, sectionGames: Game[], emptyText: string) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionCount}>{sectionGames.length}</Text>
      </View>

      {sectionGames.length ? (
        sectionGames.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            canMakePick={getPickOptions(game).length > 0}
            onMakePick={handleMakePick}
            onViewDetails={handleViewGameDetails}
          />
        ))
      ) : (
        <View style={styles.emptySection}>
          <Text style={styles.emptyText}>{emptyText}</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Games</Text>
          <Text style={styles.subtitle}>
            {isUsingLiveData ? 'Live scores and odds from The Odds API' : 'Showing mock data until live data is configured'}
          </Text>
        </View>
        <FilterChips options={filterOptions} selected={selected} onSelect={setSelected} />
        <View style={styles.statusFilterBox}>
          <Text style={styles.statusFilterLabel}>{selectedSportLabel} games</Text>
          <FilterChips options={statusOptions} selected={selectedStatus} onSelect={setSelectedStatus} />
        </View>
        {selected === 'Soccer' && (
          <View style={styles.tournamentBox}>
            <Pressable
              onPress={() => setIsTournamentMenuOpen((isOpen) => !isOpen)}
              style={styles.tournamentButton}
            >
              <View>
                <Text style={styles.tournamentLabel}>Competition</Text>
                <Text style={styles.tournamentTitle}>{selectedSoccerTournamentTitle}</Text>
              </View>
              <Text style={styles.tournamentChevron}>{isTournamentMenuOpen ? '^' : 'v'}</Text>
            </Pressable>

            {isTournamentMenuOpen && (
              <View style={styles.tournamentMenu}>
                <Pressable
                  onPress={() => {
                    setSelectedSoccerTournament('');
                    setIsTournamentMenuOpen(false);
                  }}
                  style={[
                    styles.tournamentOption,
                    selectedSoccerTournament === '' && styles.tournamentOptionSelected,
                  ]}
                >
                  <Text style={styles.tournamentOptionText}>All Soccer Competitions</Text>
                </Pressable>
                {soccerTournaments.map((tournament) => (
                  <Pressable
                    key={tournament.key}
                    onPress={() => {
                      setSelectedSoccerTournament(tournament.key);
                      setIsTournamentMenuOpen(false);
                    }}
                    style={[
                      styles.tournamentOption,
                      selectedSoccerTournament === tournament.key && styles.tournamentOptionSelected,
                    ]}
                  >
                    <Text style={styles.tournamentOptionText}>{tournament.title}</Text>
                    <Text style={styles.tournamentDescription}>{tournament.description}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        )}
        {selected === 'Tennis' && (
          <View style={styles.tournamentBox}>
            <Pressable
              onPress={() => setIsTournamentMenuOpen((isOpen) => !isOpen)}
              style={styles.tournamentButton}
            >
              <View>
                <Text style={styles.tournamentLabel}>Tournament</Text>
                <Text style={styles.tournamentTitle}>{selectedTournamentTitle}</Text>
              </View>
              <Text style={styles.tournamentChevron}>{isTournamentMenuOpen ? '^' : 'v'}</Text>
            </Pressable>

            {isTournamentMenuOpen && (
              <View style={styles.tournamentMenu}>
                <Pressable
                  onPress={() => {
                    setSelectedTennisTournament('');
                    setIsTournamentMenuOpen(false);
                  }}
                  style={[
                    styles.tournamentOption,
                    selectedTennisTournament === '' && styles.tournamentOptionSelected,
                  ]}
                >
                  <Text style={styles.tournamentOptionText}>All Tennis Tournaments</Text>
                </Pressable>
                {tennisTournaments.map((tournament) => (
                  <Pressable
                    key={tournament.key}
                    onPress={() => {
                      setSelectedTennisTournament(tournament.key);
                      setIsTournamentMenuOpen(false);
                    }}
                    style={[
                      styles.tournamentOption,
                      selectedTennisTournament === tournament.key && styles.tournamentOptionSelected,
                    ]}
                  >
                    <Text style={styles.tournamentOptionText}>{tournament.title}</Text>
                    <Text style={styles.tournamentDescription}>{tournament.description}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        )}
        {isLoading && (
          <View style={styles.notice}>
            <ActivityIndicator color="#6c63ff" />
            <Text style={styles.noticeText}>Loading live games...</Text>
          </View>
        )}
        {!isLoading && errorMessage ? (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>Live data unavailable: {errorMessage}</Text>
          </View>
        ) : null}

        {(selectedStatus === 'All' || selectedStatus === 'Live') &&
          renderGameSection('Live', groupedGames.live, 'No live games right now.')}
        {(selectedStatus === 'All' || selectedStatus === 'Upcoming') &&
          renderGameSection('Upcoming', groupedGames.upcoming, 'No upcoming games found for this filter.')}
        {(selectedStatus === 'All' || selectedStatus === 'Final') &&
          renderGameSection('Final', groupedGames.final, 'No final games found for this filter.')}
      </ScrollView>

      <Modal visible={Boolean(selectedGame)} transparent animationType="slide" onRequestClose={closePickModal}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalPanel}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleBlock}>
                <Text style={styles.modalTitle}>Create Pick</Text>
                <Text style={styles.modalSubtitle}>
                  {selectedGame ? `${selectedGame.awayTeamName} vs ${selectedGame.homeTeamName}` : ''}
                </Text>
              </View>
              <Pressable onPress={closePickModal} style={styles.closeButton}>
                <Text style={styles.closeText}>x</Text>
              </Pressable>
            </View>

            <Text style={styles.fieldLabel}>Choose odds</Text>
            <ScrollView style={styles.optionsList}>
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
                  {option.bookmaker && <Text style={styles.oddsBookmaker}>{option.bookmaker}</Text>}
                </Pressable>
              ))}
            </ScrollView>

            <Text style={styles.fieldLabel}>Confidence (1-10)</Text>
            <TextInput
              keyboardType="number-pad"
              onChangeText={setConfidence}
              style={styles.input}
              value={confidence}
              maxLength={2}
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
              style={[styles.saveButton, isSavingPick && styles.saveButtonDisabled]}
            >
              <Text style={styles.saveButtonText}>{isSavingPick ? 'Saving...' : 'Save Pick'}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1a1a2e' },
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  content: { paddingBottom: 28 },
  header: { paddingHorizontal: 20, paddingTop: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#ffffff' },
  subtitle: { color: '#a0a0a0', fontSize: 13, marginTop: 6 },
  notice: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#16213e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0f3460',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noticeText: { color: '#a0a0a0', fontSize: 12, flex: 1 },
  statusFilterBox: {
    marginBottom: 2,
  },
  statusFilterLabel: {
    color: '#7f86a3',
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 20,
    marginBottom: -6,
    textTransform: 'uppercase',
  },
  tournamentBox: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  tournamentButton: {
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderColor: '#0f3460',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  tournamentLabel: {
    color: '#7f86a3',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  tournamentTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  tournamentChevron: {
    color: '#6c63ff',
    fontSize: 13,
    fontWeight: '800',
  },
  tournamentMenu: {
    backgroundColor: '#16213e',
    borderColor: '#0f3460',
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
    overflow: 'hidden',
  },
  tournamentOption: {
    borderBottomColor: '#0f3460',
    borderBottomWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  tournamentOptionSelected: {
    backgroundColor: '#24285a',
  },
  tournamentOptionText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  tournamentDescription: {
    color: '#a0a0a0',
    fontSize: 11,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 10,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
  },
  sectionCount: {
    backgroundColor: '#0f3460',
    borderRadius: 10,
    color: '#d8d8ff',
    fontSize: 12,
    fontWeight: '800',
    minWidth: 28,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 4,
    textAlign: 'center',
  },
  emptySection: {
    backgroundColor: '#16213e',
    borderColor: '#0f3460',
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    padding: 14,
  },
  emptyText: {
    color: '#a0a0a0',
    fontSize: 13,
  },
  modalBackdrop: {
    backgroundColor: 'rgba(5, 8, 20, 0.72)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalPanel: {
    backgroundColor: '#16213e',
    borderColor: '#0f3460',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1,
    maxHeight: '88%',
    padding: 18,
  },
  modalHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  modalTitleBlock: { flex: 1, paddingRight: 12 },
  modalTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  modalSubtitle: {
    color: '#a0a0a0',
    fontSize: 13,
    marginTop: 4,
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: '#0f3460',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  closeText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 18,
  },
  fieldLabel: {
    color: '#d8d8ff',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
    marginTop: 10,
    textTransform: 'uppercase',
  },
  optionsList: {
    maxHeight: 210,
  },
  oddsOption: {
    backgroundColor: '#1a1a2e',
    borderColor: '#0f3460',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    padding: 12,
  },
  oddsOptionSelected: {
    backgroundColor: '#24285a',
    borderColor: '#6c63ff',
  },
  oddsOptionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  oddsBookmaker: {
    color: '#a0a0a0',
    fontSize: 11,
    marginTop: 4,
  },
  input: {
    backgroundColor: '#1a1a2e',
    borderColor: '#0f3460',
    borderRadius: 12,
    borderWidth: 1,
    color: '#ffffff',
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  reasoningInput: {
    minHeight: 84,
    textAlignVertical: 'top',
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: '#6c63ff',
    borderRadius: 12,
    justifyContent: 'center',
    marginTop: 16,
    minHeight: 48,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
});
