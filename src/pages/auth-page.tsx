import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ModeToggle } from '@/components/theme/mode-toggle'
import { Eye, EyeOff, Mail, Lock, Loader2, Info } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import api from '@/lib/api'
import type { ApiResponseError } from '@/lib/api.d'
import { useMutation } from '@tanstack/react-query'
import { useToast } from '@/components/ui/use-toast'
import { useAuthStore } from '@/lib/stores/use-auth-store'
import { AxiosResponse } from 'axios'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

const websiteRules = [
  "Be respectful and considerate towards all community members",
  "Share only accurate and verified information",
  "Keep personal information private and secure",
  "Engage actively with educational content",
  "Participate in university events and discussions",
  "Support fellow students and faculty members"
]

const teamMembers = [
  {
    username: 'Fasih Hasan',
    role: 'Frontend Developer',
    avatar: '/src/assets/fasih.jpeg'
  },
  {
    username: 'Abdul Rahman Azam',
    role: 'Lead Developer',
    avatar: '/src/assets/abdulrahmanazam.png'
  },
  {
    username: 'Muhammed Owais',
    role: 'Backend Developer',
    avatar: '/src/assets/owais.jpeg'
  }
]

type LoginFormData = {
  email: string
  password: string
}

type RegisterFormData = {
  email: string
  password: string
  username: string
  confirmPassword: string
}

const emailRegex = /^[a-zA-Z0-9._%+-]+@\S+.\S+$/
const usernameRegex = /^[a-zA-Z0-9_]+$/

