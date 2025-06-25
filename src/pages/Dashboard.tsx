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
import { QuoteService, type QuoteResponse } from '@/lib/quoteService';
import { BookingService, type Booking, type BookingStats } from '@/lib/bookingService';
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
  Compass,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  Receipt,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Clock3,
  CalendarDays
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { UsageDashboard } from '@/components/UsageDashboard';

export function Dashboard() {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<QuoteResponse[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingStats, setBookingStats] = useState<BookingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [bookingSearchTerm, setBookingSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [userQuotes, userBookings, stats] = await Promise.all([
        QuoteService.getUserQuotes(),
        BookingService.getUserBookings(),
        BookingService.getBookingStats()
      ]);
      
      setQuotes(userQuotes);
      setBookings(userBookings);
      setBookingStats(stats);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuote = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quote?')) return;
    
    try {
      await QuoteService.deleteQuote(id);
      setQuotes(quotes.filter(q => q.id !== id));
      toast.success('Quote deleted successfully');
    } catch (error) {
      console.error('Failed to delete quote:', error);
      toast.error('Failed to delete quote');
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;
    
    try {
      await BookingService.deleteBooking(id);
      setBookings(bookings.filter(b => b.id !== id));
      // Reload stats after deletion
      const stats = await BookingService.getBookingStats();
      setBookingStats(stats);
      toast.success('Booking deleted successfully');
    } catch (error) {
      console.error('Failed to delete booking:', error);
      toast.error('Failed to delete booking');
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, newStatus: 'confirmed' | 'pending' | 'cancelled' | 'completed') => {
    try {
      await BookingService.updateBookingStatus(bookingId, newStatus);
      setBookings(bookings.map(b => 
        b.id === bookingId ? { ...b, status: newStatus } : b
      ));
      // Reload stats after status update
      const stats = await BookingService.getBookingStats();
      setBookingStats(stats);
      toast.success(`Booking status updated to ${newStatus}`);
    } catch (error) {
      console.error('Failed to update booking status:', error);
      toast.error('Failed to update booking status');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'pending': return 'secondary';
      case 'cancelled': return 'destructive';
      case 'completed': return 'default';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock3 className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Calculate business metrics
  const totalQuotes = quotes.length;
  const confirmedQuotes = quotes.filter(q => q.status === 'confirmed').length;
  const pendingQuotes = quotes.filter(q => q.status === 'draft').length;
  const cancelledQuotes = quotes.filter(q => q.status === 'cancelled').length;
  
  const totalRevenue = quotes
    .filter(q => q.status === 'confirmed')
    .reduce((sum, q) => sum + q.totalPrice, 0);
  
  const conversionRate = totalQuotes > 0 ? (confirmedQuotes / totalQuotes) * 100 : 0;
  
  const thisMonthQuotes = quotes.filter(q => {
    const date = new Date(q.createdAt);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  const thisMonthRevenue = quotes
    .filter(q => {
      const date = new Date(q.createdAt);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear() && q.status === 'confirmed';
    })
    .reduce((sum, q) => sum + q.totalPrice, 0);

  const filteredQuotes = quotes.filter(quote =>
    quote.clientEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.clientAddress?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBookings = bookings.filter(booking =>
    booking.clientName.toLowerCase().includes(bookingSearchTerm.toLowerCase()) ||
    booking.destination.toLowerCase().includes(bookingSearchTerm.toLowerCase()) ||
    booking.status.toLowerCase().includes(bookingSearchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="px-4 py-8 space-y-8">
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
    <div className="mx-auto px-4 py-0 space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl p-8 text-foreground shadow-xl">
        <div className="absolute inset-0 bg-card" />
        <div className="relative z-10">
          <div className="flex items-center gap-6 mb-8">
            <Avatar className="h-16 w-16 border-2 border-white/10 shadow-lg">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="text-lg font-semibold text-muted-foreground">
                {user?.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.email?.split('@')[0]}</h1>
              <p className="text-muted-foreground">Your luxury travel business dashboard</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-background backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/15 rounded-lg">
                  <DollarSign className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">Total Revenue</span>
              </div>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            </div>
            <div className="bg-background backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/15 rounded-lg">
                  <FileText className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">Total Quotes</span>
              </div>
              <div className="text-2xl font-bold">{totalQuotes}</div>
            </div>
            <div className="bg-background backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/15 rounded-lg">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">Conversion Rate</span>
              </div>
              <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
            </div>
            <div className="bg-background backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/15 rounded-lg">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">This Month</span>
              </div>
              <div className="text-2xl font-bold">{thisMonthQuotes}</div>
            </div>
            <div className="bg-background backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/15 rounded-lg">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">Total Bookings</span>
              </div>
              <div className="text-2xl font-bold">{bookingStats?.totalBookings || 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <HoverCard>
          <HoverCardTrigger asChild>
            <Link to="/new-proposal">
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group border border-border/50 bg-card">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto w-12 h-12 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[var(--primary)]/20 transition-colors">
                    <Plus className="h-6 w-6 text-[var(--primary)]" />
                  </div>
                  <h3 className="font-semibold mb-2">Create Quote</h3>
                  <p className="text-sm text-muted-foreground">Generate a new client quote</p>
                </CardContent>
              </Card>
            </Link>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-semibold">Create Quote</h4>
              <p className="text-sm text-muted-foreground">
                Use our AI-powered system to create a detailed quote with itinerary for your client.
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>

        <HoverCard>
          <HoverCardTrigger asChild>
            <Link to="/quotes">
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group border border-border/50 bg-card">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                    <FileText className="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 className="font-semibold mb-2">View Quotes</h3>
                  <p className="text-sm text-muted-foreground">Manage all your quotes</p>
                </CardContent>
              </Card>
            </Link>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-semibold">View Quotes</h4>
              <p className="text-sm text-muted-foreground">
                Review, edit, and manage all your client quotes in one place.
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>

        <HoverCard>
          <HoverCardTrigger asChild>
            <Link to="/bookings">
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group border border-border/50 bg-card">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <h3 className="font-semibold mb-2">Bookings</h3>
                  <p className="text-sm text-muted-foreground">Confirmed reservations</p>
                </CardContent>
              </Card>
            </Link>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-semibold">Bookings</h4>
              <p className="text-sm text-muted-foreground">
                Track all your confirmed bookings and manage client reservations.
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>

        <HoverCard>
          <HoverCardTrigger asChild>
            <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group border border-border/50 bg-card">
              <CardContent className="p-6 text-center">
                <div className="mx-auto w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                  <BarChart3 className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="font-semibold mb-2">Analytics</h3>
                <p className="text-sm text-muted-foreground">Business insights</p>
              </CardContent>
            </Card>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-semibold">Analytics</h4>
              <p className="text-sm text-muted-foreground">
                View detailed analytics and performance metrics for your business.
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="quotes" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <FileText className="h-4 w-4 mr-2" />
            Quotes
          </TabsTrigger>
          <TabsTrigger value="bookings" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <CheckCircle className="h-4 w-4 mr-2" />
            Bookings
          </TabsTrigger>
          <TabsTrigger value="usage" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Target className="h-4 w-4 mr-2" />
            Usage & Plans
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border border-border/50 bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                    <p className="text-2xl font-bold">{formatCurrency(thisMonthRevenue)}</p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">+12% from last month</p>
              </CardContent>
            </Card>

            <Card className="border border-border/50 bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Quotes</p>
                    <p className="text-2xl font-bold">{pendingQuotes}</p>
                  </div>
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Need attention</p>
              </CardContent>
            </Card>

            <Card className="border border-border/50 bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                    <p className="text-2xl font-bold">{conversionRate.toFixed(1)}%</p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">+5% from last month</p>
              </CardContent>
            </Card>

            <Card className="border border-border/50 bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Quote Value</p>
                    <p className="text-2xl font-bold">
                      {totalQuotes > 0 ? formatCurrency(totalRevenue / totalQuotes) : formatCurrency(0)}
                    </p>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <DollarSign className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Per quote</p>
              </CardContent>
            </Card>

            <Card className="border border-border/50 bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Bookings</p>
                    <p className="text-2xl font-bold">{bookingStats?.confirmedBookings || 0}</p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Confirmed reservations</p>
              </CardContent>
            </Card>

            <Card className="border border-border/50 bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Booking Value</p>
                    <p className="text-2xl font-bold">
                      {bookingStats ? formatCurrency(bookingStats.averageBookingValue) : formatCurrency(0)}
                    </p>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <DollarSign className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Per booking</p>
              </CardContent>
            </Card>

            <Card className="border border-border/50 bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Recent Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{booking.clientName}</p>
                          <p className="text-xs text-muted-foreground">{getTimeAgo(booking.createdAt)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">{formatCurrency(booking.totalCost, booking.currency)}</p>
                        <Badge 
                          variant={getStatusColor(booking.status)}
                          className="text-xs"
                        >
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border border-border/50 bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Quotes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {quotes.slice(0, 5).map((quote) => (
                    <div key={quote.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                          <FileText className="h-4 w-4 text-[var(--primary)]" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{quote.clientEmail || 'Client'}</p>
                          <p className="text-xs text-muted-foreground">{getTimeAgo(quote.createdAt)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">{formatCurrency(quote.totalPrice, quote.currency)}</p>
                        <Badge 
                          variant={getStatusColor(quote.status)}
                          className="text-xs"
                        >
                          {quote.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/50 bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Chart
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Quote to Booking Rate</span>
                      <span>{conversionRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={conversionRate} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Monthly Goal Progress</span>
                      <span>75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Customer Satisfaction</span>
                      <span>98%</span>
                    </div>
                    <Progress value={98} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="quotes" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search quotes by client, destination, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2 px-6 py-3 rounded-xl">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>

          {/* Quotes Grid */}
          {filteredQuotes.length === 0 ? (
            <Card className="text-center py-16 border border-border/50 bg-card">
              <CardContent>
                <div className="mx-auto w-16 h-16 bg-muted rounded-xl flex items-center justify-center mb-6">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-3">No quotes found</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {searchTerm ? 'Try adjusting your search terms' : 'Start by creating your first quote'}
                </p>
                <Link to="/new-proposal">
                  <Button className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 px-6 py-3 rounded-xl">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Quote
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredQuotes.map((quote) => (
                <Card key={quote.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden border border-border/50 bg-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-[var(--primary)]" />
                        <span className="text-sm font-medium">Quote #{quote.id.slice(0, 8)}</span>
                      </div>
                      <Badge 
                        variant={getStatusColor(quote.status)}
                        className="text-xs"
                      >
                        {quote.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Client</p>
                      <p className="font-medium">{quote.clientEmail || 'Not specified'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Total Value</p>
                      <p className="text-xl font-bold text-[var(--primary)]">
                        {formatCurrency(quote.totalPrice, quote.currency)}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{formatDate(quote.createdAt)}</span>
                      <span>{getTimeAgo(quote.createdAt)}</span>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteQuote(quote.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bookings" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search bookings by client, destination, or status..."
                value={bookingSearchTerm}
                onChange={(e) => setBookingSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-input rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2 px-6 py-3 rounded-xl">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>

          {/* Bookings Grid */}
          {filteredBookings.length === 0 ? (
            <Card className="text-center py-16 border border-border/50 bg-card">
              <CardContent>
                <div className="mx-auto w-16 h-16 bg-muted rounded-xl flex items-center justify-center mb-6">
                  <CheckCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-3">No bookings found</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {bookingSearchTerm ? 'Try adjusting your search terms' : 'Start by creating quotes and confirming them as bookings'}
                </p>
                <Link to="/new-proposal">
                  <Button className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 px-6 py-3 rounded-xl">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Quote
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredBookings.map((booking) => (
                <Card key={booking.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden border border-border/50 bg-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">Booking #{booking.id.slice(0, 8)}</span>
                      </div>
                      <Badge 
                        variant={getStatusColor(booking.status)}
                        className="text-xs"
                      >
                        {booking.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Client</p>
                      <p className="font-medium">{booking.clientName}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Destination</p>
                      <p className="font-medium">{booking.destination}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Total Cost</p>
                      <p className="text-xl font-bold text-green-600">
                        {formatCurrency(booking.totalCost, booking.currency)}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        <span>{formatDate(booking.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{getTimeAgo(booking.createdAt)}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleUpdateBookingStatus(booking.id, 'completed')}
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Complete
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteBooking(booking.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <UsageDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
} 