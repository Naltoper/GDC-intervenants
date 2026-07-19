import { BlurView } from "expo-blur";
import { ChevronLeft } from "lucide-react-native";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated from "react-native-reanimated";

import { DASHBOARD_TITLE } from "../../constants/dashboard";
import { Colors } from "../../constants/theme";
import { CollapsingHeaderAnimation } from "../../hooks/useCollapsingHeader";

interface DashboardHeaderProps extends CollapsingHeaderAnimation {
  reportCount: number;
  onBack: () => void;
}

export const DashboardHeader = ({
  reportCount,
  onBack,
  headerAnimatedStyle,
  largeTitleStyle,
  smallTitleStyle,
}: DashboardHeaderProps) => (
  <Animated.View style={[styles.headerContainer, headerAnimatedStyle]}>
    {Platform.OS === "android" ? (
      <View style={[StyleSheet.absoluteFill, styles.androidOverlay]} />
    ) : (
      <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
    )}
    <View style={styles.headerContent}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <ChevronLeft
          color={Colors.light.primary}
          size={30}
          strokeWidth={2.5}
        />
      </TouchableOpacity>

      <Animated.View style={[styles.smallTitleWrapper, smallTitleStyle]}>
        <Text style={styles.smallTitle}>{DASHBOARD_TITLE}</Text>
      </Animated.View>

      <Animated.View style={[styles.titleWrapper, largeTitleStyle]}>
        <Text style={styles.title}>{DASHBOARD_TITLE}</Text>
        <Text style={styles.subtitle}>
          {reportCount} signalements reçus
        </Text>
      </Animated.View>
    </View>
  </Animated.View>
);

const styles = StyleSheet.create({
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor:
      Platform.OS === "android" ? "#fffffff6" : "rgba(255, 255, 255, 0.6)",
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderSubtle,
    overflow: "hidden",
    ...Platform.select({
      android: {
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 8,
      },
    }),
  },
  androidOverlay: {
    backgroundColor: "#ffffff09",
  },
  headerContent: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 15,
  },
  backButton: {
    position: "absolute",
    left: 15,
    bottom: 15,
    padding: 10,
    zIndex: 20,
  },
  titleWrapper: {
    alignItems: "center",
    position: "absolute",
    bottom: 15,
    width: "100%",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.light.primary,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.light.textMuted,
  },
  smallTitleWrapper: {
    position: "absolute",
    bottom: 25,
    width: "100%",
    alignItems: "center",
  },
  smallTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.primary,
  },
});
