import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { Calendar, MapPin, Users, DollarSign, Clock, Search, Filter, Download, Eye, Phone, Mail, CalendarDays } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Booking {
  id: string;
  quote_id: string;
  user_id: string;
  client_name: string;
  booking_data: any;
  total_cost: number;
  currency: string;
  status: string;
  supplier_ref: string | null;
  created_at: string;
  updated_at: string;
  quote?: {
    generated_itinerary: any;
    trip_details: any;
  };
}

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    filterAndSortBookings();
  }, [bookings, searchTerm, statusFilter, sortBy]);

  const loadBookings = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Fetch bookings with related quote data
      const { data: bookingsData, error } = await supabase
        .from('bookings')
        .select(`
          *,
          quote:quotes(
            generated_itinerary,
            trip_details
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch bookings: ${error.message}`);
      }

      setBookings(bookingsData || []);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortBookings = () => {
    let filtered = [...bookings];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(booking => 
        booking.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.quote?.generated_itinerary?.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.supplier_ref?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'createdAt':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'clientName':
          return (a.client_name || '').localeCompare(b.client_name || '');
        case 'destination':
          return (a.quote?.generated_itinerary?.destination || '').localeCompare(b.quote?.generated_itinerary?.destination || '');
        case 'totalCost':
          return b.total_cost - a.total_cost;
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    setFilteredBookings(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'GBP',
    }).format(amount);
  };

  const getStatusCounts = () => {
    const counts = { all: bookings.length, confirmed: 0, pending: 0, cancelled: 0, completed: 0 };
    bookings.forEach(booking => {
      counts[booking.status as keyof typeof counts]++;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  const getTotalRevenue = () => {
    return bookings
      .filter(booking => booking.status === 'confirmed' || booking.status === 'completed')
      .reduce((total, booking) => total + booking.total_cost, 0);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Confirmed Bookings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your confirmed client bookings and track revenue
          </p>
        </div>
        <Button asChild>
          <Link to="/quotes">
            View All Quotes
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold">{statusCounts.all}</p>
              </div>
              <CalendarDays className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts.confirmed}</p>
              </div>
              <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-blue-600">{statusCounts.completed}</p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">Completed</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(getTotalRevenue(), 'GBP')}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search bookings by client, destination, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses ({statusCounts.all})</SelectItem>
                <SelectItem value="confirmed">Confirmed ({statusCounts.confirmed})</SelectItem>
                <SelectItem value="completed">Completed ({statusCounts.completed})</SelectItem>
                <SelectItem value="pending">Pending ({statusCounts.pending})</SelectItem>
                <SelectItem value="cancelled">Cancelled ({statusCounts.cancelled})</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Date Created</SelectItem>
                <SelectItem value="clientName">Client Name</SelectItem>
                <SelectItem value="destination">Destination</SelectItem>
                <SelectItem value="totalCost">Total Cost</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={loadBookings} 
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      <Card>
        <CardHeader>
          <CardTitle>
            All Bookings ({filteredBookings.length} of {bookings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading bookings...</p>
            </div>
          ) : filteredBookings.length > 0 ? (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className="p-6 border rounded-lg hover:shadow-md transition-shadow bg-card">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">
                          {booking.quote?.generated_itinerary?.title || 'Untitled Booking'}
                        </h3>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                        {booking.supplier_ref && (
                          <Badge variant="outline" className="text-xs">
                            Ref: {booking.supplier_ref}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{booking.client_name || 'Unknown Client'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{booking.quote?.generated_itinerary?.destination || 'Destination not specified'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{booking.quote?.generated_itinerary?.days?.length || 0} days</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">
                        {formatCurrency(booking.total_cost, booking.currency)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(booking.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/booking/${booking.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Export PDF
                    </Button>
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4 mr-1" />
                      Contact Client
                    </Button>
                    {booking.status === 'confirmed' && (
                      <Button size="sm">
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">
                  {bookings.length === 0 ? 'No bookings yet' : 'No bookings match your filters'}
                </h3>
                <p className="text-sm">
                  {bookings.length === 0 
                    ? 'Confirm some quotes to see your bookings here'
                    : 'Try adjusting your search or filter criteria'
                  }
                </p>
              </div>
              {bookings.length === 0 && (
                <Button asChild>
                  <Link to="/quotes">
                    View Quotes to Confirm
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 