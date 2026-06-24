import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { t } from '@/constants/i18n';
import { usePDFOperations } from '@/hooks/usePDFOperations';
import { useDocumentPicker } from '@/hooks/useDocumentPicker';
import { useFileStore } from '@/store/fileStore';

type Tab = 'merge' | 'split' | 'add' | 'remove';

interface PageManagerPanelProps {
  visible: boolean;
  fileId: string;
  totalPages: number;
  currentPage: number;
  onClose: () => void;
  onReload: () => void;
}

export function PageManagerPanel({
  visible,
  fileId,
  totalPages,
  currentPage,
  onClose,
  onReload,
}: PageManagerPanelProps) {
  const [tab, setTab] = useState<Tab>('add');
  const [isWorking, setIsWorking] = useState(false);
  const [splitFrom, setSplitFrom] = useState('1');
  const [splitTo, setSplitTo] = useState(String(totalPages));

  const ops = usePDFOperations(fileId);
  const { pickMultiplePDFs, pickPDF: pickSinglePDF } = useDocumentPicker();

  async function handleAddBlank() {
    setIsWorking(true);
    const ok = await ops.performAddBlankPage(currentPage);
    setIsWorking(false);
    if (ok) {
      onReload();
      onClose();
    }
  }

  async function handleAddFromPDF() {
    const fileId = await pickSinglePDF();
    if (!fileId) return;
    setIsWorking(true);
    const pickedFile = useFileStore.getState().getFile(fileId);
    if (pickedFile) {
      const ok = await ops.performAddPageFromPDF(pickedFile.cachedPath, 0, currentPage);
      setIsWorking(false);
      if (ok) {
        onReload();
        onClose();
      }
    } else {
      setIsWorking(false);
    }
  }

  async function handleRemoveCurrent() {
    Alert.alert(t.removePage, t.removePageConfirm, [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.delete,
        style: 'destructive',
        onPress: async () => {
          setIsWorking(true);
          const ok = await ops.performRemovePages([currentPage - 1]);
          setIsWorking(false);
          if (ok) {
            onReload();
            onClose();
          }
        },
      },
    ]);
  }

  async function handleMerge() {
    const extras = await pickMultiplePDFs();
    if (!extras.length) return;
    setIsWorking(true);
    const result = await ops.performMerge(extras.map((e) => e.path));
    setIsWorking(false);
    if (result) {
      Alert.alert(t.done2, t.savedSuccessfully);
      onClose();
    }
  }

  async function handleSplit() {
    const from = parseInt(splitFrom, 10);
    const to = parseInt(splitTo, 10);
    if (isNaN(from) || isNaN(to) || from > to || to > totalPages) {
      Alert.alert('Fehler', 'Ungültiger Seitenbereich');
      return;
    }
    setIsWorking(true);
    const paths = await ops.performSplit([{ from, to }]);
    setIsWorking(false);
    if (paths.length) {
      Alert.alert(t.done2, t.savedSuccessfully);
      onClose();
    }
  }

  const TABS: Array<{ key: Tab; label: string; icon: string }> = [
    { key: 'add', label: t.addPage, icon: '➕' },
    { key: 'remove', label: t.removePage, icon: '🗑' },
    { key: 'merge', label: t.mergePDFs, icon: '🔗' },
    { key: 'split', label: t.splitPDF, icon: '✂️' },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        onPress={onClose}
        activeOpacity={1}
      />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>{t.pageManager}</Text>

        <View style={styles.tabs}>
          {TABS.map((tab_) => (
            <TouchableOpacity
              key={tab_.key}
              style={[styles.tabBtn, tab === tab_.key && styles.tabBtnActive]}
              onPress={() => setTab(tab_.key)}
            >
              <Text style={styles.tabIcon}>{tab_.icon}</Text>
              <Text
                style={[
                  styles.tabLabel,
                  tab === tab_.key && styles.tabLabelActive,
                ]}
                numberOfLines={1}
              >
                {tab_.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView style={styles.content}>
          {isWorking ? (
            <View style={styles.working}>
              <ActivityIndicator color={Colors.primary} />
              <Text style={styles.workingText}>{t.processing}</Text>
            </View>
          ) : (
            <>
              {tab === 'add' && (
                <View style={styles.tabContent}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={handleAddBlank}
                  >
                    <Text style={styles.actionBtnText}>📄 {t.addBlankPage}</Text>
                    <Text style={styles.actionBtnHint}>
                      Nach Seite {currentPage} einfügen
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={handleAddFromPDF}
                  >
                    <Text style={styles.actionBtnText}>📋 {t.addFromPDF}</Text>
                    <Text style={styles.actionBtnHint}>
                      Seite aus einem anderen PDF einfügen
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {tab === 'remove' && (
                <View style={styles.tabContent}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionBtnDanger]}
                    onPress={handleRemoveCurrent}
                  >
                    <Text style={[styles.actionBtnText, styles.dangerText]}>
                      🗑 Aktuelle Seite ({currentPage}) entfernen
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {tab === 'merge' && (
                <View style={styles.tabContent}>
                  <Text style={styles.hintText}>
                    Wähle weitere PDF-Dateien, die an dieses Dokument angehängt werden sollen.
                  </Text>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={handleMerge}
                  >
                    <Text style={styles.actionBtnText}>🔗 {t.mergePDFs}</Text>
                  </TouchableOpacity>
                </View>
              )}

              {tab === 'split' && (
                <View style={styles.tabContent}>
                  <Text style={styles.hintText}>
                    Speichert den gewählten Seitenbereich als neue Datei.
                  </Text>
                  <View style={styles.rangeRow}>
                    <View style={styles.rangeField}>
                      <Text style={styles.rangeLabel}>{t.from}</Text>
                      <TextInput
                        style={styles.rangeInput}
                        value={splitFrom}
                        onChangeText={setSplitFrom}
                        keyboardType="number-pad"
                      />
                    </View>
                    <Text style={styles.rangeDash}>–</Text>
                    <View style={styles.rangeField}>
                      <Text style={styles.rangeLabel}>{t.to}</Text>
                      <TextInput
                        style={styles.rangeInput}
                        value={splitTo}
                        onChangeText={setSplitTo}
                        keyboardType="number-pad"
                      />
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={handleSplit}
                  >
                    <Text style={styles.actionBtnText}>✂️ {t.splitPDF}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </ScrollView>

        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
          <Text style={styles.cancelText}>{t.cancel}</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: Colors.surfaceLight,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: '80%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderLight,
    alignSelf: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimaryLight,
    marginBottom: 16,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.bgLight,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  tabBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 10,
    color: Colors.textSecondaryLight,
    fontWeight: '500',
    textAlign: 'center',
  },
  tabLabelActive: {
    color: '#fff',
  },
  content: {
    maxHeight: 300,
  },
  tabContent: {
    gap: 12,
  },
  working: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  workingText: {
    color: Colors.textSecondaryLight,
    fontSize: 14,
  },
  actionBtn: {
    backgroundColor: Colors.bgLight,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  actionBtnDanger: {
    borderColor: Colors.error,
    backgroundColor: '#fff5f5',
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimaryLight,
  },
  actionBtnHint: {
    fontSize: 12,
    color: Colors.textSecondaryLight,
    marginTop: 4,
  },
  dangerText: {
    color: Colors.error,
  },
  hintText: {
    fontSize: 13,
    color: Colors.textSecondaryLight,
    marginBottom: 8,
    lineHeight: 18,
  },
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  rangeField: {
    flex: 1,
  },
  rangeLabel: {
    fontSize: 12,
    color: Colors.textSecondaryLight,
    marginBottom: 4,
  },
  rangeInput: {
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: Colors.textPrimaryLight,
    textAlign: 'center',
  },
  rangeDash: {
    fontSize: 20,
    color: Colors.textSecondaryLight,
    marginTop: 16,
  },
  cancelBtn: {
    marginTop: 16,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: Colors.bgLight,
    borderRadius: 12,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondaryLight,
  },
});
