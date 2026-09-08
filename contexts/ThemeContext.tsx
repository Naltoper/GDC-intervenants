import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Platform, useColorScheme as useSystemColorScheme } from 'react-native';

import {
  Colors,
  GARDIAN_CLAIR,
  HEADER_FG,
  HEADER_FG_MUTED,
  HEADER_GRADIENT_COLORS,
  PAGE_SCENE_BACKDROP,
  type AppColorPalette,
} from '../constants/theme';
import {
  getDarkSceneOverlayColors,
  LIGHT_SCENE_OVERLAY,
} from '../utils/lyceeScene';

const STORAGE_KEY = 'gdc_color_scheme';

export type ColorScheme = 'light' | 'dark';

type ThemeContextValue = {
  scheme: ColorScheme;
  isDark: boolean;
  isReady: boolean;
  colors: AppColorPalette;
  surface: string;
  pageBackdrop: string;
  headerFg: string;
  headerFgMuted: string;
  headerGradient: readonly [string, string];
  headerBorder: string;
  sceneOverlay: readonly [string, string];
  setScheme: (scheme: ColorScheme) => void;
  toggleScheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const DARK_HEADER_GRADIENT = [
  'rgba(29, 78, 216, 0.28)',
  'rgba(14, 116, 144, 0.18)',
] as const;


async function persistScheme(scheme: ColorScheme) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, scheme);
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.documentElement.dataset.theme = scheme;
      document.documentElement.style.colorScheme = scheme;
    }
  } catch (error) {
    console.warn('[theme] persist', error);
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme();
  const [scheme, setSchemeState] = useState<ColorScheme>('light');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (cancelled) return;
        if (stored === 'light' || stored === 'dark') {
          setSchemeState(stored);
        } else if (systemScheme === 'dark' || systemScheme === 'light') {
          // Défaut app : clair (ne pas basculer auto au premier lancement)
          setSchemeState('light');
        }
      } catch (error) {
        console.warn('[theme] restore', error);
      } finally {
        if (!cancelled) setIsReady(true);
      }
    };

    void restore();
    return () => {
      cancelled = true;
    };
  }, [systemScheme]);

  useEffect(() => {
    if (!isReady) return;
    void persistScheme(scheme);
  }, [scheme, isReady]);

  const setScheme = useCallback((next: ColorScheme) => {
    setSchemeState(next);
  }, []);

  const toggleScheme = useCallback(() => {
    setSchemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const value = useMemo<ThemeContextValue>(() => {
    const isDark = scheme === 'dark';
    return {
      scheme,
      isDark,
      isReady,
      colors: Colors[scheme] as AppColorPalette,
      surface: isDark ? Colors.dark.surface : GARDIAN_CLAIR,
      pageBackdrop: isDark ? Colors.dark.background : PAGE_SCENE_BACKDROP,
      headerFg: isDark ? Colors.dark.text : HEADER_FG,
      headerFgMuted: isDark ? Colors.dark.textMuted : HEADER_FG_MUTED,
      headerGradient: isDark ? DARK_HEADER_GRADIENT : HEADER_GRADIENT_COLORS,
      headerBorder: isDark
        ? 'rgba(148, 163, 184, 0.22)'
        : 'rgba(148, 163, 184, 0.28)',
      sceneOverlay: isDark ? getDarkSceneOverlayColors() : LIGHT_SCENE_OVERLAY,
      setScheme,
      toggleScheme,
    };
  }, [scheme, isReady, setScheme, toggleScheme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useAppTheme must be used within ThemeProvider');
  }
  return ctx;
}

/** Safe variant for hooks that may run outside provider during SSR/static. */
export function useAppThemeOptional(): ThemeContextValue | null {
  return useContext(ThemeContext);
}
