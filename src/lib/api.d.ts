export interface ApiResponseError {
  status: number;
  name: string;
  message: string;
  info: string;
}

export interface ApiResponse extends Record<string, any> {
  status: number;
}

export interface PostFile {
  id: number;
  path: string;
  size: number;
  createdAt: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  user: {
    id: number;
    username: string;
    displayName: string;
    role: string;
    avatar?: string;
  };
  community: {
    id: number;
    name: string;
    tags: string;
    image?: string;
  };
  fileCount: number;
  files?: PostFile[];
  isPending?: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down';
  image?: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  displayName: string;
  role: 'member' | 'admin';
  isMutualFriend?: boolean;
  isFriend?: boolean;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  avatar?: string;
}

export interface Community {
  id: number;
  name: string;
  description: string;
  tags: string;
  memberCount: number;
  members?: Partial<User>[];
  isMember: boolean;
  createdAt: string;
  updatedAt: string;
  image?: string;
}

export interface Comment {
  id: number;
  content: string;
  user: User;
  children: Comment[];
  postId: number;
  post: Post;
  parentId: number | null;
  createdAt: string;
  updatedAt: string;
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down';
}
