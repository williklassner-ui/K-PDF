import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { t } from '@/constants/i18n';

interface ViewerToolbarProps {
  title: string;
  currentPage: number;
  totalPages: number;
  isVisible: boolean;
  isBookmarked: boolean;
  onSearch: () => void;
  onBookmarkPanel: () => void;
  onToggleBookmark: () => void;
  onPrint: () => void;
  onShare: () => void;
  onEdit: () => void;
  onSaveCopy: () => void;
  onToggleDark: () => void;
  isDark: boolean;
  onMenuToggle: () => void;
  isMenuOpen: boolean;
}

export function ViewerToolbar({
  title,
  currentPage,
  totalPages,
  isVisible,
  isBookmarked,
  onSearch,
  onBookmarkPanel,
  onToggleBookmark,
  onPrint,
  onShare,
  onEdit,
  onSaveCopy,
  onToggleDark,
  isDark,
  onMenuToggle,
  isMenuOpen,
}: ViewerToolbarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  if (!isVisible) return null;

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.toolbarBg}
      />
      <View
        style={[
          styles.toolbar,
          { paddingTop: insets.top + 4 },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.iconText}>←</Text>
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {totalPages > 0 && (
            <Text style={styles.pageCount}>
              {currentPage} {t.of} {totalPages}
            </Text>
          )}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={onSearch}
            style={styles.iconBtn}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          >
            <Text style={styles.iconText}>🔍</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onToggleBookmark}
            style={styles.iconBtn}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          >
            <Text style={styles.iconText}>
              {isBookmarked ? '🔖' : '📄'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onBookmarkPanel}
            style={styles.iconBtn}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          >
            <Text style={styles.iconText}>☰</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onMenuToggle}
            style={styles.iconBtn}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          >
            <Text style={styles.iconText}>⋮</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isMenuOpen && (
        <View style={styles.menu}>
          {[
            { label: `${isDark ? '☀️' : '🌙'} ${isDark ? t.lightMode : t.darkMode}`, onPress: onToggleDark },
            { label: `✏️ ${t.edit}`, onPress: onEdit },
            { label: `🖨️ ${t.print}`, onPress: onPrint },
            { label: `📤 ${t.share}`, onPress: onShare },
            { label: `💾 ${t.saveACopy}`, onPress: onSaveCopy },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuItem}
              onPress={() => {
                onMenuToggle();
                item.onPress();
              }}
            >
              <Text style={styles.menuItemText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    backgroundColor: Colors.toolbarBg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  iconBtn: {
    padding: 6,
  },
  iconText: {
    fontSize: 20,
    color: Colors.toolbarText,
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: 8,
  },
  title: {
    color: Colors.toolbarText,
    fontSize: 15,
    fontWeight: '600',
  },
  pageCount: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menu: {
    backgroundColor: Colors.surfaceLight,
    position: 'absolute',
    right: 12,
    top: 80,
    borderRadius: 10,
    paddingVertical: 4,
    minWidth: 200,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 100,
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderLight,
  },
  menuItemText: {
    fontSize: 15,
    color: Colors.textPrimaryLight,
  },
});
