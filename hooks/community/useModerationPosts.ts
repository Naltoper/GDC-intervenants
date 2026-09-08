import { useCallback, useEffect, useMemo, useState } from 'react';

import { supabase } from '../../lib/supabase';
import type {
  CommentRow,
  CommunityPost,
  ModerationStatus,
  VoteRow,
} from '../../types/community';
import {
  buildCommentCounts,
  buildVoteScores,
  normalizeModerationStatus,
  sortPostsByScoreAndDate,
} from '../../utils/community';
import { notify } from '../../utils/notify';

type FetchPostsOptions = {
  resort?: boolean;
};

/** Feed communauté pour la modération intervenants. */
export function useModerationPosts() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchPosts = useCallback(async (options?: FetchPostsOptions) => {
    const resort = options?.resort !== false;

    const { data: postsData, error: postsError } = await supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (postsError) {
      console.error('[moderation] posts', postsError.message);
      setLoading(false);
      return;
    }

    const safePosts = (postsData || []) as CommunityPost[];
    setPosts(safePosts);

    const postIds = safePosts.map((post) => post.id);

    if (postIds.length === 0) {
      setVotes({});
      setCommentCounts({});
      setOrderedIds([]);
      setLoading(false);
      return;
    }

    const { data: votesData, error: votesError } = await supabase
      .from('community_votes')
      .select('post_id, vote_value')
      .in('post_id', postIds);

    if (votesError) {
      console.error('[moderation] votes', votesError.message);
    }

    const nextVotes = buildVoteScores((votesData as VoteRow[] | null) ?? null);
    setVotes(nextVotes);

    const { data: commentsData, error: commentsError } = await supabase
      .from('community_comments')
      .select('post_id')
      .in('post_id', postIds);

    if (commentsError) {
      console.error('[moderation] comments count', commentsError.message);
    } else {
      setCommentCounts(buildCommentCounts((commentsData as CommentRow[] | null) ?? null));
    }

    if (resort) {
      setOrderedIds(sortPostsByScoreAndDate(safePosts, nextVotes).map((post) => post.id));
    } else {
      setOrderedIds((current) => {
        if (current.length === 0) {
          return sortPostsByScoreAndDate(safePosts, nextVotes).map((post) => post.id);
        }
        const known = new Set(current);
        const newcomers = safePosts
          .filter((post) => !known.has(post.id))
          .map((post) => post.id);
        const stillThere = current.filter((id) => postIds.includes(id));
        return [...newcomers, ...stillThere];
      });
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchPosts({ resort: true });
  }, [fetchPosts]);

  const setPostStatus = useCallback(
    async (postId: string, status: ModerationStatus) => {
      setUpdatingId(postId);
      const { error } = await supabase
        .from('community_posts')
        .update({ moderation_status: status })
        .eq('id', postId);

      setUpdatingId(null);

      if (error) {
        console.error('[moderation] update post status', error.message);
        notify('Erreur', 'Impossible de mettre à jour le statut du sujet.');
        return false;
      }

      setPosts((current) =>
        current.map((post) =>
          post.id === postId ? { ...post, moderation_status: status } : post,
        ),
      );
      return true;
    },
    [],
  );

  const deletePost = useCallback(
    async (postId: string) => {
      const { error: commentsError } = await supabase
        .from('community_comments')
        .delete()
        .eq('post_id', postId);
      if (commentsError) {
        console.error('[moderation] delete comments', commentsError.message);
      }

      const { error: votesError } = await supabase
        .from('community_votes')
        .delete()
        .eq('post_id', postId);
      if (votesError) {
        console.error('[moderation] delete votes', votesError.message);
      }

      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('id', postId);

      if (error) {
        console.error('[moderation] delete post', error.message);
        notify('Erreur', 'Impossible de supprimer cette publication.');
        return false;
      }

      await fetchPosts({ resort: true });
      return true;
    },
    [fetchPosts],
  );

  const sortedPosts = useMemo(() => {
    const byId = new Map(posts.map((post) => [post.id, post]));
    if (orderedIds.length === 0) {
      return sortPostsByScoreAndDate(posts, votes);
    }

    const known = new Set(orderedIds);
    const newcomers = posts.filter((post) => !known.has(post.id));
    const ordered = orderedIds
      .map((id) => byId.get(id))
      .filter((post): post is CommunityPost => Boolean(post));
    return [...newcomers, ...ordered];
  }, [posts, votes, orderedIds]);

  const pendingCount = useMemo(
    () =>
      posts.filter(
        (post) => normalizeModerationStatus(post.moderation_status) === 'en_attente',
      ).length,
    [posts],
  );

  return {
    posts,
    sortedPosts,
    votes,
    commentCounts,
    loading,
    updatingId,
    pendingCount,
    fetchPosts,
    setPostStatus,
    deletePost,
  };
}
