import React, { useState, useCallback } from 'react';
import { View, StyleSheet, GestureResponderEvent } from 'react-native';
import { useEditorStore } from '@/store/editorStore';
import { normalizedToScreen } from '@/utils/pdfCoordinates';
import { parseRgbaComponents } from '@/utils/colorUtils';
import type { Annotation } from '@/store/editorStore';

interface DragState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  active: boolean;
}

interface AnnotationCanvasProps {
  pageIndex: number;
  containerWidth: number;
  containerHeight: number;
  onAnnotationAdded?: () => void;
}

function AnnotationRect({
  annotation,
  containerWidth,
  containerHeight,
}: {
  annotation: Annotation;
  containerWidth: number;
  containerHeight: number;
}) {
  const screen = normalizedToScreen(annotation, containerWidth, containerHeight);
  const { r, g, b, a } = parseRgbaComponents(annotation.color ?? 'rgba(255,235,59,0.5)');

  const color =
    annotation.type === 'redact'
      ? 'black'
      : `rgba(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)},${annotation.opacity ?? a})`;

  return (
    <View
      style={{
        position: 'absolute',
        left: screen.x,
        top: screen.y,
        width: screen.width,
        height: screen.height,
        backgroundColor: color,
      }}
      pointerEvents="none"
    />
  );
}

export function AnnotationCanvas({
  pageIndex,
  containerWidth,
  containerHeight,
  onAnnotationAdded,
}: AnnotationCanvasProps) {
  const { activeTool, annotations, highlightColor, addAnnotation } =
    useEditorStore();

  const [drag, setDrag] = useState<DragState | null>(null);

  const pageAnnotations = annotations.filter((a) => a.pageIndex === pageIndex);

  const handleTouchStart = useCallback(
    (e: GestureResponderEvent) => {
      if (activeTool === 'none' || activeTool === 'sign' || activeTool === 'form') return;
      const { locationX, locationY } = e.nativeEvent;
      setDrag({
        startX: locationX,
        startY: locationY,
        currentX: locationX,
        currentY: locationY,
        active: true,
      });
    },
    [activeTool]
  );

  const handleTouchMove = useCallback(
    (e: GestureResponderEvent) => {
      if (!drag?.active) return;
      setDrag((d) =>
        d ? { ...d, currentX: e.nativeEvent.locationX, currentY: e.nativeEvent.locationY } : null
      );
    },
    [drag?.active]
  );

  const handleTouchEnd = useCallback(() => {
    if (!drag?.active) return;

    const rawX = Math.min(drag.startX, drag.currentX);
    const rawY = Math.min(drag.startY, drag.currentY);
    const rawW = Math.abs(drag.currentX - drag.startX);
    const rawH = Math.abs(drag.currentY - drag.startY);

    if (rawW < 5 || rawH < 5) {
      setDrag(null);
      return;
    }

    const x = rawX / containerWidth;
    const y = rawY / containerHeight;
    const width = rawW / containerWidth;
    const height = rawH / containerHeight;

    const annotation: Annotation = {
      id: `${activeTool}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type: activeTool === 'redact' ? 'redact' : 'highlight',
      pageIndex,
      x: Math.max(0, Math.min(1, x)),
      y: Math.max(0, Math.min(1, y)),
      width: Math.min(width, 1 - Math.max(0, x)),
      height: Math.min(height, 1 - Math.max(0, y)),
      color: activeTool === 'redact' ? '#000000' : highlightColor,
      opacity: activeTool === 'redact' ? 1 : 0.4,
    };

    addAnnotation(annotation);
    onAnnotationAdded?.();
    setDrag(null);
  }, [drag, activeTool, pageIndex, containerWidth, containerHeight, highlightColor, addAnnotation, onAnnotationAdded]);

  const isInteractive = activeTool === 'highlight' || activeTool === 'redact';

  const dragPreviewColor =
    activeTool === 'redact' ? 'rgba(0,0,0,0.7)' : highlightColor;

  return (
    <View
      style={[StyleSheet.absoluteFillObject, !isInteractive && styles.passThrough]}
      onStartShouldSetResponder={() => isInteractive}
      onMoveShouldSetResponder={() => isInteractive}
      onResponderGrant={handleTouchStart}
      onResponderMove={handleTouchMove}
      onResponderRelease={handleTouchEnd}
    >
      {pageAnnotations.map((annotation) => (
        <AnnotationRect
          key={annotation.id}
          annotation={annotation}
          containerWidth={containerWidth}
          containerHeight={containerHeight}
        />
      ))}

      {drag?.active && isInteractive && (() => {
        const x = Math.min(drag.startX, drag.currentX);
        const y = Math.min(drag.startY, drag.currentY);
        const w = Math.abs(drag.currentX - drag.startX);
        const h = Math.abs(drag.currentY - drag.startY);
        const { r, g, b, a } = parseRgbaComponents(dragPreviewColor);
        return (
          <View
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: w,
              height: h,
              backgroundColor: `rgba(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)},${a})`,
            }}
            pointerEvents="none"
          />
        );
      })()}
    </View>
  );
}

const styles = StyleSheet.create({
  passThrough: {
    pointerEvents: 'none',
  } as any,
});
