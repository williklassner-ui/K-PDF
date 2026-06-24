import { useColorScheme } from 'react-native';
import { useAppStore } from '@/store/appStore';

export function useTheme() {
  const systemScheme = useColorScheme();
  const { theme } = useAppStore();

  const isDark =
    theme === 'dark' || (theme === 'system' && systemScheme === 'dark');

  return { isDark, theme };
}
