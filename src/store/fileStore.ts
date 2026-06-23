import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FileRecord {
  id: string;
  uri: string;
  cachedPath: string;
  name: string;
  size: number;
  pageCount: number;
  lastOpened: number;
  thumbnailPath?: string;
}

interface FileState {
  files: FileRecord[];
  addFile: (record: FileRecord) => void;
  removeFile: (id: string) => void;
  updateLastOpened: (id: string) => void;
  updatePageCount: (id: string, pageCount: number) => void;
  updateThumbnail: (id: string, thumbnailPath: string) => void;
  getFile: (id: string) => FileRecord | undefined;
}

export const useFileStore = create<FileState>()(
  persist(
    (set, get) => ({
      files: [],
      addFile: (record) =>
        set((state) => {
          const existing = state.files.find((f) => f.id === record.id);
          if (existing) {
            return {
              files: state.files.map((f) =>
                f.id === record.id ? { ...record, lastOpened: Date.now() } : f
              ),
            };
          }
          return { files: [record, ...state.files] };
        }),
      removeFile: (id) =>
        set((state) => ({ files: state.files.filter((f) => f.id !== id) })),
      updateLastOpened: (id) =>
        set((state) => ({
          files: state.files.map((f) =>
            f.id === id ? { ...f, lastOpened: Date.now() } : f
          ),
        })),
      updatePageCount: (id, pageCount) =>
        set((state) => ({
          files: state.files.map((f) => (f.id === id ? { ...f, pageCount } : f)),
        })),
      updateThumbnail: (id, thumbnailPath) =>
        set((state) => ({
          files: state.files.map((f) => (f.id === id ? { ...f, thumbnailPath } : f)),
        })),
      getFile: (id) => get().files.find((f) => f.id === id),
    }),
    {
      name: 'k-pdf-files',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
