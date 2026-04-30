import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  DimensionValue,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface GradientButtonProps {
  title: string;
  colors: readonly [string, string, ...string[]];
  onPress: () => void;
  icon?: React.ReactNode;
  width?: DimensionValue; // <-- La correction typographique est bien là
}

export const GradientButton = ({
  title,
  colors,
  onPress,
  icon,
  width = "100%",
}: GradientButtonProps) => {
  return (
    <TouchableOpacity onPress={onPress} style={{ width }} activeOpacity={0.8}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={styles.text}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 15,
  },
  iconContainer: {
    marginRight: 10,
  },
  text: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
