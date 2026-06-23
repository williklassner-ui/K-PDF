import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { t } from '@/constants/i18n';
import type { FileRecord } from '@/store/fileStore';

interface FileCardProps {
  file: FileRecord;
  onOpen: () => void;
  onDelete: () => void;
}

export function FileCard({ file, onOpen, onDelete }: FileCardProps) {
  function confirmDelete() {
    Alert.alert(t.deleteFile, `"${file.name}" entfernen?`, [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.deleteFile,
        style: 'destructive',
        onPress: onDelete,
      },
    ]);
  }

  const lastOpened = new Date(file.lastOpened).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onOpen}
      onLongPress={confirmDelete}
      activeOpacity={0.7}
    >
      <View style={styles.icon}>
        <Text style={styles.iconText}>📄</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {file.name}
        </Text>
        <View style={styles.meta}>
          <Text style={styles.metaText}>{t.fileSize(file.size)}</Text>
          {file.pageCount > 0 && (
            <Text style={styles.metaText}>
              {' · '}
              {file.pageCount} {t.page}{file.pageCount !== 1 ? 'n' : ''}
            </Text>
          )}
          <Text style={styles.metaText}>{' · '}{lastOpened}</Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={confirmDelete}
        style={styles.deleteBtn}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.deleteBtnText}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: Colors.bgLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 24,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimaryLight,
    marginBottom: 4,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaText: {
    fontSize: 12,
    color: Colors.textSecondaryLight,
  },
  deleteBtn: {
    padding: 4,
    marginLeft: 8,
  },
  deleteBtnText: {
    fontSize: 14,
    color: Colors.textSecondaryLight,
  },
});
