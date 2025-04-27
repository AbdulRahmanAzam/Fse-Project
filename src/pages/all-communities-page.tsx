import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Community } from '@/lib/api.d'
import { Search, Plus } from 'lucide-react'
import CommunityOverview from '@/components/community/community-overview';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/lib/stores/use-auth-store'
import { useState, useEffect } from 'react';

const usePostsQuery = (searchQuery: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['communities', searchQuery],
    queryFn: () => 
      searchQuery 
        ? api.get(`/community/name/${encodeURIComponent(searchQuery)}`)
        : api.get('/community')
  })
  return { data: (data?.data?.communities || []) as Community[], isLoading, error, refetch }
}

const CommunitiesPage = () => {
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchParams.get('q')) {
        setSearchParams(searchInput ? { q: searchInput } : {});
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, searchParams, setSearchParams]);

  const { data: communities, isLoading, error, refetch } = usePostsQuery(searchParams.get('q') || '');

  const { mutate: joinLeaveCommunity } = useMutation({
    mutationFn: ({ communityId, join }: { communityId: number, join: boolean }) => api.post(`/community/${join ? 'join' : 'leave'}/${communityId}`),
    onMutate: async ({ communityId, join }) => {
      await queryClient.cancelQueries({ queryKey: ['communities', searchParams.get('q') || ''] });

      const previousCommunities = queryClient.getQueryData(['communities', searchParams.get('q') || '']);

      queryClient.setQueryData(['communities', searchParams.get('q') || ''], (old: any) => {
        const updatedCommunities = old?.data?.communities?.map((community: Community) =>
          community.id === communityId ? {
            ...community,
            isMember: join,
            memberCount: community.memberCount + (join ? 1 : -1)
          } : community
        ) || [];
        return { data: { communities: updatedCommunities } };
      });

      return { previousCommunities };
    },
    onSuccess: (_data, variables, _context) => {
      toast({
        title: 'Success',
        description: variables.join ? 'Community joined successfully' : 'Community left successfully',
      });
    },
    onError: (error: any, _variables, context) => {
      if (context?.previousCommunities)
        queryClient.setQueryData(['communities', searchParams.get('q') || ''], context.previousCommunities);

      toast({
        title: error.message || 'Error',
        description: error.info || 'Failed to join/leave community',
        variant: 'destructive'
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['communities', searchParams.get('q') || ''] });
    }
  });

  const handleJoinLeave = (communityId: number, join: boolean) => {
    joinLeaveCommunity({ communityId, join })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10 dark:bg-gray-950">
        <div className="container max-w-6xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-xl md:text-2xl font-bold">Communities</h1>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search communities..."
                  className="pl-10"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </div>
              {user?.role === 'admin' && (
                <Button onClick={() => navigate('/community/create')} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Community
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {error ? (
            <div className="flex flex-col gap-4 items-center justify-center w-screen">
              <div className="text-center text-2xl text-red-500">Error loading communities</div>
              <Button variant="outline" onClick={() => refetch()}>Retry</Button>
            </div>
          ) : isLoading ? (
            Array(9).fill(0).map((_, i) => (
              <div key={i} className="rounded-lg overflow-hidden border">
                <Skeleton className="w-full h-32" />
                <div className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            ))
          ) : communities.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">No communities found{searchInput ? ` for "${searchInput}"` : ''}</p>
            </div>
          ) : (
            communities.map((community) =>
              <CommunityOverview
                key={community.id}
                community={community}
                onJoinLeave={() => handleJoinLeave(community.id, !community.isMember)}
              />
            )
          )}
        </div>
      </div>
    </div>
  )
}

export default CommunitiesPage