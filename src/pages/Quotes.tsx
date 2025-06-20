import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { QuoteResponse } from '@/lib/quoteService';
import { useQuoteService } from '@/hooks/useQuoteService';
import { Calendar, MapPin, Users, DollarSign, Clock, Search, Filter, Download, Eye, Edit, FileText, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Quotes() {
  const [quotes, setQuotes] = useState<QuoteResponse[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<QuoteResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const { getUserQuotes, isFetchingQuotes, confirmQuote, isConfirmingQuote, deleteQuote, isDeletingQuote } = useQuoteService();

  useEffect(() => {
    loadQuotes();
  }, []);

  useEffect(() => {
    filterAndSortQuotes();
  }, [quotes, searchTerm, statusFilter, sortBy]);

  const loadQuotes = async () => {
    try {
      const userQuotes = await getUserQuotes();
      setQuotes(userQuotes);
    } catch (error) {
      console.error('Failed to load quotes:', error);
    }
  };

  const handleConfirmQuote = async (quoteId: string) => {
    try {
      const bookingId = await confirmQuote(quoteId);
      if (bookingId) {
        // Refresh the quotes list to show updated status
        await loadQuotes();
      }
    } catch (error) {
      console.error('Failed to confirm quote:', error);
    }
  };

  const handleDeleteQuote = async (quoteId: string) => {
    try {
      const success = await deleteQuote(quoteId);
      if (success) {
        // Remove the quote from the local state
        setQuotes(prevQuotes => prevQuotes.filter(quote => quote.id !== quoteId));
      }
    } catch (error) {
      console.error('Failed to delete quote:', error);
    }
  };

  const filterAndSortQuotes = () => {
    let filtered = [...quotes];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(quote => 
        quote.generatedItinerary?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.generatedItinerary?.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.generatedItinerary?.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.clientEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.clientPhone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(quote => quote.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'clientName':
          return (a.generatedItinerary?.clientName || '').localeCompare(b.generatedItinerary?.clientName || '');
        case 'destination':
          return (a.generatedItinerary?.destination || '').localeCompare(b.generatedItinerary?.destination || '');
        case 'totalPrice':
          return b.totalPrice - a.totalPrice;
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    setFilteredQuotes(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
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
    const counts = { all: quotes.length, draft: 0, confirmed: 0, cancelled: 0 };
    quotes.forEach(quote => {
      counts[quote.status as keyof typeof counts]++;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Client Quotes</h1>
          <p className="text-muted-foreground mt-2">
            Manage all your client quotes and itineraries
          </p>
        </div>
        <Button asChild>
          <Link to="/builder">
            Create New Quote
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Quotes</p>
                <p className="text-2xl font-bold">{statusCounts.all}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Draft</p>
                <p className="text-2xl font-bold text-yellow-600">{statusCounts.draft}</p>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>
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
                <p className="text-sm font-medium text-muted-foreground">Cancelled</p>
                <p className="text-2xl font-bold text-destructive">{statusCounts.cancelled}</p>
              </div>
              <Badge className="bg-red-100 text-destructive">Cancelled</Badge>
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
                  placeholder="Search quotes by client, destination, or ID..."
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
                <SelectItem value="draft">Draft ({statusCounts.draft})</SelectItem>
                <SelectItem value="confirmed">Confirmed ({statusCounts.confirmed})</SelectItem>
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
                <SelectItem value="totalPrice">Total Price</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={loadQuotes} 
              disabled={isFetchingQuotes}
            >
              {isFetchingQuotes ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quotes List */}
      <Card>
        <CardHeader>
          <CardTitle>
            All Quotes ({filteredQuotes.length} of {quotes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredQuotes.length > 0 ? (
            <div className="space-y-4">
              {filteredQuotes.map((quote) => (
                <div key={quote.id} className="p-6 border rounded-lg hover:shadow-md transition-shadow bg-card">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">
                          {quote.generatedItinerary?.title || 'Untitled Quote'}
                        </h3>
                        <Badge className={getStatusColor(quote.status)}>
                          {quote.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{quote.generatedItinerary?.clientName || 'Unknown Client'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{quote.generatedItinerary?.destination || 'Destination not specified'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{quote.generatedItinerary?.days?.length || 0} days</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">
                        {formatCurrency(quote.totalPrice, quote.currency)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(quote.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/quote/${quote.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/quote/${quote.id}/edit`}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Export PDF
                    </Button>
                    {quote.status === 'draft' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleConfirmQuote(quote.id)}
                        disabled={isConfirmingQuote}
                      >
                        {isConfirmingQuote ? 'Confirming...' : 'Confirm Quote'}
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-destructive hover:text-destructive/80 hover:bg-destructive/10 border-destructive"
                          disabled={isDeletingQuote}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          {isDeletingQuote ? 'Deleting...' : 'Delete'}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Quote</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this quote? This action cannot be undone.
                            <br />
                            <br />
                            <strong>Quote:</strong> {quote.generatedItinerary?.title || 'Untitled Quote'}
                            <br />
                            <strong>Client:</strong> {quote.generatedItinerary?.clientName || 'Unknown Client'}
                            <br />
                            <strong>Total:</strong> {formatCurrency(quote.totalPrice, quote.currency)}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteQuote(quote.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete Quote
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <div className="text-muted-foreground mb-4">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">
                    {quotes.length === 0 ? 'No quotes yet' : 'No quotes match your filters'}
                  </h3>
                  <p className="text-sm">
                    {quotes.length === 0 
                      ? 'Create your first client quote to get started'
                      : 'Try adjusting your search or filter criteria'
                    }
                  </p>
                </div>
                {quotes.length === 0 && (
                  <Button asChild>
                    <Link to="/builder">
                      Create Your First Quote
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 