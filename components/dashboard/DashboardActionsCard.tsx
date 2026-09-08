import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../../contexts/ThemeContext';

type DashboardActionsCardProps = {
  children: ReactNode;
  title?: string;
};

/**
 * Conteneur unique pour les raccourcis dashboard
 * (Historique / Modération / Statistiques), style carte Élève.
 */
export function DashboardActionsCard({
  children,
  title = 'Raccourcis',
}: DashboardActionsCardProps) {
  const { colors, isDark, surface } = useAppTheme();
  const cardBg = isDark ? surface : '#FFFFFF';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: cardBg,
          shadowOpacity: isDark ? 0.22 : 0.08,
        },
      ]}
    >
      <Text style={[styles.heading, { color: colors.textMuted }]}>{title}</Text>
      <View style={styles.list}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 18,
    borderRadius: 20,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  heading: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  list: {
    gap: 8,
  },
});
