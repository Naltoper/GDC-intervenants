import { ChevronLeft } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';

import { useAppTheme } from '../../contexts/ThemeContext';
import { AppHeaderBar } from './AppHeaderBar';

export type PageHeaderProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  /** Conservé pour compatibilité */
  translucent?: boolean;
  style?: ViewStyle;
};

export function PageHeader({
  title,
  subtitle,
  onBack,
  right,
  style,
}: PageHeaderProps) {
  const { headerFg } = useAppTheme();

  return (
    <AppHeaderBar
      style={style}
      title={title}
      subtitle={subtitle}
      left={
        onBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={styles.backButton}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Retour"
          >
            <ChevronLeft color={headerFg} size={26} strokeWidth={2.5} />
          </TouchableOpacity>
        ) : (
          <View style={styles.sidePlaceholder} />
        )
      }
      right={right ?? <View style={styles.sidePlaceholder} />}
    />
  );
}

const styles = StyleSheet.create({
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidePlaceholder: {
    width: 44,
    height: 44,
  },
});
