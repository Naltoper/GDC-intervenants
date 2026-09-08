import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../../contexts/ThemeContext';

type DashboardLinkCardProps = {
  title: string;
  subtitle: string;
  icon: ReactNode;
  onPress: () => void;
  accessibilityLabel?: string;
  /** Badge rouge (ex. éléments en attente de modération). */
  badgeCount?: number;
  /**
   * Ligne dans une carte conteneur (pas d’ombre / fond propre).
   * Défaut : false (carte autonome).
   */
  nested?: boolean;
};

/** Ligne / carte d’action dashboard. */
export function DashboardLinkCard({
  title,
  subtitle,
  icon,
  onPress,
  accessibilityLabel,
  badgeCount = 0,
  nested = false,
}: DashboardLinkCardProps) {
  const { colors, isDark, surface } = useAppTheme();
  const showBadge = badgeCount > 0;
  const cardBg = isDark ? surface : '#FFFFFF';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        nested ? styles.row : styles.button,
        !nested && {
          backgroundColor: cardBg,
          shadowOpacity: isDark ? 0.22 : 0.08,
        },
        nested && {
          backgroundColor: isDark ? colors.borderSubtle : colors.borderSubtle,
          borderColor: colors.border,
        },
        nested && pressed && styles.rowPressed,
        !nested && pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={
        showBadge
          ? `${accessibilityLabel ?? title}, ${badgeCount} en attente`
          : accessibilityLabel ?? title
      }
    >
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: isDark ? colors.borderSubtle : colors.background,
          },
        ]}
      >
        {icon}
        {showBadge ? (
          <View style={[styles.badge, { backgroundColor: colors.status.error }]}>
            <Text style={styles.badgeText}>
              {badgeCount > 99 ? '99+' : String(badgeCount)}
            </Text>
          </View>
        ) : null}
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          {subtitle}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  rowPressed: {
    opacity: 0.82,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
});
