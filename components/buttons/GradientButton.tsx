import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  DimensionValue,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import { APP_COLORS } from '../../constants/theme';

interface GradientButtonProps {
  title: string;
  icon?: React.ReactNode;
  onPress: () => void;

  /**
   * Optionnel :
   * si on ne donne pas colors, le bouton utilise les couleurs globales de l'app.
   */
  colors?: [string, string, ...string[]];

  width?: DimensionValue;
  height?: DimensionValue;
  style?: StyleProp<ViewStyle>;
}

export const GradientButton = ({
  title,
  icon,
  onPress,
  colors = [APP_COLORS.gradient.start, APP_COLORS.gradient.end],
  width = '100%',
  height = 110,
  style,
}: GradientButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[{ width, height }, style]}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {icon && <View style={styles.iconContainer}>{icon}</View>}

        <Text style={styles.buttonText}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,

    shadowColor: APP_COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 5,
  },

  iconContainer: {
    marginBottom: 8,
  },

  buttonText: {
    color: APP_COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.12)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});