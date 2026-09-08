import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import type { AppColorPalette } from "../../constants/theme";
import { useAppTheme } from "../../contexts/ThemeContext";

type MetricTileProps = {
  label: string;
  value: string;
  hint?: string;
  accent?: string;
};

/** Tuile métrique compacte (évolution temporelle, délais…). */
export function MetricTile({ label, value, hint, accent }: MetricTileProps) {
  const { colors, surface, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, surface), [colors, surface]);
  const cardBg = isDark ? surface : "#FFFFFF";

  return (
    <View
      style={[
        styles.tile,
        {
          backgroundColor: cardBg,
          borderColor: colors.border,
        },
      ]}
    >
      <Text style={[styles.value, { color: accent ?? colors.accent }]}>
        {value}
      </Text>
      <Text style={styles.label}>{label}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

function createStyles(colors: AppColorPalette, _surface: string) {
  return StyleSheet.create({
    tile: {
      flex: 1,
      minWidth: "46%",
      borderRadius: 16,
      borderWidth: 1,
      paddingVertical: 14,
      paddingHorizontal: 12,
      alignItems: "center",
    },
    value: {
      fontSize: 22,
      fontWeight: "900",
      marginBottom: 4,
    },
    label: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.text,
      textAlign: "center",
    },
    hint: {
      marginTop: 4,
      fontSize: 11,
      color: colors.textMuted,
      textAlign: "center",
      fontWeight: "500",
    },
  });
}
