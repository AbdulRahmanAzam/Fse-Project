import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: 'member' | 'admin';
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  avatar?: string;
}

interface Post {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  likes: number;
  commentsCount: number;
  communityId?: string;
  communityName?: string;
}

interface AuthState {
  user: User | null;
  error: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  setError: (error: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      error: null,
      login: (user: User, token: string) => {
        set({ user: { ...user, isAdmin: user.role === 'admin' } });
        localStorage.setItem('auth_token', token);
      },
      setError: (error: string) => set({ error }),
      logout: () => {
        localStorage.removeItem('auth_token');
        set({ user: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);

interface PostsState {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  fetchPosts: () => Promise<void>;
  addPost: (content: string, communityId?: string) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
}

export const usePostsStore = create<PostsState>((set, get) => ({
  posts: [],
  isLoading: false,
  error: null,
  fetchPosts: async () => {
    set({ isLoading: true, error: null });
    try {
      // This would be replaced with an actual API call
      // const response = await api.get('/posts');
      
      // Mock posts for now
      const mockPosts: Post[] = [
        {
          id: '1',
          content: 'Top GitHub repositories to learn modern React development. Open source is great for many things. One of them is learning new skills.',
          authorId: '2',
          authorName: 'Shaan Alam',
          createdAt: new Date().toISOString(),
          likes: 5,
          commentsCount: 2,
          communityId: '1',
          communityName: 'Websters Shivaji'
        }
      ];
      
      set({ posts: mockPosts, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch posts', 
        isLoading: false 
      });
    }
  },
  addPost: async (content, communityId) => {
    set({ isLoading: true, error: null });
    try {
      // This would be replaced with an actual API call
      // const response = await api.post('/posts', { content, communityId });
      
      // Mock new post
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('User not authenticated');
      
      const newPost: Post = {
        id: Date.now().toString(),
        content,
        authorId: user.id,
        authorName: user.username,
        authorAvatar: user.avatar,
        createdAt: new Date().toISOString(),
        likes: 0,
        commentsCount: 0,
        communityId,
        communityName: communityId ? 'Websters Shivaji' : undefined // This would be fetched from API
      };
      
      set({ posts: [newPost, ...get().posts], isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to add post', 
        isLoading: false 
      });
    }
  },
  likePost: async (postId) => {
    try {
      // This would be replaced with an actual API call
      // await api.post(`/posts/${postId}/like`);
      
      // Update post locally for immediate feedback
      const updatedPosts = get().posts.map(post => 
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      );
      
      set({ posts: updatedPosts });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Failed to like post' 
      });
    }
  }
})); 