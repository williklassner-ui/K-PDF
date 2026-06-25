import React, { useState, useCallback } from 'react';
import { View, StyleSheet, GestureResponderEvent } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
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
  drawMode?: 'rect' | 'free';
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
      : `rgba(${r},${g},${b},${annotation.opacity ?? a})`;

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

function FreehandAnnotation({
  annotation,
  containerWidth,
  containerHeight,
}: {
  annotation: Annotation;
  containerWidth: number;
  containerHeight: number;
}) {
  if (!annotation.points || annotation.points.length < 2) return null;

  const { r, g, b, a } = parseRgbaComponents(annotation.color ?? 'rgba(255,235,59,0.5)');
  const strokeColor = `rgb(${r},${g},${b})`;
  const strokeOpacity = annotation.opacity ?? a;

  const pointsStr = annotation.points
    .map((p) => `${p.x * containerWidth},${p.y * containerHeight}`)
    .join(' ');

  return (
    <Svg style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <Polyline
        points={pointsStr}
        fill="none"
        stroke={strokeColor}
        strokeWidth={18}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity={strokeOpacity}
      />
    </Svg>
  );
}

export function AnnotationCanvas({
  pageIndex,
  containerWidth,
  containerHeight,
  onAnnotationAdded,
  drawMode = 'rect',
}: AnnotationCanvasProps) {
  const { activeTool, annotations, highlightColor, addAnnotation } =
    useEditorStore();

  const [drag, setDrag] = useState<DragState | null>(null);
  const [freehandPoints, setFreehandPoints] = useState<Array<{ x: number; y: number }>>([]);
  const [freehandActive, setFreehandActive] = useState(false);

  const pageAnnotations = annotations.filter((a) => a.pageIndex === pageIndex);
  const isFreehand = activeTool === 'highlight' && drawMode === 'free';
  const isInteractive = activeTool === 'highlight' || activeTool === 'redact';

  const handleTouchStart = useCallback(
    (e: GestureResponderEvent) => {
      if (!isInteractive) return;
      const { locationX, locationY } = e.nativeEvent;

      if (isFreehand) {
        setFreehandPoints([{ x: locationX / containerWidth, y: locationY / containerHeight }]);
        setFreehandActive(true);
      } else {
        setDrag({
          startX: locationX,
          startY: locationY,
          currentX: locationX,
          currentY: locationY,
          active: true,
        });
      }
    },
    [isInteractive, isFreehand, containerWidth, containerHeight]
  );

  const handleTouchMove = useCallback(
    (e: GestureResponderEvent) => {
      const { locationX, locationY } = e.nativeEvent;
      if (isFreehand && freehandActive) {
        setFreehandPoints((pts) => [
          ...pts,
          { x: locationX / containerWidth, y: locationY / containerHeight },
        ]);
      } else if (drag?.active) {
        setDrag((d) =>
          d ? { ...d, currentX: locationX, currentY: locationY } : null
        );
      }
    },
    [drag?.active, freehandActive, isFreehand, containerWidth, containerHeight]
  );

  const handleTouchEnd = useCallback(() => {
    if (isFreehand && freehandActive) {
      if (freehandPoints.length >= 3) {
        const xs = freehandPoints.map((p) => p.x);
        const ys = freehandPoints.map((p) => p.y);
        const annotation: Annotation = {
          id: `highlight-free-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          type: 'highlight',
          pageIndex,
          x: Math.min(...xs),
          y: Math.min(...ys),
          width: Math.max(...xs) - Math.min(...xs),
          height: Math.max(...ys) - Math.min(...ys),
          color: highlightColor,
          opacity: 0.6,
          points: freehandPoints,
        };
        addAnnotation(annotation);
        onAnnotationAdded?.();
      }
      setFreehandPoints([]);
      setFreehandActive(false);
      return;
    }

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
  }, [drag, freehandActive, freehandPoints, isFreehand, activeTool, pageIndex, containerWidth, containerHeight, highlightColor, addAnnotation, onAnnotationAdded]);

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
      {pageAnnotations.map((annotation) =>
        annotation.points && annotation.points.length >= 2 ? (
          <FreehandAnnotation
            key={annotation.id}
            annotation={annotation}
            containerWidth={containerWidth}
            containerHeight={containerHeight}
          />
        ) : (
          <AnnotationRect
            key={annotation.id}
            annotation={annotation}
            containerWidth={containerWidth}
            containerHeight={containerHeight}
          />
        )
      )}

      {drag?.active && !isFreehand && (() => {
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
              backgroundColor: `rgba(${r},${g},${b},${a})`,
            }}
            pointerEvents="none"
          />
        );
      })()}

      {freehandActive && freehandPoints.length >= 2 && (() => {
        const { r, g, b, a } = parseRgbaComponents(highlightColor);
        const strokeColor = `rgb(${r},${g},${b})`;
        const pointsStr = freehandPoints
          .map((p) => `${p.x * containerWidth},${p.y * containerHeight}`)
          .join(' ');
        return (
          <Svg style={StyleSheet.absoluteFillObject} pointerEvents="none">
            <Polyline
              points={pointsStr}
              fill="none"
              stroke={strokeColor}
              strokeWidth={18}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity={0.6}
            />
          </Svg>
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
