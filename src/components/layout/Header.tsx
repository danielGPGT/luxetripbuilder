import { useState } from 'react';
import { WandSparkles, Instagram, Github, Linkedin, User, Settings, LogOut, ChevronDown, Sun, Moon, Menu, X, Calendar, Clock, Phone, Mail, TrendingUp, Star } from 'lucide-react';
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
import { Link, useLocation } from 'react-router-dom';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import LuxeLogo from '@/assets/imgs/logo.svg';

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
  const location = useLocation();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[var(--background)]/80 backdrop-blur-lg border-b border-[var(--border)] shadow-sm">
      {/* Top Header with Contact Details */}
      <div className="bg-[var(--primary)] text-white text-sm">
        <div className="px-4 py-2">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            {/* Contact Info */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>support@aitinerary.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Mon-Fri 9AM-6PM EST</span>
              </div>
            </div>
            
            {/* Quick Links */}
            <div className="flex items-center gap-4">
              <a href="/support" className="hover:text-white/80 transition-colors">
                Support
              </a>
              <a href="/contact" className="hover:text-white/80 transition-colors">
                Contact
              </a>
              <a href="/demo" className="hover:text-white/80 transition-colors">
                Book Demo
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="w-full px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Logo/Brand - Always goes to homepage */}
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src={LuxeLogo} alt="Luxe" className="h-10 sm:h-14" />
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink 
                  href="/" 
                  className={`text-base font-medium transition-colors ${
                    location.pathname === '/' 
                      ? 'text-[var(--primary)] font-semibold' 
                      : 'text-[var(--foreground)] hover:text-[var(--primary)]'
                  }`}
                >
                  Home
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink 
                  href="/how-it-works" 
                  className={`text-base font-medium transition-colors ${
                    location.pathname === '/how-it-works' 
                      ? 'text-[var(--primary)] font-semibold' 
                      : 'text-[var(--foreground)] hover:text-[var(--primary)]'
                  }`}
                >
                  How It Works
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink 
                  href="/pricing" 
                  className={`text-base font-medium transition-colors ${
                    location.pathname === '/pricing' 
                      ? 'text-[var(--primary)] font-semibold' 
                      : 'text-[var(--foreground)] hover:text-[var(--primary)]'
                  }`}
                >
                  Pricing
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink 
                  href="/features" 
                  className={`text-base font-medium transition-colors ${
                    location.pathname === '/features' 
                      ? 'text-[var(--primary)] font-semibold' 
                      : 'text-[var(--foreground)] hover:text-[var(--primary)]'
                  }`}
                >
                  Features
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger 
                  className={`text-base font-medium transition-colors ${
                    location.pathname.startsWith('/blog') 
                      ? 'text-[var(--primary)] font-semibold' 
                      : 'text-[var(--foreground)] hover:text-[var(--primary)]'
                  }`}
                >
                  Blog
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[750px] p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Recent Posts Section */}
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-semibold text-[var(--foreground)]">Recent Posts</h3>
                          <Link to="/blog" className="text-sm text-[var(--primary)] hover:underline font-medium">
                            View All Posts →
                          </Link>
                        </div>
                        <div className="space-y-4">
                          {recentPosts.map((post) => (
                            <Link
                              key={post.slug}
                              to={`/blog/${post.slug}`}
                              className="flex gap-4 p-4 rounded-lg hover:bg-[var(--muted)] transition-all duration-200 group border border-transparent hover:border-[var(--border)]"
                            >
                              <div className="flex-shrink-0">
                                <img
                                  src={post.image}
                                  alt={post.title}
                                  className="w-20 h-16 object-cover rounded-md group-hover:scale-105 transition-transform duration-200"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm line-clamp-2 group-hover:text-[var(--primary)] transition-colors mb-3">
                                  {post.title}
                                </h4>
                                <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
                                  <span className="bg-[var(--primary)]/10 text-[var(--primary)] px-3 py-1 rounded-full font-medium">
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

                      {/* Categories & Quick Links */}
                      <div>
                        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-6">Categories</h3>
                        <div className="space-y-3 mb-8">
                          <Link to="/blog/category/technology" className="flex items-center gap-4 p-3 rounded-lg hover:bg-[var(--muted)] transition-colors group">
                            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                              <WandSparkles className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                              <div className="font-medium text-sm group-hover:text-[var(--primary)] transition-colors mb-1">Technology</div>
                              <div className="text-xs text-[var(--muted-foreground)]">AI, APIs, & Innovation</div>
                            </div>
                          </Link>
                          <Link to="/blog/category/business" className="flex items-center gap-4 p-3 rounded-lg hover:bg-[var(--muted)] transition-colors group">
                            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                              <TrendingUp className="h-5 w-5 text-green-500" />
                            </div>
                            <div>
                              <div className="font-medium text-sm group-hover:text-[var(--primary)] transition-colors mb-1">Business</div>
                              <div className="text-xs text-[var(--muted-foreground)]">Strategy & Growth</div>
                            </div>
                          </Link>
                          <Link to="/blog/category/trends" className="flex items-center gap-4 p-3 rounded-lg hover:bg-[var(--muted)] transition-colors group">
                            <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                              <Star className="h-5 w-5 text-purple-500" />
                            </div>
                            <div>
                              <div className="font-medium text-sm group-hover:text-[var(--primary)] transition-colors mb-1">Trends</div>
                              <div className="text-xs text-[var(--muted-foreground)]">Industry Insights</div>
                            </div>
                          </Link>
                        </div>

                        {/* Newsletter Signup */}
                        <div className="bg-[var(--muted)]/50 rounded-lg p-6 border border-[var(--border)]">
                          <h4 className="font-medium text-sm mb-3">Stay Updated</h4>
                          <p className="text-xs text-[var(--muted-foreground)] mb-4 leading-relaxed">
                            Get the latest travel tech insights delivered to your inbox.
                          </p>
                          <div className="flex gap-3">
                            <input
                              type="email"
                              placeholder="Enter your email"
                              className="flex-1 px-4 py-3 text-sm bg-[var(--background)] border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                            />
                            <Button size="sm" className="px-4 py-3 text-xs">
                              Subscribe
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink 
                  href="/about" 
                  className={`text-base font-medium transition-colors ${
                    location.pathname === '/about' 
                      ? 'text-[var(--primary)] font-semibold' 
                      : 'text-[var(--foreground)] hover:text-[var(--primary)]'
                  }`}
                >
                  About
                </NavigationMenuLink>
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
              
              {/* User Profile Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full hover:bg-[var(--muted)] transition-all duration-200 hover:scale-105 focus:scale-105 focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
                  >
                    <Avatar className="h-9 w-9 sm:h-10 sm:w-10 ring-2 ring-transparent transition-all duration-200 group-hover:ring-[var(--primary)]/20">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/80 text-white font-semibold">
                        {user.user_metadata?.name?.[0] || user.email?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-64 p-2 mt-2 border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-xl shadow-xl rounded-xl" 
                  align="end" 
                  sideOffset={8}
                >
                  <div className="p-3">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.user_metadata?.avatar_url} />
                          <AvatarFallback className="bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/80 text-white font-semibold">
                            {user.user_metadata?.name?.[0] || user.email?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold leading-none text-[var(--foreground)] truncate">
                            {user.user_metadata?.name || 'User'}
                          </p>
                          <p className="text-xs leading-none text-[var(--muted-foreground)] mt-1 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="my-2 h-px bg-[var(--border)]" />
                  
                  <div className="space-y-1">
                    <Link 
                      to="/dashboard" 
                      className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-[var(--muted)] transition-colors duration-150 cursor-pointer group"
                    >
                      <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center group-hover:bg-blue-500/20 transition-colors duration-150">
                        <User className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-medium">Dashboard</span>
                        <p className="text-xs text-[var(--muted-foreground)]">View your trips & bookings</p>
                      </div>
                    </Link>
                    
                    <Link 
                      to="/settings" 
                      className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-[var(--muted)] transition-colors duration-150 cursor-pointer group"
                    >
                      <div className="w-8 h-8 bg-gray-500/10 rounded-lg flex items-center justify-center group-hover:bg-gray-500/20 transition-colors duration-150">
                        <Settings className="h-4 w-4 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-medium">Settings</span>
                        <p className="text-xs text-[var(--muted-foreground)]">Manage your account</p>
                      </div>
                    </Link>
                  </div>
                  
                  <div className="my-2 h-px bg-[var(--border)]" />
                  
                  <button 
                    onClick={handleSignOut} 
                    className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-red-500/10 transition-colors duration-150 cursor-pointer group text-red-600 focus:text-red-600 focus:bg-red-500/10"
                  >
                    <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center group-hover:bg-red-500/20 transition-colors duration-150">
                      <LogOut className="h-4 w-4 text-red-500" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium">Sign out</span>
                      <p className="text-xs text-[var(--muted-foreground)]">Log out of your account</p>
                    </div>
                  </button>
                </PopoverContent>
              </Popover>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-3">
              <Link to="/login">
                <Button variant="outline" size="sm">Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">Start Free Trial</Button>
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
                to="/"
                className={`block px-3 py-2 text-base font-medium rounded-md transition-colors ${
                  location.pathname === '/' 
                    ? 'text-[var(--primary)] bg-[var(--primary)]/10 font-semibold' 
                    : 'text-[var(--foreground)] hover:bg-[var(--muted)]'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/how-it-works"
                className={`block px-3 py-2 text-base font-medium rounded-md transition-colors ${
                  location.pathname === '/how-it-works' 
                    ? 'text-[var(--primary)] bg-[var(--primary)]/10 font-semibold' 
                    : 'text-[var(--foreground)] hover:bg-[var(--muted)]'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link
                to="/pricing"
                className={`block px-3 py-2 text-base font-medium rounded-md transition-colors ${
                  location.pathname === '/pricing' 
                    ? 'text-[var(--primary)] bg-[var(--primary)]/10 font-semibold' 
                    : 'text-[var(--foreground)] hover:bg-[var(--muted)]'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                to="/features"
                className={`block px-3 py-2 text-base font-medium rounded-md transition-colors ${
                  location.pathname === '/features' 
                    ? 'text-[var(--primary)] bg-[var(--primary)]/10 font-semibold' 
                    : 'text-[var(--foreground)] hover:bg-[var(--muted)]'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <div className="px-3 py-2">
                <div className={`text-base font-medium mb-2 ${
                  location.pathname.startsWith('/blog') 
                    ? 'text-[var(--primary)] font-semibold' 
                    : 'text-[var(--foreground)]'
                }`}>
                  Blog
                </div>
                <div className="space-y-2 ml-4">
                  {recentPosts.map((post) => (
                    <Link
                      key={post.slug}
                      to={`/blog/${post.slug}`}
                      className={`block py-2 text-sm transition-colors ${
                        location.pathname === `/blog/${post.slug}` 
                          ? 'text-[var(--primary)] font-medium' 
                          : 'text-[var(--muted-foreground)] hover:text-[var(--primary)]'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {post.title}
                    </Link>
                  ))}
                  <Link
                    to="/blog"
                    className={`block py-2 text-sm transition-colors ${
                      location.pathname === '/blog' 
                        ? 'text-[var(--primary)] font-medium' 
                        : 'text-[var(--primary)] hover:underline'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    View All Posts →
                  </Link>
                </div>
              </div>
              <Link
                to="/about"
                className={`block px-3 py-2 text-base font-medium rounded-md transition-colors ${
                  location.pathname === '/about' 
                    ? 'text-[var(--primary)] bg-[var(--primary)]/10 font-semibold' 
                    : 'text-[var(--foreground)] hover:bg-[var(--muted)]'
                }`}
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