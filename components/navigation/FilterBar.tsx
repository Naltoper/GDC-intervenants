import React from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface FilterBarProps {
  currentFilter: string;
  onSelectFilter: (filter: string) => void;
}

export const FilterBar = ({ currentFilter, onSelectFilter }: FilterBarProps) => {
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
    backgroundColor: "#fff", 
    paddingVertical: 10 
  },
  filterScroll: { 
    paddingHorizontal: 20, 
    gap: 10 
  },
  filterBadge: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
  },
  filterBadgeActive: { 
    backgroundColor: "#023e8a" 
  },
  filterText: { 
    fontWeight: "700", 
    color: "#64748b" 
  },
  filterTextActive: { 
    color: "#fff" 
  },
});