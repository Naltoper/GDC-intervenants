import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { MessageCircle, ThumbsUp, Trash2 } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { PageHeader } from '../../components/headers/PageHeader';
import { DeleteConfirmModal } from '../../components/modals/DeleteConfirmModal';
import { ImageLightboxModal } from '../../components/modals/ImageLightboxModal';
import { useAppTheme } from '../../contexts/ThemeContext';
import { useModerationPosts } from '../../hooks/community/useModerationPosts';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';
import {
  formatCommunityDateTime,
  getCommunityAuthorRole,
  getCommunityDisplayName,
  getPostTitleAndBody,
} from '../../utils/community';

export default function ModerationScreen() {
  const router = useRouter();
  const { colors, surface } = useAppTheme();
  const {
    posts,
    sortedPosts,
    votes,
    commentCounts,
    loading,
    fetchPosts,
    deletePost,
  } = useModerationPosts();

  const [refreshing, setRefreshing] = useState(false);
  const [lightboxUri, setLightboxUri] = useState<string | null>(null);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void fetchPosts({ resort: true });
    }, [fetchPosts]),
  );

  const pullRefresh = usePullToRefresh({
    refreshing,
    onRefresh: async () => {
      setRefreshing(true);
      await fetchPosts({ resort: true });
      setRefreshing(false);
    },
    tintColor: colors.primaryLight,
  });

  const handleConfirmDelete = async () => {
    if (!deletePostId || deleting) return;
    setDeleting(true);
    const ok = await deletePost(deletePostId);
    setDeleting(false);
    if (ok) setDeletePostId(null);
  };

  const hairline = colors.border;

  return (
    <View style={[styles.safeArea, { backgroundColor: surface }]}>
      <PageHeader
        title="Modération Communauté"
        subtitle="Surveillez et modérez le forum élèves"
        onBack={() => router.replace('/(tabs)/dashboard')}
      />

      {loading && posts.length === 0 ? (
        <ActivityIndicator
          size="large"
          color={colors.primaryLight}
          style={styles.loader}
        />
      ) : (
        <ScrollView
          style={[styles.scroll, { backgroundColor: surface }]}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          {...pullRefresh}
        >
          <View style={[styles.listHeader, { borderBottomColor: hairline }]}>
            <Text style={[styles.listHeaderTitle, { color: colors.accent }]}>
              Sujets récents
            </Text>
            <Text style={[styles.listHeaderMeta, { color: colors.textMuted }]}>
              {posts.length} {posts.length > 1 ? 'sujets' : 'sujet'}
            </Text>
          </View>

          {posts.length === 0 ? (
            <View style={styles.emptyRow}>
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                Aucun sujet pour le moment.
              </Text>
            </View>
          ) : (
            sortedPosts.map((post, index) => {
              const score = votes[post.id] || 0;
              const commentCount = commentCounts[post.id] || 0;
              const displayName = getCommunityDisplayName(
                post.is_anonyme,
                post.author_name,
              );
              const role = getCommunityAuthorRole(post.is_anonyme);
              const { title, body } = getPostTitleAndBody(post.content);

              return (
                <View
                  key={post.id}
                  style={[
                    styles.threadRow,
                    {
                      backgroundColor: surface,
                      borderBottomColor: hairline,
                    },
                    index === sortedPosts.length - 1 && styles.threadRowLast,
                  ]}
                >
                  <View style={styles.threadMain}>
                    <View style={styles.voteColumn}>
                      <ThumbsUp color={colors.textMuted} size={18} />
                      <Text style={[styles.score, { color: colors.accent }]}>
                        {score}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.threadBody}
                      activeOpacity={0.85}
                      onPress={() =>
                        router.push({
                          pathname: '/moderation/[id]',
                          params: { id: post.id },
                        })
                      }
                      accessibilityRole="button"
                      accessibilityLabel="Ouvrir le sujet"
                    >
                      <View style={styles.threadTitleRow}>
                        <Text
                          style={[styles.threadTitle, { color: colors.text }]}
                          numberOfLines={2}
                        >
                          {title}
                        </Text>
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => setDeletePostId(post.id)}
                          accessibilityRole="button"
                          accessibilityLabel="Supprimer le sujet"
                        >
                          <Trash2 color={colors.status.error} size={16} />
                        </TouchableOpacity>
                      </View>

                      <Text
                        style={[styles.threadMeta, { color: colors.textMuted }]}
                        numberOfLines={1}
                      >
                        {displayName} · {role} ·{' '}
                        {formatCommunityDateTime(post.created_at)}
                      </Text>

                      {body ? (
                        <Text
                          style={[styles.threadPreview, { color: colors.icon }]}
                          numberOfLines={3}
                        >
                          {body}
                        </Text>
                      ) : null}
                    </TouchableOpacity>

                    {post.image_url ? (
                      <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={() => setLightboxUri(post.image_url)}
                        accessibilityRole="button"
                        accessibilityLabel="Voir l'image en grand"
                      >
                        <Image
                          source={{ uri: post.image_url }}
                          style={[
                            styles.threadThumb,
                            { backgroundColor: colors.borderSubtle },
                          ]}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    ) : null}
                  </View>

                  <View style={styles.threadFooter}>
                    <TouchableOpacity
                      style={styles.repliesButton}
                      onPress={() =>
                        router.push({
                          pathname: '/moderation/[id]',
                          params: { id: post.id },
                        })
                      }
                      accessibilityRole="button"
                      accessibilityLabel="Voir les commentaires"
                    >
                      <MessageCircle color={colors.accent} size={15} />
                      <Text style={[styles.repliesText, { color: colors.accent }]}>
                        {commentCount}{' '}
                        {commentCount > 1 ? 'commentaires' : 'commentaire'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}

      <DeleteConfirmModal
        visible={!!deletePostId}
        onClose={() => {
          if (!deleting) setDeletePostId(null);
        }}
        onConfirm={handleConfirmDelete}
        message="Voulez-vous vraiment supprimer cette publication et tous ses commentaires ?"
      />

      <ImageLightboxModal
        visible={!!lightboxUri}
        uri={lightboxUri}
        onClose={() => setLightboxUri(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  loader: {
    marginTop: 48,
  },
  container: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  listHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  listHeaderMeta: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyRow: {
    paddingVertical: 28,
    paddingHorizontal: 16,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
  },
  threadRow: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  threadRowLast: {
    borderBottomWidth: 0,
  },
  threadMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  voteColumn: {
    width: 36,
    alignItems: 'center',
    paddingTop: 2,
    gap: 2,
  },
  score: {
    minWidth: 22,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '800',
  },
  threadBody: {
    flex: 1,
    minWidth: 0,
  },
  threadTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  threadTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 21,
  },
  deleteButton: {
    padding: 4,
  },
  threadMeta: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  threadPreview: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    fontWeight: '500',
  },
  threadFooter: {
    marginTop: 10,
    marginLeft: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  repliesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  repliesText: {
    fontSize: 12,
    fontWeight: '700',
  },
  threadThumb: {
    width: 56,
    height: 56,
    borderRadius: 6,
    marginTop: 2,
  },
});
