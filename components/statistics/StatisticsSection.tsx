import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { APP_COLORS } from "../../constants/theme";
import { ProgressRow } from "./ProgressRow";

type StatEntry = [string, number];

type StatisticsSectionProps = {
  title: string;
  data: StatEntry[];
  color: string;
  getPercentage: (value: number) => number;
};

export function StatisticsSection({
  title,
  data,
  color,
  getPercentage,
}: StatisticsSectionProps) {
  return (
    <View style={styles.listCard}>
      <Text style={styles.sectionTitle}>{title}</Text>

      {data.length === 0 ? (
        <Text style={styles.emptyText}>Aucune donnée disponible</Text>
      ) : (
        data.map(([label, value]) => (
          <ProgressRow
            key={label}
            label={label}
            value={value}
            percentage={getPercentage(value)}
            color={color}
          />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  listCard: {
    backgroundColor: APP_COLORS.surface,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    marginBottom: 18,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: APP_COLORS.text,
    marginBottom: 16,
  },

  emptyText: {
    color: APP_COLORS.textMuted,
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 10,
  },
});