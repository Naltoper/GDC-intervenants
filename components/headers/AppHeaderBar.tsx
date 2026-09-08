import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import {
  HEADER_GRADIENT_END,
  HEADER_GRADIENT_START,
} from '../../constants/theme';
import { useAppTheme } from '../../contexts/ThemeContext';

/** Hauteur identique sur toutes les pages (hors safe-area déjà gérée à la racine). */
export const HEADER_PADDING_VERTICAL = 11;
export const HEADER_ROW_MIN_HEIGHT = 44;

type AppHeaderBarProps = {
  left: React.ReactNode;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  style?: ViewStyle;
};

export function AppHeaderBar({
  left,
  title,
  subtitle,
  right,
  style,
}: AppHeaderBarProps) {
  const { surface, headerFg, headerFgMuted, headerGradient, headerBorder } =
    useAppTheme();

  return (
    <View style={[styles.wrap, { backgroundColor: surface }, style]}>
      <LinearGradient
        colors={[...headerGradient]}
        start={HEADER_GRADIENT_START}
        end={HEADER_GRADIENT_END}
        style={[styles.gradient, { borderBottomColor: headerBorder }]}
      >
        <View style={styles.row}>
          <View style={[styles.side, styles.sideLeft]}>{left}</View>
          <View style={styles.titleBlock}>
            <Text style={[styles.title, { color: headerFg }]} numberOfLines={1}>
              {title}
            </Text>
            {subtitle ? (
              <Text style={[styles.subtitle, { color: headerFgMuted }]} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : (
              <View style={styles.subtitleSpacer} />
            )}
          </View>
          <View style={[styles.side, styles.sideRight]}>{right}</View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    zIndex: 10,
  },
  gradient: {
    paddingHorizontal: 10,
    paddingVertical: HEADER_PADDING_VERTICAL,
    width: '100%',
    minHeight: HEADER_PADDING_VERTICAL * 2 + HEADER_ROW_MIN_HEIGHT,
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    borderBottomWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: HEADER_ROW_MIN_HEIGHT,
  },
  side: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    zIndex: 2,
  },
  sideLeft: {
    alignItems: 'flex-start',
  },
  sideRight: {
    alignItems: 'flex-end',
  },
  titleBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    minHeight: HEADER_ROW_MIN_HEIGHT,
    overflow: 'hidden',
    zIndex: 0,
  },
  title: {
    fontSize: 19,
    lineHeight: 23,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
  },
  subtitleSpacer: {
    height: 18,
  },
});
