import { WandSparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-[var(--background)]/80 backdrop-blur-lg border-b border-[var(--border)] shadow-sm">
      <div className="mx-auto flex items-center justify-between py-3 px-6">
        {/* Logo/Brand */}
        <span className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight text-[var(--primary)] font-sans">AItinerary</span>
          <WandSparkles className="h-6 w-6 text-[var(--primary)]" />
        </span>
        {/* Spacer for center (future nav) */}
        <span className="flex-1" />
        {/* Auth Buttons */}
        <div className="flex items-center gap-2">
          <Button variant="outline">Sign In</Button>
          <Button>Sign Up</Button>
        </div>
      </div>
    </header>
  );
} 