import { useState } from 'react'
import { useTheme } from '../components/theme/theme-provider'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { 
  Calendar as CalendarIcon, 
  Link as LinkIcon, 
  Upload, 
  Image, 
  Smile, 
  MapPin, 
  Users, 
  PlusCircle, 
  X 
} from 'lucide-react'

// Types for special dates
interface SpecialDate {
  day: number;
  month: number;
  year: number;
  title: string;
}

// Types for event data
interface EventData {
  title: string;
  description: string;
  link: string;
  image: File | null;
}

// Type for Post
interface Post {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  community?: {
    id: string;
    name: string;
  };
  createdAt: Date;
  upvotes: number;
  downvotes: number;
  userVote?: 'upvote' | 'downvote' | null; // To track current user's vote
  comments: {
    id: string;
    author: {
      id: string;
      name: string;
      avatar?: string;
    };
    content: string;
    createdAt: Date;
  }[];
  image?: string;
}

const HomePage = () => {
  return (
    <div className="flex min-h-screen">
      {/* Left Sidebar */}
      <LeftSidebar />
      
      {/* Main Content */}
      <main className="flex-1 border-x border-gray-200 dark:border-gray-800">
        <div className="container max-w-4xl mx-auto py-4 px-4">
          <FeedComponent />
        </div>
      </main>
      
      {/* Right Sidebar with Calendar */}
      <RightSidebar />
    </div>
  )
}

const LeftSidebar = () => {
  return (
    <div className="w-64 p-4 hidden md:block bg-white dark:bg-gray-950 h-screen sticky top-0">
      <div className="flex items-center mb-8">
        <img src="../src/assets/genz-logo2.png" alt="" className='w-10 h-10' />
        <h1 className="text-2xl font-bold">GenZ Scholars</h1>
        <div className="w-2 h-2 rounded-full bg-green-500 ml-1"></div>
      </div>
      
      <nav className="space-y-2">
        <NavItem icon="🏠" label="Home" active />
        <NavItem icon="👤" label="Profile" />
        <NavItem icon="🔍" label="Explore Communities" />
        <NavItem icon="⚙️" label="Settings" />
      </nav>
      
      <div className="mt-8">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">My Communities</h2>
        <div className="space-y-3">
          <CommunityItem name="Websters Shivaji" members={154} />
          <CommunityItem name="Enactus Shivaji" members={89} />
          <CommunityItem name="Women Development Cell" members={67} />
          <CommunityItem name="Alumni Relations Cell" members={92} />
        </div>
        <button className="mt-4 w-full text-sm text-primary flex justify-center py-2">
          See All
        </button>
      </div>
      
      
    </div>
  )
}

const NavItem = ({ icon, label, active = false }: { icon: string; label: string; active?: boolean }) => {
  return (
    <a 
      href="#" 
      className={`flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 ${
        active ? 'bg-gray-100 dark:bg-gray-900' : ''
      }`}
    >
      <span className="mr-3">{icon}</span>
      <span className={`${active ? 'font-medium' : ''}`}>{label}</span>
    </a>
  )
}

const CommunityItem = ({ name, members }: { name: string; members: number }) => {
  return (
    <div className="flex items-center">
      <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0"></div>
      <div className="ml-2">
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs text-gray-500">{members} members</p>
      </div>
    </div>
  )
}