const AuthPage = () => {
  const { toast } = useToast();
  const { login, setError } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const { register: loginRegister, handleSubmit: handleLoginSubmit, formState: { errors: loginErrors }, reset: resetLogin } = useForm<LoginFormData>();
  const { register: registerRegister, handleSubmit: handleRegisterSubmit, formState: { errors: registerErrors }, reset: resetRegister } = useForm<RegisterFormData>();
  const navigate = useNavigate();

  const { mutate: loginFn, isPending: isLoginLoading, isSuccess: isLoginSuccess } = useMutation({
    mutationFn: (data: LoginFormData) => {
      return api.post('/user/login', data);
    },
    onSuccess: ({ data }: AxiosResponse<any, any>) => {
      login(data.user, data.token);
    },
    onError: (error: ApiResponseError) => {
      setError(error.message);
      toast({
        title: error.message,
        description: error.info,
        variant: 'destructive',
      })
    }
  });

  const { mutate: registerFn, isPending: isRegisterLoading, isSuccess: isRegisterSuccess } = useMutation({
    mutationFn: (data: RegisterFormData) => {
      return api.post('/user/register', { ...data, role: 'member' });
    },
    onSuccess: () => {
      navigate('/redirect');
    },
    onError: (error: ApiResponseError) => {
      setError(error.message);
      toast({
        title: error.message,
        description: error.info,
        variant: 'destructive',
      });
    }
  });

  useEffect(() => {
    if (isLoginSuccess)
      resetLogin();
  }, [isLoginSuccess]);

  useEffect(() => {
    if (isRegisterSuccess)
      resetRegister();
  }, [isRegisterSuccess]);
  
  return (
    <div className="fixed inset-0 flex items-center justify-center p-2 sm:p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm z-50">
      <div className="w-full max-w-4xl h-[95vh] sm:h-auto max-h-[95vh] bg-background/95 dark:bg-background/95 rounded-xl shadow-2xl flex flex-col md:flex-row overflow-hidden">
        {/* Left panel - Form */}
        <div className="w-full md:w-1/2 p-3 sm:p-4 md:p-6 flex items-center justify-center overflow-auto">
          <div className="w-full max-w-md py-2">
            <div className="text-center mb-4 relative">
              <div className="absolute right-0 top-0">
                <ModeToggle />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">GenZ Scholars</h1>
              <p className="text-muted-foreground text-xs sm:text-sm mt-1">Connect with your university community</p>
            </div>
            
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              {/* Sign in tab */}
              <TabsContent value="signin">
                <form onSubmit={handleLoginSubmit(data => loginFn(data))} className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm text-foreground">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        {...loginRegister("email", {
                          required: "Email is required",
                          pattern: {
                            value: emailRegex,
                            message: "Invalid email address"
                          }
                        })}
                        placeholder="university.email@edu.in"
                        className="pl-10 h-9"
                        disabled={isLoginLoading}
                      />
                    </div>
                    {loginErrors.email && <p className="text-xs text-red-500 dark:text-red-400">{loginErrors.email.message}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="password" className="text-sm text-foreground">Password</Label>
                      <Link to="#" className="text-xs text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        {...loginRegister("password", {
                          required: "Password is required",
                          minLength: {
                            value: 8,
                            message: "Password must be at least 8 characters"
                          }
                        })}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 h-9"
                        disabled={isLoginLoading}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-2.5"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoginLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                    {loginErrors.password && <p className="text-xs text-red-500 dark:text-red-400">{loginErrors.password.message}</p>}
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full h-9 text-sm"
                    disabled={isLoginLoading}
                  >
                    {false ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              {/* Sign up tab */}
              <TabsContent value="signup">
                <form onSubmit={handleRegisterSubmit(data => registerFn(data))} className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm text-foreground">Username</Label>
                    <Input
                      id="username"
                      {...registerRegister("username", {
                        required: "Username is required",
                        minLength: {
                          value: 3,
                          message: "Username must be at least 3 characters"
                        },
                        pattern: {
                          value: usernameRegex,
                          message: "Username must contain only letters, numbers and underscores"
                        }
                      })}
                      placeholder="john_doe"
                      className="h-9"
                      disabled={isRegisterLoading}
                    />
                    {registerErrors.username && <p className="text-xs text-red-500 dark:text-red-400">{registerErrors.username.message}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-sm text-foreground">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-email"
                        {...registerRegister("email", {
                          required: "Email is required",
                          pattern: {
                            value: emailRegex,
                            message: "Email must be a valid NU email"
                          }
                        })}
                        placeholder="university.email@edu.in"
                        className="pl-10 h-9"
                        disabled={isRegisterLoading}
                      />
                    </div>
                    {registerErrors.email && <p className="text-xs text-red-500 dark:text-red-400">{registerErrors.email.message}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-sm text-foreground">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-password"
                        {...registerRegister("password", {
                          required: "Password is required",
                          minLength: {
                            value: 8,
                            message: "Password must be at least 8 characters"
                          }
                        })}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 h-9"
                        disabled={isRegisterLoading}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-2.5"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isRegisterLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                    {registerErrors.password && <p className="text-xs text-red-500 dark:text-red-400">{registerErrors.password.message}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-sm text-foreground">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        {...registerRegister("confirmPassword", {
                          required: "Confirm password is required",
                          validate: (value, data) => {
                            if (value !== data.password)
                              return "Passwords do not match"
                          }
                        })}
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 h-9"
                        disabled={isRegisterLoading}
                      />
                    </div>
                    {registerErrors.confirmPassword && <p className="text-xs text-red-500 dark:text-red-400">{registerErrors.confirmPassword.message}</p>}
                  </div>
                  
                  <Button type="submit" className="w-full h-9 text-sm" disabled={isRegisterLoading}>
                    {isRegisterLoading ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Signing up...
                      </>
                    ) : (
                      "Sign Up"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Mobile Info Button */}
            <div className="md:hidden mt-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full gap-2">
                    <Info className="h-4 w-4" />
                    About GenZ Scholars
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[80vh]">
                  <SheetHeader>
                    <SheetTitle>About GenZ Scholars</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4 space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Meet Our Development Team</h3>
                      <div className="flex flex-wrap justify-center gap-3">
                        {teamMembers.map((member, index) => (
                          <div key={index} className="text-center">
                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/30 bg-primary/10 mx-auto">
                              <img 
                                src={member.avatar} 
                                alt={member.username} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <p className="font-medium mt-1">{member.username}</p>
                            <p className="text-sm opacity-90">{member.role}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Community Guidelines</h3>
                      <ul className="space-y-2 text-sm">
                        {websiteRules.map((rule, index) => (
                          <li key={index} className="flex items-start">
                            <span className="font-bold mr-1">•</span>
                            <span>{rule}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
        
        {/* Desktop Right panel - Information */}
        <div className="hidden md:block w-1/2 bg-primary/90 dark:bg-primary/80 text-primary-foreground overflow-auto">
          <div className="h-full p-6 flex flex-col">
            <div className="flex-1 flex flex-col justify-center items-center text-center">
              <h2 className="text-xl font-bold mb-3">Welcome to GenZ Scholars</h2>
              <p className="mb-4 max-w-md text-sm text-primary-foreground/90">
                Your university's digital hub for connecting students, sharing knowledge, and building a thriving academic community.
              </p>
              
              {/* Team members */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Meet Our Development Team</h3>
                <div className="flex flex-wrap justify-center gap-3">
                  {teamMembers.map((member, index) => (
                    <div key={index} className="text-center">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary-foreground/30 bg-primary-foreground/10 mx-auto">
                        <img 
                          src={member.avatar} 
                          alt={member.username} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="font-medium mt-1">{member.username}</p>
                      <p className="text-sm opacity-90">{member.role}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Website rules */}
              <div className="w-full max-w-md">
                <h3 className="text-lg font-semibold mb-2">Community Guidelines</h3>
                <ul className="space-y-2 text-sm text-primary-foreground/90">
                  {websiteRules.map((rule, index) => (
                    <li key={index} className="flex items-start">
                      <span className="font-bold mr-1">•</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthPage 