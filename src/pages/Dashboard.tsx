import { useAuth } from '@/lib/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState } from 'react';
import { loadItineraries, deleteItinerary, type SavedItinerary } from '@/lib/itineraryService';
import { toast } from 'sonner';
import { 
  Loader2, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar, 
  MapPin, 
  User, 
  Plus, 
  TrendingUp, 
  Globe, 
  Clock, 
  Star,
  Search,
  Filter,
  Download,
  Share2,
  Heart,
  Zap,
  Award,
  Users,
  DollarSign,
  Plane,
  Hotel,
  Utensils,
  Camera
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { UsageDashboard } from '@/components/UsageDashboard';

export function Dashboard() {
  const { user } = useAuth();
  const [itineraries, setItineraries] = useState<SavedItinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  };

  const filteredItineraries = itineraries.filter(itinerary =>
    itinerary.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    itinerary.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
    itinerary.client_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalBudget = itineraries.reduce((sum, it) => {
    const budget = it.preferences?.budget?.amount || 0;
    return sum + budget;
  }, 0);

  const averageBudget = itineraries.length > 0 ? totalBudget / itineraries.length : 0;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--primary)] via-[var(--primary)]/90 to-[var(--primary)]/70 p-8 text-white">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16 border-2 border-white/20">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="text-lg font-semibold">
                {user?.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {user?.email?.split('@')[0]}! 👋</h1>
              <p className="text-white/80">Ready to create your next luxury adventure?</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-5 w-5" />
                <span className="text-sm font-medium">Total Trips</span>
              </div>
              <div className="text-2xl font-bold">{itineraries.length}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5" />
                <span className="text-sm font-medium">Avg Budget</span>
              </div>
              <div className="text-2xl font-bold">${averageBudget.toLocaleString()}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5" />
                <span className="text-sm font-medium">This Month</span>
              </div>
              <div className="text-2xl font-bold">
                {itineraries.filter(it => {
                  const date = new Date(it.date_created);
                  const now = new Date();
                  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                }).length}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-5 w-5" />
                <span className="text-sm font-medium">Success Rate</span>
              </div>
              <div className="text-2xl font-bold">98%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <HoverCard>
          <HoverCardTrigger asChild>
        <Link to="/new-proposal">
              <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto w-12 h-12 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-[var(--primary)]/20 transition-colors">
                    <Plus className="h-6 w-6 text-[var(--primary)]" />
                  </div>
                  <h3 className="font-semibold mb-2">Create New Trip</h3>
                  <p className="text-sm text-muted-foreground">Start planning your next adventure</p>
                </CardContent>
              </Card>
        </Link>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-semibold">Create New Trip</h4>
              <p className="text-sm text-muted-foreground">
                Use our AI-powered planner to create a personalized luxury itinerary in minutes.
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>

        <HoverCard>
          <HoverCardTrigger asChild>
            <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="mx-auto w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                  <Search className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="font-semibold mb-2">Browse Templates</h3>
                <p className="text-sm text-muted-foreground">Explore curated travel templates</p>
              </CardContent>
            </Card>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-semibold">Browse Templates</h4>
              <p className="text-sm text-muted-foreground">
                Get inspired with our collection of premium travel templates for popular destinations.
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>

        <HoverCard>
          <HoverCardTrigger asChild>
            <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="mx-auto w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
                  <Download className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="font-semibold mb-2">Export PDF</h3>
                <p className="text-sm text-muted-foreground">Download your itineraries</p>
              </CardContent>
            </Card>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-semibold">Export PDF</h4>
              <p className="text-sm text-muted-foreground">
                Download your itineraries as beautiful PDF documents to share with clients.
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>

        <HoverCard>
          <HoverCardTrigger asChild>
            <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="mx-auto w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                  <Award className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="font-semibold mb-2">Premium Features</h3>
                <p className="text-sm text-muted-foreground">Unlock advanced tools</p>
              </CardContent>
            </Card>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-semibold">Premium Features</h4>
              <p className="text-sm text-muted-foreground">
                Upgrade to unlock advanced features like AI image generation and priority support.
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="itineraries" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="itineraries">My Itineraries</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="usage">Usage & Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="itineraries" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search itineraries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>

          {/* Itineraries Grid */}
          {filteredItineraries.length === 0 ? (
            <Card className="text-center py-12">
          <CardContent>
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Plane className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No itineraries found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? 'Try adjusting your search terms' : 'Start by creating your first itinerary'}
                </p>
                <Link to="/new-proposal">
                  <Button className="bg-[var(--primary)] hover:bg-[var(--primary)]/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Itinerary
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredItineraries.map((itinerary) => (
                <Card key={itinerary.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <div className="relative">
                    <div className="h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="h-8 w-8 mx-auto mb-2 text-[var(--primary)]" />
                        <p className="text-sm font-medium text-muted-foreground">{itinerary.destination}</p>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
                        {itinerary.days?.length || 0} days
                      </Badge>
                    </div>
              </div>
                  
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                      <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-[var(--primary)] transition-colors">
                        {itinerary.title}
                      </h3>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteItinerary(itinerary.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                    <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                        <span className="truncate">{itinerary.client_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                        <span>{formatDate(itinerary.date_created)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span>${(itinerary.preferences?.budget?.amount || 0).toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 group/btn">
                        <Eye className="h-4 w-4 mr-1 group-hover/btn:text-[var(--primary)]" />
                          View
                        </Button>
                        <Link to={`/edit-itinerary/${itinerary.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full group/btn">
                          <Edit className="h-4 w-4 mr-1 group-hover/btn:text-[var(--primary)]" />
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Trip Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Trips Created</span>
                    <span className="text-sm text-muted-foreground">{itineraries.length}</span>
                  </div>
                  <Progress value={Math.min((itineraries.length / 10) * 100, 100)} className="h-2" />
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Average Budget</span>
                    <span className="text-sm text-muted-foreground">${averageBudget.toLocaleString()}</span>
                  </div>
                  <Progress value={Math.min((averageBudget / 10000) * 100, 100)} className="h-2" />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">This Month</span>
                    <span className="text-sm text-muted-foreground">
                      {itineraries.filter(it => {
                        const date = new Date(it.date_created);
                        const now = new Date();
                        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                      }).length}
                    </span>
                  </div>
                  <Progress value={Math.min((itineraries.filter(it => {
                    const date = new Date(it.date_created);
                    const now = new Date();
                    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                  }).length / 5) * 100, 100)} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Popular Destinations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from(new Set(itineraries.map(it => it.destination)))
                    .slice(0, 5)
                    .map((destination, index) => (
                      <div key={destination} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {index + 1}
                          </div>
                          <span className="font-medium">{destination}</span>
                        </div>
                        <Badge variant="secondary">
                          {itineraries.filter(it => it.destination === destination).length}
                        </Badge>
                      </div>
                    ))}
                </div>
          </CardContent>
        </Card>
      </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {itineraries.slice(0, 5).map((itinerary, index) => (
                  <div key={itinerary.id} className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {itinerary.title.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium truncate">{itinerary.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {itinerary.days?.length || 0} days
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Created for {itinerary.client_name} • {itinerary.destination}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getTimeAgo(itinerary.date_created)}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Link to={`/edit-itinerary/${itinerary.id}`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <UsageDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
} 