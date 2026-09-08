import { Trash2 } from 'lucide-react-native';
import { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { AppColorPalette } from '../../constants/theme';
import { useAppTheme } from '../../contexts/ThemeContext';
import type { CommunityComment } from '../../types/community';
import {
  formatCommunityDateTime,
  getCommunityDisplayName,
} from '../../utils/community';

type ModerationCommentsListProps = {
  comments: CommunityComment[];
  onDelete: (commentId: string) => void;
};

/** Liste des commentaires avec action de suppression pour les intervenants. */
export function ModerationCommentsList({
  comments,
  onDelete,
}: ModerationCommentsListProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (comments.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Aucun commentaire pour le moment.</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {comments.map((comment) => {
        const name = getCommunityDisplayName(comment.is_anonyme, comment.author_name);

        return (
          <View key={comment.id} style={styles.row}>
            <Text style={styles.body}>
              <Text style={styles.author}>{name} </Text>
              {comment.content}
            </Text>
            <View style={styles.metaRow}>
              <Text style={styles.date}>{formatCommunityDateTime(comment.created_at)}</Text>
              <TouchableOpacity
                onPress={() => onDelete(comment.id)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Supprimer le commentaire"
              >
                <Trash2 color={colors.status.error} size={14} />
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function createStyles(colors: AppColorPalette) {
  return StyleSheet.create({
    list: {
      paddingTop: 8,
      gap: 10,
    },
    empty: {
      paddingVertical: 10,
    },
    emptyText: {
      fontSize: 13,
      color: colors.textMuted,
    },
    row: {
      paddingLeft: 4,
    },
    body: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },
    author: {
      fontWeight: '800',
      color: colors.text,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginTop: 4,
    },
    date: {
      fontSize: 11,
      color: colors.textMuted,
    },
  });
}
