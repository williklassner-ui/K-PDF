import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';
import { cacheFile, generateFileId, getFileInfo } from '@/services/FileService';
import { useFileStore } from '@/store/fileStore';
import { getPageCount } from '@/services/PDFService';

const SIZE_WARN_BYTES = 50 * 1024 * 1024; // 50 MB

export function useDocumentPicker() {
  const { addFile } = useFileStore();

  async function pickPDF(options?: {
    warnLargeFile?: boolean;
  }): Promise<string | null> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: false,
      });

      if (result.canceled || !result.assets?.length) return null;

      const asset = result.assets[0];
      const { uri, name = 'document.pdf', size = 0 } = asset;

      if (options?.warnLargeFile && size > SIZE_WARN_BYTES) {
        await new Promise<void>((resolve, reject) => {
          Alert.alert(
            'Große Datei',
            `Diese Datei ist ${(size / (1024 * 1024)).toFixed(1)} MB groß. Der Editor kann bei großen Dateien langsam sein.`,
            [
              { text: 'Abbrechen', onPress: () => reject(new Error('cancelled')), style: 'cancel' },
              { text: 'Trotzdem öffnen', onPress: () => resolve() },
            ]
          );
        });
      }

      // Copy from content:// to file:// (required for react-native-webview and pdf-lib)
      const cachedPath = await cacheFile(uri, name);
      const fileInfo = await getFileInfo(cachedPath);
      const fileId = generateFileId(name, size || (fileInfo as any).size || 0);

      let pageCount = 0;
      try {
        pageCount = await getPageCount(cachedPath);
      } catch {
        pageCount = 0;
      }

      addFile({
        id: fileId,
        uri,
        cachedPath,
        name,
        size: size || (fileInfo as any).size || 0,
        pageCount,
        lastOpened: Date.now(),
      });

      return fileId;
    } catch (err: any) {
      if (err.message !== 'cancelled') {
        console.error('DocumentPicker error:', err);
      }
      return null;
    }
  }

  async function pickMultiplePDFs(): Promise<Array<{ path: string; name: string }>> {
    const results: Array<{ path: string; name: string }> = [];

    while (true) {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: false,
      });

      if (result.canceled || !result.assets?.length) break;

      const asset = result.assets[0];
      const { uri, name = 'document.pdf' } = asset;

      try {
        const cachedPath = await cacheFile(uri, name);
        results.push({ path: cachedPath, name });
      } catch {
        break;
      }

      const more = await new Promise<boolean>((resolve) => {
        Alert.alert(
          'Weitere Datei hinzufügen?',
          `${results.length} Datei(en) ausgewählt.`,
          [
            { text: 'Fertig', onPress: () => resolve(false) },
            { text: '+ Weitere hinzufügen', onPress: () => resolve(true) },
          ]
        );
      });

      if (!more) break;
    }

    return results;
  }

  return { pickPDF, pickMultiplePDFs };
}
