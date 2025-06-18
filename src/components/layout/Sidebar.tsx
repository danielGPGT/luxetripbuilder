import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Settings,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/lib/AuthProvider';
import { ItineraryService } from '@/lib/itineraryService';
import { useEffect } from 'react';
import type { SavedItinerary } from '@/lib/itineraryService';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [recentItineraries, setRecentItineraries] = useState<SavedItinerary[]>([]);
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const itineraryService = new ItineraryService(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );
      
      itineraryService.getUserItineraries(user.id)
        .then(setRecentItineraries)
        .catch(console.error);
    }
  }, [user]);

  const navItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: 'Builder',
      href: '/builder',
      icon: FileText,
    },
    {
      title: 'Settings',
      href: '/settings',
      icon: Settings,
    },
  ];

  return (
    <div
      className={cn(
        'relative flex h-full flex-col border-r bg-background ',
        isCollapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      <div className="flex h-16 items-center justify-between px-4">
        {!isCollapsed && <span className="text-lg font-semibold">Navigation</span>}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 py-2">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant={location.pathname === item.href ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-start',
                isCollapsed && 'justify-center'
              )}
              asChild
            >
              <Link to={item.href}>
                <item.icon className="mr-2 h-4 w-4" />
                {!isCollapsed && item.title}
              </Link>
            </Button>
          ))}
        </div>

        {!isCollapsed && recentItineraries.length > 0 && (
          <div className="mt-6 space-y-1">
            <h4 className="px-2 text-sm font-medium">Recent Itineraries</h4>
            {recentItineraries.slice(0, 5).map((itinerary) => (
              <Button
                key={itinerary.id}
                variant="ghost"
                className="w-full justify-start"
                asChild
              >
                <Link to={`/itinerary/${itinerary.id}`}>
                  <FileText className="mr-2 h-4 w-4" />
                  {itinerary.title}
                </Link>
              </Button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
} 