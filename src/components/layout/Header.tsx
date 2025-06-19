import { WandSparkles, Instagram, Github, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthProvider';
import { supabase } from '@/lib/supabase';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu';
import { Link } from 'react-router-dom';

export function Header() {
  const { user } = useAuth();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload(); // Optional: force refresh to update UI
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[var(--background)]/80 backdrop-blur-lg border-b border-[var(--border)] shadow-sm">
      <div className="w-full px-4 sm:px-6 py-3 grid grid-cols-1 sm:grid-cols-[auto_1fr_auto] items-center gap-y-2">
        {/* Logo/Brand */}
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 justify-self-start hover:opacity-80 transition-opacity">
          <span className="text-2xl font-bold tracking-tight text-[var(--primary)] font-sans">AItinerary</span>
          <WandSparkles className="h-6 w-6 text-[var(--primary)]" />
        </Link>
        {/* Center nav links using NavigationMenu */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink href="/pricing" className="text-base font-medium text-[var(--foreground)]">Pricing</NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href="/features" className="text-base font-medium text-[var(--foreground)]">Features</NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink href="/about" className="text-base font-medium text-[var(--foreground)]">About</NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        {/* Social + Auth/User Section */}
        <div className="flex items-center gap-4 justify-self-end">
          {/* Social Media Icons */}
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
          {/* Auth/User Section */}
          {user ? (
            <>
              <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
        <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback>{user.user_metadata?.name?.[0] || user.email?.[0]}</AvatarFallback>
                </Avatar>
                <span className="hidden sm:block font-medium text-sm text-[var(--foreground)]">{user.user_metadata?.name || user.email}</span>
              </div>
            </>
          ) : (
            <>
              <Link to="/login">
          <Button variant="outline">Sign In</Button>
              </Link>
              <Link to="/signup">
          <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
} 