import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api";
import { useToast } from "@/components/ui/use-toast";
import { Comment } from "../api.d";


export const useVoteComment = (queryKey: any[]) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutate } = useMutation({
    mutationFn: ({ commentId, voteType }: { commentId: number, voteType: 'up' | 'down' }) => {
      return api.post(`/comment/${voteType === 'up' ? 'upvote' : 'downvote'}/${commentId}`);
    },
    onMutate: async ({ commentId, voteType }) => {
      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData(queryKey);

      const updateCommentTree = (comments: Comment[]): Comment[] => {
        return comments.map(comment => {
          if (comment.id === commentId) {
            const isSameVote = comment.userVote === voteType;
            const isSwitchingVote = comment.userVote && comment.userVote !== voteType;

            return {
              ...comment,
              upvotes: comment.upvotes +
                (voteType === 'up' ? (isSameVote ? -1 : (isSwitchingVote ? 1 : 1)) : (isSwitchingVote ? -1 : 0)),
              downvotes: comment.downvotes +
                (voteType === 'down' ? (isSameVote ? -1 : (isSwitchingVote ? 1 : 1)) : (isSwitchingVote ? -1 : 0)),
              userVote: isSameVote ? undefined : voteType,
            };
          }
          if (comment.children && comment.children.length > 0) {
            return {
              ...comment,
              children: updateCommentTree(comment.children)
            };
          }
          return comment;
        });
      };

      queryClient.setQueryData(queryKey, (old: any) => {
        // Handle single comment update
        if (old?.data?.comment) {
          const comment = old.data.comment;
          if (comment.id === commentId) {
            const isSameVote = comment.userVote === voteType;
            const isSwitchingVote = comment.userVote && comment.userVote !== voteType;

            return {
              data: {
                comment: {
                  ...comment,
                  upvotes: comment.upvotes +
                    (voteType === 'up' ? (isSameVote ? -1 : (isSwitchingVote ? 1 : 1)) : (isSwitchingVote ? -1 : 0)),
                  downvotes: comment.downvotes +
                    (voteType === 'down' ? (isSameVote ? -1 : (isSwitchingVote ? 1 : 1)) : (isSwitchingVote ? -1 : 0)),
                  userVote: isSameVote ? undefined : voteType,
                }
              }
            };
          }
        }
        // Handle comments list update
        else if (old?.data?.comments) {
          return { data: { comments: updateCommentTree(old.data.comments) } };
        }
        return old;
      });

      return { previousData };
    },
    onError: (error, _variables, context) => {
      if (context?.previousData)
        queryClient.setQueryData(queryKey, context.previousData);

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

  return { voteComment: mutate };
}