import { Check, X } from 'lucide-react-native';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useAppTheme } from '../../contexts/ThemeContext';
import type { ModerationStatus } from '../../types/community';

type ModerationActionButtonsProps = {
  status: ModerationStatus;
  busy?: boolean;
  onApprove: () => void;
  onRefuse: () => void;
};

/** Boutons Valider / Refuser selon le statut courant. */
export function ModerationActionButtons({
  status,
  busy = false,
  onApprove,
  onRefuse,
}: ModerationActionButtonsProps) {
  const { colors } = useAppTheme();
  const canApprove = status !== 'publie';
  const canRefuse = status !== 'refuse';

  if (!canApprove && !canRefuse) return null;

  return (
    <View style={styles.row}>
      {busy ? (
        <ActivityIndicator size="small" color={colors.primaryLight} />
      ) : (
        <>
          {canApprove ? (
            <TouchableOpacity
              style={[
                styles.button,
                {
                  backgroundColor: colors.status.success + '18',
                  borderColor: colors.status.success,
                },
              ]}
              onPress={onApprove}
              accessibilityRole="button"
              accessibilityLabel="Valider"
            >
              <Check color={colors.status.success} size={14} strokeWidth={2.6} />
              <Text style={[styles.label, { color: colors.status.success }]}>
                Valider
              </Text>
            </TouchableOpacity>
          ) : null}
          {canRefuse ? (
            <TouchableOpacity
              style={[
                styles.button,
                {
                  backgroundColor: colors.status.error + '14',
                  borderColor: colors.status.error,
                },
              ]}
              onPress={onRefuse}
              accessibilityRole="button"
              accessibilityLabel="Refuser"
            >
              <X color={colors.status.error} size={14} strokeWidth={2.6} />
              <Text style={[styles.label, { color: colors.status.error }]}>
                Refuser
              </Text>
            </TouchableOpacity>
          ) : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
});
