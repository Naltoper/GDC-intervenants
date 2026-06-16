import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../constants/theme";

interface FilterBarProps {
  currentFilter: string;
  onSelectFilter: (filter: string) => void;
}

export const FilterBar = ({
  currentFilter,
  onSelectFilter,
}: FilterBarProps) => {
  const filters = ["Tous", "Non traité", "En cours", "Résolu"];

  return (
    <View style={styles.filterBar}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        {filters.map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => onSelectFilter(f)}
            style={[
              styles.filterBadge,
              currentFilter === f && styles.filterBadgeActive,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                currentFilter === f && styles.filterTextActive,
              ]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  filterBar: {
    backgroundColor: Colors.light.background,
    paddingVertical: 10,
    borderRadius: 20,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterBadge: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.borderSubtle,
  },
  filterBadgeActive: {
    backgroundColor: Colors.light.primary,
  },
  filterText: {
    fontWeight: "700",
    color: Colors.light.textMuted,
  },
  filterTextActive: {
    color: Colors.light.surface,
  },
});
