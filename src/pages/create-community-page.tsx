import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import api from '@/lib/api';
import { useForm } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';

type FormData = {
  name: string;
  description: string;
  tags: string;
  image?: string;
};

const CreateCommunityPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const { mutate: createCommunity, isPending } = useMutation({
    mutationFn: (data: FormData) => api.post('/community', { ...data, tags: data.tags.split(',') }),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Community created successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      navigate('/communities');
    },
    onError: (error: any) => {
      toast({
        title: error.message || 'Error',
        description: error.info || 'Failed to create community',
        variant: 'destructive'
      });
    }
  });

  const onSubmit = (data: FormData) => {
    createCommunity(data);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-2xl mx-auto px-4">
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/communities')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Communities
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Create a New Community</CardTitle>
            <CardDescription>
              Start a new community and bring people together around shared interests.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Community Name</Label>
                <Input
                  id="name"
                  {...register("name", {
                    required: "Name is required",
                    minLength: {
                      value: 3,
                      message: "Name must be at least 3 characters"
                    },
                    maxLength: {
                      value: 50,
                      message: "Name must be less than 50 characters"
                    }
                  })}
                  placeholder="Enter community name"
                />
                {errors.name && <p className="text-xs text-red-500 dark:text-red-400">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register("description", {
                    required: "Description is required",
                    minLength: {
                      value: 10,
                      message: "Description must be at least 10 characters"
                    },
                    maxLength: {
                      value: 500,
                      message: "Description must be less than 500 characters"
                    }
                  })}
                  placeholder="Describe your community"
                  className="min-h-[100px]"
                />
                {errors.description && <p className="text-xs text-red-500 dark:text-red-400">{errors.description.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  {...register("tags")}
                  placeholder="e.g. gaming, technology, art"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/communities')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Creating...' : 'Create Community'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CreateCommunityPage; 