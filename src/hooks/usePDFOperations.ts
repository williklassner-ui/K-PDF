import { Alert } from 'react-native';
import { useEditorStore } from '@/store/editorStore';
import { useFileStore } from '@/store/fileStore';
import {
  applyEditsAndSerialize,
  mergePDFs,
  splitPDF,
  addBlankPage,
  addPageFromPDF,
  removePages,
  SplitRange,
} from '@/services/PDFService';
import {
  saveToDocuments,
  replaceFile,
  shareFile,
} from '@/services/FileService';

export function usePDFOperations(fileId: string) {
  const { annotations, formFields, setSaving, setDirty, reset } =
    useEditorStore();
  const { getFile } = useFileStore();

  const file = getFile(fileId);

  async function saveAsCopy(): Promise<string | null> {
    if (!file) return null;
    setSaving(true);
    try {
      const bytes = await applyEditsAndSerialize(
        file.cachedPath,
        annotations,
        formFields
      );
      const baseName = file.name.replace(/\.pdf$/i, '');
      const outputName = `${baseName}_bearbeitet_${Date.now()}.pdf`;
      const savedPath = await saveToDocuments(bytes, outputName);
      setDirty(false);
      return savedPath;
    } catch (e: any) {
      Alert.alert('Fehler', 'Speichern fehlgeschlagen: ' + e.message);
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function saveAndReplace(): Promise<boolean> {
    if (!file) return false;
    setSaving(true);
    try {
      const bytes = await applyEditsAndSerialize(
        file.cachedPath,
        annotations,
        formFields
      );
      await replaceFile(file.cachedPath, bytes);
      setDirty(false);
      return true;
    } catch (e: any) {
      Alert.alert('Fehler', 'Ersetzen fehlgeschlagen: ' + e.message);
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function shareCurrent(): Promise<void> {
    if (!file) return;
    try {
      setSaving(true);
      const bytes = await applyEditsAndSerialize(
        file.cachedPath,
        annotations,
        formFields
      );
      const tmpPath = await saveToDocuments(bytes, `share_${Date.now()}.pdf`);
      await shareFile(tmpPath);
    } catch (e: any) {
      Alert.alert('Fehler', 'Teilen fehlgeschlagen: ' + e.message);
    } finally {
      setSaving(false);
    }
  }

  async function performMerge(extraPaths: string[]): Promise<string | null> {
    if (!file) return null;
    setSaving(true);
    try {
      const allPaths = [file.cachedPath, ...extraPaths];
      const bytes = await mergePDFs(allPaths);
      const baseName = file.name.replace(/\.pdf$/i, '');
      const outputName = `${baseName}_zusammengeführt_${Date.now()}.pdf`;
      return await saveToDocuments(bytes, outputName);
    } catch (e: any) {
      Alert.alert('Fehler', 'Zusammenführen fehlgeschlagen: ' + e.message);
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function performSplit(ranges: SplitRange[]): Promise<string[]> {
    if (!file) return [];
    setSaving(true);
    try {
      const results = await splitPDF(file.cachedPath, ranges);
      const baseName = file.name.replace(/\.pdf$/i, '');
      const paths: string[] = [];
      for (let i = 0; i < results.length; i++) {
        const name = `${baseName}_teil${i + 1}_${Date.now()}.pdf`;
        const path = await saveToDocuments(results[i], name);
        paths.push(path);
      }
      return paths;
    } catch (e: any) {
      Alert.alert('Fehler', 'Aufteilen fehlgeschlagen: ' + e.message);
      return [];
    } finally {
      setSaving(false);
    }
  }

  async function performAddBlankPage(atIndex: number): Promise<boolean> {
    if (!file) return false;
    setSaving(true);
    try {
      const bytes = await addBlankPage(file.cachedPath, atIndex);
      await replaceFile(file.cachedPath, bytes);
      return true;
    } catch (e: any) {
      Alert.alert('Fehler', 'Seite hinzufügen fehlgeschlagen: ' + e.message);
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function performAddPageFromPDF(
    sourcePath: string,
    sourcePageIndex: number,
    atIndex: number
  ): Promise<boolean> {
    if (!file) return false;
    setSaving(true);
    try {
      const bytes = await addPageFromPDF(
        file.cachedPath,
        sourcePath,
        sourcePageIndex,
        atIndex
      );
      await replaceFile(file.cachedPath, bytes);
      return true;
    } catch (e: any) {
      Alert.alert('Fehler', e.message);
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function performRemovePages(pageIndices: number[]): Promise<boolean> {
    if (!file) return false;
    setSaving(true);
    try {
      const bytes = await removePages(file.cachedPath, pageIndices);
      await replaceFile(file.cachedPath, bytes);
      return true;
    } catch (e: any) {
      Alert.alert('Fehler', 'Seiten entfernen fehlgeschlagen: ' + e.message);
      return false;
    } finally {
      setSaving(false);
    }
  }

  return {
    saveAsCopy,
    saveAndReplace,
    shareCurrent,
    performMerge,
    performSplit,
    performAddBlankPage,
    performAddPageFromPDF,
    performRemovePages,
  };
}
