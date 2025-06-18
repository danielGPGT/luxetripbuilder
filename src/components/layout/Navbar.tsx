import { useAuth } from '@/lib/AuthProvider';
import { Button } from '@/components/ui/button';
import { Plus, Bell, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold">LuxeTripBuilder</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/builder">
              <Plus className="h-5 w-5" />
              <span className="sr-only">Create New Itinerary</span>
            </Link>
          </Button>

          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>

          <div className="relative">
            <Button variant="ghost" size="icon" onClick={() => signOut()}>
              <User className="h-5 w-5" />
              <span className="sr-only">User Menu</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
} 