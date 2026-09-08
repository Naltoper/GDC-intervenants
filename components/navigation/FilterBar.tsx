import { Pressable, StyleSheet, Text, View } from "react-native";

import { Colors } from "../../constants/theme";
import { DASHBOARD_TOUS_BLUE } from "../../constants/dashboard";

interface FilterBarProps {
  currentFilter: string;
  onSelectFilter: (filter: string) => void;
}

const FILTERS = ["Tous", "Non traité", "En cours", "Résolu"];
const palette = Colors.light;

const STATUS_DOT_COLORS: Record<string, string> = {
  "Non traité": palette.status.error,
  "En cours": palette.status.warning,
  Résolu: palette.status.success,
};

const FILTER_ACTIVE_COLORS: Record<
  string,
  { background: string; border: string; text: string; shadow: string }
> = {
  Tous: {
    background: DASHBOARD_TOUS_BLUE,
    border: DASHBOARD_TOUS_BLUE,
    text: "#ffffff",
    shadow: DASHBOARD_TOUS_BLUE,
  },
  "Non traité": {
    background: palette.status.error,
    border: palette.status.error,
    text: "#ffffff",
    shadow: palette.status.error,
  },
  "En cours": {
    background: palette.status.warning,
    border: palette.status.warning,
    text: "#ffffff",
    shadow: palette.status.warning,
  },
  Résolu: {
    background: palette.status.success,
    border: palette.status.success,
    text: "#ffffff",
    shadow: palette.status.success,
  },
};

export const FilterBar = ({
  currentFilter,
  onSelectFilter,
}: FilterBarProps) => (
  <View style={styles.wrapper}>
    <Text style={styles.label}>Filtrer par statut</Text>
    <View style={styles.row}>
      {FILTERS.map((filter) => {
        const isActive = currentFilter === filter;
        const activeColors = FILTER_ACTIVE_COLORS[filter];
        const dotColor =
          filter === "Tous"
            ? DASHBOARD_TOUS_BLUE
            : STATUS_DOT_COLORS[filter] ?? palette.textMuted;

        return (
          <Pressable
            key={filter}
            onPress={() => onSelectFilter(filter)}
            style={({ pressed }) => [
              styles.chip,
              isActive && {
                backgroundColor: activeColors.background,
                borderColor: activeColors.border,
                shadowColor: activeColors.shadow,
              },
              pressed && styles.chipPressed,
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`Filtre ${filter}`}
          >
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: isActive ? "#ffffff" : dotColor,
                },
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
  wrapper: {
    backgroundColor: palette.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 14,
    marginBottom: 12,
    shadowColor: palette.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: palette.textMuted,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.background,
  },
  chipPressed: {
    opacity: 0.85,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "700",
    color: palette.text,
  },
});
