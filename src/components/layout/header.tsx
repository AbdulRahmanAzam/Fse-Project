import { Link, useNavigate } from 'react-router-dom'

import { 
  Bell,
  Sun, 
  Moon, 
  User, 
  Handshake, 
  Menu,
  ChevronDown,
  Users
} from 'lucide-react'
import { useTheme } from '../theme/theme-provider'

import { Button } from '../ui/button'

import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '../ui/dropdown-menu'

import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetTitle,
  SheetHeader
} from '../ui/sheet'

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '../ui/dialog'

import { useAuthStore } from '@/lib/stores/use-auth-store'
import { ModeToggle } from '../theme/mode-toggle'

// Developer information
const developers = [
  {
    name: "Fasih Hasan",
    role: "Backend Developer",
    avatar: "/src/assets/fasih.jpeg",
    bio: "Specialized in React and modern UI frameworks. Passionate about creating intuitive user experiences.",
    github: "https://github.com/fasihh",
    linkedin: "https://www.linkedin.com/in/fasihhasankhan/"
  },
  {
    name: "Abdul Rahman Azam",
    role: "Frontend Developer",
    avatar: "/src/assets/abdulrahmanazam.png",
    bio: "Node.js expert with extensive experience in RESTful API design and database management.",
    github: "https://github.com/abdulrahmanazam",
    linkedin: "https://www.linkedin.com/in/abdulrahmanazam"
  },
  {
    name: "Muhammed Owais",
    role: "Backend Developer",
    avatar: "/src/assets/owais.jpeg",
    bio: "Full stack developer with a focus on system architecture and performance optimization.",
    github: "https://github.com",
    linkedin: "https://www.linkedin.com/in/muhammed-owais-6bbb5925a/"
  }
];

const Header = () => {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  // const [searchQuery, setSearchQuery] = useState('');
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <img src="/src/assets/genz-logo2.png" alt="Logo" className="h-8 w-8" />
            <span className="text-xl font-bold">GenZ Scholars</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          {/* Theme Toggle */}
          <ModeToggle />

          {/* About Developer */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Handshake className="mr-2 h-4 w-4" />
                <span>Team</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Meet Our Development Team</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {developers.map((dev, index) => (
                    <div key={index} className="flex flex-col items-center text-center">
                      <img 
                        src={dev.avatar} 
                        alt={dev.name} 
                        className="h-24 w-24 rounded-full mb-3" 
                      />
                      <h3 className="text-lg font-semibold">{dev.name}</h3>
                      <p className="text-sm text-primary mb-2">{dev.role}</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        {dev.bio}
                      </p>
                      <div className="flex gap-3">
                        <Button variant="outline" size="sm" asChild>
                          <a href={dev.github} target="_blank" rel="noopener noreferrer">GitHub</a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <a href={dev.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Notifications */}
          {user?.isAdmin && <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-white">
                  3
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between px-4 py-2">
                <h3 className="font-medium">Notifications</h3>
                <Button variant="ghost" size="sm">Mark all as read</Button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {[1, 2, 3].map((i) => (
                  <DropdownMenuItem key={i} className="flex flex-col items-start p-4 focus:bg-accent">
                    <div className="flex w-full gap-4">
                      <div className="h-8 w-8 rounded-full bg-muted"></div>
                      <div className="flex-1">
                        <p className="text-sm">
                          <span className="font-medium">User {i}</span> requested materials for Machine Learning course
                        </p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
              <div className="border-t p-2">
                <Button variant="ghost" size="sm" className="w-full justify-center">
                  View all notifications
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>}

          {/* Profile or Auth */}
          {!!user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <div className="h-8 w-8 rounded-full bg-muted overflow-hidden">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.username} className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-4 w-4 mx-auto my-2" />
                    )}
                  </div>
                  <span className="max-w-[100px] truncate hidden sm:inline-block">{user.displayName || user.username}</span>
                  <ChevronDown className="h-4 w-4 hidden sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/auth">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              {!!user ? (
                <Button variant="ghost" size="icon" className="relative">
                  <div className="h-8 w-8 rounded-full bg-muted overflow-hidden">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.username} className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-4 w-4 mx-auto my-2" />
                    )}
                  </div>
                </Button>
              ) : (
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              )}
            </SheetTrigger>
            <SheetTitle className="sr-only">GenZ Scholars</SheetTitle>
            <SheetContent side="right">
              <div className="flex flex-col h-full">
                <div onClick={() => navigate('/')} className="flex justify-between items-center py-4">
                  <div className="flex items-center gap-2">
                    <img src="/src/assets/genz-logo2.png" alt="Logo" className="h-8 w-8" />
                    <span className="text-xl font-bold">GenZ Scholars</span>
                  </div>
                </div>
                
                {!!user && (
                  <div className="flex items-center gap-3 mb-4 p-3 bg-muted/30 rounded-lg">
                    <div onClick={() => navigate('/profile')} className="h-10 w-10 rounded-full bg-muted overflow-hidden">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.username} className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-5 w-5 mx-auto my-2.5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{user.displayName || user.username}</p>
                      <p className="font-light text-xs">{user.email}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col gap-2 mt-4">
                  <Button variant="ghost" className="justify-start" onClick={toggleTheme}>
                    {theme === 'dark' ? (
                      <><Sun className="mr-2 h-4 w-4" /> Light Mode</>
                    ) : (
                      <><Moon className="mr-2 h-4 w-4" /> Dark Mode</>
                    )}
                  </Button>
                  
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" className="justify-start">
                        <Handshake className="mr-2 h-4 w-4" />
                        <span>Team</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="max-w-md" side="bottom">
                      <SheetHeader>
                        <SheetTitle>Meet Our Development Team</SheetTitle>
                      </SheetHeader>
                      <div className="py-4 space-y-6">
                        {developers.map((dev, index) => (
                          <div key={index} className="flex items-start space-x-4">
                            <img 
                              src={dev.avatar} 
                              alt={dev.name} 
                              className="h-12 w-12 rounded-full" 
                            />
                            <div>
                              <h3 className="text-sm font-semibold">{dev.name}</h3>
                              <p className="text-xs text-primary">{dev.role}</p>
                              <p className="text-xs text-muted-foreground mt-1 mb-2">
                                {dev.bio}
                              </p>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="h-7 px-2 text-xs" asChild>
                                  <a href={dev.github} target="_blank" rel="noopener noreferrer">GitHub</a>
                                </Button>
                                <Button variant="outline" size="sm" className="h-7 px-2 text-xs" asChild>
                                  <a href={dev.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </SheetContent>
                  </Sheet>
                  
                  {user?.isAdmin && <Button variant="ghost" className="justify-start relative">
                    <Bell className="mr-2 h-4 w-4" />
                    <span>Notifications</span>
                    <span className="absolute top-1/2 right-4 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-white">
                      3
                    </span>
                  </Button>}

                  <Button variant="ghost" className="justify-start" asChild>
                    <Link to="/communities">
                      <Users className="mr-2 h-4 w-4" />
                      <span>Explore</span>
                    </Link>
                  </Button>
                  
                  <Button variant="ghost" className="justify-start" asChild>
                    <Link to="/profile">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </Button>
                  <Button variant="ghost" className="justify-start" asChild>
                    <Link to="/settings">Settings</Link>
                  </Button>
                  <Button variant="ghost" className="justify-start" onClick={logout}>
                    Sign Out
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

export default Header 