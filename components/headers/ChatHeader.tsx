import { useRouter } from 'expo-router';
import { ChevronLeft, FileText } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { useAppTheme } from '../../contexts/ThemeContext';
import { AppHeaderBar } from './AppHeaderBar';

interface ChatHeaderProps {
  reportId?: string | undefined;
  role: 'user' | 'admin' | string | string[] | undefined;
  onShowDetails?: () => void;
  /** Optional routing context for the back button fallback. */
  from?: string;
  fromFilter?: string;
}

export const ChatHeader = ({
  role,
  onShowDetails,
  from,
  fromFilter,
}: ChatHeaderProps) => {
  const router = useRouter();
  const { colors, headerFg } = useAppTheme();
  const isUserAuthor = role === 'user';

  const handleBack = () => {
    const canGoBack =
      typeof (router as { canGoBack?: () => boolean }).canGoBack === 'function'
        ? (router as { canGoBack: () => boolean }).canGoBack()
        : true;

    if (canGoBack && typeof router.back === 'function') {
      router.back();
      return;
    }

    if (from === 'chat-history') {
      router.replace('/(tabs)/chat-history');
      return;
    }

    if (from === 'reports') {
      router.replace({
        pathname: '/(tabs)/reports',
        params: { filter: fromFilter ?? 'Tous' },
      });
      return;
    }

    router.replace('/(tabs)/dashboard');
  };

  return (
    <AppHeaderBar
      title={isUserAuthor ? 'Échange avec un intervenant' : 'Échange avec un élève'}
      subtitle="Discussion sécurisée et confidentielle"
      left={
        <TouchableOpacity
          onPress={handleBack}
          style={styles.iconButton}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Retour"
        >
          <ChevronLeft color={headerFg} size={26} strokeWidth={2.5} />
        </TouchableOpacity>
      }
      right={
        onShowDetails ? (
          <TouchableOpacity
            onPress={onShowDetails}
            style={[
              styles.detailsButton,
              {
                backgroundColor: colors.borderSubtle,
                borderColor: colors.border,
              },
            ]}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Voir les détails du signalement"
          >
            <FileText size={16} color={colors.accent} />
          </TouchableOpacity>
        ) : (
          <View style={styles.sidePlaceholder} />
        )
      }
    />
  );
};

const styles = StyleSheet.create({
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsButton: {
    width: 44,
    height: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  sidePlaceholder: {
    width: 44,
    height: 44,
  },
});
