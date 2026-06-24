import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useReaderStore, Bookmark } from '@/store/readerStore';

function bookmarkKey(fileId: string) {
  return `k-pdf-bookmarks-${fileId}`;
}

export function useBookmarks(fileId: string | null) {
  const { bookmarks, setBookmarks, addBookmark, removeBookmark, currentPage } =
    useReaderStore();

  useEffect(() => {
    if (!fileId) return;
    AsyncStorage.getItem(bookmarkKey(fileId)).then((raw) => {
      if (raw) setBookmarks(JSON.parse(raw));
      else setBookmarks([]);
    });
  }, [fileId]);

  async function persist(updated: Bookmark[]) {
    if (!fileId) return;
    await AsyncStorage.setItem(bookmarkKey(fileId), JSON.stringify(updated));
  }

  const isCurrentPageBookmarked = bookmarks.some(
    (b) => b.page === currentPage
  );

  async function toggleBookmark(page: number, title?: string) {
    const existing = bookmarks.find((b) => b.page === page);
    if (existing) {
      removeBookmark(existing.id);
      await persist(bookmarks.filter((b) => b.id !== existing.id));
    } else {
      const newBookmark: Bookmark = {
        id: `${fileId}-${page}-${Date.now()}`,
        fileId: fileId!,
        page,
        title: title ?? `Seite ${page}`,
        createdAt: Date.now(),
      };
      addBookmark(newBookmark);
      await persist([...bookmarks, newBookmark]);
    }
  }

  async function deleteBookmark(id: string) {
    removeBookmark(id);
    await persist(bookmarks.filter((b) => b.id !== id));
  }

  return { bookmarks, isCurrentPageBookmarked, toggleBookmark, deleteBookmark };
}
