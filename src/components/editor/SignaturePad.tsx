import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native';
import SignatureCanvas from 'react-native-signature-canvas';
import { Colors } from '@/constants/colors';
import { t } from '@/constants/i18n';

interface SignaturePadProps {
  visible: boolean;
  onInsert: (base64: string) => void;
  onClose: () => void;
}

const { width, height } = Dimensions.get('window');

const PEN_COLORS = [
  { color: '#111111', label: 'Schwarz' },
  { color: '#1565C0', label: 'Blau' },
  { color: '#C62828', label: 'Rot' },
  { color: '#ffa000', label: 'Orange' },
];

const WEBSTYLE = `
  .m-signature-pad { border: none; box-shadow: none; }
  .m-signature-pad--footer { display: none; }
  canvas { background: #ffffff; }
`;

export function SignaturePad({ visible, onInsert, onClose }: SignaturePadProps) {
  const sigRef = useRef<any>(null);
  const [penColor, setPenColor] = useState('#111111');

  function handleOK(data: string) {
    onInsert(data);
    onClose();
  }

  function handleClear() {
    sigRef.current?.clearSignature();
  }

  function handleConfirm() {
    sigRef.current?.readSignature();
  }

  function handleColorChange(color: string) {
    setPenColor(color);
    sigRef.current?.changePenColor(color);
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>{t.cancel}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.signatureTitle}</Text>
          <TouchableOpacity onPress={handleConfirm} style={styles.headerBtn}>
            <Text style={[styles.headerBtnText, styles.confirmText]}>
              {t.insertSignature}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.hint}>{t.signatureHint}</Text>

        <View style={styles.colorRow}>
          {PEN_COLORS.map((c) => (
            <TouchableOpacity
              key={c.color}
              style={[
                styles.colorSwatch,
                { backgroundColor: c.color },
                penColor === c.color && styles.colorSwatchActive,
              ]}
              onPress={() => handleColorChange(c.color)}
            />
          ))}
        </View>

        <View style={styles.canvasContainer}>
          <SignatureCanvas
            ref={sigRef}
            onOK={handleOK}
            onEmpty={() => {}}
            descriptionText=""
            clearText={t.clearSignature}
            confirmText={t.insertSignature}
            webStyle={WEBSTYLE}
            autoClear={false}
            imageType="image/png"
            backgroundColor="#ffffff"
            penColor={penColor}
          />
        </View>

        <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
          <Text style={styles.clearBtnText}>🗑 {t.clearSignature}</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surfaceLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderLight,
    paddingTop: 48,
    backgroundColor: Colors.bgLight,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimaryLight,
  },
  headerBtn: {
    padding: 4,
  },
  headerBtnText: {
    fontSize: 16,
    color: Colors.textSecondaryLight,
  },
  confirmText: {
    color: Colors.accent,
    fontWeight: '600',
  },
  hint: {
    textAlign: 'center',
    color: Colors.textSecondaryLight,
    fontSize: 13,
    marginTop: 12,
    marginBottom: 4,
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 10,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSwatchActive: {
    borderColor: Colors.accent,
    transform: [{ scale: 1.2 }],
  },
  canvasContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: 8,
    margin: 16,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  clearBtn: {
    alignSelf: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  clearBtnText: {
    color: Colors.textSecondaryLight,
    fontSize: 15,
  },
});
