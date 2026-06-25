import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { t } from '@/constants/i18n';
import type { Tool } from '@/store/editorStore';

interface EditorToolbarProps {
  isDirty: boolean;
  isSaving: boolean;
  canUndo: boolean;
  canRedo: boolean;
  activeTool: Tool;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onClose: () => void;
}

export function EditorToolbar({
  isDirty,
  isSaving,
  canUndo,
  canRedo,
  activeTool,
  onUndo,
  onRedo,
  onSave,
  onClose,
}: EditorToolbarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.toolbar, { paddingTop: insets.top + 4 }]}>
      <TouchableOpacity
        onPress={onClose}
        style={styles.iconBtn}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.iconText}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title} numberOfLines={1}>
        {t.edit}
      </Text>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={onUndo}
          style={styles.iconBtn}
          disabled={!canUndo}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
        >
          <Text style={[styles.iconText, !canUndo && styles.iconDisabled]}>⟲</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onRedo}
          style={styles.iconBtn}
          disabled={!canRedo}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
        >
          <Text style={[styles.iconText, !canRedo && styles.iconDisabled]}>⟳</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onSave}
          style={[styles.saveBtn, !isDirty && styles.saveBtnDisabled]}
          disabled={!isDirty || isSaving}
        >
          <Text style={styles.saveBtnText}>
            {isSaving ? '...' : t.save}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    backgroundColor: Colors.toolbarBg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  iconBtn: {
    padding: 6,
  },
  iconText: {
    fontSize: 22,
    color: Colors.toolbarText,
  },
  iconDisabled: {
    color: Colors.toolbarIconDisabled,
  },
  title: {
    flex: 1,
    color: Colors.toolbarText,
    fontSize: 15,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  saveBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 16,
    marginLeft: 4,
  },
  saveBtnDisabled: {
    opacity: 0.4,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
