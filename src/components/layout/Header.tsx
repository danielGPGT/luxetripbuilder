import { useState } from 'react';
import { WandSparkles, Instagram, Github, Linkedin, User, Settings, LogOut, ChevronDown, Sun, Moon, Menu, X, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthProvider';
import { supabase } from '@/lib/supabase';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useTheme } from '@/components/ThemeProvider';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from '@/components/ui/navigation-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';

// Recent blog posts data
const recentPosts = [
  {
    slug: 'welcome-to-the-blog',
    title: 'Welcome to the AItinerary Blog',
    date: '2024-06-10',
    category: 'Company',
    readTime: '3 min read',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=200&fit=crop',
  },
  {
    slug: 'ai-in-travel',
    title: 'How AI is Transforming B2B Travel',
    date: '2024-06-09',
    category: 'Technology',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=200&fit=crop',
  },
  {
    slug: 'luxury-travel-trends-2024',
    title: 'Luxury Travel Trends to Watch in 2024',
    date: '2024-06-07',
    category: 'Trends',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&h=200&fit=crop',
  },
];

export function Header() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[var(--background)]/80 backdrop-blur-lg border-b border-[var(--border)] shadow-sm">
      <div className="w-full px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Logo/Brand - Always goes to homepage */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--primary)] font-sans">AItinerary</span>
          <WandSparkles className="h-5 w-5 sm:h-6 sm:w-6 text-[var(--primary)]" />
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink href="/how-it-works" className="text-base font-medium text-[var(--foreground)]">How It Works</NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href="/pricing" className="text-base font-medium text-[var(--foreground)]">Pricing</NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href="/features" className="text-base font-medium text-[var(--foreground)]">Features</NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-base font-medium text-[var(--foreground)]">Blog</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[400px] p-4">
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold">Recent Posts</h3>
                        <Link to="/blog" className="text-sm text-[var(--primary)] hover:underline">
                          View All
                        </Link>
                      </div>
                      {recentPosts.map((post) => (
                        <Link
                          key={post.slug}
                          to={`/blog/${post.slug}`}
                          className="flex gap-3 p-3 rounded-lg hover:bg-[var(--muted)] transition-colors group"
                        >
                          <div className="flex-shrink-0">
                            <img
                              src={post.image}
                              alt={post.title}
                              className="w-16 h-12 object-cover rounded-md"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm line-clamp-2 group-hover:text-[var(--primary)] transition-colors">
                              {post.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 text-xs text-[var(--muted-foreground)]">
                              <span className="bg-[var(--primary)]/10 text-[var(--primary)] px-2 py-0.5 rounded-full">
                                {post.category}
                              </span>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {post.readTime}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href="/about" className="text-base font-medium text-[var(--foreground)]">About</NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        
        {/* Right side - Social + Theme Toggle + Auth/User Section */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Social Media Icons - Hidden on mobile */}
          <div className="hidden sm:flex items-center gap-2">
            <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" title="Instagram">
              <Button variant="ghost" size="icon">
                <Instagram className="h-5 w-5 text-[var(--foreground)]" />
              </Button>
            </a>
            <a href="https://github.com/" target="_blank" rel="noopener noreferrer" title="GitHub">
              <Button variant="ghost" size="icon">
                <Github className="h-5 w-5 text-[var(--foreground)]" />
              </Button>
            </a>
            <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer" title="LinkedIn">
              <Button variant="ghost" size="icon">
                <Linkedin className="h-5 w-5 text-[var(--foreground)]" />
              </Button>
            </a>
          </div>
          
          {/* Theme Toggle */}
          <div className="flex items-center gap-1 bg-[var(--muted)] rounded-lg p-1">
            <Button
              variant={theme === "light" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTheme("light")}
              className={`h-8 px-3 transition-all duration-200 ${
                theme === "light" 
                  ? "bg-[var(--primary)] text-primary-foreground shadow-sm" 
                  : "hover:bg-[var(--muted-foreground)]/10 text-foreground"
              }`}
            >
              <Sun className="h-4 w-4" />
            </Button>
            <Button
              variant={theme === "dark" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTheme("dark")}
              className={`h-8 px-3 transition-all duration-200 ${
                theme === "dark" 
                  ? "bg-[var(--primary)] text-white shadow-sm" 
                  : "hover:bg-[var(--muted-foreground)]/10 text-foreground"
              }`}
            >
              <Moon className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Auth/User Section */}
          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* My Dashboard Button - Hidden on mobile */}
              <div className="hidden sm:block">
                <Link to="/dashboard">
                  <Button variant="default" size="sm">
                    My Dashboard
                  </Button>
                </Link>
              </div>
              
              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full">
                    <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-[var(--primary)] text-white">
                        {user.user_metadata?.name?.[0] || user.email?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.user_metadata?.name || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-3">
              <Link to="/login">
                <Button variant="outline" size="sm">Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-lg">
          <div className="px-4 py-4 space-y-4">
            {/* Mobile Navigation Links */}
            <nav className="space-y-2">
              <Link
                to="/how-it-works"
                className="block px-3 py-2 text-base font-medium text-[var(--foreground)] hover:bg-[var(--muted)] rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link
                to="/pricing"
                className="block px-3 py-2 text-base font-medium text-[var(--foreground)] hover:bg-[var(--muted)] rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                to="/features"
                className="block px-3 py-2 text-base font-medium text-[var(--foreground)] hover:bg-[var(--muted)] rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <div className="px-3 py-2">
                <div className="text-base font-medium text-[var(--foreground)] mb-2">Blog</div>
                <div className="space-y-2 ml-4">
                  {recentPosts.map((post) => (
                    <Link
                      key={post.slug}
                      to={`/blog/${post.slug}`}
                      className="block py-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {post.title}
                    </Link>
                  ))}
                  <Link
                    to="/blog"
                    className="block py-2 text-sm text-[var(--primary)] hover:underline"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    View All Posts →
                  </Link>
                </div>
              </div>
              <Link
                to="/about"
                className="block px-3 py-2 text-base font-medium text-[var(--foreground)] hover:bg-[var(--muted)] rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
            </nav>

            {/* Mobile Social Links */}
            <div className="flex items-center gap-2 pt-2 border-t border-[var(--border)]">
              <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" title="Instagram">
                <Button variant="ghost" size="icon">
                  <Instagram className="h-5 w-5 text-[var(--foreground)]" />
                </Button>
              </a>
              <a href="https://github.com/" target="_blank" rel="noopener noreferrer" title="GitHub">
                <Button variant="ghost" size="icon">
                  <Github className="h-5 w-5 text-[var(--foreground)]" />
                </Button>
              </a>
              <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer" title="LinkedIn">
                <Button variant="ghost" size="icon">
                  <Linkedin className="h-5 w-5 text-[var(--foreground)]" />
                </Button>
              </a>
            </div>

            {/* Mobile Auth Section */}
            {!user && (
              <div className="flex flex-col gap-2 pt-2 border-t border-[var(--border)]">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Sign In</Button>
                </Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </div>
            )}

            {user && (
              <div className="pt-2 border-t border-[var(--border)]">
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="default" className="w-full">My Dashboard</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
} 