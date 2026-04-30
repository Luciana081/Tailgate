import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

const COLORS = {
  CARD: '#16213e',
  ACCENT: '#e94560',
  TEXT_PRIMARY: '#e8e8e8',
  TEXT_SECONDARY: '#8892b0',
  BORDER: '#2d2d2d',
};

interface FilterChipsProps {
  options: string[];
  selected: string;
  onSelect: (option: string) => void;
}

export default function FilterChips({ options, selected, onSelect }: FilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {options.map((option) => {
        const isSelected = option === selected;
        return (
          <TouchableOpacity
            key={option}
            style={[styles.chip, isSelected && styles.chipSelected]}
            onPress={() => onSelect(option)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    backgroundColor: COLORS.CARD,
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: COLORS.ACCENT,
    borderColor: COLORS.ACCENT,
  },
  chipText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 13,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: COLORS.TEXT_PRIMARY,
    fontWeight: '700',
  },
});
