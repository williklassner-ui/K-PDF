import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { t } from '@/constants/i18n';
import type { Bookmark } from '@/store/readerStore';

interface BookmarkPanelProps {
  visible: boolean;
  bookmarks: Bookmark[];
  onGoToPage: (page: number) => void;
  onDeleteBookmark: (id: string) => void;
  onClose: () => void;
}

export function BookmarkPanel({
  visible,
  bookmarks,
  onGoToPage,
  onDeleteBookmark,
  onClose,
}: BookmarkPanelProps) {
  if (!visible) return null;

  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.bookmarks}</Text>
        <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      {bookmarks.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Noch keine Lesezeichen</Text>
          <Text style={styles.emptyHint}>
            Tippe auf das Seitenicon in der Toolbar um ein Lesezeichen hinzuzufügen
          </Text>
        </View>
      ) : (
        <FlatList
          data={bookmarks}
          keyExtractor={(b) => b.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.bookmarkItem}
              onPress={() => onGoToPage(item.page)}
            >
              <Text style={styles.bookmarkTitle}>{item.title}</Text>
              <View style={styles.bookmarkRight}>
                <Text style={styles.bookmarkPage}>S. {item.page}</Text>
                <TouchableOpacity
                  onPress={() => onDeleteBookmark(item.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.deleteText}>✕</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => (
            <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: Colors.borderLight }} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: Colors.surfaceLight,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: -2, height: 0 },
    zIndex: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderLight,
    backgroundColor: Colors.bgLight,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimaryLight,
  },
  closeText: {
    fontSize: 16,
    color: Colors.textSecondaryLight,
  },
  empty: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondaryLight,
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 13,
    color: Colors.textSecondaryLight,
    textAlign: 'center',
    lineHeight: 18,
  },
  bookmarkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bookmarkTitle: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimaryLight,
  },
  bookmarkRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bookmarkPage: {
    fontSize: 12,
    color: Colors.textSecondaryLight,
    backgroundColor: Colors.bgLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  deleteText: {
    fontSize: 14,
    color: Colors.error,
    padding: 4,
  },
});
