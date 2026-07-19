import { LinearGradient } from "expo-linear-gradient";
import { BarChart3 } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

import { APP_COLORS } from "../../constants/theme";

interface DashboardStatsButtonProps {
  onPress: () => void;
}

export const DashboardStatsButton = ({ onPress }: DashboardStatsButtonProps) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.85}
    style={styles.wrapper}
  >
    <LinearGradient
      colors={[APP_COLORS.gradient.start, APP_COLORS.gradient.end]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.button}
    >
      <BarChart3 color={APP_COLORS.white} size={22} />
      <Text style={styles.text}>Voir les statistiques</Text>
    </LinearGradient>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 10,
    marginBottom: 10,
  },
  button: {
    height: 56,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    elevation: 5,
  },
  text: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});
