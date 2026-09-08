import { Trash2 } from 'lucide-react-native';
import { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { AppColorPalette } from '../../constants/theme';
import { useAppTheme } from '../../contexts/ThemeContext';
import type { CommunityComment, ModerationStatus } from '../../types/community';
import {
  formatCommunityDateTime,
  getCommunityDisplayName,
  getModerationStatusLabel,
  normalizeModerationStatus,
} from '../../utils/community';
import { ModerationActionButtons } from './ModerationActionButtons';

type CommentItem = CommunityComment & { postTitle?: string };

type ModerationCommentsListProps = {
  comments: CommentItem[];
  updatingId?: string | null;
  onDelete: (commentId: string) => void;
  onSetStatus: (commentId: string, status: ModerationStatus) => void;
  onOpenPost?: (postId: string) => void;
  /** Sans padding horizontal (écran détail déjà paddé). */
  nested?: boolean;
};

/** Liste commentaires avec validation / refus / suppression. */
export function ModerationCommentsList({
  comments,
  updatingId = null,
  onDelete,
  onSetStatus,
  onOpenPost,
  nested = false,
}: ModerationCommentsListProps) {
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (comments.length === 0) {
    return (
      <View style={[styles.empty, nested && styles.emptyNested]}>
        <Text style={styles.emptyText}>Aucun commentaire pour ce filtre.</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {comments.map((comment) => {
        const name = getCommunityDisplayName(comment.is_anonyme, comment.author_name);
        const status = normalizeModerationStatus(comment.moderation_status);
        const postTitle = comment.postTitle ?? null;
        const busy = updatingId === comment.id;

        return (
          <View
            key={comment.id}
            style={[
              styles.row,
              { borderBottomColor: colors.border },
              nested && styles.rowNested,
            ]}
          >
            {postTitle ? (
              <TouchableOpacity
                onPress={() => onOpenPost?.(comment.post_id)}
                disabled={!onOpenPost}
                accessibilityRole={onOpenPost ? 'button' : undefined}
              >
                <Text style={[styles.postTitle, { color: colors.accent }]} numberOfLines={1}>
                  {postTitle}
                </Text>
              </TouchableOpacity>
            ) : null}

            <Text style={styles.body}>
              <Text style={styles.author}>{name} </Text>
              {comment.content}
            </Text>

            <Text
              style={[
                styles.statusBadge,
                status === 'en_attente' && styles.waitingBadge,
                status === 'refuse' && styles.refusedBadge,
                status === 'publie' && styles.publishedBadge,
              ]}
            >
              {getModerationStatusLabel(status)}
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

            <View style={styles.actions}>
              <ModerationActionButtons
                status={status}
                busy={busy}
                onApprove={() => onSetStatus(comment.id, 'publie')}
                onRefuse={() => onSetStatus(comment.id, 'refuse')}
              />
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
      paddingTop: 4,
    },
    empty: {
      paddingVertical: 28,
      paddingHorizontal: 16,
    },
    emptyNested: {
      paddingHorizontal: 0,
      paddingVertical: 10,
    },
    emptyText: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: 'center',
    },
    row: {
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    rowNested: {
      paddingHorizontal: 0,
    },
    postTitle: {
      fontSize: 12,
      fontWeight: '700',
      marginBottom: 6,
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
    statusBadge: {
      alignSelf: 'flex-start',
      marginTop: 8,
      fontSize: 11,
      fontWeight: '700',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
      overflow: 'hidden',
    },
    waitingBadge: {
      color: '#b45309',
      backgroundColor: '#fef3c7',
    },
    refusedBadge: {
      color: colors.status.error,
      backgroundColor: colors.status.error + '18',
    },
    publishedBadge: {
      color: colors.status.success,
      backgroundColor: colors.status.success + '18',
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginTop: 6,
    },
    date: {
      fontSize: 11,
      color: colors.textMuted,
    },
    actions: {
      marginTop: 10,
    },
  });
}
