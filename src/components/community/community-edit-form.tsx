import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Community } from '@/lib/api.d';
import api from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

type FormData = {
  name: string;
  description: string;
  image?: string;
};

interface CommunityEditFormProps {
  community: Community;
  onClose: () => void;
}

const CommunityEditForm = ({ community, onClose }: CommunityEditFormProps) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: community.name,
      description: community.description,
      image: community.image || '',
    }
  });

  const { mutate: updateCommunity, isPending } = useMutation({
    mutationFn: (data: FormData) => api.put(`/community/${community.id}`, data),
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['community', community.id] });

      const previousCommunity = queryClient.getQueryData(['community', community.id]);

      queryClient.setQueryData(['community', community.id], (old: any) => ({
        data: {
          community: {
            ...old.data.community,
            ...newData
          }
        }
      }));

      return { previousCommunity };
    },
    onError: (error: any, _newData, context) => {
      if (context?.previousCommunity) {
        queryClient.setQueryData(['community', community.id], context.previousCommunity);
      }
      toast({
        title: 'Error',
        description: error.message || 'Failed to update community',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Community updated successfully',
      });
      onClose();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['community', community.id] });
    },
  });

  const onSubmit = (data: FormData) => {
    updateCommunity(data);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit Community</DialogTitle>
        <DialogDescription>
          Update your community details
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">Name</label>
          <Input
            id="name"
            {...register('name', {
              required: 'Name is required',
              minLength: {
                value: 3,
                message: 'Name must be at least 3 characters',
              },
            })}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">Description</label>
          <Textarea
            id="description"
            {...register('description', {
              required: 'Description is required',
              minLength: {
                value: 10,
                message: 'Description must be at least 10 characters',
              },
            })}
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="image" className="text-sm font-medium">Image URL (optional)</label>
          <Input
            id="image"
            type="url"
            {...register('image')}
            placeholder="https://example.com/image.jpg"
          />
          {errors.image && (
            <p className="text-sm text-red-500">{errors.image.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </>
  );
};

export default CommunityEditForm; 