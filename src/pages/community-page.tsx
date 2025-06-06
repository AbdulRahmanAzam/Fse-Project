import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Community, Post, User } from '@/lib/api.d';
import api from '@/lib/api';
import { toast } from '@/components/ui/use-toast';
import { Users, Info, Crown, MoreVertical, Pencil, Trash2, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getCommunityColor } from '@/lib/random-colors';
import { useState } from 'react';
import CommunityLeaveWarning from '@/components/community/community-leave-warning';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import CommunityDeleteWarning from '@/components/community/community-delete-warning';
import CommunityEditForm from '@/components/community/community-edit-form';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAuthStore } from '@/lib/stores/use-auth-store';
import PostOverview from '@/components/posts/post-overview';
import { cn } from '@/lib/utils';

const useCommunityQuery = (id: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['community', id],
    queryFn: () => api.get(`/community/id/${id}`)
  });
  return { data: data?.data?.community as Community, isLoading, error, refetch };
};

const usePostsQuery = (communityId: string) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['posts', communityId],
    queryFn: () => api.get(`/post/community/${communityId}`)
  });
  return { data: (data?.data?.posts || []) as Post[], isLoading, error, refetch };
};

const CommunityPage = () => {
  const { id } = useParams();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { data: community, isLoading, error, refetch } = useCommunityQuery(id!);
  const { data: posts, isLoading: postsLoading, error: postsError, refetch: postsRefetch } = usePostsQuery(id!);
  const [color1, color2] = getCommunityColor(id!);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const navigate = useNavigate();

  const { mutate: joinLeaveCommunity } = useMutation({
    mutationFn: (join: boolean) => api.post(`/community/${join ? 'join' : 'leave'}/${id}`),
    onMutate: async (join) => {
      await queryClient.cancelQueries({ queryKey: ['community', id] });
      const previousCommunity = queryClient.getQueryData(['community', id]);

      queryClient.setQueryData(['community', id], (old: any) => ({
        data: {
          ...old.data,
          community: {
            ...old.data.community,
            isMember: join,
            memberCount: old.data.community.memberCount + (join ? 1 : -1),
            members: join
              ? [...old.data.community.members, user]
              : old.data.community.members.filter((member: User) => member.id !== user?.id)
          }
        }
      }));

      return { previousCommunity };
    },
    onSuccess: (_data, join) => {
      toast({
        title: 'Success',
        description: join ? 'Community joined successfully' : 'Community left successfully',
      });
    },
    onError: (error: any, _join, context) => {
      if (context?.previousCommunity) {
        queryClient.setQueryData(['community', id], context.previousCommunity);
      }
      toast({
        title: error.message || 'Error',
        description: error.info || 'Failed to join/leave community',
        variant: 'destructive'
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['community', id] });
    }
  });

  const { mutate: deleteCommunity } = useMutation({
    mutationFn: () => api.delete(`/community/${id}`),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Community deleted successfully',
      });
      navigate('/communities');
    },
    onError: (error: any) => {
      toast({
        title: error.message || 'Error',
        description: error.info || 'Failed to delete community',
        variant: 'destructive'
      });
    }
  });

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="text-center text-2xl text-red-500">Error loading community</div>
        <Button variant="outline" onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  const CommunityOptions = ({ className }: { className?: string }) => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className={cn("h-8 w-8", className)}>
            <MoreVertical className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit Community
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Community
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Banner Skeleton */}
        <div className="h-32 sm:h-48 relative">
          <Skeleton className="absolute inset-0" />
        </div>

        {/* Main Content */}
        <div className="container max-w-8xl mx-auto px-2 sm:px-4">
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
            {/* Left Content */}
            <div className="flex-1 -mt-8 sm:-mt-16 relative z-10">
              {/* Community Info Card */}
              <div className="rounded-lg border bg-card shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-16 w-16 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full max-w-2xl" />
                    <Skeleton className="h-4 w-3/4 max-w-xl" />
                  </div>
                  <Skeleton className="h-10 w-32" />
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>

              {/* Posts Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-8 w-28" />
                </div>
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="rounded-lg border bg-card p-4 space-y-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-20" />
                      </div>
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="hidden lg:block lg:w-80 lg:-mt-16 relative z-10">
              <div className="rounded-lg border bg-card shadow-lg p-4 sticky top-4">
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="space-y-4">
                  {Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Banner */}
      <div
        className="h-32 sm:h-48 relative"
        style={{
          background: `linear-gradient(to right, ${color1}, ${color2})`
        }}
      >
        <div className="absolute top-4 left-4 z-10">
          <Button
            variant="ghost"
            onClick={() => navigate('/communities')}
            className="gap-2 bg-background/80 hover:bg-background/90"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Communities
          </Button>
        </div>
        {community?.image && (
          <img
            src={community.image}
            alt={community.name}
            className="w-full h-full object-cover absolute inset-0 mix-blend-overlay"
          />
        )}
      </div>

      {/* Main Content Area */}
      <div className="container max-w-8xl mx-auto px-2 sm:px-4">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Left Content (Community Info & Posts) */}
          <div className="flex-1 -mt-8 sm:-mt-16 relative z-10">
            <Card className="shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 dark:bg-gray-950">
              <CardContent className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-0">
                <div>
                  <div className="flex items-center justify-between md:hidden mb-4">
                    <div className='flex items-center justify-between gap-2'>
                      <h1 className="text-xl sm:text-2xl font-bold">{community.name}</h1>
                      {user?.isAdmin && <CommunityOptions className='block md:hidden' />}
                    </div>
                    {/* Mobile Members Button */}
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Users className="h-4 w-4" />
                          <span className="text-sm">{community.memberCount}</span>
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="right" className="w-full sm:w-[400px] p-0">
                        <SheetHeader className="p-4 border-b">
                          <SheetTitle>Members</SheetTitle>
                        </SheetHeader>
                        <ScrollArea className="h-[calc(100vh-4rem)]">
                          <div className="px-4 py-2 space-y-4">
                            {community.members?.sort((a, b) => (a.role === 'admin' ? -1 : 1) - (b.role === 'admin' ? -1 : 1)).map((member, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-3 cursor-pointer"
                                onClick={() => navigate(`/profile/${member.id}`)}
                              >
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={member.avatar} alt={member.username} />
                                  <AvatarFallback>
                                    {member.username?.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium truncate">
                                      {member.displayName || member.username}
                                    </p>
                                    {member.role === 'admin' && (
                                      <Crown className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground truncate">
                                    @{member.username}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </SheetContent>
                    </Sheet>
                  </div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-bold mb-2 hidden md:block">{community.name}</h1>
                    {user?.isAdmin && <CommunityOptions className='hidden md:block' />}
                  </div>
                  <p className="text-muted-foreground text-sm sm:text-base">{community.description}</p>
                </div>
                <Button
                  variant={community.isMember ? "outline" : "default"}
                  onClick={() => community.isMember ? setShowLeaveDialog(true) : joinLeaveCommunity(!community.isMember)}
                  className="w-full md:w-auto"
                >
                  {community.isMember ? "Leave Community" : "Join Community"}
                </Button>
              </CardContent>

              <CardFooter className="flex flex-wrap items-center gap-4 mt-4 sm:mt-6 p-0">
                <div className="hidden items-center gap-2 md:flex">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {community.memberCount.toLocaleString()} members
                  </span>
                </div>
                <TooltipProvider>
                  {community.tags && (
                    <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Tags</p>
                        </TooltipContent>
                      </Tooltip>
                      <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                        {community.tags.split(',').map((tag: string, index: number) => (
                          <Badge key={index} className="text-xs whitespace-nowrap">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </TooltipProvider>
              </CardFooter>
            </Card>

            {/* Posts Section */}
            <div className="space-y-4 mb-10">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-semibold">Posts</h2>
                {(community.isMember || user?.isAdmin) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/community/${id}/create-post`)}
                  >
                    Create Post
                  </Button>
                )}
              </div>

              <ScrollArea className="h-[600px] pr-4">
                {postsLoading ? (
                  <div className="space-y-4">
                    {Array(3).fill(0).map((_, i) => (
                      <div key={i} className="rounded-lg border bg-card p-4 space-y-4">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-6 w-6 rounded-full" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-8 w-16" />
                          <Skeleton className="h-8 w-16" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : postsError ? (
                  <div className="flex flex-col items-center justify-center p-8 gap-4">
                    <div className="text-center text-red-500">Error loading posts</div>
                    <Button variant="outline" onClick={() => postsRefetch()}>Retry</Button>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 gap-4">
                    <p className="text-muted-foreground text-center">No posts yet</p>
                    {community.isMember && (
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/community/${id}/create-post`)}
                      >
                        Create First Post
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <div 
                        key={post.id}
                        className="cursor-pointer transition-colors hover:bg-accent/50 rounded-lg"
                        onClick={() => navigate(`/community/${id}/post/${post.id}`)}
                      >
                        <PostOverview
                          post={{ ...post, community }}
                          queryKey={['posts', id!]}
                          showPinned={true}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>

          {/* Desktop Right Sidebar - Members List */}
          <div className="hidden lg:block lg:w-80 lg:-mt-16 relative z-10">
            <Card className="shadow-lg sticky top-4 dark:bg-gray-950">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Members</h3>
                  <span className="text-sm text-muted-foreground">
                    {community.memberCount.toLocaleString()}
                  </span>
                </div>

                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {community.members
                      ?.sort((a, b) => (a.role === 'admin' ? -1 : 1) - (b.role === 'admin' ? -1 : 1))
                      .map((member, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 cursor-pointer"
                          onClick={() => navigate(`/profile/${member.id}`)}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.avatar} alt={member.username} />
                            <AvatarFallback>
                              {member.username?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium truncate">
                                {member.displayName || member.username}
                              </p>
                              {member.role === 'admin' && (
                                <Crown className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              @{member.username}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <CommunityLeaveWarning
        community={community}
        showLeaveDialog={showLeaveDialog}
        setShowLeaveDialog={setShowLeaveDialog}
        onJoinLeave={() => joinLeaveCommunity(!community.isMember)}
      />
      <CommunityDeleteWarning
        community={community}
        showDeleteDialog={showDeleteDialog}
        setShowDeleteDialog={setShowDeleteDialog}
        deleteCommunity={() => deleteCommunity()}
      />
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          {community && (
            <CommunityEditForm
              community={community}
              onClose={() => setShowEditDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommunityPage;
