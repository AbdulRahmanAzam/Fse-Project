import { useState } from 'react'
import { useTheme } from '../components/theme/theme-provider'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Eye, EyeOff, Github, Mail, Lock, Loader2 } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'

const AuthPage = () => {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoginLoading, setIsLoginLoading] = useState(false)
  const [isRegisterLoading, setIsRegisterLoading] = useState(false)
  
  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  })
  
  // Register form state
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  
  // Validation state
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  
  // Handle login form change
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setLoginForm({
      ...loginForm,
      [name]: value
    })
    
    // Clear error when typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      })
    }
  }
  
  // Handle register form change
  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setRegisterForm({
      ...registerForm,
      [name]: value
    })
    
    // Clear error when typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      })
    }
  }
  
  // Validate login form
  const validateLogin = () => {
    const newErrors: {[key: string]: string} = {}
    
    if (!loginForm.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(loginForm.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!loginForm.password) {
      newErrors.password = 'Password is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  // Validate register form
  const validateRegister = () => {
    const newErrors: {[key: string]: string} = {}
    
    if (!registerForm.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!registerForm.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(registerForm.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!registerForm.password) {
      newErrors.password = 'Password is required'
    } else if (registerForm.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }
    
    if (registerForm.password !== registerForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  // Handle login submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateLogin()) {
      setIsLoginLoading(true)
      // Normally would call API here
      console.log('Login form submitted:', loginForm)
      
      // Redirect to home page on successful login
      setTimeout(() => {
        navigate('/', { replace: true })
        setIsLoginLoading(false)
      }, 1000)
    }
  }
  
  // Handle register submit
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateRegister()) {
      setIsRegisterLoading(true)
      // Normally would call API here
      console.log('Register form submitted:', registerForm)
      
      // Redirect to home page on successful registration
      setTimeout(() => {
        navigate('/', { replace: true })
        setIsRegisterLoading(false)
      }, 1000)
    }
  }
  
  // Team members data
  const teamMembers = [
    {
      name: 'Fasih Hasan',
      role: 'Frontend Developer',
      avatar: '/src/assets/fasih.jpeg'
    },
    {
      name: 'Abdul Rahman Azam',
      role: 'Lead Developer',
      avatar: '/src/assets/abdulrahmanazam.png'
    },
    {
      name: 'Muhammed Owais',
      role: 'Backend Developer',
      avatar: '/src/assets/owais.jpeg'
    }
  ]
  
  // Website rules
  const websiteRules = [
    "Be respectful and considerate towards all community members",
    "Share only accurate and verified information",
    "Keep personal information private and secure",
    "Engage actively with educational content",
    "Participate in university events and discussions",
    "Support fellow students and faculty members"
  ]
  
  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/50 dark:bg-white/55 backdrop-blur-sm z-50">
      <div className="w-full max-w-4xl h-auto max-h-[90vh] bg-background/95 dark:bg-background/95 border border-border rounded-xl shadow-2xl flex flex-col md:flex-row overflow-hidden">
        {/* Left panel - Form */}
        <div className="md:w-1/2 p-4 md:p-6 flex items-center justify-center overflow-auto">
          <div className="w-full max-w-md py-2">
            <div className="text-center mb-4">
              <h1 className="text-2xl font-bold text-foreground">GenZ Scholars</h1>
              <p className="text-muted-foreground text-sm mt-1">Connect with your university community</p>
            </div>
            
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleLoginSubmit} className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm text-foreground">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="university.email@edu.in"
                        className="pl-10 h-9"
                        value={loginForm.email}
                        onChange={handleLoginChange}
                        disabled={isLoginLoading}
                      />
                    </div>
                    {errors.email && <p className="text-xs text-red-500 dark:text-red-400">{errors.email}</p>}
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
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 h-9"
                        value={loginForm.password}
                        onChange={handleLoginChange}
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
                    {errors.password && <p className="text-xs text-red-500 dark:text-red-400">{errors.password}</p>}
                  </div>
                  
                  <Button type="submit" className="w-full h-9 text-sm" disabled={isLoginLoading}>
                    {isLoginLoading ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                  
                  <div className="relative my-3">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-background dark:bg-background px-2 text-muted-foreground text-xs">Or continue with</span>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full h-9 text-sm" type="button" disabled={isLoginLoading}>
                    <Github className="mr-2 h-3 w-3" />
                    Github
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm text-foreground">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      className="h-9"
                      value={registerForm.name}
                      onChange={handleRegisterChange}
                      disabled={isRegisterLoading}
                    />
                    {errors.name && <p className="text-xs text-red-500 dark:text-red-400">{errors.name}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-sm text-foreground">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-email"
                        name="email"
                        type="email"
                        placeholder="university.email@edu.in"
                        className="pl-10 h-9"
                        value={registerForm.email}
                        onChange={handleRegisterChange}
                        disabled={isRegisterLoading}
                      />
                    </div>
                    {errors.email && <p className="text-xs text-red-500 dark:text-red-400">{errors.email}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-sm text-foreground">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 h-9"
                        value={registerForm.password}
                        onChange={handleRegisterChange}
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
                    {errors.password && <p className="text-xs text-red-500 dark:text-red-400">{errors.password}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-sm text-foreground">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className="h-9"
                      value={registerForm.confirmPassword}
                      onChange={handleRegisterChange}
                      disabled={isRegisterLoading}
                    />
                    {errors.confirmPassword && <p className="text-xs text-red-500 dark:text-red-400">{errors.confirmPassword}</p>}
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
          </div>
        </div>
        
        {/* Right panel - Information */}
        <div className="md:w-1/2 bg-primary/90 dark:bg-primary/80 text-primary-foreground overflow-auto">
          <div className="h-full p-4 md:p-6 flex flex-col">
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
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-primary-foreground/30 bg-primary-foreground/10 mx-auto">
                        <img 
                          src={member.avatar} 
                          alt={member.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="font-medium mt-1 text-sm">{member.name}</p>
                      <p className="text-xs opacity-90">{member.role}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Website rules */}
              <div className="w-full max-w-md">
                <h3 className="text-lg font-semibold mb-2">Community Guidelines</h3>
                <ul className="space-y-1 text-left text-sm text-primary-foreground/90">
                  {websiteRules.map((rule, index) => (
                    <li key={index} className="flex items-start">
                      <span className="font-bold mr-1">•</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="mt-auto text-center opacity-75 text-xs">
              <p>© {new Date().getFullYear()} GenZ Scholars. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthPage 