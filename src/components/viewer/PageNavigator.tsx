import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  GestureResponderEvent,
} from 'react-native';
import { Colors } from '@/constants/colors';

interface PageNavigatorProps {
  visible: boolean;
  currentPage: number;
  totalPages: number;
  onGoToPage: (page: number) => void;
}

export function PageNavigator({
  visible,
  currentPage,
  totalPages,
  onGoToPage,
}: PageNavigatorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');

  if (!visible || totalPages === 0) return null;

  const progress = totalPages > 1 ? (currentPage - 1) / (totalPages - 1) : 0;

  function handleTrackPress(e: GestureResponderEvent) {
    const { locationX, target } = e.nativeEvent;
    (target as any).measure((_x: number, _y: number, width: number) => {
      const ratio = Math.max(0, Math.min(1, locationX / width));
      const page = Math.round(ratio * (totalPages - 1)) + 1;
      onGoToPage(page);
    });
  }

  function handleInputSubmit() {
    const page = parseInt(inputValue, 10);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      onGoToPage(page);
    }
    setIsEditing(false);
    setInputValue('');
    Keyboard.dismiss();
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => onGoToPage(Math.max(1, currentPage - 1))}
        style={styles.navBtn}
        disabled={currentPage <= 1}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 4 }}
      >
        <Text style={[styles.navBtnText, currentPage <= 1 && styles.disabled]}>‹</Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={1}
        style={styles.trackContainer}
        onPress={handleTrackPress}
      >
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progress * 100}%` }]} />
          <View style={[styles.thumb, { left: `${progress * 100}%` }]} />
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setIsEditing(true)}
        style={styles.pageLabel}
        hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
      >
        {isEditing ? (
          <TextInput
            style={styles.pageInput}
            value={inputValue}
            onChangeText={setInputValue}
            keyboardType="number-pad"
            returnKeyType="go"
            onSubmitEditing={handleInputSubmit}
            onBlur={() => setIsEditing(false)}
            autoFocus
            maxLength={5}
          />
        ) : (
          <Text style={styles.pageLabelText}>
            {currentPage} / {totalPages}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => onGoToPage(Math.min(totalPages, currentPage + 1))}
        style={styles.navBtn}
        disabled={currentPage >= totalPages}
        hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
      >
        <Text style={[styles.navBtnText, currentPage >= totalPages && styles.disabled]}>›</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 24,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  navBtn: {
    padding: 4,
  },
  navBtnText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '300',
  },
  disabled: {
    opacity: 0.3,
  },
  trackContainer: {
    flex: 1,
    marginHorizontal: 8,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  track: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    position: 'relative',
    overflow: 'visible',
  },
  fill: {
    height: 3,
    backgroundColor: Colors.accentLight,
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    top: -5,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: Colors.accentLight,
    marginLeft: -6,
  },
  pageLabel: {
    minWidth: 60,
    alignItems: 'center',
  },
  pageLabelText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  pageInput: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
    borderBottomWidth: 1,
    borderBottomColor: Colors.accentLight,
    minWidth: 50,
    textAlign: 'center',
    paddingVertical: 0,
  },
});
