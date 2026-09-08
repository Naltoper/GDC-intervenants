import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { MessageCircle, ThumbsUp, Trash2 } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { ModerationActionButtons } from '../../components/community/ModerationActionButtons';
import { ModerationCommentsList } from '../../components/community/ModerationCommentsList';
import { PageHeader } from '../../components/headers/PageHeader';
import { DeleteConfirmModal } from '../../components/modals/DeleteConfirmModal';
import { ImageLightboxModal } from '../../components/modals/ImageLightboxModal';
import { useAppTheme } from '../../contexts/ThemeContext';
import { useModerationCommentsQueue } from '../../hooks/community/useModerationCommentsQueue';
import { useModerationPosts } from '../../hooks/community/useModerationPosts';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';
import type { ModerationStatus } from '../../types/community';
import {
  formatCommunityDateTime,
  getCommunityAuthorRole,
  getCommunityDisplayName,
  getModerationStatusLabel,
  getPostTitleAndBody,
  normalizeModerationStatus,
} from '../../utils/community';

type KindTab = 'posts' | 'comments';
type StatusFilter = ModerationStatus;

const KIND_TABS: { key: KindTab; label: string }[] = [
  { key: 'posts', label: 'Sujets' },
  { key: 'comments', label: 'Commentaires' },
];

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'en_attente', label: 'En attente' },
  { key: 'publie', label: 'Publiés' },
  { key: 'refuse', label: 'Refusés' },
];

