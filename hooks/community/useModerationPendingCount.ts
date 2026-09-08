import { useCallback, useEffect, useState } from 'react';

import { supabase } from '../../lib/supabase';

/** Compteur global des sujets + commentaires en attente (badge dashboard). */
export function useModerationPendingCount() {
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [postsResult, commentsResult] = await Promise.all([
      supabase
        .from('community_posts')
        .select('id', { count: 'exact', head: true })
        .eq('moderation_status', 'en_attente'),
      supabase
        .from('community_comments')
        .select('id', { count: 'exact', head: true })
        .eq('moderation_status', 'en_attente'),
    ]);

    if (postsResult.error) {
      console.error('[moderation] pending posts', postsResult.error.message);
    }
    if (commentsResult.error) {
      console.error('[moderation] pending comments', commentsResult.error.message);
    }

    setPendingCount((postsResult.count || 0) + (commentsResult.count || 0));
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { pendingCount, loading, refresh };
}
