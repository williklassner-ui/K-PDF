import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Colors } from '@/constants/colors';

export type SortField = 'lastOpened' | 'name' | 'size';
export type SortDir = 'asc' | 'desc';

interface SortFilterBarProps {
  sortField: SortField;
  sortDir: SortDir;
  onSort: (field: SortField) => void;
}

const SORT_OPTIONS: Array<{ key: SortField; label: string }> = [
  { key: 'lastOpened', label: 'Zuletzt geöffnet' },
  { key: 'name', label: 'Name' },
  { key: 'size', label: 'Größe' },
];

export function SortFilterBar({ sortField, sortDir, onSort }: SortFilterBarProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {SORT_OPTIONS.map((opt) => {
          const active = sortField === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => onSort(opt.key)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {opt.label}
                {active ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderLight,
    backgroundColor: Colors.surfaceLight,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.bgLight,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    color: Colors.textSecondaryLight,
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#fff',
  },
});
