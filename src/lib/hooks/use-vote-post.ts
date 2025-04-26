import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api";
import { useToast } from "@/components/ui/use-toast";
import { Post } from "../api.d";


export const useVotePost = (queryKey: any[]) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutate } = useMutation({
    mutationFn: ({ postId, voteType }: { postId: number, voteType: 'up' | 'down' }) => {
      return api.post(`/post/${voteType === 'up' ? 'upvote' : 'downvote'}/${postId}`);
    },
    onMutate: async ({ postId, voteType }) => {
      await queryClient.cancelQueries({ queryKey });

      const previousPosts = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old: any) => {
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
        queryClient.setQueryData(queryKey, context.previousPosts);

      error.stack && console.log(error.stack);
      toast({
        title: 'Error',
        description: error.message
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    }
  });

  return { votePost: mutate };
}