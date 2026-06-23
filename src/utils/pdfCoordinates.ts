/**
 * Converts between PDF coordinate space (origin bottom-left, in points)
 * and normalized screen space (origin top-left, 0–1 range).
 */

export interface PDFPoint {
  x: number;
  y: number;
}

export interface NormalizedRect {
  x: number; // 0–1
  y: number; // 0–1
  width: number;
  height: number;
}

export interface ScreenRect {
  x: number; // pixels
  y: number;
  width: number;
  height: number;
}

/** Convert a screen tap (pixels from top-left) to normalized coords. */
export function screenToNormalized(
  screenX: number,
  screenY: number,
  containerWidth: number,
  containerHeight: number
): PDFPoint {
  return {
    x: screenX / containerWidth,
    y: screenY / containerHeight,
  };
}

/** Convert normalized rect to screen pixels. */
export function normalizedToScreen(
  rect: NormalizedRect,
  containerWidth: number,
  containerHeight: number
): ScreenRect {
  return {
    x: rect.x * containerWidth,
    y: rect.y * containerHeight,
    width: rect.width * containerWidth,
    height: rect.height * containerHeight,
  };
}

/** Convert normalized rect to PDF points (y-flipped). */
export function normalizedToPDF(
  rect: NormalizedRect,
  pageWidthPt: number,
  pageHeightPt: number
): { x: number; y: number; width: number; height: number } {
  return {
    x: rect.x * pageWidthPt,
    y: (1 - rect.y - rect.height) * pageHeightPt,
    width: rect.width * pageWidthPt,
    height: rect.height * pageHeightPt,
  };
}

/** Convert PDF points (y-flipped, bottom-left origin) to normalized. */
export function pdfToNormalized(
  pdfX: number,
  pdfY: number,
  pdfWidth: number,
  pdfHeight: number,
  pageWidthPt: number,
  pageHeightPt: number
): NormalizedRect {
  return {
    x: pdfX / pageWidthPt,
    y: 1 - (pdfY + pdfHeight) / pageHeightPt,
    width: pdfWidth / pageWidthPt,
    height: pdfHeight / pageHeightPt,
  };
}

/** Clamp a value between min and max. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Ensure a rect stays within [0,1] bounds. */
export function clampNormalizedRect(rect: NormalizedRect): NormalizedRect {
  const x = clamp(rect.x, 0, 1);
  const y = clamp(rect.y, 0, 1);
  const width = clamp(rect.width, 0, 1 - x);
  const height = clamp(rect.height, 0, 1 - y);
  return { x, y, width, height };
}
