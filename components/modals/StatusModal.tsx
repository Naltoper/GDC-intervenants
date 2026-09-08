import React, { useMemo } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import type { AppColorPalette } from '../../constants/theme';
import { useAppTheme } from '../../contexts/ThemeContext';

interface StatusModalProps {
  visible: boolean;
  currentStatus: string;
  onSelect: (status: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export const StatusModal = ({
  visible,
  currentStatus,
  onSelect,
  onConfirm,
  onCancel,
}: StatusModalProps) => {
  const { colors, surface } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, surface), [colors, surface]);

  const statusStyleConfig: Record<string, { border: string; bg: string; text: string }> = {
    'Non traité': {
      border: colors.status.error,
      bg: colors.status.errorBg,
      text: colors.status.errorText,
    },
    'En cours': {
      border: colors.status.warning,
      bg: colors.status.warningBg,
      text: colors.status.warningText,
    },
    Résolu: {
      border: colors.status.success,
      bg: colors.status.successBg,
      text: colors.status.successText,
    },
  };

  const statuses = ['Non traité', 'En cours', 'Résolu'];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Modifier le statut</Text>

          {statuses.map((s) => {
            const isSelected = currentStatus === s;
            const statusColors = statusStyleConfig[s];

            return (
              <TouchableOpacity
                key={s}
                style={[
                  styles.statusOption,
                  isSelected && {
                    borderColor: statusColors.border,
                    backgroundColor: statusColors.bg,
                  },
                ]}
                onPress={() => onSelect(s)}
              >
                <Text
                  style={{
                    color: isSelected ? statusColors.text : colors.textMuted,
                    fontWeight: '600',
                  }}
                >
                  {s}
                </Text>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
            <Text style={styles.confirmBtnText}>Enregistrer</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
            <Text style={styles.cancelText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

function createStyles(colors: AppColorPalette, surface: string) {
  return StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(15,23,42,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      width: '100%',
      backgroundColor: surface,
      borderRadius: 20,
      padding: 25,
      alignItems: 'center',
      elevation: 5,
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.accent,
      marginBottom: 20,
    },
    statusOption: {
      width: '100%',
      padding: 15,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      marginBottom: 10,
      alignItems: 'center',
    },
    confirmBtn: {
      width: '100%',
      backgroundColor: colors.primary,
      padding: 15,
      borderRadius: 12,
      marginTop: 10,
      alignItems: 'center',
    },
    confirmBtnText: {
      color: 'white',
      fontWeight: '700',
      fontSize: 16,
    },
    closeButton: {
      marginTop: 15,
    },
    cancelText: {
      color: colors.textMuted,
      fontWeight: '600',
    },
  });
}
