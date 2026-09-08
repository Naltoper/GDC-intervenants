import { LogOut } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import { useAppTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';

type HeaderLogoutButtonProps = {
  iconColor?: string;
};

/** Déconnexion directe dans le header (remplace le menu ⋯). */
export function HeaderLogoutButton({ iconColor }: HeaderLogoutButtonProps) {
  const router = useRouter();
  const { colors } = useAppTheme();
  const tint = iconColor ?? colors.status.error;

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
      style={styles.button}
      onPress={handleLogout}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel="Se déconnecter"
    >
      <LogOut size={16} color={tint} strokeWidth={2.4} />
      <Text style={[styles.label, { color: tint }]} numberOfLines={1}>
        Se déconnecter
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    maxWidth: 148,
    paddingHorizontal: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 5,
    borderRadius: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
});
