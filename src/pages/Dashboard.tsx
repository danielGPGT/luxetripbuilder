import { useAuth } from '@/lib/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Itineraries</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Coming soon: List of your generated itineraries</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 