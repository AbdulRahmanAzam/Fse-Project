import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import api from '@/lib/api';
import { useForm } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';
import { Post } from '@/lib/api.d';
import { useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/use-auth-store';

type FormData = {
  title: string;
  content: string;
  image?: string;
};

const usePostQuery = (postId: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => api.get(`/post/${postId}`)
  });
  return { data: data?.data?.post as Post, isLoading, error };
};

const EditPostPage = () => {
  const { user } = useAuthStore();
  const { id, postId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: post, isLoading, error } = usePostQuery(postId!);
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>();

  useEffect(() => {
    if (post) {
      if (!user?.isAdmin && user?.id !== post.user.id) {
        navigate(`/community/${id}`);
        toast({
          title: 'Error',
          description: 'You do not have permission to edit this post',
          variant: 'destructive'
        });
      } else {
        reset({
          title: post.title,
          content: post.content,
          image: post.image
        });
      }
    }
  }, [post, user, navigate, id, reset]);

  const { mutate: updatePost, isPending } = useMutation({
    mutationFn: (data: FormData) => api.patch(`/post/${postId}`, data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Post updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['posts', id] });
      navigate(`/community/${id}`);
    },
    onError: (error: any) => {
      toast({
        title: error.message || 'Error',
        description: error.info || 'Failed to update post',
        variant: 'destructive'
      });
    }
  });

  const onSubmit = (data: FormData) => {
    updatePost(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container max-w-2xl mx-auto px-4">
          <div className="space-y-4">
            <div className="h-8 w-48 bg-muted rounded animate-pulse" />
            <div className="h-96 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container max-w-2xl mx-auto px-4">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="text-center text-red-500">Error loading post</div>
            <Button variant="outline" onClick={() => navigate(`/community/${id}`)}>Back to Community</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-2xl mx-auto px-4">
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={() => navigate(`/community/${id}`)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {post?.community.name}
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Edit Post</CardTitle>
            <CardDescription>
              Update your post in the {post?.community.name} community.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Post Title</Label>
                <Input
                  id="title"
                  {...register("title", {
                    required: "Title is required",
                    minLength: {
                      value: 3,
                      message: "Title must be at least 3 characters"
                    },
                    maxLength: {
                      value: 100,
                      message: "Title must be less than 100 characters"
                    }
                  })}
                  placeholder="Enter post title"
                />
                {errors.title && <p className="text-xs text-red-500 dark:text-red-400">{errors.title.message}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  {...register("content", {
                    required: "Content is required",
                    minLength: {
                      value: 10,
                      message: "Content must be at least 10 characters"
                    },
                    maxLength: {
                      value: 10000,
                      message: "Content must be less than 10000 characters"
                    }
                  })}
                  placeholder="Write your post content here..."
                  className="min-h-[200px]"
                />
                {errors.content && <p className="text-xs text-red-500 dark:text-red-400">{errors.content.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Image URL (optional)</Label>
                <Input
                  id="image"
                  {...register("image", {
                    pattern: {
                      value: /^https?:\/\/.+$/,
                      message: "Must be a valid URL"
                    }
                  })}
                  placeholder="https://example.com/image.jpg"
                />
                {errors.image && <p className="text-xs text-red-500 dark:text-red-400">{errors.image.message}</p>}
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/community/${id}`)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Updating...' : 'Update Post'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default EditPostPage; 