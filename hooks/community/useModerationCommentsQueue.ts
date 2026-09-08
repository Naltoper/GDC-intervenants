import { useCallback, useEffect, useMemo, useState } from 'react';

import { supabase } from '../../lib/supabase';
import type { CommunityComment, ModerationStatus } from '../../types/community';
import { getPostTitleAndBody, normalizeModerationStatus } from '../../utils/community';
import { notify } from '../../utils/notify';

export type ModerationCommentItem = CommunityComment & {
  postTitle: string;
};

/** File de tous les commentaires pour l’onglet modération. */
export function useModerationCommentsQueue() {
  const [comments, setComments] = useState<ModerationCommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    const { data, error } = await supabase
      .from('community_comments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[moderation] comments queue', error.message);
      setLoading(false);
      return;
    }

    const rows = (data || []) as CommunityComment[];
    const postIds = [...new Set(rows.map((row) => row.post_id))];
    const titleByPostId: Record<string, string> = {};

    if (postIds.length > 0) {
      const { data: postsData, error: postsError } = await supabase
        .from('community_posts')
        .select('id, content')
        .in('id', postIds);

      if (postsError) {
        console.error('[moderation] comments posts', postsError.message);
      } else {
        for (const post of postsData || []) {
          titleByPostId[post.id] = getPostTitleAndBody(post.content).title;
        }
      }
    }

    setComments(
      rows.map((comment) => ({
        ...comment,
        postTitle: titleByPostId[comment.post_id] || 'Sujet',
      })),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchComments();
  }, [fetchComments]);

  const setCommentStatus = useCallback(
    async (commentId: string, status: ModerationStatus) => {
      setUpdatingId(commentId);
      const { error } = await supabase
        .from('community_comments')
        .update({ moderation_status: status })
        .eq('id', commentId);
      setUpdatingId(null);

      if (error) {
        console.error('[moderation] update comment', error.message);
        notify('Erreur', 'Impossible de mettre à jour le commentaire.');
        return false;
      }

      setComments((current) =>
        current.map((comment) =>
          comment.id === commentId
            ? { ...comment, moderation_status: status }
            : comment,
        ),
      );
      return true;
    },
    [],
  );

  const deleteComment = useCallback(
    async (commentId: string) => {
      const { error } = await supabase
        .from('community_comments')
        .delete()
        .eq('id', commentId);

      if (error) {
        console.error('[moderation] delete comment', error.message);
        notify('Erreur', 'Impossible de supprimer ce commentaire.');
        return false;
      }

      setComments((current) => current.filter((comment) => comment.id !== commentId));
      return true;
    },
    [],
  );

  const pendingCount = useMemo(
    () =>
      comments.filter(
        (comment) =>
          normalizeModerationStatus(comment.moderation_status) === 'en_attente',
      ).length,
    [comments],
  );

  return {
    comments,
    loading,
    updatingId,
    pendingCount,
    fetchComments,
    setCommentStatus,
    deleteComment,
  };
}
