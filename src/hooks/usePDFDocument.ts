import { useState, useEffect } from 'react';
import { readFileAsBase64 } from '@/services/FileService';
import { useFileStore } from '@/store/fileStore';

interface PDFDocumentState {
  base64: string | null;
  isLoading: boolean;
  error: string | null;
}

export function usePDFDocument(fileId: string | null) {
  const [state, setState] = useState<PDFDocumentState>({
    base64: null,
    isLoading: false,
    error: null,
  });

  const getFile = useFileStore((s) => s.getFile);

  useEffect(() => {
    if (!fileId) return;

    const file = getFile(fileId);
    if (!file) {
      setState({ base64: null, isLoading: false, error: 'Datei nicht gefunden' });
      return;
    }

    setState({ base64: null, isLoading: true, error: null });

    readFileAsBase64(file.cachedPath)
      .then((base64) => {
        setState({ base64, isLoading: false, error: null });
      })
      .catch((err) => {
        setState({
          base64: null,
          isLoading: false,
          error: err.message ?? 'Unbekannter Fehler',
        });
      });
  }, [fileId]);

  return state;
}
