import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Upload, X, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Community } from '@/lib/api.d';
import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/lib/stores/use-auth-store';
import { useToast } from '@/components/ui/use-toast';

type PostFormData = {
  title: string;
  content: string;
  files?: FileList;
};

const useCommunityQuery = (id: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['community', id],
    queryFn: () => api.get(`/community/id/${id}`)
  });
  return { data: data?.data?.community as Community, isLoading, error };
};

const CreatePostPage = () => {
  const { user } = useAuthStore();
  const { id } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: community, isLoading, error } = useCommunityQuery(id!);
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<PostFormData>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  useEffect(() => {
    if (!community) {
      navigate(`/community/${id}`);
      toast({
        title: 'Error',
        description: 'Community not found',
        variant: 'destructive'
      });
    } else {
      if (!user?.isAdmin && !community.members?.some((member) => member.id === user?.id)) {
        navigate(`/community/${id}`);
        toast({
          title: 'Error',
          description: 'You are not a member of this community',
          variant: 'destructive'
        });
      }
    }
  }, [community, navigate, user?.id, id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;

    const files = Array.from(fileList);
    if (selectedFiles.length + files.length > 5) {
      toast({
        title: 'Error',
        description: 'You can only upload up to 5 files',
        variant: 'destructive'
      });
      return;
    }
    
    const invalidFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      toast({
        title: 'Error',
        description: 'Each file must be less than 5MB',
        variant: 'destructive'
      });
      return;
    }

    setSelectedFiles(prev => [...prev, ...files]);
    
    const dt = new DataTransfer();
    [...selectedFiles, ...files].forEach(file => dt.items.add(file));
    setValue('files', dt.files);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      
      const dt = new DataTransfer();
      newFiles.forEach(file => dt.items.add(file));
      setValue('files', dt.files);
      
      return newFiles;
    });
  };

  const { mutate: createPost, isPending } = useMutation({
    mutationFn: async (data: PostFormData) => {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('content', data.content ?? '');
      const currentFiles = watch('files');
      if (currentFiles) {
        Array.from(currentFiles).forEach(file => {
          formData.append('files', file);
        });
      }
      formData.append('communityId', id!);
      
      return api.post('/post', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Post created successfully' + (user?.role !== 'admin' && selectedFiles.length > 0 ? ' and is now pending approval' : ''),
      });
      queryClient.invalidateQueries({ queryKey: ['posts', id] });
      navigate(`/community/${id}`);
    },
    onError: (error: any) => {
      error.stack && console.error(error.stack);
      toast({
        title: error.message || 'Error',
        description: error.info || 'Failed to create post',
        variant: 'destructive'
      });
    }
  });

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
            <div className="text-center text-red-500">Error loading community</div>
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
            Back to {community?.name}
          </Button>
        </div>
        <Card className='dark:bg-gray-950'>
          <CardHeader>
            <CardTitle>Create a New Post</CardTitle>
            <CardDescription>
              Share your thoughts with the {community?.name} community.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(data => createPost(data))} className="space-y-4">
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
                <Label>Attach Files (optional)</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                    {...register('files')}
                    onChange={handleFileChange}
                    ref={fileInputRef}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                    disabled={selectedFiles.length >= 5}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Files ({selectedFiles.length}/5)
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG, GIF (max 5MB per file)
                </p>
                
                {selectedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-muted rounded-md"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
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
                {isPending ? 'Creating...' : 'Create Post'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CreatePostPage; 