const FeedComponent = () => {
  const [postContent, setPostContent] = useState('');
  const [attachments, setAttachments] = useState<{
    image: File | null;
    community: string | null;
    location: string | null;
  }>({
    image: null,
    community: null,
    location: null
  });
  
  // Mock posts data
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      content: 'Top GitHub repositories to learn modern React development. Open source is great for many things. One of them is learning new skills.',
      author: {
        id: '2',
        name: 'Shaan Alam'
      },
      community: {
        id: '1',
        name: 'Websters Shivaji'
      },
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      upvotes: 5,
      downvotes: 1,
      userVote: null,
      comments: [
        {
          id: '1',
          author: {
            id: '3',
            name: 'Elon Musk'
          },
          content: 'Nice idea!! Keep up the great work!',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
        },
        {
          id: '2',
          author: {
            id: '2',
            name: 'Shaan Alam'
          },
          content: 'Thanks!!',
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
        }
      ]
    }
  ]);
  
  const [showCommunityDropdown, setShowCommunityDropdown] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // Sample communities
  const communities = [
    { id: '1', name: 'Websters Shivaji' },
    { id: '2', name: 'Enactus Shivaji' },
    { id: '3', name: 'Women Development Cell' },
    { id: '4', name: 'Alumni Relations Cell' }
  ];
  
  // Create a post
  const handleCreatePost = () => {
    if (!postContent.trim()) return;
    
    const newPost: Post = {
      id: Math.random().toString(36).substring(2, 9),
      content: postContent,
      author: {
        id: '1',
        name: 'You' // In a real app, this would be the current user
      },
      ...(attachments.community ? {
        community: communities.find(c => c.id === attachments.community) || undefined
      } : {}),
      createdAt: new Date(),
      upvotes: 0,
      downvotes: 0,
      userVote: null,
      comments: [],
      ...(attachments.image ? {
        image: URL.createObjectURL(attachments.image)
      } : {})
    };
    
    setPosts([newPost, ...posts]);
    setPostContent('');
    setAttachments({
      image: null,
      community: null,
      location: null
    });
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachments({
        ...attachments,
        image: e.target.files[0]
      });
    }
  };
  
  // Handle voting
  const handleVote = (postId: string, voteType: 'upvote' | 'downvote') => {
    setPosts(
      posts.map(post => {
        if (post.id === postId) {
          // If already voted this way, remove vote
          if (post.userVote === voteType) {
            return {
              ...post,
              upvotes: voteType === 'upvote' ? post.upvotes - 1 : post.upvotes,
              downvotes: voteType === 'downvote' ? post.downvotes - 1 : post.downvotes,
              userVote: null
            };
          }
          
          // If voted other way, switch vote
          if (post.userVote) {
            return {
              ...post,
              upvotes: voteType === 'upvote' ? post.upvotes + 1 : post.upvotes - 1,
              downvotes: voteType === 'downvote' ? post.downvotes + 1 : post.downvotes - 1,
              userVote: voteType
            };
          }
          
          // If not voted yet
          return {
            ...post,
            upvotes: voteType === 'upvote' ? post.upvotes + 1 : post.upvotes,
            downvotes: voteType === 'downvote' ? post.downvotes + 1 : post.downvotes,
            userVote: voteType
          };
        }
        return post;
      })
    );
  };
  
  // Handle comments
  const [commentInput, setCommentInput] = useState<{[key: string]: string}>({});
  
  const handleAddComment = (postId: string) => {
    if (!commentInput[postId] || !commentInput[postId].trim()) return;
    
    setPosts(
      posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [
              ...post.comments,
              {
                id: Math.random().toString(36).substring(2, 9),
                author: {
                  id: '1',
                  name: 'You' // Current user
                },
                content: commentInput[postId],
                createdAt: new Date()
              }
            ]
          };
        }
        return post;
      })
    );
    
    // Clear input
    setCommentInput({
      ...commentInput,
      [postId]: ''
    });
  };
  
  return (
    <div className="space-y-6">
      {/* Post Creation Interface */}
      <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-background">
        <div className="flex items-start space-x-3">
          <div className="h-10 w-10 rounded-full bg-gray-300 flex-shrink-0"></div>
          <div className="flex-1">
            <Textarea
              placeholder="What's on your mind?"
              value={postContent}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPostContent(e.target.value)}
              className="min-h-24 resize-none border-0 focus-visible:ring-0 px-0 py-2 bg-transparent"
            />
            
            {attachments.image && (
              <div className="relative bg-muted rounded-md p-2 mt-2">
                <div className="flex items-center space-x-2">
                  <Image className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{attachments.image.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto h-6 w-6 p-0"
                    onClick={() => setAttachments({...attachments, image: null})}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            
            {attachments.community && (
              <div className="bg-muted rounded-md p-2 mt-2">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {communities.find(c => c.id === attachments.community)?.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto h-6 w-6 p-0"
                    onClick={() => setAttachments({...attachments, community: null})}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  id="post-image"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileUpload}
                />
                <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0" asChild>
                  <label htmlFor="post-image">
                    <Image className="h-4 w-4" />
                  </label>
                </Button>
                
                <div className="relative">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="rounded-full h-8 w-8 p-0"
                    onClick={() => setShowCommunityDropdown(!showCommunityDropdown)}
                  >
                    <Users className="h-4 w-4" />
                  </Button>
                  
                  {showCommunityDropdown && (
                    <div className="absolute left-0 mt-1 w-64 rounded-md shadow-lg bg-background border border-border">
                      <div className="p-2 text-xs font-medium text-muted-foreground">
                        Select a community
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {communities.map(community => (
                          <div 
                            key={community.id}
                            className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-muted"
                            onClick={() => {
                              setAttachments({...attachments, community: community.id});
                              setShowCommunityDropdown(false);
                            }}
                          >
                            <div className="h-6 w-6 rounded-full bg-muted flex-shrink-0 mr-2"></div>
                            {community.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0">
                  <MapPin className="h-4 w-4" />
                </Button>
                
                <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0">
                  <Smile className="h-4 w-4" />
                </Button>
              </div>
              
              <Button
                onClick={handleCreatePost}
                size="sm"
                disabled={!postContent.trim()}
              >
                Post
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Posts */}
      {posts.map(post => (
        <article key={post.id} className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <div className="flex items-start space-x-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-gray-300"></div>
            <div>
              <p className="font-medium">{post.author.name}</p>
              {post.community && (
                <button className="text-sm text-blue-500">{post.community.name}</button>
              )}
            </div>
          </div>
          
          <p className="mb-4">{post.content}</p>
          
          {post.image && (
            <div className="rounded-lg overflow-hidden mb-4">
              <img src={post.image} alt="Post" className="w-full" />
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                className={`flex items-center space-x-1 ${post.userVote === 'upvote' ? 'text-green-500' : ''}`}
                onClick={() => handleVote(post.id, 'upvote')}
              >
                <span>⬆️</span>
                <span className="text-sm">{post.upvotes}</span>
              </button>
              
              <button 
                className={`flex items-center space-x-1 ${post.userVote === 'downvote' ? 'text-red-500' : ''}`}
                onClick={() => handleVote(post.id, 'downvote')}
              >
                <span>⬇️</span>
                <span className="text-sm">{post.downvotes}</span>
              </button>
            </div>
            <button 
              className="text-sm text-gray-500"
              onClick={() => {
                if (!commentInput[post.id]) {
                  setCommentInput({
                    ...commentInput,
                    [post.id]: ''
                  });
                }
              }}
            >
              Comments ({post.comments.length})
            </button>
          </div>
          
          {/* Comment input */}
          {(commentInput[post.id] !== undefined || post.comments.length > 0) && (
            <div className="mt-4 pt-4 border-t">
              {post.comments.map(comment => (
                <div key={comment.id} className="mb-2">
                  <div className="flex items-start space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                    <div>
                      <p className="font-medium text-sm">{comment.author.name}</p>
                      <p className="text-sm">{comment.content}</p>
                      <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                        <span>{formatTime(comment.createdAt)}</span>
                        <button>Reply</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="mt-3 flex space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex-shrink-0"></div>
                <div className="flex-1 flex space-x-2">
                  <Input
                    placeholder="Write a comment..."
                    value={commentInput[post.id] || ''}
                    onChange={(e) => setCommentInput({...commentInput, [post.id]: e.target.value})}
                    className="flex-1 h-8 text-sm"
                  />
                  <Button 
                    size="sm" 
                    onClick={() => handleAddComment(post.id)}
                    disabled={!commentInput[post.id] || !commentInput[post.id].trim()}
                  >
                    Post
                  </Button>
                </div>
              </div>
            </div>
          )}
        </article>
      ))}
    </div>
  );
};

// Helper function to format time (e.g., "2d ago")
const formatTime = (date: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

const RightSidebar = () => {
  const [showEventsDialog, setShowEventsDialog] = useState(false);
  
  return (
    <div className="w-80 p-4 hidden lg:block bg-white dark:bg-gray-950 h-screen sticky top-0 overflow-y-auto">
      {/* Calendar Component */}
      <div className="mt-6">
        <Calendar />
      </div>
      
      {/* View All Events Button */}
      <div className="mt-4 flex justify-center">
        <Button 
          onClick={() => setShowEventsDialog(true)}
          className="w-full"
          variant="outline"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          View All Events
        </Button>
      </div>
      
      {/* All Events Dialog */}
      <Dialog open={showEventsDialog} onOpenChange={setShowEventsDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Upcoming University Events</DialogTitle>
            <DialogDescription>
              All planned events for the upcoming weeks
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-y-auto pr-2" style={{ maxHeight: 'calc(80vh - 180px)' }}>
            <AllEvents />
          </div>
        </DialogContent>
      </Dialog>

      <h2 className="font-medium mb-4 mt-6">New Communities</h2>
      
      <div className="space-y-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gray-300"></div>
              <div className="ml-2">
                <p className="text-sm font-medium">Websters Shivaji</p>
                <p className="text-xs text-gray-500">184 members</p>
              </div>
            </div>
            <button className="text-xs text-primary">Join</button>
          </div>
        ))}
        
        <button className="text-sm text-primary">See more...</button>
      </div>
      
      <h2 className="font-medium mb-4">New Members</h2>
      
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gray-300"></div>
              <div className="ml-2">
                <p className="text-sm font-medium">Shaan Alam</p>
                <p className="text-xs text-gray-500">President at Websters Shivaji</p>
              </div>
            </div>
            <button className="text-xs text-primary">Follow</button>
          </div>
        ))}
        
        <button className="text-sm text-primary">See more...</button>
      </div>
      
      
    </div>
  )
}

// Add the AllEvents component
const AllEvents = () => {
  // Get all events from specialDates in the Calendar component
  // For demo purposes, we'll create mock events
  const events = [
    {
      id: '1',
      title: 'Tech Conference',
      description: 'Join us for the annual university tech conference featuring industry leaders and innovative showcases from our students.',
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 25),
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dGVjaCUyMGNvbmZlcmVuY2V8ZW58MHx8MHx8fDA%3D'
    },
    {
      id: '2',
      title: 'Cultural Festival',
      description: 'Experience diverse cultural performances, food stalls, and interactive exhibits celebrating our multicultural campus community.',
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 28),
      image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZmVzdGl2YWx8ZW58MHx8MHx8fDA%3D'
    },
    {
      id: '3',
      title: 'Alumni Networking Night',
      description: 'Connect with successful alumni, build your professional network, and explore potential career opportunities.',
      date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 5),
      image: 'https://images.unsplash.com/photo-1539127670104-5bc08f3d0ff6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8bmV0d29ya2luZyUyMGV2ZW50fGVufDB8fDB8fHww'
    },
    {
      id: '4',
      title: 'Hackathon 2023',
      description: 'Put your coding skills to the test in this 48-hour hackathon. Solve real-world problems and compete for amazing prizes.',
      date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 12),
      image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aGFja2F0aG9ufGVufDB8fDB8fHww'
    },
    {
      id: '5',
      title: 'Research Symposium',
      description: 'Discover groundbreaking research from our faculty and students. Poster presentations and keynote speakers from various disciplines.',
      date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 18),
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmVzZWFyY2h8ZW58MHx8MHx8fDA%3D'
    }
  ];
  
  // Sort events by date
  const sortedEvents = [...events].sort((a, b) => a.date.getTime() - b.date.getTime());
  
  return (
    <div className="space-y-6 py-2">
      {sortedEvents.map(event => (
        <div 
          key={event.id} 
          className="flex flex-col sm:flex-row gap-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="sm:w-1/3 h-40 rounded-md overflow-hidden flex-shrink-0">
            <img 
              src={event.image} 
              alt={event.title} 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{event.title}</h3>
            <p className="text-sm text-muted-foreground mb-2">
              {event.date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </p>
            <p className="text-sm">{event.description}</p>
            
            <div className="mt-4 flex justify-end">
              <Button size="sm" variant="default">
                <CalendarIcon className="mr-2 h-3 w-3" />
                Add to Calendar
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Calendar component with theme support
const Calendar = () => {
  const { theme } = useTheme()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [eventDate, setEventDate] = useState<Date | null>(null)
  const [showEventDialog, setShowEventDialog] = useState(false)
  const [eventData, setEventData] = useState<EventData>({
    title: '',
    description: '',
    link: '',
    image: null
  })
  
  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
  
  // Set special dates for university events
  const [specialDates, setSpecialDates] = useState<SpecialDate[]>([
    { day: 25, month: new Date().getMonth(), year: new Date().getFullYear(), title: "Tech Conference" }
  ])
  
  // Helper to generate calendar days
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDayOfMonth = new Date(year, month, 1).getDay()
    
    const days = []
    
    // Add empty days for the start of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: new Date(year, month - 1, 30 - firstDayOfMonth + i + 1).getDate(), currentMonth: false })
    }
    
    // Add days for current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, currentMonth: true })
    }
    
    // Fill remaining slots
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ day: i, currentMonth: false })
    }
    
    return days
  }
  
  const days = getDaysInMonth(currentMonth)
  
  const isToday = (day: number) => {
    const today = new Date()
    return day === today.getDate() && 
           currentMonth.getMonth() === today.getMonth() && 
           currentMonth.getFullYear() === today.getFullYear()
  }
  
  const isSpecialDay = (day: number) => {
    return specialDates.some(date => 
      date.day === day && 
      date.month === currentMonth.getMonth() && 
      date.year === currentMonth.getFullYear()
    )
  }
  
  const handleDayDoubleClick = (day: number) => {
    if (!day) return
    
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    setEventDate(selectedDate)
    setShowEventDialog(true)
  }
  
  const handleCreateEvent = () => {
    console.log("Event created:", { date: eventDate, ...eventData })
    // Here you would typically save this to your backend
    // For now, we'll just add it to our special dates
    if (eventDate) {
      const newSpecialDate: SpecialDate = {
        day: eventDate.getDate(),
        month: eventDate.getMonth(),
        year: eventDate.getFullYear(),
        title: eventData.title
      }
      
      setSpecialDates([...specialDates, newSpecialDate])
    }
    
    // Reset form
    setEventData({
      title: '',
      description: '',
      link: '',
      image: null
    })
    setShowEventDialog(false)
  }
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEventData({ ...eventData, image: e.target.files[0] })
    }
  }
  
  return (
    <>
      <div className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} border border-border p-4 rounded-lg shadow-sm`}>
        <div className="flex justify-between items-center mb-4">
          <button 
            className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-muted"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
          >
            &lt;
          </button>
          <h3 className="font-medium">
            {currentMonth.toLocaleString('default', { month: 'long' })} {currentMonth.getFullYear()}
          </h3>
          <button 
            className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-muted"
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
          >
            &gt;
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 text-center">
          {daysOfWeek.map(day => (
            <div key={day} className="text-xs text-muted-foreground font-medium py-1">{day}</div>
          ))}
          
          {days.map((day, index) => (
            <div 
              key={index} 
              className={`
                text-sm p-1 rounded-full w-7 h-7 flex items-center justify-center transition-colors cursor-pointer
                ${!day.currentMonth ? 'text-muted-foreground/50' : ''}
                ${day.currentMonth && isToday(day.day) ? 'bg-primary text-primary-foreground' : ''}
                ${day.currentMonth && isSpecialDay(day.day) ? 'bg-blue-600 text-white' : ''}
                ${day.currentMonth && !isToday(day.day) && !isSpecialDay(day.day) ? 'hover:bg-muted' : ''}
              `}
              onDoubleClick={() => day.currentMonth && handleDayDoubleClick(day.day)}
            >
              {day.day}
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-xs text-center text-muted-foreground">
          <p>Double-click on a date to add an event</p>
        </div>
      </div>
      
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create University Event</DialogTitle>
            <DialogDescription>
              {eventDate ? (
                <>Add details for event on {eventDate.toLocaleDateString()}</>
              ) : (
                <>Select a date to add an event</>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-title" className="text-right">
                Title
              </Label>
              <Input
                id="event-title"
                className="col-span-3"
                value={eventData.title}
                onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-desc" className="text-right">
                Description
              </Label>
              <Textarea
                id="event-desc"
                className="col-span-3"
                value={eventData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEventData({ ...eventData, description: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-link" className="text-right">
                Link
              </Label>
              <div className="col-span-3 flex">
                <span className="inline-flex items-center px-3 bg-muted border border-r-0 border-input rounded-l-md">
                  <LinkIcon className="h-4 w-4" />
                </span>
                <Input
                  id="event-link"
                  className="rounded-l-none"
                  placeholder="https://"
                  value={eventData.link}
                  onChange={(e) => setEventData({ ...eventData, link: e.target.value })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-image" className="text-right">
                Image
              </Label>
              <div className="col-span-3">
                <Label
                  htmlFor="event-image"
                  className="flex items-center gap-2 p-2 border border-dashed border-input rounded-md hover:bg-muted cursor-pointer"
                >
                  <Upload className="h-4 w-4" />
                  <span>{eventData.image ? eventData.image.name : "Upload event image"}</span>
                  <Input
                    id="event-image"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setShowEventDialog(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleCreateEvent}>
              Create Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default HomePage 