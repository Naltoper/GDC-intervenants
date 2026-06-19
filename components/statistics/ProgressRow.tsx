import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { APP_COLORS } from "../../constants/theme";

type ProgressRowProps = {
  label: string;
  value: number;
  percentage: number;
  color: string;
};

export function ProgressRow({
  label,
  value,
  percentage,
  color,
}: ProgressRowProps) {
  return (
    <View style={styles.progressRow}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>{label}</Text>

        <Text style={styles.progressValue}>
          {value} - {percentage}%
        </Text>
      </View>

      <View style={styles.progressBackground}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${percentage}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  progressRow: {
    marginBottom: 16,
  },

  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    gap: 10,
  },

  progressLabel: {
    flex: 1,
    color: APP_COLORS.text,
    fontSize: 14,
    fontWeight: "700",
  },

  progressValue: {
    color: APP_COLORS.textMuted,
    fontSize: 13,
    fontWeight: "700",
  },

  progressBackground: {
    height: 9,
    backgroundColor: APP_COLORS.border,
    borderRadius: 20,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 20,
  },
});