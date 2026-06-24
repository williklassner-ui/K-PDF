export function hexToRgba(hex: string, alpha = 1): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function rgbaToHex(rgba: string): string {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return '#000000';
  const r = parseInt(match[1]).toString(16).padStart(2, '0');
  const g = parseInt(match[2]).toString(16).padStart(2, '0');
  const b = parseInt(match[3]).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

export function withAlpha(rgba: string, alpha: number): string {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return rgba;
  return `rgba(${match[1]},${match[2]},${match[3]},${alpha})`;
}

export function parseRgbaComponents(rgba: string): {
  r: number;
  g: number;
  b: number;
  a: number;
} {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!match) return { r: 0, g: 0, b: 0, a: 1 };
  return {
    r: parseInt(match[1]),
    g: parseInt(match[2]),
    b: parseInt(match[3]),
    a: match[4] ? parseFloat(match[4]) : 1,
  };
}

export function skiaColor(rgba: string): { r: number; g: number; b: number; a: number } {
  const { r, g, b, a } = parseRgbaComponents(rgba);
  return { r: r / 255, g: g / 255, b: b / 255, a };
}
