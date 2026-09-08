import { LinearGradient } from "expo-linear-gradient";
import { BarChart3 } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

import { useAppTheme } from "../../contexts/ThemeContext";

interface DashboardStatsButtonProps {
  onPress: () => void;
}

export const DashboardStatsButton = ({ onPress }: DashboardStatsButtonProps) => {
  const { colors } = useAppTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={styles.wrapper}
    >
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.button}
      >
        <BarChart3 color="#ffffff" size={22} />
        <Text style={styles.text}>Voir les statistiques</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    borderRadius: 20,
    overflow: "hidden",
    marginTop: 10,
    marginBottom: 10,
  },
  button: {
    height: 56,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  text: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});
