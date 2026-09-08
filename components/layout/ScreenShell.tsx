import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { LyceeBackground } from '../backgrounds/LyceeBackground';
import { useAppTheme } from '../../contexts/ThemeContext';

type ScreenShellProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Fond de page aligné sur l'app Élève (scène lycée + tokens thème). */
export function ScreenShell({ children, style }: ScreenShellProps) {
  const { pageBackdrop } = useAppTheme();

  return (
    <View style={[styles.root, { backgroundColor: pageBackdrop }, style]}>
      <LyceeBackground variant="blur" withOverlay={false}>
        {children}
      </LyceeBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
