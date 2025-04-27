import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cleanFilePath, formatTime } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle2, FileIcon, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { usePendingPostsQuery } from "@/lib/hooks/use-pending-posts";

const useApproveRejectPostMutation = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutate: approveRejectPost, isPending } = useMutation({
    mutationFn: ({ postId, status }: { postId: number, status: 'approve' | 'reject' }) => {
      return api.patch(`post/${status}/${postId}`);
    },
    onSuccess: (_data, { status }: { postId: number, status: 'approve' | 'reject' }) => {
      toast({
        title: status === 'approve' ? 'Post approved' : 'Post rejected',
        description: status === 'approve' ? 'The post has been approved.' : 'The post has been rejected.',
      });
    },
    onError: (error: any) => {
      error.stack && console.error(error.stack);
      toast({
        title: 'Error approving post',
        description: error.message,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-posts'] });
    }
  });

  return { approveRejectPost, isPending };
};

const PendingPostSkeleton = () => (
  <Card className="animate-pulse">
    <CardHeader>
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-4 w-64 mt-2" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-4 w-full mt-2" />
      <Skeleton className="h-4 w-3/4 mt-2" />
      <Skeleton className="h-4 w-1/2 mt-2" />
      <Skeleton className="h-48 w-full mt-4" />
      <div className="mt-4 space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    </CardContent>
    <CardFooter className="flex justify-end gap-2">
      <Skeleton className="h-9 w-20" />
      <Skeleton className="h-9 w-20" />
    </CardFooter>
  </Card>
);

export default function PendingPostsPage() {
  const { posts, count, isLoading, error } = usePendingPostsQuery(true);
  const { approveRejectPost, isPending } = useApproveRejectPostMutation();

  if (error) {
    return (
      <div className="container py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load pending posts. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <PendingPostSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!posts?.length) {
    return (
      <div className="container py-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No Pending Posts</h2>
          <p className="text-muted-foreground">
            All posts have been reviewed. Check back later for new submissions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pending Posts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review and moderate posts before they appear in communities
          </p>
        </div>
        <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-lg">
          <XCircle className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{count} posts pending</span>
        </div>
      </div>

      <div className="grid gap-4">
        {posts.map((post) => (
          <Card key={post.id} className="group hover:border-border/80 transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">{post.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <span>Posted by {post.user.displayName || post.user.username}</span>
                    <span>•</span>
                    <span>in {post.community.name}</span>
                    <span>•</span>
                    <span>{formatTime(new Date(post.createdAt))}</span>
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => approveRejectPost({ postId: post.id, status: 'reject' })}
                    disabled={isPending}
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => approveRejectPost({ postId: post.id, status: 'approve' })}
                    disabled={isPending}
                  >
                    Approve
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-muted-foreground whitespace-pre-wrap">{post.content}</p>
              </div>
              {post.image && (
                <div className="mt-4 rounded-lg overflow-hidden border">
                  <img 
                    src={post.image} 
                    alt="Post" 
                    className="w-full h-auto object-cover" 
                  />
                </div>
              )}
              {post.files && post.files.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium">Attached Files</h4>
                  <div className="grid gap-2">
                    {post.files.map((file) => (
                      <a
                        key={file.id}
                        href={`${import.meta.env.VITE_API_URL}/post/file/${cleanFilePath(file.path)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2 rounded-md border bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <FileIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm truncate">
                          {cleanFilePath(file.path, true)}
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 