import React from 'react';
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { t } from '@/constants/i18n';
import { FileCard } from './FileCard';
import type { FileRecord } from '@/store/fileStore';

interface FileListProps {
  files: FileRecord[];
  onOpen: (fileId: string) => void;
  onDelete: (fileId: string) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export function FileList({
  files,
  onOpen,
  onDelete,
  onRefresh,
  refreshing = false,
}: FileListProps) {
  if (files.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>📂</Text>
        <Text style={styles.emptyText}>{t.noFiles}</Text>
        <Text style={styles.emptyHint}>{t.noFilesHint}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={files}
      keyExtractor={(f) => f.id}
      renderItem={({ item }) => (
        <FileCard
          file={item}
          onOpen={() => onOpen(item.id)}
          onDelete={() => onDelete(item.id)}
        />
      )}
      contentContainerStyle={styles.list}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        ) : undefined
      }
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingVertical: 8,
    paddingBottom: 16,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textSecondaryLight,
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: Colors.textSecondaryLight,
    textAlign: 'center',
    lineHeight: 20,
  },
});
