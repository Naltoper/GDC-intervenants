import { Pressable, StyleSheet, Text, View } from "react-native";

import { APP_COLORS, Colors } from "../../constants/theme";

interface FilterBarProps {
  currentFilter: string;
  onSelectFilter: (filter: string) => void;
}

const FILTERS = ["Tous", "Non traité", "En cours", "Résolu"];

const STATUS_DOT_COLORS: Record<string, string> = {
  "Non traité": Colors.light.status.error,
  "En cours": Colors.light.status.warning,
  Résolu: Colors.light.status.success,
};

const FILTER_ACTIVE_COLORS: Record<
  string,
  { background: string; border: string; text: string; shadow: string }
> = {
  Tous: {
    background: APP_COLORS.primary,
    border: APP_COLORS.primary,
    text: Colors.light.surface,
    shadow: APP_COLORS.primary,
  },
  "Non traité": {
    background: Colors.light.status.error,
    border: Colors.light.status.error,
    text: Colors.light.surface,
    shadow: Colors.light.status.error,
  },
  "En cours": {
    background: Colors.light.status.warning,
    border: Colors.light.status.warning,
    text: Colors.light.surface,
    shadow: Colors.light.status.warning,
  },
  Résolu: {
    background: Colors.light.status.success,
    border: Colors.light.status.success,
    text: Colors.light.surface,
    shadow: Colors.light.status.success,
  },
};

export const FilterBar = ({
  currentFilter,
  onSelectFilter,
}: FilterBarProps) => (
  <View style={styles.container}>
    <Text style={styles.label}>Filtrer par statut</Text>
    <View style={styles.grid}>
      {FILTERS.map((filter) => {
        const isActive = currentFilter === filter;
        const activeColors =
          FILTER_ACTIVE_COLORS[filter] ?? FILTER_ACTIVE_COLORS.Tous;
        const dotColor =
          filter === "Tous"
            ? APP_COLORS.primary
            : STATUS_DOT_COLORS[filter] ?? Colors.light.textMuted;

        return (
          <Pressable
            key={filter}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            onPress={() => onSelectFilter(filter)}
            style={({ pressed }) => [
              styles.chip,
              isActive && {
                backgroundColor: activeColors.background,
                borderColor: activeColors.border,
                shadowColor: activeColors.shadow,
              },
              isActive && styles.chipActiveShadow,
              pressed && !isActive && styles.chipPressed,
            ]}
          >
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: isActive ? Colors.light.surface : dotColor,
                },
                isActive && styles.dotActive,
              ]}
            />
            <Text
              style={[
                styles.chipText,
                isActive && { color: activeColors.text },
              ]}
            >
              {filter}
            </Text>
          </Pressable>
        );
      })}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingHorizontal: 12,
    paddingVertical: 14,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
    color: Colors.light.textMuted,
    marginBottom: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 8,
    columnGap: 8,
  },
  chip: {
    width: "48%",
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.background,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 10,
  },
  chipActiveShadow: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 4,
  },
  chipPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.45)",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.light.text,
  },
});
