import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThumbsUp, Trash2 } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { ModerationCommentsList } from '../../components/community/ModerationCommentsList';
import { PageHeader } from '../../components/headers/PageHeader';
import { DeleteConfirmModal } from '../../components/modals/DeleteConfirmModal';
import { ImageLightboxModal } from '../../components/modals/ImageLightboxModal';
import type { AppColorPalette } from '../../constants/theme';
import { useAppTheme } from '../../contexts/ThemeContext';
import { useModerationComments } from '../../hooks/community/useModerationComments';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';
import { supabase } from '../../lib/supabase';
import type { CommunityPost } from '../../types/community';
import {
  formatCommunityDateTime,
  getCommunityAuthorRole,
  getCommunityDisplayName,
  getPostTitleAndBody,
} from '../../utils/community';
import { notify } from '../../utils/notify';

type PendingDelete =
  | { type: 'post'; id: string }
  | { type: 'comment'; id: string }
  | null;

export default function ModerationPostDetailsScreen() {
  const { colors, surface } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, surface), [colors, surface]);
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const postId = Array.isArray(id) ? id[0] : id;

  const commentsState = useModerationComments(postId ?? null);

  const [post, setPost] = useState<CommunityPost | null>(null);
  const [score, setScore] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [lightboxUri, setLightboxUri] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPost = useCallback(async () => {
    if (!postId) return;

    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .eq('id', postId)
      .single();

    if (error) {
      console.error('[moderation] post', error.message);
      notify('Erreur', 'Impossible de charger ce sujet.');
      return;
    }

    setPost(data as CommunityPost);

    const { data: votesData } = await supabase
      .from('community_votes')
      .select('vote_value')
      .eq('post_id', postId);

    const likes = (votesData || []).filter((vote) => vote.vote_value === 1);
    setScore(likes.length);
  }, [postId]);

  useEffect(() => {
    void fetchPost();
  }, [fetchPost]);

  const pullRefresh = usePullToRefresh({
    refreshing,
    onRefresh: async () => {
      setRefreshing(true);
      await Promise.all([fetchPost(), commentsState.fetchComments()]);
      setRefreshing(false);
    },
    tintColor: colors.primaryLight,
  });

  const handleConfirmDelete = async () => {
    if (!pendingDelete || deleting) return;
    setDeleting(true);

    if (pendingDelete.type === 'comment') {
      const ok = await commentsState.deleteComment(pendingDelete.id);
      setDeleting(false);
      if (ok) setPendingDelete(null);
      return;
    }

    // Suppression du sujet + contenu associé
    const { error: commentsError } = await supabase
      .from('community_comments')
      .delete()
      .eq('post_id', pendingDelete.id);
    if (commentsError) {
      console.error('[moderation] delete comments', commentsError.message);
    }

    const { error: votesError } = await supabase
      .from('community_votes')
      .delete()
      .eq('post_id', pendingDelete.id);
    if (votesError) {
      console.error('[moderation] delete votes', votesError.message);
    }

    const { error } = await supabase
      .from('community_posts')
      .delete()
      .eq('id', pendingDelete.id);

    setDeleting(false);

    if (error) {
      console.error('[moderation] delete post', error.message);
      notify('Erreur', 'Impossible de supprimer cette publication.');
      return;
    }

    setPendingDelete(null);
    router.replace('/(tabs)/moderation');
  };

  const { title, body } = getPostTitleAndBody(post?.content || '');

  return (
    <View style={styles.safeArea}>
      <PageHeader
        title="Sujet"
        subtitle="Modération de la discussion"
        onBack={() => router.replace('/(tabs)/moderation')}
        right={
          post ? (
            <TouchableOpacity
              onPress={() => setPendingDelete({ type: 'post', id: post.id })}
              style={styles.headerDelete}
              accessibilityRole="button"
              accessibilityLabel="Supprimer la publication"
            >
              <Trash2 color={colors.status.error} size={20} />
            </TouchableOpacity>
          ) : undefined
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        {...pullRefresh}
      >
        {post ? (
          <View style={styles.postCard}>
            <View style={styles.postHeader}>
              <View style={styles.likeColumn}>
                <ThumbsUp color={colors.textMuted} size={18} />
                <Text style={styles.score}>{score}</Text>
              </View>

              <View style={styles.postCopy}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.meta}>
                  {getCommunityDisplayName(post.is_anonyme, post.author_name)} ·{' '}
                  {getCommunityAuthorRole(post.is_anonyme)} ·{' '}
                  {formatCommunityDateTime(post.created_at)}
                </Text>
              </View>
            </View>

            {body ? <Text style={styles.body}>{body}</Text> : null}

            {post.image_url ? (
              <TouchableOpacity
                onPress={() => setLightboxUri(post.image_url)}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Voir l'image en grand"
              >
                <Image
                  source={{ uri: post.image_url }}
                  style={styles.postImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          <Text style={styles.loadingText}>Chargement du sujet…</Text>
        )}

        <Text style={styles.commentsHeading}>
          {commentsState.comments.length}{' '}
          {commentsState.comments.length > 1 ? 'commentaires' : 'commentaire'}
        </Text>

        <ModerationCommentsList
          comments={commentsState.comments}
          onDelete={(commentId) =>
            setPendingDelete({ type: 'comment', id: commentId })
          }
        />
      </ScrollView>

      <DeleteConfirmModal
        visible={!!pendingDelete}
        onClose={() => {
          if (!deleting) setPendingDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        message={
          pendingDelete?.type === 'comment'
            ? 'Voulez-vous vraiment supprimer ce commentaire ?'
            : 'Voulez-vous vraiment supprimer cette publication et tous ses commentaires ?'
        }
      />

      <ImageLightboxModal
        visible={!!lightboxUri}
        uri={lightboxUri}
        onClose={() => setLightboxUri(null)}
      />
    </View>
  );
}

function createStyles(colors: AppColorPalette, surface: string) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: surface,
    },
    scroll: {
      flex: 1,
    },
    container: {
      padding: 16,
      paddingBottom: 28,
    },
    headerDelete: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
    },
    postCard: {
      backgroundColor: surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 14,
      marginBottom: 18,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    },
    postHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
    },
    likeColumn: {
      alignItems: 'center',
      paddingTop: 2,
      gap: 4,
    },
    score: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.accent,
    },
    postCopy: {
      flex: 1,
      minWidth: 0,
    },
    title: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
      lineHeight: 24,
    },
    meta: {
      marginTop: 6,
      fontSize: 12,
      color: colors.textMuted,
      fontWeight: '500',
    },
    body: {
      marginTop: 12,
      fontSize: 15,
      lineHeight: 22,
      color: colors.text,
    },
    postImage: {
      width: '100%',
      height: 220,
      borderRadius: 12,
      marginTop: 14,
      backgroundColor: colors.border,
    },
    commentsHeading: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.accent,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
      marginBottom: 8,
    },
    loadingText: {
      color: colors.textMuted,
      textAlign: 'center',
      paddingVertical: 24,
    },
  });
}
