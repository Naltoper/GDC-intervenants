import React, { useMemo } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { AppColorPalette } from '../../constants/theme';
import { useAppTheme } from '../../contexts/ThemeContext';

interface DeleteConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message?: string;
}

export function DeleteConfirmModal({
  visible,
  onClose,
  onConfirm,
  message = 'Voulez-vous vraiment supprimer ce signalement ?',
}: DeleteConfirmModalProps) {
  const { colors, surface } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, surface), [colors, surface]);

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.actions}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.button,
                styles.cancelButton,
                pressed && styles.buttonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Annuler"
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.button,
                styles.confirmButton,
                pressed && styles.buttonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Confirmer la suppression"
            >
              <Text style={styles.confirmButtonText}>Confirmer</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function createStyles(colors: AppColorPalette, surface: string) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(15, 23, 42, 0.45)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    card: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: surface,
      borderRadius: 20,
      paddingHorizontal: 22,
      paddingVertical: 24,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
    },
    message: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 22,
    },
    actions: {
      flexDirection: 'row',
      gap: 10,
    },
    button: {
      flex: 1,
      minHeight: 46,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 12,
    },
    buttonPressed: {
      opacity: 0.88,
      transform: [{ scale: 0.98 }],
    },
    cancelButton: {
      backgroundColor: colors.borderSubtle,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cancelButtonText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textMuted,
    },
    confirmButton: {
      backgroundColor: colors.status.error,
    },
    confirmButtonText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#FFFFFF',
    },
  });
}
