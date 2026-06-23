import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Colors } from '@/constants/colors';

interface ThumbnailStripProps {
  visible: boolean;
  totalPages: number;
  currentPage: number;
  onGoToPage: (page: number) => void;
}

export function ThumbnailStrip({
  visible,
  totalPages,
  currentPage,
  onGoToPage,
}: ThumbnailStripProps) {
  const flatRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!visible || totalPages === 0) return;
    flatRef.current?.scrollToIndex({
      index: Math.max(0, currentPage - 1),
      animated: true,
      viewPosition: 0.5,
    });
  }, [currentPage, visible, totalPages]);

  if (!visible || totalPages === 0) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatRef}
        data={pages}
        horizontal
        keyExtractor={(p) => String(p)}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        onScrollToIndexFailed={() => {}}
        renderItem={({ item: page }) => {
          const isActive = page === currentPage;
          return (
            <TouchableOpacity
              style={[styles.thumb, isActive && styles.thumbActive]}
              onPress={() => onGoToPage(page)}
              activeOpacity={0.7}
            >
              <View style={[styles.thumbInner, isActive && styles.thumbInnerActive]}>
                <Text style={styles.thumbIcon}>📄</Text>
              </View>
              <Text style={[styles.pageNum, isActive && styles.pageNumActive]}>
                {page}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(30,30,30,0.92)',
    paddingVertical: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  list: {
    paddingHorizontal: 8,
  },
  thumb: {
    alignItems: 'center',
    marginHorizontal: 4,
    paddingVertical: 2,
  },
  thumbActive: {},
  thumbInner: {
    width: 50,
    height: 70,
    borderRadius: 4,
    backgroundColor: Colors.cardDark,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  thumbInnerActive: {
    borderColor: Colors.accentLight,
  },
  thumbIcon: {
    fontSize: 28,
  },
  pageNum: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    marginTop: 3,
  },
  pageNumActive: {
    color: Colors.accentLight,
    fontWeight: '700',
  },
});
