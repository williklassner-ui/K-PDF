import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { t } from '@/constants/i18n';

interface SaveOptionsModalProps {
  visible: boolean;
  isSaving: boolean;
  onSaveAsCopy: () => void;
  onReplaceOriginal: () => void;
  onClose: () => void;
}

export function SaveOptionsModal({
  visible,
  isSaving,
  onSaveAsCopy,
  onReplaceOriginal,
  onClose,
}: SaveOptionsModalProps) {
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

        <Text style={styles.title}>{t.saveOptions}</Text>

        {isSaving ? (
          <View style={styles.loading}>
            <ActivityIndicator color={Colors.primary} />
            <Text style={styles.loadingText}>{t.processing}</Text>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={styles.option}
              onPress={onSaveAsCopy}
            >
              <Text style={styles.optionIcon}>📋</Text>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>{t.saveAsCopy}</Text>
                <Text style={styles.optionHint}>{t.saveAsCopyHint}</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.option}
              onPress={onReplaceOriginal}
            >
              <Text style={styles.optionIcon}>💾</Text>
              <View style={styles.optionText}>
                <Text style={[styles.optionTitle, { color: Colors.error }]}>
                  {t.replaceOriginal}
                </Text>
                <Text style={styles.optionHint}>{t.replaceOriginalHint}</Text>
                <Text style={[styles.optionHint, { color: Colors.error, marginTop: 2 }]}>
                  ⚠ {t.replaceOriginalWarning}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>{t.cancel}</Text>
            </TouchableOpacity>
          </>
        )}
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
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderLight,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimaryLight,
    marginBottom: 20,
  },
  loading: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  loadingText: {
    color: Colors.textSecondaryLight,
    fontSize: 14,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
  },
  optionIcon: {
    fontSize: 28,
    marginRight: 14,
    marginTop: 2,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimaryLight,
    marginBottom: 4,
  },
  optionHint: {
    fontSize: 13,
    color: Colors.textSecondaryLight,
    lineHeight: 18,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.borderLight,
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
