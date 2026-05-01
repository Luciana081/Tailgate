import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Props {
  options: string[];
  selected: string;
  onSelect: (option: string) => void;
}

export default function FilterChips({ options, selected, onSelect }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container} contentContainerStyle={styles.content}>
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
    marginVertical: 12,
  },
  content: {
    paddingHorizontal: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#16213e',
    borderWidth: 1,
    borderColor: '#0f3460',
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: '#6c63ff',
    borderColor: '#6c63ff',
  },
  chipText: {
    color: '#a0a0a0',
    fontSize: 13,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#ffffff',
  },
});
