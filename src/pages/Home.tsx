import { AuthTest } from '@/components/AuthTest';
import { ItineraryTest } from '@/components/ItineraryTest';

export function Home() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome to LuxeTripBuilder
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Your AI-powered luxury travel itinerary builder
        </p>
        <div className="space-y-8">
          <AuthTest />
          <ItineraryTest />
        </div>
      </main>
    </div>
  );
} 