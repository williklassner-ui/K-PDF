import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { t } from '@/constants/i18n';

interface SearchPanelProps {
  visible: boolean;
  resultCount: number;
  activeIndex: number;
  onSearch: (query: string) => void;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}

export function SearchPanel({
  visible,
  resultCount,
  activeIndex,
  onSearch,
  onNext,
  onPrev,
  onClose,
}: SearchPanelProps) {
  const [query, setQuery] = useState('');

  if (!visible) return null;

  function handleSubmit() {
    Keyboard.dismiss();
    if (query.trim()) onSearch(query.trim());
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder={t.searchPlaceholder}
          placeholderTextColor={Colors.textSecondaryLight}
          returnKeyType="search"
          onSubmitEditing={handleSubmit}
          autoFocus
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSubmit}>
          <Text style={styles.searchBtnText}>🔍</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      {resultCount > 0 && (
        <View style={styles.resultRow}>
          <Text style={styles.resultText}>
            {activeIndex + 1} / {resultCount} Treffer
          </Text>
          <TouchableOpacity onPress={onPrev} style={styles.navBtn}>
            <Text style={styles.navBtnText}>↑</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onNext} style={styles.navBtn}>
            <Text style={styles.navBtnText}>↓</Text>
          </TouchableOpacity>
        </View>
      )}

      {query.trim() && resultCount === 0 && (
        <Text style={styles.noResults}>{t.searchNoResults}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderLight,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: Colors.bgLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    color: Colors.textPrimaryLight,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  searchBtn: {
    marginLeft: 8,
    padding: 8,
  },
  searchBtnText: {
    fontSize: 18,
  },
  closeBtn: {
    marginLeft: 4,
    padding: 8,
  },
  closeBtnText: {
    fontSize: 16,
    color: Colors.textSecondaryLight,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  resultText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondaryLight,
  },
  navBtn: {
    padding: 6,
    marginLeft: 4,
  },
  navBtnText: {
    fontSize: 18,
    color: Colors.primary,
  },
  noResults: {
    marginTop: 6,
    fontSize: 13,
    color: Colors.textSecondaryLight,
  },
});
