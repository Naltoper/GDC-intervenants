import type { ImageSourcePropType } from 'react-native';

export type LyceeSceneVariant = 'full' | 'blur';

const LYCEE_SCENE_SOURCES = {
  full: {
    light: require('../assets/images/lyceeBg.jpg') as ImageSourcePropType,
    dark: require('../assets/images/lyceeBgNight.png') as ImageSourcePropType,
  },
  blur: {
    light: require('../assets/images/lyceeBgBlur.png') as ImageSourcePropType,
    dark: require('../assets/images/lyceeBgNightBlur.png') as ImageSourcePropType,
  },
} as const;

/**
 * Opacité de base du voile sombre (stop haut du LinearGradient).
 * Le stop bas utilise automatiquement +0.12 (comme le voile clair 0.28→0.55).
 * Modifier UNIQUEMENT cette valeur (entre 0 et 1) pour toute l’app.
 * Exemples : 0.22 · 0.28 (défaut) · 0.4 · 0.55
 */
export const DARK_SCENE_OVERLAY_OPACITY = 0.32;

/** RGB du voile sombre. */
export const DARK_SCENE_OVERLAY_RGB = '8, 15, 28';

/** Voile clair (mode jour, pages « full »). */
export const LIGHT_SCENE_OVERLAY = [
  'rgba(213, 237, 236, 0.28)',
  'rgba(213, 237, 236, 0.55)',
] as const;

export function getDarkSceneOverlayColor(
  opacity: number = DARK_SCENE_OVERLAY_OPACITY,
): string {
  const alpha = Math.max(0, Math.min(1, opacity));
  return `rgba(${DARK_SCENE_OVERLAY_RGB}, ${alpha})`;
}

export function getDarkSceneOverlayColors(
  opacity: number = DARK_SCENE_OVERLAY_OPACITY,
): readonly [string, string] {
  const color = getDarkSceneOverlayColor(opacity);
  return [color, color];
}

export function getLyceeSceneSource(
  variant: LyceeSceneVariant,
  isDark: boolean,
): ImageSourcePropType {
  const pair = LYCEE_SCENE_SOURCES[variant];
  return isDark ? pair.dark : pair.light;
}
