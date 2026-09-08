import { useCallback, useEffect, useState } from 'react';

import { supabase } from '../../lib/supabase';
import type { CommunityComment } from '../../types/community';
import { notify } from '../../utils/notify';

/** Commentaires d’un sujet — suppression admin (sans filtre user_token). */
export function useModerationComments(postId: string | null) {
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [loading, setLoading] = useState(Boolean(postId));

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
    fetchComments,
    deleteComment,
  };
}
