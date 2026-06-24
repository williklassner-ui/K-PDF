import React, { useRef, useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Alert, BackHandler } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import * as Print from 'expo-print';
import { useFileStore } from '@/store/fileStore';
import { useReaderStore } from '@/store/readerStore';
import { usePDFDocument } from '@/hooks/usePDFDocument';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useTheme } from '@/hooks/useTheme';
import { shareFile, saveToDocuments } from '@/services/FileService';
import PDFViewer, { PDFViewerRef } from '@/components/viewer/PDFViewer';
import { ViewerToolbar } from '@/components/viewer/ViewerToolbar';
import { SearchPanel } from '@/components/viewer/SearchPanel';
import { BookmarkPanel } from '@/components/viewer/BookmarkPanel';
import { ThumbnailStrip } from '@/components/viewer/ThumbnailStrip';
import { PageNavigator } from '@/components/viewer/PageNavigator';

export default function ViewerScreen() {
  const { fileId } = useLocalSearchParams<{ fileId: string }>();
  const router = useRouter();

  const file = useFileStore((s) => s.getFile(fileId ?? ''));
  const {
    currentPage,
    totalPages,
    isToolbarVisible,
    isFullscreen,
    isSearchOpen,
    isBookmarkPanelOpen,
    searchResults,
    activeSearchIndex,
    setCurrentPage,
    setTotalPages,
    toggleToolbar,
    toggleFullscreen,
    showToolbar,
    setSearchOpen,
    setBookmarkPanelOpen,
    setSearchResults,
    setActiveSearchIndex,
    setLoaded,
    reset,
  } = useReaderStore();

  const { isDark } = useTheme();
  const [localDark, setLocalDark] = useState(isDark);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [showNavigator, setShowNavigator] = useState(true);

  const { base64, isLoading, error } = usePDFDocument(fileId ?? null);
  const { bookmarks, isCurrentPageBookmarked, toggleBookmark, deleteBookmark } =
    useBookmarks(fileId ?? null);

  const viewerRef = useRef<PDFViewerRef>(null);

  useEffect(() => {
    reset();
  }, [fileId]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      router.back();
      return true;
    });
    return () => sub.remove();
  }, [router]);

  useEffect(() => {
    if (error) Alert.alert('Fehler', error);
  }, [error]);

  const handleLoaded = useCallback(
    (numPages: number) => {
      setTotalPages(numPages);
      setLoaded(true);
      if (file) {
        useFileStore.getState().updatePageCount(file.id, numPages);
      }
    },
    [file, setTotalPages, setLoaded]
  );

  const handlePageChanged = useCallback(
    (page: number) => {
      setCurrentPage(page);
    },
    [setCurrentPage]
  );

  const handleSearch = useCallback(
    (query: string) => {
      viewerRef.current?.search(query);
    },
    []
  );

  const handleSearchResults = useCallback(
    (count: number, pages: number[]) => {
      setSearchResults(
        pages.map((p, i) => ({ page: p, text: '', index: i }))
      );
    },
    [setSearchResults]
  );

  const handleGoToPage = useCallback(
    (page: number) => {
      viewerRef.current?.goToPage(page);
      setCurrentPage(page);
    },
    [setCurrentPage]
  );

  async function handlePrint() {
    if (!file) return;
    try {
      await Print.printAsync({ uri: file.cachedPath });
    } catch (e: any) {
      Alert.alert('Fehler', 'Drucken fehlgeschlagen: ' + e.message);
    }
  }

  async function handleShare() {
    if (!file) return;
    try {
      await shareFile(file.cachedPath);
    } catch (e: any) {
      Alert.alert('Fehler', e.message);
    }
  }

  function handleEdit() {
    if (!fileId) return;
    router.push(`/editor/${fileId}`);
  }

  async function handleToggleFullscreen() {
    if (isFullscreen) {
      await NavigationBar.setVisibilityAsync('visible');
    } else {
      await NavigationBar.setVisibilityAsync('hidden');
    }
    toggleFullscreen();
  }

  async function handleSaveCopy() {
    if (!file || !base64) return;
    try {
      const name = file.name.replace(/\.pdf$/i, '') + '_kopie.pdf';
      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      await saveToDocuments(bytes, name);
      Alert.alert('Gespeichert', 'Kopie wurde gespeichert.');
    } catch (e: any) {
      Alert.alert('Fehler', e.message);
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden={isFullscreen} style="light" />
      <ViewerToolbar
        title={file?.name ?? ''}
        currentPage={currentPage}
        totalPages={totalPages}
        isVisible={isToolbarVisible}
        isBookmarked={isCurrentPageBookmarked}
        isFullscreen={isFullscreen}
        onSearch={() => setSearchOpen(true)}
        onBookmarkPanel={() => {
          setBookmarkPanelOpen(!isBookmarkPanelOpen);
          setShowThumbnails(false);
        }}
        onToggleBookmark={() => toggleBookmark(currentPage)}
        onPrint={handlePrint}
        onShare={handleShare}
        onEdit={handleEdit}
        onSaveCopy={handleSaveCopy}
        onToggleDark={() => {
          const next = !localDark;
          setLocalDark(next);
        }}
        isDark={localDark}
        onMenuToggle={() => setIsMenuOpen((v) => !v)}
        isMenuOpen={isMenuOpen}
        onToggleFullscreen={handleToggleFullscreen}
      />

      {isSearchOpen && (
        <SearchPanel
          visible
          resultCount={searchResults.length}
          activeIndex={activeSearchIndex}
          onSearch={handleSearch}
          onNext={() => {
            viewerRef.current?.nextSearch();
            setActiveSearchIndex((activeSearchIndex + 1) % Math.max(1, searchResults.length));
          }}
          onPrev={() => {
            viewerRef.current?.prevSearch();
            setActiveSearchIndex(
              (activeSearchIndex - 1 + Math.max(1, searchResults.length)) % Math.max(1, searchResults.length)
            );
          }}
          onClose={() => {
            setSearchOpen(false);
            viewerRef.current?.clearSearch();
          }}
        />
      )}

      <View style={styles.pdfContainer}>
        <PDFViewer
          ref={viewerRef}
          base64={base64 ?? undefined}
          onLoaded={handleLoaded}
          onPageChanged={handlePageChanged}
          onSearchResults={handleSearchResults}
          onSearchIndex={(index) => setActiveSearchIndex(index)}
          onTap={() => {
            toggleToolbar();
            setIsMenuOpen(false);
          }}
          style={styles.pdf}
        />
      </View>

      <BookmarkPanel
        visible={isBookmarkPanelOpen}
        bookmarks={bookmarks}
        onGoToPage={(page) => {
          handleGoToPage(page);
          setBookmarkPanelOpen(false);
        }}
        onDeleteBookmark={deleteBookmark}
        onClose={() => setBookmarkPanelOpen(false)}
      />

      <ThumbnailStrip
        visible={showThumbnails}
        totalPages={totalPages}
        currentPage={currentPage}
        onGoToPage={handleGoToPage}
      />

      {showNavigator && (
        <View style={styles.navigator} pointerEvents="box-none">
          <PageNavigator
            visible
            currentPage={currentPage}
            totalPages={totalPages}
            onGoToPage={handleGoToPage}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#525659',
  },
  pdfContainer: {
    flex: 1,
  },
  pdf: {
    flex: 1,
  },
  navigator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 8,
  },
});
