import React, { useRef } from 'react';
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

const WEBSTYLE = `
  .m-signature-pad { border: none; box-shadow: none; }
  .m-signature-pad--footer { display: none; }
  canvas { background: transparent; }
`;

export function SignaturePad({ visible, onInsert, onClose }: SignaturePadProps) {
  const sigRef = useRef<any>(null);

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
            backgroundColor="rgba(0,0,0,0)"
            penColor={Colors.textPrimaryLight}
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
    color: Colors.primary,
    fontWeight: '600',
  },
  hint: {
    textAlign: 'center',
    color: Colors.textSecondaryLight,
    fontSize: 13,
    marginTop: 12,
    marginBottom: 8,
  },
  canvasContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: 8,
    margin: 16,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceLight,
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
