import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { User, Post, Comment } from "@/lib/api.d";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/lib/stores/use-auth-store";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, Check, X, ArrowUpDown, MessageSquare, FileText, Calendar, Trophy, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import PostOverview from "@/components/posts/post-overview";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CommentCard from "@/components/comments/comment-card";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import LeftSidebar from "@/components/home/left-sidebar";

const useUserQuery = (id: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user', id],
    queryFn: () => api.get(`/user/id/${id}`)
  });
  return { data: data?.data?.user as User, isLoading, error };
};

const usePostsQuery = (userId: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['posts', userId],
    queryFn: () => api.get(`/post/user/${userId}`)
  });
  return { 
    data: (data?.data?.posts || []) as Post[], 
    totalCount: data?.data?.totalCount || 0,
    isLoading, 
    error 
  };
};

const useCommentsQuery = (userId: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['comments', userId],
    queryFn: () => api.get(`/comment/user/${userId}`)
  });
  return { data: (data?.data?.comments || []) as Comment[], 
    totalCount: data?.data?.totalCount || 0, 
    isLoading, 
    error 
  };
};


const ProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuthStore();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const userId = id || currentUser?.id?.toString() || '';
    const { data: user, isLoading, error } = useUserQuery(userId);
    const { data: posts, totalCount, isLoading: postsLoading, error: postsError } = usePostsQuery(userId);
    const { data: comments, totalCount: commentsTotalCount, isLoading: commentsLoading, error: commentsError } = useCommentsQuery(userId);
    const [isEditing, setIsEditing] = useState(false);
    const [displayName, setDisplayName] = useState('');
    const [sortBy, setSortBy] = useState<'new' | 'top'>('new');
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    useEffect(() => {
        if (user?.displayName) {
            setDisplayName(user.displayName);
        }
    }, [user?.displayName]);

    const { mutate: updateDisplayName, isPending } = useMutation({
        mutationFn: () => api.patch(`/user/${userId}`, { displayName }),
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Display name updated successfully",
            });
            queryClient.invalidateQueries({ queryKey: ['user', userId] });
            setIsEditing(false);
        },
        onError: (error: any) => {
            toast({
                title: error.message || "Error",
                description: error.info || "Failed to update display name",
                variant: "destructive",
            });
        }
    });

    const { mutate: addFriend, isPending: isAddingFriend } = useMutation({
        mutationFn: () => api.post(`user/friends/${userId}`),
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Friend request sent successfully",
            });
            queryClient.invalidateQueries({ queryKey: ['user', userId] });
        },
        onError: (error: any) => {
            toast({
                title: error.message || "Error",
                description: error.info || "Failed to send friend request",
                variant: "destructive",
            });
        }
    });

    // If no ID is provided and we're not logged in, redirect to auth
    useEffect(() => {
        if (!id && !currentUser) {
            navigate('/auth');
        }
    }, [id, currentUser, navigate]);

    const sortedPosts = posts ? [...posts].sort((a, b) => {
        if (sortBy === 'new') {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else {
            return (b.upvotes || 0) - (a.upvotes || 0);
        }
    }) : [];

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <div className="text-center text-2xl text-red-500">Error loading profile</div>
                <Button variant="outline" onClick={() => navigate(-1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Go Back
                </Button>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="container max-w-4xl mx-auto py-8 px-4">
                <div className="flex items-center gap-4 mb-8">
                    <Skeleton className="h-20 w-20 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
                <Skeleton className="h-10 w-full" />
            </div>
        );
    }

    const isOwnProfile = !id || currentUser?.id === user?.id;

    return ( 
        <div className="flex min-h-screen">
            {/* Left Sidebar - Hidden on mobile */}
            <div className="hidden md:block">
                <LeftSidebar />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex justify-center">
                <div className="w-full max-w-4xl py-4 sm:py-8 px-2 sm:px-4">
                    {/* Profile Header */}
                    <Card className="p-4 sm:p-6 mb-4 sm:mb-8">
                        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-background shadow-lg">
                                <AvatarImage src={user?.avatar} />
                                <AvatarFallback className="text-xl sm:text-2xl">{user?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 text-center sm:text-left">
                                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2">
                                    {isEditing ? (
                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                            <Input
                                                value={displayName}
                                                onChange={(e) => setDisplayName(e.target.value)}
                                                className="h-8 w-full sm:w-64"
                                                placeholder="Enter display name"
                                            />
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => updateDisplayName()}
                                                disabled={isPending || !displayName.trim()}
                                            >
                                                <Check className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    setDisplayName(user?.displayName || '');
                                                }}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col sm:flex-row items-center gap-2">
                                            <div 
                                                className="group relative cursor-pointer"
                                                onClick={() => isOwnProfile && (window.innerWidth < 640 ? setIsEditDialogOpen(true) : setIsEditing(true))}
                                            >
                                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                                                    {user?.displayName}
                                                </h1>
                                                {isOwnProfile && (
                                                    <div className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity sm:block hidden">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-2 space-y-1">
                                    <p className="text-muted-foreground text-base sm:text-lg">u/{user?.username}</p>
                                    <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            <span>Member since {new Date(user?.createdAt!).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Trophy className="h-4 w-4" />
                                            <span>{totalCount || posts?.length || 0} posts</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MessageSquare className="h-4 w-4" />
                                            <span>{commentsTotalCount || comments?.length || 0} comments</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {!isOwnProfile && (
                                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                    <Button 
                                        variant="outline" 
                                        onClick={() => navigate(-1)} 
                                        className="w-full sm:w-auto"
                                    >
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Go Back
                                    </Button>
                                    <Button
                                        variant="default"
                                        onClick={() => addFriend()}
                                        disabled={isAddingFriend}
                                        className="w-full sm:w-auto"
                                    >
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        {isAddingFriend ? "Adding..." : "Add Friend"}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Edit Display Name Dialog */}
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit Display Name</DialogTitle>
                            </DialogHeader>
                            <div className="py-4">
                                <Input
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="Enter display name"
                                    className="w-full"
                                />
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsEditDialogOpen(false);
                                        setDisplayName(user?.displayName || '');
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => {
                                        updateDisplayName();
                                        setIsEditDialogOpen(false);
                                    }}
                                    disabled={isPending || !displayName.trim()}
                                >
                                    Save Changes
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Tabs */}
                    <Card className="p-4 sm:p-6">
                        <Tabs defaultValue="posts" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6">
                                <TabsTrigger value="posts" className="flex items-center gap-2 py-2 sm:py-3">
                                    <FileText className="h-4 w-4" />
                                    <span className="hidden sm:inline">Posts</span>
                                </TabsTrigger>
                                <TabsTrigger value="comments" className="flex items-center gap-2 py-2 sm:py-3">
                                    <MessageSquare className="h-4 w-4" />
                                    <span className="hidden sm:inline">Comments</span>
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="posts" className="mt-0">
                                {postsError ? (
                                    <div className="flex flex-col items-center justify-center py-8 gap-4">
                                        <div className="text-center text-red-500">Error loading posts</div>
                                        <Button variant="outline" onClick={() => window.location.reload()}>
                                            Try Again
                                        </Button>
                                    </div>
                                ) : postsLoading ? (
                                    <div className="space-y-4">
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
                                                <div className="flex items-center gap-4">
                                                    <Skeleton className="h-8 w-8" />
                                                    <Skeleton className="h-8 w-8" />
                                                    <Skeleton className="h-8 w-8" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : posts?.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No posts found
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                            <Badge variant="secondary" className="text-sm">
                                                {posts.length} {posts.length === 1 ? 'post' : 'posts'}
                                            </Badge>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto">
                                                        <ArrowUpDown className="h-4 w-4" />
                                                        Sort by: {sortBy === 'new' ? 'New' : 'Top'}
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-[200px]">
                                                    <DropdownMenuItem 
                                                        onClick={() => setSortBy('new')}
                                                        className={sortBy === 'new' ? 'bg-accent' : ''}
                                                    >
                                                        New
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        onClick={() => setSortBy('top')}
                                                        className={sortBy === 'top' ? 'bg-accent' : ''}
                                                    >
                                                        Top
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        <Separator className="my-4" />
                                        {sortedPosts.map((post, index) => (
                                            <div key={post.id}>
                                                <div 
                                                    className="cursor-pointer transition-colors hover:bg-accent/50 rounded-lg"
                                                    onClick={() => navigate(`/community/${post.community.id}/post/${post.id}`)}
                                                >
                                                    <PostOverview
                                                        post={post}
                                                        queryKey={['posts', userId]}
                                                        showPinned={true}
                                                    />
                                                </div>
                                                {index < sortedPosts.length - 1 && <Separator className="my-4" />}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                            <TabsContent value="comments" className="mt-0">
                                {commentsError ? (
                                    <div className="flex flex-col items-center justify-center py-8 gap-4">
                                        <div className="text-center text-red-500">Error loading comments</div>
                                        <Button variant="outline" onClick={() => window.location.reload()}>
                                            Try Again
                                        </Button>
                                    </div>
                                ) : commentsLoading ? (
                                    <div className="space-y-4">
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
                                                    <Skeleton className="h-4 w-full" />
                                                    <Skeleton className="h-4 w-2/3" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : comments?.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No comments found
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                            <Badge variant="secondary" className="text-sm">
                                                {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
                                            </Badge>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto">
                                                        <ArrowUpDown className="h-4 w-4" />
                                                        Sort by: {sortBy === 'new' ? 'New' : 'Top'}
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-[200px]">
                                                    <DropdownMenuItem 
                                                        onClick={() => setSortBy('new')}
                                                        className={sortBy === 'new' ? 'bg-accent' : ''}
                                                    >
                                                        New
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        onClick={() => setSortBy('top')}
                                                        className={sortBy === 'top' ? 'bg-accent' : ''}
                                                    >
                                                        Top
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        <Separator className="my-4" />
                                        {comments
                                            .sort((a, b) => {
                                                if (sortBy === 'new') {
                                                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                                                } else {
                                                    return (b.upvotes || 0) - (a.upvotes || 0);
                                                }
                                            })
                                            .map((comment, index) => (
                                                <div key={comment.id}>
                                                    <div 
                                                        className="cursor-pointer transition-colors hover:bg-accent/50 rounded-lg"
                                                        onClick={() => navigate(`/community/${comment.post.community.id}/post/${comment.post.id}`)}
                                                    >
                                                        <CommentCard
                                                            comment={comment}
                                                            postId={comment.postId.toString()}
                                                            queryKey={['comments', userId]}
                                                        />
                                                    </div>
                                                    {index < comments.length - 1 && <Separator className="my-4" />}
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </Card>
                </div>
            </div>
        </div>
     );
}
 
export default ProfilePage;