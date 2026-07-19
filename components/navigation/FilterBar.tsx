import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";

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

export const FilterBar = ({
  currentFilter,
  onSelectFilter,
}: FilterBarProps) => {
  const { width } = useWindowDimensions();
  const isCompact = width < 400;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Filtrer par statut</Text>
      <View style={[styles.grid, isCompact && styles.gridCompact]}>
        {FILTERS.map((filter) => {
          const isActive = currentFilter === filter;
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
                isCompact ? styles.chipCompact : styles.chipWide,
                isActive && styles.chipActive,
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
                style={[styles.chipText, isActive && styles.chipTextActive]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
              >
                {filter}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

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
    gap: 8,
  },
  gridCompact: {
    justifyContent: "space-between",
  },
  chip: {
    minHeight: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.background,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 12,
  },
  chipCompact: {
    width: "48.5%",
  },
  chipWide: {
    flexGrow: 1,
    flexBasis: "22%",
    minWidth: 72,
  },
  chipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
    shadowColor: Colors.light.primary,
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
    flexShrink: 1,
    fontSize: 13,
    fontWeight: "700",
    color: Colors.light.text,
  },
  chipTextActive: {
    color: Colors.light.surface,
  },
});
