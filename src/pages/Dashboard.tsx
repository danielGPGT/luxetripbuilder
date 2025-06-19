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
  Camera,
  Sparkles,
  Crown,
  Trophy,
  Target,
  BarChart3,
  Activity,
  Compass
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--primary)] via-[var(--primary)]/90 to-[var(--primary)]/70 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12 blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-20 w-20 border-4 border-white/20 shadow-lg">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="text-xl font-semibold bg-white/20">
                {user?.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-yellow-300" />
                <span className="text-sm font-medium text-white/80">Premium Member</span>
              </div>
              <h1 className="text-4xl font-bold">Welcome back, {user?.email?.split('@')[0]}! 👋</h1>
              <p className="text-white/80 text-lg">Ready to create your next luxury adventure?</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Globe className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">Total Trips</span>
              </div>
              <div className="text-3xl font-bold">{itineraries.length}</div>
              <div className="text-xs text-white/60 mt-1">Luxury experiences</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <DollarSign className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">Avg Budget</span>
              </div>
              <div className="text-3xl font-bold">${averageBudget.toLocaleString()}</div>
              <div className="text-xs text-white/60 mt-1">Per itinerary</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">This Month</span>
              </div>
              <div className="text-3xl font-bold">
                {itineraries.filter(it => {
                  const date = new Date(it.date_created);
                  const now = new Date();
                  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                }).length}
              </div>
              <div className="text-xs text-white/60 mt-1">New adventures</div>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Crown className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">Success Rate</span>
              </div>
              <div className="text-3xl font-bold">98%</div>
              <div className="text-xs text-white/60 mt-1">Client satisfaction</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <HoverCard>
          <HoverCardTrigger asChild>
            <Link to="/new-proposal">
              <Card className="hover:shadow-2xl transition-all duration-300 cursor-pointer group border-0 bg-gradient-to-br from-[var(--primary)]/5 to-[var(--primary)]/10">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]/80 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Plus className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 group-hover:text-[var(--primary)] transition-colors">Create New Trip</h3>
                  <p className="text-sm text-muted-foreground">Start planning your next adventure</p>
                  <div className="mt-3 flex items-center justify-center gap-1 text-xs text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity">
                    <Zap className="h-3 w-3" />
                    <span>AI Powered</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Create New Trip
              </h4>
              <p className="text-sm text-muted-foreground">
                Use our AI-powered planner to create a personalized luxury itinerary in minutes.
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>

        <HoverCard>
          <HoverCardTrigger asChild>
            <Card className="hover:shadow-2xl transition-all duration-300 cursor-pointer group border-0 bg-gradient-to-br from-blue-500/5 to-blue-500/10">
              <CardContent className="p-6 text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Search className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors">Browse Templates</h3>
                <p className="text-sm text-muted-foreground">Explore curated travel templates</p>
                <div className="mt-3 flex items-center justify-center gap-1 text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Compass className="h-3 w-3" />
                  <span>Curated</span>
                </div>
              </CardContent>
            </Card>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Compass className="h-4 w-4" />
                Browse Templates
              </h4>
              <p className="text-sm text-muted-foreground">
                Get inspired with our collection of premium travel templates for popular destinations.
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>

        <HoverCard>
          <HoverCardTrigger asChild>
            <Card className="hover:shadow-2xl transition-all duration-300 cursor-pointer group border-0 bg-gradient-to-br from-green-500/5 to-green-500/10">
              <CardContent className="p-6 text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Download className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-green-600 transition-colors">Export PDF</h3>
                <p className="text-sm text-muted-foreground">Download your itineraries</p>
                <div className="mt-3 flex items-center justify-center gap-1 text-xs text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trophy className="h-3 w-3" />
                  <span>Premium Quality</span>
                </div>
              </CardContent>
            </Card>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Export PDF
              </h4>
              <p className="text-sm text-muted-foreground">
                Download your itineraries as beautiful PDF documents to share with clients.
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>

        <HoverCard>
          <HoverCardTrigger asChild>
            <Card className="hover:shadow-2xl transition-all duration-300 cursor-pointer group border-0 bg-gradient-to-br from-purple-500/5 to-purple-500/10">
              <CardContent className="p-6 text-center">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-purple-600 transition-colors">Premium Features</h3>
                <p className="text-sm text-muted-foreground">Unlock advanced tools</p>
                <div className="mt-3 flex items-center justify-center gap-1 text-xs text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Crown className="h-3 w-3" />
                  <span>Exclusive</span>
                </div>
              </CardContent>
            </Card>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Crown className="h-4 w-4" />
                Premium Features
              </h4>
              <p className="text-sm text-muted-foreground">
                Upgrade to unlock advanced features like AI image generation and priority support.
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="itineraries" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1 rounded-2xl">
          <TabsTrigger value="itineraries" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md">
            <Globe className="h-4 w-4 mr-2" />
            My Itineraries
          </TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="activity" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md">
            <Activity className="h-4 w-4 mr-2" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="usage" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md">
            <Target className="h-4 w-4 mr-2" />
            Usage & Plans
          </TabsTrigger>
        </TabsList>

        <TabsContent value="itineraries" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search your luxury itineraries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-input rounded-2xl bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2 px-6 py-3 rounded-2xl">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>

          {/* Itineraries Grid */}
          {filteredItineraries.length === 0 ? (
            <Card className="text-center py-16 border-0 bg-gradient-to-br from-muted/30 to-muted/10">
              <CardContent>
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/10 rounded-3xl flex items-center justify-center mb-6">
                  <Plane className="h-10 w-10 text-[var(--primary)]" />
                </div>
                <h3 className="text-xl font-bold mb-3">No itineraries found</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {searchTerm ? 'Try adjusting your search terms' : 'Start by creating your first luxury itinerary'}
                </p>
                <Link to="/new-proposal">
                  <Button className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 px-8 py-3 rounded-2xl shadow-lg">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Itinerary
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredItineraries.map((itinerary) => {
                const heroImage = itinerary.days?.[0]?.imageUrl;
                return (
                  <Card key={itinerary.id} className="group hover:shadow-2xl transition-all duration-500 overflow-hidden border-0 bg-gradient-to-br from-white to-muted/20 hover:scale-[1.02]">
                    <div className="relative">
                      {/* Hero Image */}
                      <div className="h-48 bg-gradient-to-br from-blue-500/20 to-purple-500/20 relative overflow-hidden">
                        {heroImage ? (
                          <img 
                            src={heroImage} 
                            alt={itinerary.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center">
                              <MapPin className="h-12 w-12 mx-auto mb-3 text-[var(--primary)]/60" />
                              <p className="text-sm font-medium text-muted-foreground">{itinerary.destination}</p>
                            </div>
                          </div>
                        )}
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                        
                        {/* Badge */}
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-white/90 backdrop-blur-sm text-black font-semibold border-0 shadow-lg">
                            <Calendar className="h-3 w-3 mr-1" />
                            {itinerary.days?.length || 0} days
                          </Badge>
                        </div>
                        
                        {/* Action buttons */}
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteItinerary(itinerary.id)}
                            className="bg-white/90 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-full p-2 shadow-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-lg line-clamp-2 group-hover:text-[var(--primary)] transition-colors">
                          {itinerary.title}
                        </h3>
                      </div>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                          <div className="w-8 h-8 bg-[var(--primary)]/10 rounded-lg flex items-center justify-center">
                            <User className="h-4 w-4 text-[var(--primary)]" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Client</p>
                            <p className="text-sm font-semibold truncate">{itinerary.client_name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                          <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                            <MapPin className="h-4 w-4 text-blue-500" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Destination</p>
                            <p className="text-sm font-semibold">{itinerary.destination}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                          <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center">
                            <DollarSign className="h-4 w-4 text-green-500" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Budget</p>
                            <p className="text-sm font-semibold">${(itinerary.preferences?.budget?.amount || 0).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button variant="outline" size="sm" className="flex-1 group/btn rounded-xl">
                          <Eye className="h-4 w-4 mr-2 group-hover/btn:text-[var(--primary)]" />
                          View
                        </Button>
                        <Link to={`/edit-itinerary/${itinerary.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full group/btn rounded-xl">
                            <Edit className="h-4 w-4 mr-2 group-hover/btn:text-[var(--primary)]" />
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 bg-gradient-to-br from-white to-muted/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-[var(--primary)]/10 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-[var(--primary)]" />
                  </div>
                  Trip Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Trips Created</span>
                    <span className="text-sm text-muted-foreground font-semibold">{itineraries.length}</span>
                  </div>
                  <Progress value={Math.min((itineraries.length / 10) * 100, 100)} className="h-3" />
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Average Budget</span>
                    <span className="text-sm text-muted-foreground font-semibold">${averageBudget.toLocaleString()}</span>
                  </div>
                  <Progress value={Math.min((averageBudget / 10000) * 100, 100)} className="h-3" />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">This Month</span>
                    <span className="text-sm text-muted-foreground font-semibold">
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
                  }).length / 5) * 100, 100)} className="h-3" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-white to-muted/20 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Globe className="h-5 w-5 text-blue-500" />
                  </div>
                  Popular Destinations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from(new Set(itineraries.map(it => it.destination)))
                    .slice(0, 5)
                    .map((destination, index) => (
                      <div key={destination} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                            {index + 1}
                          </div>
                          <span className="font-medium">{destination}</span>
                        </div>
                        <Badge variant="secondary" className="font-semibold">
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
          <Card className="border-0 bg-gradient-to-br from-white to-muted/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Activity className="h-5 w-5 text-green-500" />
                </div>
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {itineraries.slice(0, 5).map((itinerary, index) => (
                  <div key={itinerary.id} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-muted/50 transition-all duration-300 border border-transparent hover:border-muted">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white text-sm font-bold shadow-lg">
                      {itinerary.title.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold truncate">{itinerary.title}</span>
                        <Badge variant="outline" className="text-xs font-semibold">
                          {itinerary.days?.length || 0} days
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Created for {itinerary.client_name} • {itinerary.destination}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {getTimeAgo(itinerary.date_created)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="rounded-xl">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Link to={`/edit-itinerary/${itinerary.id}`}>
                        <Button variant="ghost" size="sm" className="rounded-xl">
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