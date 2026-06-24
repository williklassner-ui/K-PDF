export const Colors = {
  // Dark theme — black + orange
  primary: '#111111',
  primaryLight: '#1c1c1c',
  primaryDark: '#000000',
  accent: '#ffa000',
  accentLight: '#ffd149',
  accentDark: '#c67100',

  // Backgrounds
  bgLight: '#1a1a1a',
  bgDark: '#0d0d0d',
  surfaceLight: '#242424',
  surfaceDark: '#1a1a1a',
  cardLight: '#2a2a2a',
  cardDark: '#1e1e1e',

  // Text
  textPrimaryLight: '#ffffff',
  textPrimaryDark: '#ffffff',
  textSecondaryLight: '#aaaaaa',
  textSecondaryDark: '#888888',

  // Borders
  borderLight: '#333333',
  borderDark: '#222222',

  // Toolbar
  toolbarBg: '#111111',
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
  pdfBg: '#1a1a1a',
  pageShadow: 'rgba(0,0,0,0.6)',

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
