import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Post } from "@/lib/api.d";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MessageCircle, MoreVertical, Pencil, Trash2, FileText, Download } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import VoteButtons from "@/components/posts/vote-buttons";
import { useVotePost } from "@/lib/hooks/use-vote-post";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import PostDeleteWarning from "@/components/posts/post-delete-warning";
import { useState } from "react";
import { useAuthStore } from "@/lib/stores/use-auth-store";
import CommentCard from "@/components/comments/comment-card";
import { Comment } from "@/lib/api.d";
import { cleanFilePath, formatTime } from "@/lib/utils";
import { useForm } from "react-hook-form";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";


type CommentFormData = {
  content: string;
}

const usePostQuery = (postId: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => api.get(`/post/${postId}`),
  });
  return { data: data?.data.post as (Post | undefined), isLoading, error, refetch };
}

const useCommentsQuery = (postId: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => api.get(`/comment/post/${postId}`),
  });
  return { data: data?.data.comments as Comment[], isLoading, error, refetch };
}

const useCreateCommentMutation = (postId: string, reset: () => void) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { mutate: createComment } = useMutation({
    mutationFn: (comment: CommentFormData) => api.post(`/comment/${postId}`, comment),
    onMutate: async (newComment: CommentFormData) => {
      if (!user) return;

      await queryClient.cancelQueries({ queryKey: ["comments", postId] });

      const previousComments = queryClient.getQueryData<any>(["comments", postId]);

      queryClient.setQueryData(["comments", postId], (old: any) => {
        const optimisticComment: Comment = {
          id: Date.now(),
          content: newComment.content,
          post: {
            id: parseInt(postId),
            title: '',
            content: '',
            user: user,
            community: { id: parseInt(postId), name: '', tags: '' },
            fileCount: 0,
            isPinned: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            upvotes: 0,
            downvotes: 0,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          upvotes: 0,
          downvotes: 0,
          userVote: undefined,
          user,
          postId: parseInt(postId),
          parentId: null,
          children: []
        };

        return {
          data: {
            comments: [optimisticComment, ...(old?.data?.comments || [])]
          }
        };
      });

      return { previousComments };
    },
    onSuccess: (_) => {
      toast({
        title: 'Success',
        description: 'Comment created successfully',
      });
      reset();
    },
    onError: (error: any, _variables, context) => {
      if (context?.previousComments)
        queryClient.setQueryData(["comments", postId], context.previousComments);

      toast({
        title: error.message || 'Error',
        description: error.info || 'Failed to create comment',
        variant: 'destructive'
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    }
  });
  return { createComment };
}

const useDeletePostMutation = (postId: string, communityId: number) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const { mutate: deletePost } = useMutation({
    mutationFn: () => api.delete(`/post/${postId}`),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Post deleted successfully',
      });
      navigate(`/community/${communityId}`);
    },
    onError: (error: any) => {
      error.stack && console.error(error.stack);
      toast({
        title: error.message || 'Error',
        description: error.info || 'Failed to delete post',
        variant: 'destructive'
      });
    }
  });

  return { deletePost };
}


