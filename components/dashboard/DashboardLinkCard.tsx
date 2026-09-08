import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "../../contexts/ThemeContext";

type DashboardLinkCardProps = {
  title: string;
  subtitle: string;
  icon: ReactNode;
  onPress: () => void;
  accessibilityLabel?: string;
};

/** Carte d’action dashboard (même langage visuel que les tuiles Élève). */
export function DashboardLinkCard({
  title,
  subtitle,
  icon,
  onPress,
  accessibilityLabel,
}: DashboardLinkCardProps) {
  const { colors, surface } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: surface,
          borderColor: colors.border,
        },
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
    >
      <View
        style={[
          styles.iconWrap,
          {
            backgroundColor: colors.borderSubtle,
            borderColor: colors.border,
          },
        ]}
      >
        {icon}
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
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "500",
  },
});
