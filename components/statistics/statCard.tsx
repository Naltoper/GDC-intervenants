import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import type { AppColorPalette } from "../../constants/theme";
import { useAppTheme } from "../../contexts/ThemeContext";

type StatCardProps = {
  title: string;
  value: number;
  percentage: number;
  color: string;
  icon: React.ReactNode;
};

export function StatCard({
  title,
  value,
  percentage,
  color,
  icon,
}: StatCardProps) {
  const { colors, surface } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, surface), [colors, surface]);

  return (
    <View style={styles.statCard}>
      <View style={styles.statIcon}>{icon}</View>

      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>

      <Text style={[styles.statPercentage, { color }]}>{percentage}%</Text>
    </View>
  );
}

function createStyles(colors: AppColorPalette, surface: string) {
  return StyleSheet.create({
    statCard: {
      flex: 1,
      backgroundColor: surface,
      borderRadius: 20,
      padding: 14,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    },
    statIcon: {
      marginBottom: 8,
    },
    statValue: {
      fontSize: 24,
      fontWeight: "900",
      color: colors.text,
    },
    statTitle: {
      fontSize: 12,
      color: colors.textMuted,
      textAlign: "center",
      marginTop: 2,
    },
    statPercentage: {
      fontSize: 13,
      fontWeight: "800",
      marginTop: 6,
    },
  });
}
