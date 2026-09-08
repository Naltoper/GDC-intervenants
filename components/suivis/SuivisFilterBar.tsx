import { ArrowDown, ArrowUp, MessageCircle } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../../contexts/ThemeContext';

export const SUIVIS_STATUS_FILTERS = [
  'Tous',
  'Non traité',
  'En cours',
  'Résolu',
] as const;

export type SuivisStatusFilter = (typeof SUIVIS_STATUS_FILTERS)[number];
export type SuivisDateSort = 'recent' | 'oldest';

type SuivisFilterBarProps = {
  status: SuivisStatusFilter;
  onStatusChange: (status: SuivisStatusFilter) => void;
  onlyWithChat: boolean;
  onOnlyWithChatChange: (value: boolean) => void;
  dateSort: SuivisDateSort;
  onDateSortChange: (value: SuivisDateSort) => void;
};

export function SuivisFilterBar({
  status,
  onStatusChange,
  onlyWithChat,
  onOnlyWithChatChange,
  dateSort,
  onDateSortChange,
}: SuivisFilterBarProps) {
  const { colors, surface } = useAppTheme();

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: surface,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {SUIVIS_STATUS_FILTERS.map((item) => {
          const selected = status === item;
          return (
            <Pressable
              key={item}
              onPress={() => onStatusChange(item)}
              style={[
                styles.chip,
                {
                  backgroundColor: colors.borderSubtle,
                  borderColor: colors.border,
                },
                selected && {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: colors.text },
                  selected && styles.chipTextSelected,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          );
        })}

        <Pressable
          onPress={() => onOnlyWithChatChange(!onlyWithChat)}
          style={[
            styles.chip,
            {
              backgroundColor: colors.borderSubtle,
              borderColor: colors.border,
            },
            onlyWithChat && {
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            },
          ]}
          accessibilityRole="button"
          accessibilityState={{ selected: onlyWithChat }}
        >
          <MessageCircle
            size={13}
            color={onlyWithChat ? '#FFFFFF' : colors.accent}
            strokeWidth={2.4}
          />
          <Text
            style={[
              styles.chipText,
              { color: colors.text },
              onlyWithChat ? styles.chipTextSelected : { color: colors.accent },
            ]}
          >
            Chat actif
          </Text>
        </Pressable>
      </ScrollView>

      <View style={styles.sortRow}>
        <Text style={[styles.sortLabel, { color: colors.textMuted }]}>
          Date d'envoi
        </Text>
        <Pressable
          onPress={() => onDateSortChange('recent')}
          style={[
            styles.chip,
            {
              backgroundColor: colors.borderSubtle,
              borderColor: colors.border,
            },
            dateSort === 'recent' && {
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            },
          ]}
          accessibilityRole="button"
          accessibilityState={{ selected: dateSort === 'recent' }}
          testID="suivis-sort-recent"
        >
          <ArrowDown
            size={13}
            color={dateSort === 'recent' ? '#FFFFFF' : colors.accent}
            strokeWidth={2.4}
          />
          <Text
            style={[
              styles.chipText,
              { color: colors.text },
              dateSort === 'recent' && styles.chipTextSelected,
            ]}
          >
            Plus récent
          </Text>
        </Pressable>
        <Pressable
          onPress={() => onDateSortChange('oldest')}
          style={[
            styles.chip,
            {
              backgroundColor: colors.borderSubtle,
              borderColor: colors.border,
            },
            dateSort === 'oldest' && {
              backgroundColor: colors.primary,
              borderColor: colors.primary,
            },
          ]}
          accessibilityRole="button"
          accessibilityState={{ selected: dateSort === 'oldest' }}
          testID="suivis-sort-oldest"
        >
          <ArrowUp
            size={13}
            color={dateSort === 'oldest' ? '#FFFFFF' : colors.accent}
            strokeWidth={2.4}
          />
          <Text
            style={[
              styles.chipText,
              { color: colors.text },
              dateSort === 'oldest' && styles.chipTextSelected,
            ]}
          >
            Plus ancien
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export function matchesStatusFilter(
  reportStatus: string | null | undefined,
  filter: SuivisStatusFilter,
) {
  if (filter === 'Tous') return true;
  const value = reportStatus || 'Non traité';
  if (filter === 'Résolu') return value === 'Résolu' || value === 'Traité';
  return value === filter;
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 8,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  sortLabel: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginRight: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 32,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
});
