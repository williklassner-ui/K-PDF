import React, { useRef, useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  BackHandler,
  TouchableOpacity,
  Text,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFileStore } from '@/store/fileStore';
import { useEditorStore } from '@/store/editorStore';
import { usePDFDocument } from '@/hooks/usePDFDocument';
import { usePDFOperations } from '@/hooks/usePDFOperations';
import { extractFormFields } from '@/services/PDFService';
import PDFViewer, { PDFViewerRef } from '@/components/viewer/PDFViewer';
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { AnnotationCanvas } from '@/components/editor/AnnotationCanvas';
import { SignaturePad } from '@/components/editor/SignaturePad';
import { FormFieldOverlay } from '@/components/editor/FormFieldOverlay';
import { PageManagerPanel } from '@/components/editor/PageManagerPanel';
import { SaveOptionsModal } from '@/components/editor/SaveOptionsModal';
import { Colors, HighlightColors } from '@/constants/colors';
import { t } from '@/constants/i18n';
import type { Tool } from '@/store/editorStore';

export default function EditorScreen() {
  const { fileId } = useLocalSearchParams<{ fileId: string }>();
  const router = useRouter();

  const file = useFileStore((s) => s.getFile(fileId ?? ''));
  const {
    activeTool,
    highlightColor,
    annotations,
    formFields,
    undoStack,
    redoStack,
    isDirty,
    isSaving,
    setTool,
    setHighlightColor,
    setFormFields,
    undo,
    redo,
    reset,
  } = useEditorStore();

  const { base64, isLoading } = usePDFDocument(fileId ?? null);
  const ops = usePDFOperations(fileId ?? '');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [showPageManager, setShowPageManager] = useState(false);
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const viewerRef = useRef<PDFViewerRef>(null);

  useEffect(() => {
    reset();
    return () => reset();
  }, [fileId]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      handleClose();
      return true;
    });
    return () => sub.remove();
  }, [isDirty]);

  useEffect(() => {
    if (activeTool === 'form' && file && formFields.length === 0) {
      extractFormFields(file.cachedPath).then((fields) => {
        setFormFields(
          fields.map((f) => ({
            fieldName: f.name,
            fieldType: f.type,
            value: f.value ?? (f.type === 'checkbox' ? false : ''),
            x: f.x,
            y: f.y,
            width: f.width,
            height: f.height,
            pageIndex: f.pageIndex,
            options: f.options,
          }))
        );
      });
    }
  }, [activeTool, file]);

  function handleClose() {
    if (isDirty) {
      Alert.alert(
        'Nicht gespeicherte Änderungen',
        'Willst du die Änderungen verwerfen?',
        [
          { text: t.cancel, style: 'cancel' },
          {
            text: 'Verwerfen',
            style: 'destructive',
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  }

  async function handleSaveAsCopy() {
    const path = await ops.saveAsCopy();
    setShowSaveOptions(false);
    if (path) {
      Alert.alert(t.savedSuccessfully, 'Gespeichert unter Dokumente/k-pdf/');
    }
  }

  async function handleReplaceOriginal() {
    const ok = await ops.saveAndReplace();
    setShowSaveOptions(false);
    if (ok) {
      Alert.alert(t.savedSuccessfully, 'Originaldatei wurde aktualisiert.');
    }
  }

  function handleSignatureInsert(base64Sig: string) {
    useEditorStore.getState().addAnnotation({
      id: `sig-${Date.now()}`,
      type: 'signature',
      pageIndex: currentPage - 1,
      x: 0.1,
      y: 0.7,
      width: 0.4,
      height: 0.1,
      imageBase64: base64Sig,
    });
    setTool('none');
  }

  const TOOLS: Array<{ key: Tool; label: string; icon: string }> = [
    { key: 'form', label: t.fillForm, icon: '📝' },
    { key: 'sign', label: t.sign, icon: '✍️' },
    { key: 'highlight', label: t.highlight, icon: '🖍️' },
    { key: 'redact', label: t.redact, icon: '⬛' },
    { key: 'none', label: t.pages, icon: '📄' },
  ];

  return (
    <View style={styles.container}>
      <EditorToolbar
        isDirty={isDirty}
        isSaving={isSaving}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        activeTool={activeTool}
        onUndo={undo}
        onRedo={redo}
        onSave={() => setShowSaveOptions(true)}
        onClose={handleClose}
      />

      <View
        style={styles.pdfContainer}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          setCanvasSize({ width, height });
        }}
      >
        <PDFViewer
          ref={viewerRef}
          base64={base64 ?? undefined}
          onLoaded={(n) => setTotalPages(n)}
          onPageChanged={(p) => setCurrentPage(p)}
          style={StyleSheet.absoluteFillObject}
        />

        {canvasSize.width > 0 && (
          <AnnotationCanvas
            pageIndex={currentPage - 1}
            containerWidth={canvasSize.width}
            containerHeight={canvasSize.height}
          />
        )}

        {activeTool === 'form' && canvasSize.width > 0 && (
          <FormFieldOverlay
            pageIndex={currentPage - 1}
            containerWidth={canvasSize.width}
            containerHeight={canvasSize.height}
          />
        )}
      </View>

      {activeTool === 'highlight' && showColorPicker && (
        <View style={styles.colorPicker}>
          {HighlightColors.map((c) => (
            <TouchableOpacity
              key={c.name}
              style={[
                styles.colorSwatch,
                { backgroundColor: c.solid },
                highlightColor === c.color && styles.colorSwatchActive,
              ]}
              onPress={() => {
                setHighlightColor(c.color);
                setShowColorPicker(false);
              }}
            />
          ))}
        </View>
      )}

      <View style={styles.bottomBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.toolsRow}
        >
          {TOOLS.map((tool) => {
            const isActive = activeTool === tool.key && tool.key !== 'none';
            return (
              <TouchableOpacity
                key={tool.key}
                style={[styles.toolBtn, isActive && styles.toolBtnActive]}
                onPress={() => {
                  if (tool.key === 'none') {
                    setShowPageManager(true);
                    return;
                  }
                  if (activeTool === tool.key) {
                    setTool('none');
                    return;
                  }
                  setTool(tool.key);
                  if (tool.key === 'sign') setShowSignaturePad(true);
                  if (tool.key === 'highlight') setShowColorPicker(true);
                }}
              >
                <Text style={styles.toolIcon}>{tool.icon}</Text>
                <Text
                  style={[styles.toolLabel, isActive && styles.toolLabelActive]}
                >
                  {tool.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <SignaturePad
        visible={showSignaturePad}
        onInsert={handleSignatureInsert}
        onClose={() => {
          setShowSignaturePad(false);
          setTool('none');
        }}
      />

      <PageManagerPanel
        visible={showPageManager}
        fileId={fileId ?? ''}
        totalPages={totalPages}
        currentPage={currentPage}
        onClose={() => setShowPageManager(false)}
        onReload={() => viewerRef.current?.reload()}
      />

      <SaveOptionsModal
        visible={showSaveOptions}
        isSaving={isSaving}
        onSaveAsCopy={handleSaveAsCopy}
        onReplaceOriginal={handleReplaceOriginal}
        onClose={() => setShowSaveOptions(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.pdfBg,
  },
  pdfContainer: {
    flex: 1,
    position: 'relative',
  },
  bottomBar: {
    backgroundColor: Colors.toolbarBg,
    paddingVertical: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: -2 },
  },
  toolsRow: {
    paddingHorizontal: 12,
    gap: 8,
    flexDirection: 'row',
  },
  toolBtn: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 68,
  },
  toolBtnActive: {
    backgroundColor: 'rgba(255,160,0,0.25)',
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  toolIcon: {
    fontSize: 22,
    marginBottom: 2,
  },
  toolLabel: {
    fontSize: 11,
    color: Colors.toolInactive,
    fontWeight: '500',
  },
  toolLabelActive: {
    color: Colors.toolActive,
    fontWeight: '700',
  },
  colorPicker: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.toolbarBg,
    paddingVertical: 8,
    gap: 12,
  },
  colorSwatch: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSwatchActive: {
    borderColor: '#fff',
    transform: [{ scale: 1.2 }],
  },
});
