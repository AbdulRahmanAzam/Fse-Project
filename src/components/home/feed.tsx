import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";

import { Post } from "@/lib/api.d";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PostOverview from "@/components/posts/post-overview";
import { ScrollArea } from "@/components/ui/scroll-area";


const usePostsQuery = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['posts'],
    queryFn: () => api.get('/post/relevant')
  })
  return { data: (data?.data?.posts || []) as Post[], isLoading, error, refetch }
}

const FeedComponent = () => {
  const { data: posts, isLoading, error, refetch } = usePostsQuery();
  const navigate = useNavigate();

  return (
    <ScrollArea className="h-[calc(100vh-4rem)]">
      <div className="space-y-6 p-4 mb-6">
        {error ? (
          <div className='flex flex-col gap-4 items-center justify-center'>
            <p className='text-red-500'>Error loading posts</p>
            <Button variant="outline" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : isLoading ? (
          <div className='flex flex-col gap-4'>
            {[...Array(5)].map((_, index) => (
              <div key={index} className="rounded-lg border bg-card p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length > 0 ? (
          posts.map((post, index) => (
            <div 
              key={index}
              className="cursor-pointer transition-colors hover:bg-accent/50 rounded-lg"
              onClick={() => navigate(`/community/${post.community.id}/post/${post.id}`)}
            >
              <PostOverview
                post={post}
                queryKey={['posts']}
              />
            </div>
          ))
        ) : (
          <div className='flex flex-col gap-4 items-center justify-center'>
            <p className='text-gray-500'>Nothing here yet...</p>
            <p className='text-gray-500'>Join a community to see posts!</p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default FeedComponent;
