import { LogOut } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { useAppTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';

type HeaderLogoutButtonProps = {
  iconColor?: string;
};

/** Déconnexion compacte (icône seule) dans le header. */
export function HeaderLogoutButton({ iconColor }: HeaderLogoutButtonProps) {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const tint = iconColor ?? colors.status.error;
  const bg = isDark ? colors.status.errorBg : colors.status.errorBg;

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Auth optionnelle : on ramène quand même à l’accueil.
    } finally {
      router.replace('/');
    }
  };

  return (
    <TouchableOpacity
      style={styles.hit}
      onPress={handleLogout}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel="Se déconnecter"
    >
      <View style={[styles.iconBox, { backgroundColor: bg }]}>
        <LogOut size={18} color={tint} strokeWidth={2.4} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  hit: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
