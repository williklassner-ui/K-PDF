import { useEditorStore, Annotation } from '@/store/editorStore';
import { useCallback } from 'react';
import { clampNormalizedRect } from '@/utils/pdfCoordinates';

export function useAnnotations(pageIndex: number) {
  const { annotations, addAnnotation, removeAnnotation, highlightColor } =
    useEditorStore();

  const pageAnnotations = annotations.filter(
    (a) => a.pageIndex === pageIndex
  );

  const addHighlight = useCallback(
    (x: number, y: number, width: number, height: number) => {
      const rect = clampNormalizedRect({ x, y, width, height });
      const annotation: Annotation = {
        id: `hl-${Date.now()}-${Math.random()}`,
        type: 'highlight',
        pageIndex,
        ...rect,
        color: highlightColor,
        opacity: 0.4,
      };
      addAnnotation(annotation);
    },
    [pageIndex, highlightColor, addAnnotation]
  );

  const addRedaction = useCallback(
    (x: number, y: number, width: number, height: number) => {
      const rect = clampNormalizedRect({ x, y, width, height });
      const annotation: Annotation = {
        id: `rd-${Date.now()}-${Math.random()}`,
        type: 'redact',
        pageIndex,
        ...rect,
        color: '#000000',
        opacity: 1,
      };
      addAnnotation(annotation);
    },
    [pageIndex, addAnnotation]
  );

  const addSignature = useCallback(
    (
      imageBase64: string,
      x: number,
      y: number,
      width: number,
      height: number
    ) => {
      const rect = clampNormalizedRect({ x, y, width, height });
      const annotation: Annotation = {
        id: `sig-${Date.now()}-${Math.random()}`,
        type: 'signature',
        pageIndex,
        ...rect,
        imageBase64,
      };
      addAnnotation(annotation);
    },
    [pageIndex, addAnnotation]
  );

  return {
    pageAnnotations,
    addHighlight,
    addRedaction,
    addSignature,
    removeAnnotation,
  };
}
