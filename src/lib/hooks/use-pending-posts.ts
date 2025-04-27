import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Post } from "@/lib/api.d";

type PendingPost = Omit<Post, 'upvotes' | 'downvotes'>;

export const usePendingPostsQuery = (isAdmin: boolean, limit?: number) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['pending-posts'],
    queryFn: async () => {
      if (!isAdmin)
        return { posts: [], count: 0 };

      const response = await api.get('post/pending');
      const posts = response.data.posts as PendingPost[];
      return {
        posts: limit ? posts.slice(0, limit) : posts,
        count: response.data.count
      };
    }
  });

  return {
    posts: data?.posts || [],
    count: data?.count || 0,
    isLoading,
    error
  };
}; 