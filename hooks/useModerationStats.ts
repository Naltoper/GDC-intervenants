import { useCallback, useEffect, useState } from 'react';

import { supabase } from '../lib/supabase';

export type ModerationStats = {
  postsPending: number;
  postsPublished: number;
  postsRefused: number;
  commentsPending: number;
  commentsPublished: number;
  commentsRefused: number;
};

const EMPTY: ModerationStats = {
  postsPending: 0,
  postsPublished: 0,
  postsRefused: 0,
  commentsPending: 0,
  commentsPublished: 0,
  commentsRefused: 0,
};

async function countByStatus(
  table: 'community_posts' | 'community_comments',
  status: string,
) {
  const { count, error } = await supabase
    .from(table)
    .select('id', { count: 'exact', head: true })
    .eq('moderation_status', status);

  if (error) {
    console.error(`[stats] ${table} ${status}`, error.message);
    return 0;
  }
  return count || 0;
}

/** Compteurs de modération communauté pour la page Statistiques. */
export function useModerationStats() {
  const [stats, setStats] = useState<ModerationStats>(EMPTY);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [
      postsPending,
      postsPublished,
      postsRefused,
      commentsPending,
      commentsPublished,
      commentsRefused,
    ] = await Promise.all([
      countByStatus('community_posts', 'en_attente'),
      countByStatus('community_posts', 'publie'),
      countByStatus('community_posts', 'refuse'),
      countByStatus('community_comments', 'en_attente'),
      countByStatus('community_comments', 'publie'),
      countByStatus('community_comments', 'refuse'),
    ]);

    setStats({
      postsPending,
      postsPublished,
      postsRefused,
      commentsPending,
      commentsPublished,
      commentsRefused,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { stats, loading, refresh };
}
