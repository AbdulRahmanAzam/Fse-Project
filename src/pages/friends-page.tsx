import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { User } from "@/lib/api.d";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Search, UserMinus, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import LeftSidebar from "@/components/home/left-sidebar";

const useFriendsQuery = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['friends'],
        queryFn: () => api.get('/user/friends')
    });
    return { data: (data?.data?.friends || []) as User[], isLoading, error };
};

const useUserByIdQuery = (id: string) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['user', id],
        queryFn: () => api.get(`/user/id/${id}`),
        enabled: !!id,
    });
    return { data: data?.data?.user as User, isLoading, error };
};

const useUserByUsernameQuery = (username: string) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['user', username],
        queryFn: () => api.get(`/user/username/${username}`),
        enabled: !!username,
    });
    return { data: data?.data?.user as User, isLoading, error };
};

const FriendsPage = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');
    const [showRemoveDialog, setShowRemoveDialog] = useState(false);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [selectedFriend, setSelectedFriend] = useState<User | null>(null);
    const [userId, setUserId] = useState('');
    const [username, setUsername] = useState('');
    const [activeTab, setActiveTab] = useState('id');

    const { data: friends, isLoading, error } = useFriendsQuery();
    const { data: userById, isLoading: loadingById } = useUserByIdQuery(userId);
    const { data: userByUsername, isLoading: loadingByUsername } = useUserByUsernameQuery(username);

    const { mutate: removeFriend, isPending: isRemoving } = useMutation({
        mutationFn: (friendId: number) => api.delete(`/user/friends/${friendId}`),
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Friend removed successfully",
            });
            queryClient.invalidateQueries({ queryKey: ['friends'] });
            setShowRemoveDialog(false);
            setSelectedFriend(null);
        },
        onError: (error: any) => {
            toast({
                title: error.message || "Error",
                description: error.info || "Failed to remove friend",
                variant: "destructive",
            });
        }
    });

    const { mutate: addFriend, isPending: isAdding } = useMutation({
        mutationFn: (friendId: number) => api.post(`/user/friends/${friendId}`),
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Friend request sent successfully",
            });
            queryClient.invalidateQueries({ queryKey: ['friends'] });
            setShowAddDialog(false);
            setUserId('');
            setUsername('');
        },
        onError: (error: any) => {
            toast({
                title: error.message || "Error",
                description: error.info || "Failed to send friend request",
                variant: "destructive",
            });
        }
    });

    const filteredFriends = friends?.filter(friend => 
        friend.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        friend.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleRemoveFriend = (friend: User) => {
        setSelectedFriend(friend);
        setShowRemoveDialog(true);
    };

    const isAlreadyFriend = (userId: number) => {
        return friends?.some(friend => friend.id === userId);
    };

    const handleAddFriend = () => {
        const userToAdd = activeTab === 'id' ? userById : userByUsername;
        if (userToAdd) {
            if (isAlreadyFriend(userToAdd.id)) {
                toast({
                    title: "Already Friends",
                    description: "This user is already in your friends list",
                    variant: "destructive",
                });
                return;
            }
            addFriend(userToAdd.id);
        }
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <div className="text-center text-2xl text-red-500">Error loading friends</div>
                <Button variant="outline" onClick={() => window.location.reload()}>
                    Try Again
                </Button>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen">
            {/* Left Sidebar - Hidden on mobile */}
            <div className="hidden md:block">
                <LeftSidebar />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex justify-center">
                <div className="w-full max-w-4xl py-4 sm:py-8 px-2 sm:px-4">
                    <Card className="p-3 sm:p-6">
                        <div className="flex flex-col gap-4 sm:gap-6">
                            {/* Header */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                                <div className="flex items-center gap-2">
                                    <Users className="h-5 w-5 sm:h-6 sm:w-6" />
                                    <h1 className="text-xl sm:text-2xl font-bold">Friends</h1>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                    <div className="relative w-full sm:w-64">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search friends..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-8 h-9 sm:h-10"
                                        />
                                    </div>
                                    <Button 
                                        onClick={() => setShowAddDialog(true)}
                                        className="w-full sm:w-auto h-9 sm:h-10"
                                    >
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Add Friend
                                    </Button>
                                </div>
                            </div>

                            {/* Friends List */}
                            {isLoading ? (
                                <div className="space-y-3 sm:space-y-4">
                                    {Array(5).fill(0).map((_, i) => (
                                        <div key={i} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border">
                                            <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-full" />
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-32" />
                                                <Skeleton className="h-3 w-24" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : filteredFriends?.length === 0 ? (
                                <div className="text-center py-6 sm:py-8">
                                    {searchQuery ? (
                                        <div className="space-y-2">
                                            <p className="text-muted-foreground">No friends found matching "{searchQuery}"</p>
                                            <Button 
                                                variant="outline" 
                                                onClick={() => setSearchQuery('')}
                                                className="h-9 sm:h-10"
                                            >
                                                Clear Search
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <p className="text-muted-foreground">You haven't added any friends yet</p>
                                            <Button 
                                                onClick={() => setShowAddDialog(true)}
                                                className="h-9 sm:h-10"
                                            >
                                                <UserPlus className="mr-2 h-4 w-4" />
                                                Find Friends
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="grid gap-3 sm:gap-4">
                                    {filteredFriends?.map((friend) => (
                                        <Card key={friend.id} className="p-3 sm:p-4">
                                            <div className="flex items-center justify-between gap-3 sm:gap-4">
                                                <div 
                                                    className="flex items-center gap-3 sm:gap-4 cursor-pointer hover:opacity-80 transition-opacity"
                                                    onClick={() => navigate(`/profile/${friend.id}`)}
                                                >
                                                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                                                        <AvatarImage src={friend.avatar} />
                                                        <AvatarFallback className="text-base sm:text-lg">
                                                            {friend.username.charAt(0).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <h3 className="font-semibold text-sm sm:text-base">{friend.displayName || friend.username}</h3>
                                                        <p className="text-xs sm:text-sm text-muted-foreground">u/{friend.username}</p>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 sm:h-9 sm:w-9 p-0 text-destructive hover:text-destructive"
                                                    onClick={() => handleRemoveFriend(friend)}
                                                >
                                                    <UserMinus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Remove Friend Dialog */}
            <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Remove Friend</DialogTitle>
                    </DialogHeader>
                    <p className="py-4">
                        Are you sure you want to remove {selectedFriend?.displayName || selectedFriend?.username} from your friends?
                    </p>
                    <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowRemoveDialog(false);
                                setSelectedFriend(null);
                            }}
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => selectedFriend && removeFriend(selectedFriend.id)}
                            disabled={isRemoving}
                            className="w-full sm:w-auto"
                        >
                            {isRemoving ? "Removing..." : "Remove Friend"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Friend Dialog */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Friend</DialogTitle>
                    </DialogHeader>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="id">Search by ID</TabsTrigger>
                            <TabsTrigger value="username">Search by Username</TabsTrigger>
                        </TabsList>
                        <TabsContent value="id" className="space-y-4">
                            <div className="space-y-2">
                                <Input
                                    placeholder="Enter user ID"
                                    value={userId}
                                    onChange={(e) => setUserId(e.target.value)}
                                    className="h-9 sm:h-10"
                                />
                                {loadingById && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Skeleton className="h-4 w-4 rounded-full" />
                                        Searching...
                                    </div>
                                )}
                                {userById && (
                                    <Card className="p-3 sm:p-4">
                                        <div className="flex items-center justify-between gap-3 sm:gap-4">
                                            <div className="flex items-center gap-3 sm:gap-4">
                                                <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                                                    <AvatarImage src={userById.avatar} />
                                                    <AvatarFallback className="text-base sm:text-lg">
                                                        {userById.username.charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h3 className="font-semibold text-sm sm:text-base">{userById.displayName || userById.username}</h3>
                                                    <p className="text-xs sm:text-sm text-muted-foreground">u/{userById.username}</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleAddFriend}
                                                disabled={isAdding || isAlreadyFriend(userById.id)}
                                                className="h-8 sm:h-9"
                                            >
                                                {isAdding ? (
                                                    "Adding..."
                                                ) : isAlreadyFriend(userById.id) ? (
                                                    "Already Friends"
                                                ) : (
                                                    <>
                                                        <UserPlus className="mr-2 h-4 w-4" />
                                                        Add Friend
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </Card>
                                )}
                            </div>
                        </TabsContent>
                        <TabsContent value="username" className="space-y-4">
                            <div className="space-y-2">
                                <Input
                                    placeholder="Enter username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="h-9 sm:h-10"
                                />
                                {loadingByUsername && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Skeleton className="h-4 w-4 rounded-full" />
                                        Searching...
                                    </div>
                                )}
                                {userByUsername && (
                                    <Card className="p-3 sm:p-4">
                                        <div className="flex items-center justify-between gap-3 sm:gap-4">
                                            <div className="flex items-center gap-3 sm:gap-4">
                                                <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                                                    <AvatarImage src={userByUsername.avatar} />
                                                    <AvatarFallback className="text-base sm:text-lg">
                                                        {userByUsername.username.charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h3 className="font-semibold text-sm sm:text-base">{userByUsername.displayName || userByUsername.username}</h3>
                                                    <p className="text-xs sm:text-sm text-muted-foreground">u/{userByUsername.username}</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleAddFriend}
                                                disabled={isAdding || isAlreadyFriend(userByUsername.id)}
                                                className="h-8 sm:h-9"
                                            >
                                                {isAdding ? (
                                                    "Adding..."
                                                ) : isAlreadyFriend(userByUsername.id) ? (
                                                    "Already Friends"
                                                ) : (
                                                    <>
                                                        <UserPlus className="mr-2 h-4 w-4" />
                                                        Add Friend
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </Card>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                    <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowAddDialog(false);
                                setUserId('');
                                setUsername('');
                            }}
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddFriend}
                            disabled={isAdding || !(userById || userByUsername)}
                            className="w-full sm:w-auto"
                        >
                            {isAdding ? "Adding..." : "Add Friend"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default FriendsPage;