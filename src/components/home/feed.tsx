import { useMutation, useQuery } from "@tanstack/react-query";

import api from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

import { Post } from "@/lib/api.d";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PostOverview from "@/components/posts/post-overview";


const usePostsQuery = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['posts'],
    queryFn: () => api.get('/post/relevant')
  })
  return { data: (data?.data?.posts || []) as Post[], isLoading, error, refetch }
}

const FeedComponent = () => {
  const { toast } = useToast();
  const { data: posts, isLoading, error, refetch } = usePostsQuery();

  const queryClient = useQueryClient();

  const { mutate: votePost } = useMutation({
    mutationFn: ({ postId, voteType }: { postId: number, voteType: 'up' | 'down' }) => {
      return api.post(`/post/${voteType === 'up' ? 'upvote' : 'downvote'}/${postId}`);
    },
    onMutate: async ({ postId, voteType }) => {
      await queryClient.cancelQueries({ queryKey: ['posts'] });

      const previousPosts = queryClient.getQueryData(['posts']);

      queryClient.setQueryData(['posts'], (old: any) => {
        const updatedPosts = old?.data?.posts?.map((post: Post) => {
          if (post.id === postId) {
            const isSameVote = post.userVote === voteType;
            const isSwitchingVote = post.userVote && post.userVote !== voteType;

            return {
              ...post,
              upvotes: post.upvotes +
                (voteType === 'up' ? (isSameVote ? -1 : (isSwitchingVote ? 1 : 1)) : (isSwitchingVote ? -1 : 0)),
              downvotes: post.downvotes +
                (voteType === 'down' ? (isSameVote ? -1 : (isSwitchingVote ? 1 : 1)) : (isSwitchingVote ? -1 : 0)),
              userVote: isSameVote ? undefined : voteType,
            };
          }
          return post;
        }) || [];

        return { data: { posts: updatedPosts } };
      });

      return { previousPosts };
    },
    onError: (error, _variables, context) => {
      if (context?.previousPosts)
        queryClient.setQueryData(['posts'], context.previousPosts);

      error.stack && console.log(error.stack);
      toast({
        title: 'Error',
        description: error.message
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    }
  });

  const handleVote = (postId: number, voteType: 'up' | 'down') => {
    votePost({ postId, voteType });
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className='flex flex-col gap-4 items-center justify-center'>
          <p className='text-red-500'>Error loading posts</p>
          <Button variant="outline" onClick={() => refetch()}>Retry</Button>
        </div>
      ) : isLoading ? (
        <div className='flex flex-col gap-4'>
          {[...Array(10)].map((_, index) => (
            <Skeleton key={index} className='w-full h-32 rounded-lg' />
          ))}
        </div>
      ) : posts.length > 0 ? (
        posts.map((post, index) => <PostOverview key={index} post={post} handleVote={handleVote} />)
      ) : (
        <div className='flex flex-col gap-4 items-center justify-center'>
          <p className='text-gray-500'>Nothing here yet...</p>
          <p className='text-gray-500'>Join a community to see posts!</p>
        </div>
      )}
    </div>
  );
};

export default FeedComponent;
