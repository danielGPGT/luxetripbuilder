import { useAuth } from '@/lib/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { loadItineraries, deleteItinerary, type SavedItinerary } from '@/lib/itineraryService';
import { toast } from 'sonner';
import { Loader2, Eye, Edit, Trash2, Calendar, MapPin, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const { user } = useAuth();
  const [itineraries, setItineraries] = useState<SavedItinerary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserItineraries();
    }
  }, [user]);

  const loadUserItineraries = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userItineraries = await loadItineraries(user.id);
      setItineraries(userItineraries);
    } catch (error) {
      console.error('Failed to load itineraries:', error);
      toast.error('Failed to load itineraries');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItinerary = async (id: string) => {
    if (!confirm('Are you sure you want to delete this itinerary?')) return;
    
    try {
      await deleteItinerary(id);
      setItineraries(itineraries.filter(it => it.id !== id));
      toast.success('Itinerary deleted successfully');
    } catch (error) {
      console.error('Failed to delete itinerary:', error);
      toast.error('Failed to delete itinerary');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <Link to="/new-proposal">
          <Button className="bg-[var(--primary)] hover:bg-[var(--primary)]/90">
            Create New Itinerary
          </Button>
        </Link>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Itineraries ({itineraries.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {itineraries.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No itineraries yet</p>
                <Link to="/new-proposal">
                  <Button>Create Your First Itinerary</Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {itineraries.map((itinerary) => (
                  <Card key={itinerary.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-semibold text-lg line-clamp-2">{itinerary.title}</h3>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteItinerary(itinerary.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                          {itinerary.client_name}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {itinerary.destination}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {formatDate(itinerary.date_created)}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Link to={`/edit-itinerary/${itinerary.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 