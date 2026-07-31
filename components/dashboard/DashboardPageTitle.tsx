import { StyleSheet, Text, View } from "react-native";

import { DASHBOARD_TITLE } from "../../constants/dashboard";
import { Colors } from "../../constants/theme";

interface DashboardPageTitleProps {
  reportCount: number;
  title?: string;
  subtitle?: string;
}

export const DashboardPageTitle = ({
  reportCount,
  title = DASHBOARD_TITLE,
  subtitle,
}: DashboardPageTitleProps) => (
  <View style={styles.card}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.subtitle}>
      {subtitle ??
        `${reportCount} signalement${reportCount === 1 ? "" : "s"} reçu${
          reportCount === 1 ? "" : "s"
        }`}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.light.primary,
    letterSpacing: -0.3,
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.light.textMuted,
    textAlign: "center",
  },
});
