import { BlurView } from "expo-blur";
import { ChevronLeft, Menu } from "lucide-react-native";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated from "react-native-reanimated";

import { DASHBOARD_HEADER, DASHBOARD_TITLE } from "../../constants/dashboard";
import { Colors } from "../../constants/theme";
import { CollapsingHeaderAnimation } from "../../hooks/useCollapsingHeader";

interface DashboardHeaderProps extends Partial<CollapsingHeaderAnimation> {
  onBack?: () => void;
  onMenuPress?: () => void;
  /** When true, left action is the hamburger menu instead of back. */
  showMenu?: boolean;
  /** Optional sticky title override (e.g. current filter label). */
  stickyTitle?: string;
}

export const DashboardHeader = ({
  onBack,
  onMenuPress,
  showMenu = false,
  stickyTitle = DASHBOARD_TITLE,
  stickyBarStyle,
  stickyTitleStyle,
}: DashboardHeaderProps) => (
  <View style={styles.headerContainer} pointerEvents="box-none">
    <Animated.View
      style={[styles.backgroundLayer, stickyBarStyle]}
      pointerEvents="none"
    >
      {Platform.OS === "ios" ? (
        <>
          <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
          <View style={[StyleSheet.absoluteFill, styles.iosTint]} />
        </>
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.androidFallback]} />
      )}
      <View style={styles.bottomBorder} />
    </Animated.View>

    <View style={styles.headerContent} pointerEvents="box-none">
      <TouchableOpacity
        onPress={showMenu ? onMenuPress : onBack}
        style={styles.leftButton}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={showMenu ? "Ouvrir le menu" : "Retour"}
      >
        {showMenu ? (
          <Menu color={Colors.light.primary} size={26} strokeWidth={2.4} />
        ) : (
          <ChevronLeft
            color={Colors.light.primary}
            size={28}
            strokeWidth={2.5}
          />
        )}
      </TouchableOpacity>

      <Animated.View
        style={[styles.titleWrapper, stickyTitleStyle]}
        pointerEvents="none"
      >
        <Text style={styles.stickyTitle} numberOfLines={1}>
          {stickyTitle}
        </Text>
      </Animated.View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    height: DASHBOARD_HEADER.STICKY_HEIGHT,
    overflow: "hidden",
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  iosTint: {
    backgroundColor: "rgba(255, 255, 255, 0.55)",
  },
  androidFallback: {
    backgroundColor: "rgba(255, 255, 255, 0.94)",
  },
  bottomBorder: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.light.border,
  },
  headerContent: {
    flex: 1,
    justifyContent: "center",
  },
  leftButton: {
    position: "absolute",
    left: 8,
    top: 0,
    bottom: 0,
    width: 44,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  titleWrapper: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 52,
  },
  stickyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.primary,
    textAlign: "center",
  },
});
