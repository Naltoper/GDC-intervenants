import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import type { AppColorPalette } from "../../constants/theme";
import { useAppTheme } from "../../contexts/ThemeContext";
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
  const { colors, surface } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, surface), [colors, surface]);

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

function createStyles(colors: AppColorPalette, surface: string) {
  return StyleSheet.create({
    listCard: {
      backgroundColor: surface,
      borderRadius: 20,
      padding: 18,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 18,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "900",
      color: colors.text,
      marginBottom: 16,
    },
    emptyText: {
      color: colors.textMuted,
      fontSize: 14,
      textAlign: "center",
      paddingVertical: 10,
    },
  });
}
