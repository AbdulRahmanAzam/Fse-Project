import { Comment } from "@/lib/api.d";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { cn, formatTime } from "@/lib/utils";
import { Button } from "../ui/button";
import { MessageCircle, MoreVertical, ArrowDown, ArrowUp, Check, X, ChevronDown, ChevronUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Textarea } from "../ui/textarea";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useToast } from "../ui/use-toast";
import { useVoteComment } from "@/lib/hooks/use-vote-comment";
import { useAuthStore } from "@/lib/stores/use-auth-store";
import { useReplyStore } from "@/lib/stores/use-reply-store";
import CommentDeleteWarning from "./comment-delete-warning";

const CommentCard = ({
  comment,
  postId,
  queryKey,
  showReplyButton = true
}: {
  comment: Comment;
  postId: string;
  queryKey: any[];
  showReplyButton?: boolean;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [replyContent, setReplyContent] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { voteComment } = useVoteComment(queryKey);
  const user = useAuthStore((state) => state.user);
  const { replyingTo, setReplyingTo } = useReplyStore();

  const isReplying = replyingTo === comment.id;

  const { mutate: deleteComment } = useMutation({
    mutationFn: (commentId: number) => api.delete(`/comment/${commentId}`),
    onMutate: async (commentId: number) => {
      await queryClient.cancelQueries({ queryKey });
      const previousComments = queryClient.getQueryData<any>(queryKey);

      const updateCommentTree = (comments: Comment[]): Comment[] => {
        return comments.filter(comment => {
          if (comment.id === commentId) return false;
          if (comment.children && comment.children.length > 0) {
            comment.children = updateCommentTree(comment.children);
          }
          return true;
        });
      };

      queryClient.setQueryData<Comment[]>(queryKey, (old: any) => ({
        ...old,
        data: {
          comments: updateCommentTree(old.data.comments)
        }
      }));

      return { previousComments };
    },
    onSuccess: (_) => {
      toast({
        title: 'Success',
        description: 'Comment deleted successfully',
      });
    },
    onError: (error: any, _commentId, context) => {
      if (context?.previousComments)
        queryClient.setQueryData<Comment[]>(queryKey, context?.previousComments);

      toast({
        title: error.message || 'Error',
        description: error.info || 'Failed to delete comment',
        variant: 'destructive'
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    }
  });

  const { mutate: editComment } = useMutation({
    mutationFn: (data: { id: number; content: string }) => api.patch(`/comment/${data.id}`, { content: data.content }),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey });
      const previousComments = queryClient.getQueryData<any>(queryKey);

      const updateCommentTree = (comments: Comment[]): Comment[] => {
        return comments.map(comment => {
          if (comment.id === data.id) {
            return { ...comment, content: data.content, updatedAt: new Date().toISOString() };
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

      queryClient.setQueryData<Comment[]>(queryKey, (old: any) => ({
        ...old,
        data: {
          comments: updateCommentTree(old.data.comments)
        }
      }));

      return { previousComments };
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Comment updated successfully',
      });
    },
    onError: (error: any, _data, context) => {
      if (context?.previousComments)
        queryClient.setQueryData<Comment[]>(queryKey, context?.previousComments);

      toast({
        title: error.message || 'Error',
        description: error.info || 'Failed to edit comment',
        variant: 'destructive'
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    }
  });

  const { mutate: createReply } = useMutation({
    mutationFn: (content: string) => api.post(`/comment/${postId}`, { content, parentId: comment.id }),
    onMutate: async (content: string) => {
      await queryClient.cancelQueries({ queryKey });

      const previousComments = queryClient.getQueryData<any>(queryKey);

      const updateCommentTree = (comments: Comment[]): Comment[] => {
        return comments.map(c => {
          if (c.id === comment.id) {
            return {
              ...c,
              children: [
                {
                  id: Date.now(),
                  content,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  upvotes: 0,
                  downvotes: 0,
                  userVote: undefined,
                  user: user || {
                    id: 0,
                    username: 'Anonymous',
                    displayName: 'Anonymous',
                    email: '',
                    role: 'member',
                    isAdmin: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    avatar: undefined
                  },
                  postId: parseInt(postId),
                  parentId: comment.id,
                  children: [],
                  post: {
                    id: parseInt(postId),
                    title: '',
                    content: '',
                    user: user || {
                      id: 0,
                      username: 'Anonymous',
                      displayName: 'Anonymous',
                      email: '',
                      role: 'member',
                      isAdmin: false,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                      avatar: undefined
                    },
                    community: {
                      id: 0,
                      name: '',
                      tags: ''
                    },
                    fileCount: 0,
                    isPinned: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    upvotes: 0,
                    downvotes: 0
                  }
                },
                ...(c.children || [])
              ]
            };
          }
          if (c.children && c.children.length > 0) {
            return {
              ...c,
              children: updateCommentTree(c.children)
            };
          }
          return c;
        });
      };

      queryClient.setQueryData<Comment[]>(queryKey, (old: any) => ({
        ...old,
        data: {
          comments: updateCommentTree(old.data.comments)
        }
      }));

      return { previousComments };
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Reply posted successfully',
      });
      setReplyContent('');
      setReplyingTo(null);
    },
    onError: (error: any, _variables, context) => {
      if (context?.previousComments)
        queryClient.setQueryData<Comment[]>(queryKey, context.previousComments);

      toast({
        title: error.message || 'Error',
        description: error.info || 'Failed to post reply',
        variant: 'destructive'
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    }
  });

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    editComment({ id: comment.id, content: editContent });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  const handleVote = (commentId: number, voteType: 'up' | 'down') => {
    voteComment({ commentId, voteType });
  };

  const handleReply = () => {
    if (replyContent.trim()) {
      createReply(replyContent);
      setIsCollapsed(false);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex gap-4 p-4 hover:bg-muted/50 rounded-lg transition-colors">
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={comment.user.avatar} alt={comment.user.username} />
          <AvatarFallback>{comment.user.username?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm">{comment.user.displayName}</p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1">
                      <p className="text-xs text-muted-foreground">
                        {formatTime(new Date(comment.createdAt))}
                      </p>
                      {Math.abs(new Date(comment.updatedAt).getTime() - new Date(comment.createdAt).getTime()) > 5000 && (
                        <span className="text-xs text-muted-foreground">(edited)</span>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">
                      Date created: {new Date(comment.createdAt).toLocaleString()}
                      {comment.updatedAt !== comment.createdAt && (
                        <span className="block text-xs text-muted-foreground">
                          Last edited: {new Date(comment.updatedAt).toLocaleString()}
                        </span>
                      )}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEditClick}>Edit</DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive cursor-pointer"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveEdit}>
                  <Check className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-foreground mb-2">{comment.content}</p>
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  className="flex px-1 hover:bg-accent/50"
                >
                  <div
                    className={cn("text-sm p-1 mx-1 hover:bg-accent rounded-full", comment.userVote === 'up' && 'text-green-500')}
                    onClick={() => handleVote(comment.id, 'up')}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </div>
                  <span className="text-sm">{comment.upvotes - comment.downvotes}</span>
                  <div
                    className={cn("text-sm p-1 mx-1 hover:bg-accent rounded-full", comment.userVote === 'down' && 'text-red-500')}
                    onClick={() => handleVote(comment.id, 'down')}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </div>
                </Button>
                {showReplyButton && <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={() => setReplyingTo(comment.id)}>
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-xs">Reply</span>
                </Button>}
              </div>
            </>
          )}
        </div>
      </div>
      {isReplying && (
        <div className="ml-8 mt-2 pl-4">
          <Textarea
            placeholder="Write a reply..."
            className="min-h-[80px] text-sm"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
          />
          <div className="flex gap-2 mt-2">
            <Button size="sm" onClick={handleReply}>
              <Check className="h-4 w-4 mr-1" />
              Reply
            </Button>
            <Button size="sm" variant="outline" onClick={() => {
              setReplyContent('');
              setReplyingTo(null);
            }}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      )}
      {comment.children && comment.children.length > 0 && (
        <div className="ml-8 mt-1 pl-4 space-y-2 relative">
          {!isCollapsed && <div className="absolute left-0 top-0 bottom-0 w-px bg-border" />}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 gap-1 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <>
                <ChevronDown className="h-3 w-3" />
                Show {comment.children.length} {comment.children.length === 1 ? 'reply' : 'replies'}
              </>
            ) : (
              <>
                <ChevronUp className="h-3 w-3" />
                Hide replies
              </>
            )}
          </Button>
          {!isCollapsed && comment.children.map((child) => (
            <CommentCard
              key={child.id}
              comment={child}
              postId={postId}
              queryKey={queryKey}
              showReplyButton={false}
            />
          ))}
        </div>
      )}
      
      <CommentDeleteWarning 
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={() => deleteComment(comment.id)}
      />
    </div>
  );
};

export default CommentCard;
