import { Pressable, StyleSheet, Text, View } from "react-native";

import { DashboardStatusCardConfig } from "../../constants/dashboard";
import { useAppTheme } from "../../contexts/ThemeContext";

export type DashboardStatusCardData = DashboardStatusCardConfig & {
  count: number;
};

interface DashboardStatusCardProps {
  card: DashboardStatusCardData;
  onPress: () => void;
}

export const DashboardStatusCard = ({
  card,
  onPress,
}: DashboardStatusCardProps) => {
  const { colors, surface } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: surface,
          borderColor: colors.border,
        },
        pressed && styles.cardPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${card.label}, ${card.count} signalements`}
    >
      <View style={[styles.accentDot, { backgroundColor: card.accent }]} />
      <View style={styles.content}>
        <Text style={[styles.label, { color: card.text }]} numberOfLines={1}>
          {card.label}
        </Text>
        <Text style={[styles.count, { color: card.text }]}>{card.count}</Text>
        <Text style={[styles.hint, { color: colors.textMuted }]}>
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
    borderWidth: 1,
    overflow: "hidden",
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
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
  content: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  label: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 8,
  },
  count: {
    fontSize: 36,
    fontWeight: "800",
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  hint: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
  },
});
