export const Colors = {
  primary: '#1a237e',
  primaryLight: '#534bae',
  primaryDark: '#000051',
  accent: '#ffa000',
  accentLight: '#ffd149',
  accentDark: '#c67100',

  // Backgrounds
  bgLight: '#f5f5f5',
  bgDark: '#121212',
  surfaceLight: '#ffffff',
  surfaceDark: '#1e1e1e',
  cardLight: '#ffffff',
  cardDark: '#2d2d2d',

  // Text
  textPrimaryLight: '#212121',
  textPrimaryDark: '#ffffff',
  textSecondaryLight: '#757575',
  textSecondaryDark: '#b0b0b0',

  // Borders
  borderLight: '#e0e0e0',
  borderDark: '#3d3d3d',

  // Toolbar
  toolbarBg: '#1a237e',
  toolbarText: '#ffffff',
  toolbarIcon: '#ffffff',
  toolbarIconDisabled: 'rgba(255,255,255,0.4)',

  // Editor tools
  toolActive: '#ffa000',
  toolInactive: 'rgba(255,255,255,0.7)',

  // Highlight colors
  highlightYellow: 'rgba(255, 235, 59, 0.5)',
  highlightGreen: 'rgba(76, 175, 80, 0.5)',
  highlightBlue: 'rgba(33, 150, 243, 0.5)',
  highlightPink: 'rgba(233, 30, 99, 0.5)',
  highlightOrange: 'rgba(255, 152, 0, 0.5)',

  // PDF viewer
  pdfBg: '#525659',
  pageShadow: 'rgba(0,0,0,0.4)',

  // Status
  error: '#d32f2f',
  success: '#388e3c',
  warning: '#f57c00',
  info: '#1976d2',

  // Redaction
  redactColor: '#000000',
} as const;

export const HighlightColors = [
  { name: 'yellow', color: Colors.highlightYellow, solid: '#FFEB3B' },
  { name: 'green', color: Colors.highlightGreen, solid: '#4CAF50' },
  { name: 'blue', color: Colors.highlightBlue, solid: '#2196F3' },
  { name: 'pink', color: Colors.highlightPink, solid: '#E91E63' },
  { name: 'orange', color: Colors.highlightOrange, solid: '#FF9800' },
] as const;
