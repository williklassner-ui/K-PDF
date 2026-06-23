import { create } from 'zustand';

export interface Bookmark {
  id: string;
  fileId: string;
  page: number;
  title: string;
  createdAt: number;
}

export interface SearchResult {
  page: number;
  text: string;
  index: number;
}

interface ReaderState {
  fileId: string | null;
  currentPage: number;
  totalPages: number;
  scale: number;
  isFullscreen: boolean;
  isToolbarVisible: boolean;
  isSearchOpen: boolean;
  isBookmarkPanelOpen: boolean;
  searchQuery: string;
  searchResults: SearchResult[];
  activeSearchIndex: number;
  bookmarks: Bookmark[];
  isLoaded: boolean;

  setFileId: (id: string) => void;
  setCurrentPage: (page: number) => void;
  setTotalPages: (total: number) => void;
  setScale: (scale: number) => void;
  toggleFullscreen: () => void;
  toggleToolbar: () => void;
  showToolbar: () => void;
  setSearchOpen: (open: boolean) => void;
  setBookmarkPanelOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: SearchResult[]) => void;
  setActiveSearchIndex: (index: number) => void;
  setBookmarks: (bookmarks: Bookmark[]) => void;
  addBookmark: (bookmark: Bookmark) => void;
  removeBookmark: (id: string) => void;
  setLoaded: (loaded: boolean) => void;
  reset: () => void;
}

const initialState = {
  fileId: null,
  currentPage: 1,
  totalPages: 0,
  scale: 1.0,
  isFullscreen: false,
  isToolbarVisible: true,
  isSearchOpen: false,
  isBookmarkPanelOpen: false,
  searchQuery: '',
  searchResults: [],
  activeSearchIndex: 0,
  bookmarks: [],
  isLoaded: false,
};

export const useReaderStore = create<ReaderState>((set) => ({
  ...initialState,
  setFileId: (fileId) => set({ fileId }),
  setCurrentPage: (currentPage) => set({ currentPage }),
  setTotalPages: (totalPages) => set({ totalPages }),
  setScale: (scale) => set({ scale }),
  toggleFullscreen: () => set((s) => ({ isFullscreen: !s.isFullscreen })),
  toggleToolbar: () => set((s) => ({ isToolbarVisible: !s.isToolbarVisible })),
  showToolbar: () => set({ isToolbarVisible: true }),
  setSearchOpen: (isSearchOpen) => set({ isSearchOpen }),
  setBookmarkPanelOpen: (isBookmarkPanelOpen) => set({ isBookmarkPanelOpen }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSearchResults: (searchResults) => set({ searchResults }),
  setActiveSearchIndex: (activeSearchIndex) => set({ activeSearchIndex }),
  setBookmarks: (bookmarks) => set({ bookmarks }),
  addBookmark: (bookmark) =>
    set((s) => ({ bookmarks: [...s.bookmarks, bookmark] })),
  removeBookmark: (id) =>
    set((s) => ({ bookmarks: s.bookmarks.filter((b) => b.id !== id) })),
  setLoaded: (isLoaded) => set({ isLoaded }),
  reset: () => set(initialState),
}));
