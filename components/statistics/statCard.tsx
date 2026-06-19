import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { APP_COLORS } from "../../constants/theme";

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
  return (
    <View style={styles.statCard}>
      <View style={styles.statIcon}>{icon}</View>

      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>

      <Text style={[styles.statPercentage, { color }]}>
        {percentage}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statCard: {
    flex: 1,
    backgroundColor: APP_COLORS.surface,
    borderRadius: 18,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },

  statIcon: {
    marginBottom: 8,
  },

  statValue: {
    fontSize: 24,
    fontWeight: "900",
    color: APP_COLORS.text,
  },

  statTitle: {
    fontSize: 12,
    color: APP_COLORS.textMuted,
    textAlign: "center",
    marginTop: 2,
  },

  statPercentage: {
    fontSize: 13,
    fontWeight: "800",
    marginTop: 6,
  },
});