import { Colors } from "@/constants/theme";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ActivityIndicator,
  DimensionValue,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface GradientButtonProps {
  title: string;
  icon?: React.ReactNode;
  onPress: () => void;
  colors?: readonly [string, string, ...string[]];
  width?: DimensionValue;
  height?: DimensionValue;
  style?: StyleProp<ViewStyle>;
  isLoading?: boolean;
  disabled?: boolean;
}

const SPRING_CONFIG = {
  damping: 15,
  stiffness: 300,
};

export const GradientButton = ({
  title,
  icon,
  onPress,
  colors = [Colors.light.secondary, Colors.light.primary],
  width = "100%",
  height = 110,
  style,
  isLoading = false,
  disabled = false,
}: GradientButtonProps) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isInteractive = !disabled && !isLoading;

  const handlePressIn = () => {
    if (!isInteractive) return;
    // Effet de pression
    scale.value = withSpring(0.9, SPRING_CONFIG);
    // Petit retour tactile
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    if (!isInteractive) return;
    // Retour à la normale
    scale.value = withSpring(1, SPRING_CONFIG);
  };

  const currentColors = isInteractive
    ? colors
    : ([Colors.light.border, Colors.light.border] as const);

  return (
    <Animated.View style={[animatedStyle, { width, height }, style]}>
      <Pressable
        onPress={isInteractive ? onPress : undefined}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ disabled: !isInteractive, busy: isLoading }}
        style={({ pressed }) => [
          styles.pressableContainer,
          { opacity: pressed && isInteractive ? 0.75 : 1 },
          !isInteractive && { shadowOpacity: 0, elevation: 0 },
        ]}
      >
        <LinearGradient
          colors={currentColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.light.surface} size="small" />
          ) : (
            <>
              {icon && <View style={styles.iconContainer}>{icon}</View>}
              <Text style={styles.buttonText}>{title}</Text>
            </>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  pressableContainer: {
    flex: 1,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  gradient: {
    flex: 1,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
  },
  iconContainer: {
    marginBottom: 8,
  },

  buttonText: {
    color: Colors.light.surface,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});