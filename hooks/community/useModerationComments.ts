import { useCallback, useEffect, useState } from 'react';

import { supabase } from '../../lib/supabase';
import type { CommunityComment, ModerationStatus } from '../../types/community';
import { notify } from '../../utils/notify';

/** Commentaires d’un sujet — actions admin (statut + suppression). */
export function useModerationComments(postId: string | null) {
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [loading, setLoading] = useState(Boolean(postId));
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    if (!postId) {
      setComments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('community_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[moderation] comments', error.message);
      setLoading(false);
      return;
    }

    setComments((data as CommunityComment[]) || []);
    setLoading(false);
  }, [postId]);

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
        console.error('[moderation] update comment status', error.message);
        notify('Erreur', 'Impossible de mettre à jour le statut du commentaire.');
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

      await fetchComments();
      return true;
    },
    [fetchComments],
  );

  return {
    comments,
    loading,
    updatingId,
    fetchComments,
    setCommentStatus,
    deleteComment,
  };
}
