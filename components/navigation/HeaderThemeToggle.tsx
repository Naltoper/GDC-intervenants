import { Moon, Sun } from 'lucide-react-native';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { useAppTheme } from '../../contexts/ThemeContext';

type HeaderThemeToggleProps = {
  /** Couleur d’icône (défaut : accent). */
  iconColor?: string;
};

/** Bascule clair / sombre pour les headers. */
export function HeaderThemeToggle({ iconColor }: HeaderThemeToggleProps) {
  const { colors, isDark, setScheme } = useAppTheme();
  const tint = iconColor ?? colors.accent;

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => setScheme(isDark ? 'light' : 'dark')}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={isDark ? 'Mode clair' : 'Mode sombre'}
    >
      {isDark ? (
        <Sun size={20} color={tint} strokeWidth={2.4} />
      ) : (
        <Moon size={20} color={tint} strokeWidth={2.4} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
});
