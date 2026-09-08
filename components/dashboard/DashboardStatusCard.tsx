import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";

import { DashboardStatusCardConfig } from "../../constants/dashboard";
import { useAppTheme } from "../../contexts/ThemeContext";

export type DashboardStatusCardData = DashboardStatusCardConfig & {
  count: number;
};

type DashboardStatusCardProps = {
  card: DashboardStatusCardData;
  onPress: () => void;
  /** Largeur pleine (carte « Tous »). */
  fullWidth?: boolean;
  /** Variante plus compacte pour la rangée 3 colonnes. */
  compact?: boolean;
};

export const DashboardStatusCard = ({
  card,
  onPress,
  fullWidth = false,
  compact = false,
}: DashboardStatusCardProps) => {
  const { colors, isDark, surface } = useAppTheme();
  const cardBg = isDark ? surface : "#FFFFFF";

  const layoutStyle: ViewStyle = fullWidth
    ? styles.cardFull
    : compact
      ? styles.cardCompact
      : styles.card;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        layoutStyle,
        {
          backgroundColor: cardBg,
          shadowOpacity: isDark ? 0.22 : 0.08,
        },
        pressed && styles.cardPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${card.label}, ${card.count} signalements`}
    >
      <View
        style={[
          compact ? styles.accentDotCompact : styles.accentDot,
          { backgroundColor: card.accent },
        ]}
      />
      <View style={[styles.content, compact && styles.contentCompact]}>
        <Text
          style={[
            compact ? styles.labelCompact : styles.label,
            { color: card.text },
          ]}
          numberOfLines={1}
        >
          {card.label}
        </Text>
        <Text
          style={[
            compact ? styles.countCompact : styles.count,
            { color: card.text },
          ]}
        >
          {card.count}
        </Text>
        <Text
          style={[
            compact ? styles.hintCompact : styles.hint,
            { color: colors.textMuted },
          ]}
          numberOfLines={1}
        >
          signalement{card.count === 1 ? "" : "s"}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "48%",
    minHeight: 140,
    borderRadius: 20,
    overflow: "hidden",
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardFull: {
    width: "100%",
    minHeight: 112,
    borderRadius: 20,
    overflow: "hidden",
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardCompact: {
    flex: 1,
    minHeight: 128,
    borderRadius: 18,
    overflow: "hidden",
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  accentDot: {
    width: 4,
    marginVertical: 16,
    marginLeft: 12,
    borderRadius: 2,
  },
  accentDotCompact: {
    width: 4,
    marginVertical: 12,
    marginLeft: 8,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  contentCompact: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 8,
  },
  labelCompact: {
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 6,
  },
  count: {
    fontSize: 36,
    fontWeight: "800",
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  countCompact: {
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 32,
    letterSpacing: -0.4,
  },
  hint: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
  },
  hintCompact: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: "600",
  },
});
