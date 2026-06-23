export const t = {
  // Home
  appName: 'K-PDF',
  recentFiles: 'Zuletzt geöffnet',
  noFiles: 'Keine PDF-Dateien',
  noFilesHint: 'Tippe auf + um eine PDF zu öffnen',
  openFile: 'PDF öffnen',
  deleteFile: 'Entfernen',
  fileSize: (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  },

  // Viewer
  page: 'Seite',
  of: 'von',
  search: 'Suchen',
  searchPlaceholder: 'Text suchen...',
  searchNoResults: 'Keine Treffer',
  bookmarks: 'Lesezeichen',
  tableOfContents: 'Inhaltsverzeichnis',
  addBookmark: 'Lesezeichen hinzufügen',
  removeBookmark: 'Lesezeichen entfernen',
  print: 'Drucken',
  share: 'Teilen',
  edit: 'Bearbeiten',
  saveACopy: 'Als Kopie speichern',
  zoomIn: 'Vergrößern',
  zoomOut: 'Verkleinern',
  fitWidth: 'Breite anpassen',
  fitPage: 'Seite anpassen',
  fullscreen: 'Vollbild',
  singlePage: 'Einzelseite',
  continuousScroll: 'Fortlaufend',
  rotate: 'Drehen',
  viewMode: 'Anzeigemodus',
  darkMode: 'Dunkler Modus',
  lightMode: 'Heller Modus',

  // Editor toolbar
  fillForm: 'Formular ausfüllen',
  sign: 'Unterschreiben',
  highlight: 'Markieren',
  redact: 'Schwärzen',
  pages: 'Seiten',
  undo: 'Rückgängig',
  redo: 'Wiederholen',
  done: 'Fertig',
  cancel: 'Abbrechen',
  save: 'Speichern',
  close: 'Schließen',
  confirm: 'Bestätigen',
  delete: 'Löschen',
  apply: 'Anwenden',

  // Highlight colors
  yellow: 'Gelb',
  green: 'Grün',
  blue: 'Blau',
  pink: 'Pink',
  orange: 'Orange',

  // Signature
  signatureTitle: 'Unterschrift',
  signatureHint: 'Zeichne deine Unterschrift',
  clearSignature: 'Löschen',
  insertSignature: 'Einfügen',

  // Redaction
  redactHint: 'Ziehe ein Rechteck über den zu schwärzenden Bereich',
  redactWarning:
    'Hinweis: Dies ist eine visuelle Schwärzung. Der zugrundeliegende Text kann von spezialisierten Tools noch ausgelesen werden.',

  // Page manager
  pageManager: 'Seiten verwalten',
  mergePDFs: 'PDFs zusammenführen',
  splitPDF: 'PDF aufteilen',
  addPage: 'Seite hinzufügen',
  removePage: 'Seite entfernen',
  addBlankPage: 'Leere Seite hinzufügen',
  addFromPDF: 'Seite aus PDF hinzufügen',
  removePageConfirm: 'Seite wirklich entfernen?',
  pageRange: 'Seitenbereich',
  selectPages: 'Seiten auswählen',
  from: 'Von',
  to: 'Bis',
  selectFiles: 'Dateien auswählen',
  addMoreFiles: '+ Weitere Datei hinzufügen',
  mergeOrder: 'Reihenfolge',
  splitResult: 'Aufteilen in',
  parts: 'Teile',
  processing: 'Wird verarbeitet...',
  done2: 'Erledigt',
  pagesSelected: (n: number) => `${n} Seite${n !== 1 ? 'n' : ''} ausgewählt`,
  pageN: (n: number) => `Seite ${n}`,

  // Save options
  saveOptions: 'Speichern',
  saveAsCopy: 'Als Kopie speichern',
  saveAsCopyHint: 'Erstellt eine neue Datei mit deinen Änderungen',
  replaceOriginal: 'Original ersetzen',
  replaceOriginalHint: 'Überschreibt die Originaldatei mit deinen Änderungen',
  replaceOriginalWarning: 'Die Originaldatei wird unwiderruflich überschrieben.',
  savedSuccessfully: 'Erfolgreich gespeichert',
  saveError: 'Fehler beim Speichern',

  // Errors
  errorLoadingPDF: 'PDF konnte nicht geladen werden',
  errorOpeningFile: 'Datei konnte nicht geöffnet werden',
  errorProcessing: 'Fehler bei der Verarbeitung',
  fileTooLarge: (mb: number) =>
    `Diese Datei ist ${mb} MB groß. Große Dateien können im Editor langsam sein.`,
  continue: 'Trotzdem öffnen',

  // Settings
  settings: 'Einstellungen',
  theme: 'Design',
  scrollMode: 'Scroll-Modus',
  autoHideToolbar: 'Toolbar automatisch ausblenden',
  about: 'Über K-PDF',
  version: 'Version',
} as const;
