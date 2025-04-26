import { useQuery } from "@tanstack/react-query";

import api from "@/lib/api";

import { Post } from "@/lib/api.d";
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
  const { data: posts, isLoading, error, refetch } = usePostsQuery();

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
        posts.map((post, index) =>
          <PostOverview
            key={index}
            post={post}
            queryKey={['posts']}
          />
        )
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
