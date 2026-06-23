import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark' | 'system';
type ScrollMode = 'single' | 'continuous';

interface AppState {
  theme: Theme;
  scrollMode: ScrollMode;
  autoHideToolbar: boolean;
  setTheme: (theme: Theme) => void;
  setScrollMode: (mode: ScrollMode) => void;
  setAutoHideToolbar: (value: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'system',
      scrollMode: 'continuous',
      autoHideToolbar: true,
      setTheme: (theme) => set({ theme }),
      setScrollMode: (scrollMode) => set({ scrollMode }),
      setAutoHideToolbar: (autoHideToolbar) => set({ autoHideToolbar }),
    }),
    {
      name: 'k-pdf-app',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
