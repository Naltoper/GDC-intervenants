import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  ImageBackground,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useAppTheme } from '../../contexts/ThemeContext';
import { getLyceeSceneSource, type LyceeSceneVariant } from '../../utils/lyceeScene';

type LyceeBackgroundProps = {
  children: React.ReactNode;
  variant?: LyceeSceneVariant;
  withOverlay?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * Même structure en clair et en sombre :
 * ImageBackground → LinearGradient (voile) → children
 * Seule la couleur du dégradé change.
 */
export function LyceeBackground({
  children,
  variant = 'full',
  withOverlay,
  style,
}: LyceeBackgroundProps) {
  const { isDark, surface } = useAppTheme();
  const source = getLyceeSceneSource(variant, isDark);
  const showOverlay = withOverlay ?? (isDark || variant === 'full');

  // Mode clair (déjà OK) — ne pas toucher
  const lightColors = ['rgba(213, 237, 236, 0.28)', 'rgba(213, 237, 236, 0.55)'] as const;
  // Mode sombre — même composant, juste un voile noir
  const darkColors = ['rgba(0, 0, 0, 0.35)', 'rgba(0, 0, 0, 0.5)'] as const;

  return (
    <View style={[styles.mainContainer, { backgroundColor: surface }, style]}>
      <ImageBackground
        source={source}
        style={[styles.backgroundImage, { backgroundColor: surface }]}
        imageStyle={styles.backgroundImageInner}
        resizeMode="cover"
      >
        {showOverlay ? (
          <LinearGradient
            key={isDark ? 'overlay-dark' : 'overlay-light'}
            colors={isDark ? [...darkColors] : [...lightColors]}
            style={styles.overlay}
          >
            {children}
          </LinearGradient>
        ) : (
          <View style={styles.overlay}>{children}</View>
        )}
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backgroundImageInner: {
    opacity: 1,
  },
  overlay: {
    flex: 1,
  },
});
