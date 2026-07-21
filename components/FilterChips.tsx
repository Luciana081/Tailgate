import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Props {
  options: string[];
  selected: string;
  onSelect: (option: string) => void;
}

export default function FilterChips({ options, selected, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={[styles.chip, selected === option && styles.chipSelected]}
          onPress={() => onSelect(option)}
        >
          <Text style={[styles.chipText, selected === option && styles.chipTextSelected]}>{option}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
    flexShrink: 0,
    marginTop: 14,
    marginBottom: 14,
    minHeight: 46,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 2,
  },
  chip: {
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#0f3460',
    justifyContent: 'center',
    marginRight: 8,
    minHeight: 38,
    minWidth: 68,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  chipSelected: {
    backgroundColor: '#6c63ff',
    borderColor: '#6c63ff',
  },
  chipText: {
    color: '#d8d8ff',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  chipTextSelected: {
    color: '#ffffff',
  },
});
