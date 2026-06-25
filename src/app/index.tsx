import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { t } from '@/constants/i18n';
import { useFileStore } from '@/store/fileStore';
import { useDocumentPicker } from '@/hooks/useDocumentPicker';
import { FileList } from '@/components/home/FileList';
import { SortFilterBar, SortField, SortDir } from '@/components/home/SortFilterBar';
import { deleteFile } from '@/services/FileService';

export default function HomeScreen() {
  const router = useRouter();
  const { files, removeFile, updateLastOpened } = useFileStore();

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      Alert.alert(
        'App beenden?',
        'Wirklich beenden?',
        [
          { text: 'Abbrechen', style: 'cancel' },
          { text: 'Beenden', style: 'destructive', onPress: () => BackHandler.exitApp() },
        ]
      );
      return true;
    });
    return () => sub.remove();
  }, []);
  const { pickPDF } = useDocumentPicker();
  const [sortField, setSortField] = useState<SortField>('lastOpened');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [isOpening, setIsOpening] = useState(false);

  const sortedFiles = useMemo(() => {
    return [...files].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'lastOpened') cmp = a.lastOpened - b.lastOpened;
      else if (sortField === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortField === 'size') cmp = a.size - b.size;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [files, sortField, sortDir]);

  function handleSort(field: SortField) {
    if (field === sortField) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  }

  async function handleOpenPDF() {
    if (isOpening) return;
    setIsOpening(true);
    try {
      const fileId = await pickPDF({ warnLargeFile: true });
      if (fileId) {
        router.push(`/viewer/${fileId}`);
      }
    } finally {
      setIsOpening(false);
    }
  }

  function handleOpenExisting(fileId: string) {
    updateLastOpened(fileId);
    router.push(`/viewer/${fileId}`);
  }

  async function handleDelete(fileId: string) {
    const file = files.find((f) => f.id === fileId);
    if (file) {
      try {
        await deleteFile(file.cachedPath);
      } catch {
        // File might already be gone
      }
    }
    removeFile(fileId);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.appName}>{t.appName}</Text>
        <TouchableOpacity
          style={[styles.openBtn, isOpening && styles.openBtnDisabled]}
          onPress={handleOpenPDF}
          disabled={isOpening}
          activeOpacity={0.75}
        >
          <Text style={styles.openBtnText}>
            {isOpening ? '...' : '+ ' + t.openFile}
          </Text>
        </TouchableOpacity>
      </View>

      {files.length > 0 && (
        <SortFilterBar
          sortField={sortField}
          sortDir={sortDir}
          onSort={handleSort}
        />
      )}

      <View style={styles.listContainer}>
        <FileList
          files={sortedFiles}
          onOpen={handleOpenExisting}
          onDelete={handleDelete}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.toolbarBg,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  appName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  openBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  openBtnDisabled: {
    opacity: 0.6,
  },
  openBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  listContainer: {
    flex: 1,
  },
});
