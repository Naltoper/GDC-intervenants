import { BarChart3, LogOut, MoreVertical } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import type { AppColorPalette } from '../../constants/theme';
import { useAppTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';

type HeaderOverflowMenuProps = {
  /** Couleur de l’icône (headerFg par défaut via parent). */
  iconColor?: string;
};

/**
 * Menu « ⋯ » du header Intervenants : Statistiques + Déconnexion.
 * Remplace l’ancien tiroir hamburger.
 */
export function HeaderOverflowMenu({ iconColor }: HeaderOverflowMenuProps) {
  const router = useRouter();
  const { colors, surface, headerFg } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, surface), [colors, surface]);
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    setOpen(false);
    try {
      await supabase.auth.signOut();
    } catch {
      // Auth optionnelle : on ramène quand même à l’accueil.
    } finally {
      router.replace('/');
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        style={styles.trigger}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel="Ouvrir le menu"
      >
        <MoreVertical color={iconColor ?? headerFg} size={22} strokeWidth={2.4} />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
          <View style={styles.menu}>
            <TouchableOpacity
              style={styles.item}
              activeOpacity={0.8}
              onPress={() => {
                setOpen(false);
                router.push('/(tabs)/statistics');
              }}
            >
              <View style={[styles.iconWrap, { backgroundColor: colors.borderSubtle }]}>
                <BarChart3 size={18} color={colors.accent} />
              </View>
              <View style={styles.textWrap}>
                <Text style={styles.label}>Statistiques</Text>
                <Text style={styles.hint}>Vue d’ensemble des signalements</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.item, styles.logoutItem]}
              activeOpacity={0.8}
              onPress={handleLogout}
            >
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: colors.status.errorBg },
                ]}
              >
                <LogOut size={18} color={colors.status.error} />
              </View>
              <View style={styles.textWrap}>
                <Text style={[styles.label, { color: colors.status.error }]}>
                  Se déconnecter
                </Text>
                <Text style={styles.hint}>Retour à l’accueil</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

function createStyles(colors: AppColorPalette, surface: string) {
  return StyleSheet.create({
    trigger: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
    },
    overlay: {
      flex: 1,
      justifyContent: 'flex-start',
      alignItems: 'flex-end',
      paddingTop: 56,
      paddingRight: 12,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(15, 23, 42, 0.28)',
    },
    menu: {
      width: 280,
      backgroundColor: surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
      zIndex: 2,
      gap: 4,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 12,
      paddingHorizontal: 10,
      borderRadius: 12,
      backgroundColor: colors.background,
    },
    logoutItem: {
      backgroundColor: colors.status.errorBg,
    },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textWrap: {
      flex: 1,
    },
    label: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 2,
    },
    hint: {
      fontSize: 12,
      color: colors.textMuted,
      fontWeight: '500',
    },
  });
}