const PostPage = () => {
  const { postId } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { data: post, isLoading: postLoading, error: postError, refetch: postRefetch } = usePostQuery(postId!);
  const { data: comments, isLoading: commentsLoading, error: commentsError } = useCommentsQuery(postId!);
  const { votePost } = useVotePost(['post', postId]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { register, handleSubmit, reset } = useForm<CommentFormData>();
  const { createComment } = useCreateCommentMutation(postId!, reset);
  const { deletePost } = useDeletePostMutation(postId!, post?.community.id!);

  const handleVote = (postId: number, voteType: 'up' | 'down') => {
    votePost({ postId, voteType });
  };

  const handleEdit = () => {
    navigate(`/community/${post?.community.id}/edit-post/${postId}`);
  };

  if (postLoading || commentsLoading) {
    return (
      <div className="min-h-screen bg-background py-4 sm:py-8">
        <div className="container max-w-4xl mx-auto px-2 sm:px-4">
          {/* Back Button Skeleton */}
          <div className="mb-4">
            <Skeleton className="h-9 w-32" />
          </div>

          {/* Post Card Skeleton */}
          <div className="rounded-lg border bg-card shadow-lg mb-6">
            <div className="p-4 sm:p-6">
              {/* Post Header Skeleton */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>

              {/* Post Title Skeleton */}
              <Skeleton className="h-8 w-3/4 mb-3 sm:mb-4" />

              {/* Post Image Skeleton */}
              <Skeleton className="h-48 sm:h-64 w-full rounded-lg mb-3 sm:mb-4" />

              {/* Post Content Skeleton */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>

            {/* Post Footer Skeleton */}
            <div className="border-t p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          </div>

          {/* Comment Form Skeleton */}
          <div className="rounded-lg border bg-card p-4 mb-6">
            <div className="flex gap-3 sm:gap-4">
              <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
          </div>

          {/* Comments Skeleton */}
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="rounded-lg border bg-card p-4">
                <div className="flex gap-3 sm:gap-4">
                  <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex items-center gap-4 mt-2">
                      <Skeleton className="h-6 w-6" />
                      <Skeleton className="h-6 w-6" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (postError || commentsError) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="text-center text-red-500">Error loading post</div>
            <Button variant="outline" onClick={() => postRefetch()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background py-4 sm:py-8">
        <div className="container max-w-4xl mx-auto px-2 sm:px-4">
          <div className="mb-4">
            <Button
              variant="ghost"
              className="gap-2 text-sm sm:text-base"
              onClick={() => navigate(`/community/${post?.community.id}`)}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Community
            </Button>
          </div>

          <Card className="mb-6 dark:bg-gray-950">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10 cursor-pointer"
                    onClick={() => navigate(`/profile/${post?.user.id}`)}
                  >
                    <AvatarImage src={post?.user.avatar} alt={post?.user.username} />
                    <AvatarFallback>
                      {post?.user.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm sm:text-base cursor-pointer transition-colors hover:text-primary"
                      onClick={() => navigate(`/profile/${post?.user.id}`)}
                    >
                      {post?.user.displayName || post?.user.username}
                    </p>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1">
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {formatTime(new Date(post?.createdAt || ''))}
                            </p>
                            {Math.abs(new Date(post?.createdAt || '').getTime() - new Date(post?.updatedAt || '').getTime()) > 5000 && (
                              <span className="text-xs sm:text-sm text-muted-foreground">(edited)</span>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">
                            Date Created: {new Date(post?.createdAt || '').toLocaleString()}
                            {Math.abs(new Date(post?.createdAt || '').getTime() - new Date(post?.updatedAt || '').getTime()) > 5000 && (
                              <span className="block text-xs text-muted-foreground">
                                Last edited: {new Date(post?.updatedAt || '').toLocaleString()}
                              </span>
                            )}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 sm:h-8 sm:w-8"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      className="flex items-center gap-2"
                      onClick={handleEdit}
                    >
                      <Pencil className="h-4 w-4" />
                      Edit Post
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="flex items-center gap-2 text-destructive"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Post
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">{post?.title}</h1>
              
              {post?.image && (
                <div className="mb-3 sm:mb-4 rounded-lg overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}

              <MarkdownRenderer content={post?.content || ''} className="text-sm sm:text-base" />

              {post?.files && post.files.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h3 className="text-sm font-medium">Attached Files</h3>
                  <div className="space-y-2">
                    {post.files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-muted rounded-md hover:bg-muted/80 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm truncate">{cleanFilePath(file.path, true)}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 flex-shrink-0"
                          onClick={() => window.open(`${import.meta.env.VITE_API_URL}/post/file/${cleanFilePath(file.path)}`, '_blank')}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 border-t">
              {post && <VoteButtons post={post} handleVote={handleVote} />}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MessageCircle className="h-4 w-4" />
                      <span className="text-sm">{comments?.length || 0}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">{comments?.length || 0} {comments?.length === 1 ? 'comment' : 'comments'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardFooter>
          </Card>

          <div className="space-y-3 sm:space-y-4">
            <form onSubmit={handleSubmit(data => createComment(data))} className="flex gap-3 sm:gap-4">
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                <AvatarImage src={user?.avatar} alt="User" />
                <AvatarFallback>{user?.username?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <Textarea
                  placeholder="Write a comment..."
                  className="min-h-[80px] sm:min-h-[100px] text-sm sm:text-base"
                  {...register('content')}
                />
                <Button className="mt-2 text-sm sm:text-base">Comment</Button>
              </div>
            </form>

            <div className="space-y-3 sm:space-y-4">
              {comments?.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {comments.map((comment: Comment) => (
                    <CommentCard
                      key={comment.id}
                      comment={comment}
                      postId={postId!}
                      queryKey={['comments', postId]}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground text-sm sm:text-base">No comments yet</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <PostDeleteWarning
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onDelete={() => deletePost()}
      />
    </>
  );
};

export default PostPage;
