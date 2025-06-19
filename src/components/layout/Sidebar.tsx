import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Sun, Moon, Home, FilePlus2, Calendar, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/AuthProvider';
import LuxeLogo from '@/assets/Luxe.svg';
import { loadItineraries } from '@/lib/itineraryService';
import { useTheme } from '@/components/ThemeProvider';

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const [recentItineraries, setRecentItineraries] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { theme, setTheme } = useTheme();

  // Example nav items
  const navItems = [
    { label: 'Dashboard', icon: Home, href: '/dashboard' },
    { label: 'New Proposal', icon: FilePlus2, href: '/new-proposal' },
    { label: 'Itineraries', icon: Calendar, href: '/itineraries' },
    // Add more as needed
  ];

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      loadItineraries(user.id)
        .then((data) => setRecentItineraries(data.slice(0, 3)))
        .finally(() => setLoading(false));
    } else {
      setRecentItineraries([]);
    }
  }, [user?.id]);

  return (
    <aside className={`fixed left-0 top-0 h-screen z-40 bg-background border-r shadow-lg transition-all duration-300 flex flex-col ${collapsed ? 'w-20' : 'w-72'}`}>
      {/* Top: Logo & Collapse Button */}
      <div className="flex items-center justify-between h-20 px-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <img src={LuxeLogo} alt="AItinerary Logo" className="h-8 w-8" />
          <span className={`font-bold text-xl transition-opacity duration-200 ${collapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'} text-[var(--foreground)]`}>AItinerary</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2">
        {navItems.map(item => (
          <Link to={item.href} key={item.href}>
            <Button
              variant={location.pathname === item.href ? 'secondary' : 'ghost'}
              className={`w-full flex items-center gap-3 my-1 ${collapsed ? 'justify-center' : 'justify-start'}`}
            >
              <item.icon className="h-5 w-5" />
              {!collapsed && <span className="text-[var(--foreground)]">{item.label}</span>}
            </Button>
          </Link>
          ))}
      </nav>

      {/* Projects/Recent Itineraries */}
      {user && !collapsed && (
        <div className="px-4 py-2">
          <div className="font-semibold text-sm mb-2 text-[var(--muted-foreground)]">Recent Itineraries</div>
          <ScrollArea className="max-h-32">
            {loading ? (
              <div className="text-xs text-muted-foreground px-2 py-1">Loading...</div>
            ) : recentItineraries.length === 0 ? (
              <div className="text-xs text-muted-foreground px-2 py-1">No itineraries</div>
            ) : (
              recentItineraries.map(it => (
                <Link to={`/itinerary/${it.id}`} key={it.id}>
                  <Button variant="ghost" className="w-full justify-start my-1 truncate">
                    <span className="truncate">{it.title.length > 22 ? it.title.slice(0, 22) + '…' : it.title}</span>
                  </Button>
                </Link>
              ))
            )}
          </ScrollArea>
          {/* TODO: Add 'Show more' functionality if needed */}
        </div>
      )}

      {/* Bottom: Theme Switcher & User */}
      <div className="mt-auto w-full px-4 py-4 flex flex-col gap-4">
        <div className="flex items-center gap-2 justify-center mb-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme('light')}
            aria-pressed={theme === 'light'}
          >
            <Sun className={theme === 'light' ? 'text-yellow-500' : ''} />
          </Button>
              <Button
                variant="ghost"
            size="icon"
            onClick={() => setTheme('dark')}
            aria-pressed={theme === 'dark'}
              >
            <Moon className={theme === 'dark' ? 'text-blue-500' : ''} />
              </Button>
        </div>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback>{user?.user_metadata?.name?.[0] || user?.email?.[0]}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div>
              <div className="font-medium text-[var(--foreground)]">{user?.user_metadata?.name || user?.email || "User Name"}</div>
              <div className="text-xs text-muted-foreground">{user?.email || "user@email.com"}</div>
          </div>
        )}
        </div>
    </div>
    </aside>
  );
} 