export default function ModerationScreen() {
  const router = useRouter();
  const { colors, surface } = useAppTheme();
  const postsState = useModerationPosts();
  const commentsQueue = useModerationCommentsQueue();

  const [kind, setKind] = useState<KindTab>('posts');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('en_attente');
  const [refreshing, setRefreshing] = useState(false);
  const [lightboxUri, setLightboxUri] = useState<string | null>(null);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      void postsState.fetchPosts({ resort: true });
      void commentsQueue.fetchComments();
    }, [postsState.fetchPosts, commentsQueue.fetchComments]),
  );

  const pullRefresh = usePullToRefresh({
    refreshing,
    onRefresh: async () => {
      setRefreshing(true);
      await Promise.all([
        postsState.fetchPosts({ resort: true }),
        commentsQueue.fetchComments(),
      ]);
      setRefreshing(false);
    },
    tintColor: colors.primaryLight,
  });

  const filteredPosts = useMemo(
    () =>
      postsState.sortedPosts.filter(
        (post) =>
          normalizeModerationStatus(post.moderation_status) === statusFilter,
      ),
    [postsState.sortedPosts, statusFilter],
  );

  const filteredComments = useMemo(
    () =>
      commentsQueue.comments.filter(
        (comment) =>
          normalizeModerationStatus(comment.moderation_status) === statusFilter,
      ),
    [commentsQueue.comments, statusFilter],
  );

  const pendingTotal = postsState.pendingCount + commentsQueue.pendingCount;

  const handleConfirmDelete = async () => {
    if (deleting) return;
    setDeleting(true);

    if (deletePostId) {
      const ok = await postsState.deletePost(deletePostId);
      setDeleting(false);
      if (ok) setDeletePostId(null);
      return;
    }

    if (deleteCommentId) {
      const ok = await commentsQueue.deleteComment(deleteCommentId);
      setDeleting(false);
      if (ok) setDeleteCommentId(null);
    }
  };

  const hairline = colors.border;
  const loading =
    kind === 'posts'
      ? postsState.loading && postsState.posts.length === 0
      : commentsQueue.loading && commentsQueue.comments.length === 0;

  return (
    <View style={[styles.safeArea, { backgroundColor: surface }]}>
      <PageHeader
        title="Modération Communauté"
        subtitle={
          pendingTotal > 0
            ? `${pendingTotal} élément${pendingTotal > 1 ? 's' : ''} en attente`
            : 'Surveillez et modérez le forum élèves'
        }
        onBack={() => router.replace('/(tabs)/dashboard')}
      />

      <View style={[styles.tabsRow, { borderBottomColor: hairline }]}>
        {KIND_TABS.map((tab) => {
          const active = kind === tab.key;
          const count =
            tab.key === 'posts'
              ? postsState.pendingCount
              : commentsQueue.pendingCount;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.kindTab,
                active && {
                  borderBottomColor: colors.primaryLight,
                },
              ]}
              onPress={() => setKind(tab.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
            >
              <Text
                style={[
                  styles.kindTabLabel,
                  { color: active ? colors.primaryLight : colors.textMuted },
                ]}
              >
                {tab.label}
              </Text>
              {count > 0 ? (
                <View
                  style={[styles.kindBadge, { backgroundColor: colors.status.error }]}
                >
                  <Text style={styles.kindBadgeText}>{count > 99 ? '99+' : count}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statusFilters}
        style={styles.statusFiltersScroll}
      >
        {STATUS_FILTERS.map((filter) => {
          const active = statusFilter === filter.key;
          return (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.statusChip,
                {
                  backgroundColor: active
                    ? colors.primaryLight + '18'
                    : colors.borderSubtle,
                  borderColor: active ? colors.primaryLight : colors.border,
                },
              ]}
              onPress={() => setStatusFilter(filter.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text
                style={[
                  styles.statusChipLabel,
                  { color: active ? colors.primaryLight : colors.textMuted },
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {loading ? (
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
          {kind === 'posts' ? (
            <>
              <View style={[styles.listHeader, { borderBottomColor: hairline }]}>
                <Text style={[styles.listHeaderTitle, { color: colors.accent }]}>
                  {STATUS_FILTERS.find((f) => f.key === statusFilter)?.label}
                </Text>
                <Text style={[styles.listHeaderMeta, { color: colors.textMuted }]}>
                  {filteredPosts.length}{' '}
                  {filteredPosts.length > 1 ? 'sujets' : 'sujet'}
                </Text>
              </View>

              {filteredPosts.length === 0 ? (
                <View style={styles.emptyRow}>
                  <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                    Aucun sujet pour ce filtre.
                  </Text>
                </View>
              ) : (
                filteredPosts.map((post, index) => {
                  const score = postsState.votes[post.id] || 0;
                  const commentCount = postsState.commentCounts[post.id] || 0;
                  const displayName = getCommunityDisplayName(
                    post.is_anonyme,
                    post.author_name,
                  );
                  const role = getCommunityAuthorRole(post.is_anonyme);
                  const { title, body } = getPostTitleAndBody(post.content);
                  const status = normalizeModerationStatus(post.moderation_status);
                  const busy = postsState.updatingId === post.id;

                  return (
                    <View
                      key={post.id}
                      style={[
                        styles.threadRow,
                        {
                          backgroundColor: surface,
                          borderBottomColor: hairline,
                        },
                        index === filteredPosts.length - 1 && styles.threadRowLast,
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
                            style={[
                              styles.statusBadge,
                              status === 'en_attente' && styles.waitingBadge,
                              status === 'refuse' && styles.refusedBadge,
                              status === 'publie' && styles.publishedBadge,
                            ]}
                          >
                            {getModerationStatusLabel(status)}
                          </Text>

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
                          <Text
                            style={[styles.repliesText, { color: colors.accent }]}
                          >
                            {commentCount}{' '}
                            {commentCount > 1 ? 'commentaires' : 'commentaire'}
                          </Text>
                        </TouchableOpacity>

                        <ModerationActionButtons
                          status={status}
                          busy={busy}
                          onApprove={() =>
                            void postsState.setPostStatus(post.id, 'publie')
                          }
                          onRefuse={() =>
                            void postsState.setPostStatus(post.id, 'refuse')
                          }
                        />
                      </View>
                    </View>
                  );
                })
              )}
            </>
          ) : (
            <ModerationCommentsList
              comments={filteredComments}
              updatingId={commentsQueue.updatingId}
              onDelete={setDeleteCommentId}
              onSetStatus={(id, status) => {
                void commentsQueue.setCommentStatus(id, status);
              }}
              onOpenPost={(postId) =>
                router.push({
                  pathname: '/moderation/[id]',
                  params: { id: postId },
                })
              }
            />
          )}
        </ScrollView>
      )}

      <DeleteConfirmModal
        visible={!!deletePostId || !!deleteCommentId}
        onClose={() => {
          if (deleting) return;
          setDeletePostId(null);
          setDeleteCommentId(null);
        }}
        onConfirm={handleConfirmDelete}
        message={
          deleteCommentId
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
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  kindTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  kindTabLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  kindBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kindBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  statusFiltersScroll: {
    flexGrow: 0,
  },
  statusFilters: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusChipLabel: {
    fontSize: 12,
    fontWeight: '700',
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
  statusBadge: {
    alignSelf: 'flex-start',
    marginTop: 6,
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
    color: '#b91c1c',
    backgroundColor: '#fee2e2',
  },
  publishedBadge: {
    color: '#047857',
    backgroundColor: '#d1fae5',
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
    gap: 10,
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
