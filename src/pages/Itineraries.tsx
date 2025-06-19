import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { loadAllItineraries, deleteItinerary, type SavedItinerary } from '@/lib/itineraryService';
import { toast } from 'sonner';
import { 
  Loader2, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar, 
  MapPin, 
  User, 
  Search, 
  Filter,
  Download,
  Share2,
  Plus,
  X,
  Sparkles,
  Globe,
  SortAsc,
  Target,
  RefreshCw,
  SlidersHorizontal,
  FilterX
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { PDFExportButton } from '@/components/PDFExportButton';

export function Itineraries() {
  const [itineraries, setItineraries] = useState<SavedItinerary[]>([]);
  const [filteredItineraries, setFilteredItineraries] = useState<SavedItinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [filterDestination, setFilterDestination] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedItinerary, setSelectedItinerary] = useState<SavedItinerary | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllItineraries();
  }, []);

  useEffect(() => {
    filterAndSortItineraries();
  }, [itineraries, searchTerm, sortBy, filterDestination]);

  const fetchAllItineraries = async () => {
    setLoading(true);
    try {
      // Load all itineraries from the database
      const allItineraries = await loadAllItineraries();
      setItineraries(allItineraries);
    } catch (error) {
      console.error('Failed to load itineraries:', error);
      toast.error('Failed to load itineraries');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortItineraries = () => {
    let filtered = [...itineraries];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(itinerary =>
        itinerary.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        itinerary.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        itinerary.destination.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Destination filter
    if (filterDestination !== 'all') {
      filtered = filtered.filter(itinerary =>
        itinerary.destination.toLowerCase() === filterDestination.toLowerCase()
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date_created).getTime() - new Date(a.date_created).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'client':
          return a.client_name.localeCompare(b.client_name);
        case 'destination':
          return a.destination.localeCompare(b.destination);
        default:
          return 0;
      }
    });

    setFilteredItineraries(filtered);
    setCurrentPage(1);
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

  const getUniqueDestinations = () => {
    const destinations = [...new Set(itineraries.map(it => it.destination))];
    return destinations.sort();
  };

  const paginatedItineraries = filteredItineraries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredItineraries.length / itemsPerPage);

  // Modal open handler
  const handleView = (itinerary: SavedItinerary) => {
    setSelectedItinerary(itinerary);
    setViewModalOpen(true);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilterDestination('all');
    setSortBy('date');
  };

  const hasActiveFilters = searchTerm || filterDestination !== 'all' || sortBy !== 'date';

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
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">All Itineraries</h1>
          <p className="text-muted-foreground">
            {filteredItineraries.length} of {itineraries.length} itineraries
          </p>
        </div>
        <Link to="/new-proposal">
          <Button className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 px-6 py-3 rounded-2xl shadow-lg">
            <Plus className="h-4 w-4 mr-2" />
            Create New
          </Button>
        </Link>
      </div>

      {/* Premium Filters Section */}
      <Card className="mb-8 border-0 bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="p-2 bg-gradient-to-br from-[var(--primary)]/10 to-[var(--primary)]/20 rounded-xl">
              <SlidersHorizontal className="h-5 w-5 text-[var(--primary)]" />
            </div>
            Advanced Filters
            {hasActiveFilters && (
              <Badge className="ml-2 bg-[var(--primary)] text-white border-0">
                Active
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {/* Search Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Search className="h-4 w-4" />
                Search Itineraries
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title, client, or destination..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 bg-white/60 backdrop-blur-sm border border-input/50 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all duration-300 rounded-2xl"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Destination Filter */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Destination
              </label>
              <Select value={filterDestination} onValueChange={setFilterDestination}>
                <SelectTrigger className="bg-white/60 backdrop-blur-sm border border-input/50 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all duration-300 rounded-2xl py-3">
                  <SelectValue placeholder="All destinations" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-0 shadow-2xl">
                  <SelectItem value="all" className="rounded-lg">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      All Destinations
                    </div>
                  </SelectItem>
                  {getUniqueDestinations().map(destination => (
                    <SelectItem key={destination} value={destination} className="rounded-lg">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {destination}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort Options */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <SortAsc className="h-4 w-4" />
                Sort By
              </label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-white/60 backdrop-blur-sm border border-input/50 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all duration-300 rounded-2xl py-3">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-0 shadow-2xl">
                  <SelectItem value="date" className="rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Date Created
                    </div>
                  </SelectItem>
                  <SelectItem value="title" className="rounded-lg">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Title
                    </div>
                  </SelectItem>
                  <SelectItem value="client" className="rounded-lg">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Client Name
                    </div>
                  </SelectItem>
                  <SelectItem value="destination" className="rounded-lg">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Destination
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters Button */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Target className="h-4 w-4" />
                Actions
              </label>
              <Button
                variant="outline"
                onClick={clearAllFilters}
                disabled={!hasActiveFilters}
                className="w-full bg-white/60 hover:bg-white/80 border border-input/50 hover:border-[var(--primary)]/30 transition-all duration-300 rounded-2xl py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FilterX className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-6 pt-6 border-t border-border/50">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="h-4 w-4 text-[var(--primary)]" />
                <span className="text-sm font-semibold text-muted-foreground">Active Filters:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchTerm && (
                  <Badge variant="secondary" className="bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20">
                    Search: "{searchTerm}"
                    <button
                      onClick={() => setSearchTerm('')}
                      className="ml-2 hover:text-[var(--primary)]/70"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filterDestination !== 'all' && (
                  <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                    Destination: {filterDestination}
                    <button
                      onClick={() => setFilterDestination('all')}
                      className="ml-2 hover:text-blue-600/70"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {sortBy !== 'date' && (
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                    Sort: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                    <button
                      onClick={() => setSortBy('date')}
                      className="ml-2 hover:text-green-600/70"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Luxury View Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-2xl p-0 bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-2xl border-0 shadow-2xl rounded-2xl overflow-hidden">
          {selectedItinerary && (
            <>
              {/* Hero Image */}
              <div className="relative h-56 w-full bg-gray-100 flex items-center justify-center">
                {selectedItinerary.days?.[0]?.imageUrl ? (
                  <img 
                    src={selectedItinerary.days[0].imageUrl} 
                    alt="Itinerary" 
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      // Hide the broken image and show fallback
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) {
                        fallback.style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div className="flex flex-col items-center justify-center w-full h-full text-gray-300" style={{ display: selectedItinerary.days?.[0]?.imageUrl ? 'none' : 'flex' }}>
                  <MapPin className="h-10 w-10 mb-2" />
                  <span className="text-xs">No Image</span>
                </div>
                <div className="absolute top-4 left-4">
                <Badge className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 text-white border-0 text-xs font-medium px-2 py-1 shadow-md">
                        {((selectedItinerary.preferences as any)?.style?.tone || 'LUXURY').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </Badge>
                </div>
                <DialogClose asChild>
                  <button className="absolute top-4 right-4 bg-white/80 hover:bg-gray-200 rounded-full p-2 shadow z-10 flex items-center justify-center">
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                </DialogClose>
              </div>
              <div className="p-8">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold mb-2 text-[var(--foreground)]">
                    {selectedItinerary.title}
                  </DialogTitle>
                  <DialogDescription className="mb-4 text-[var(--muted-foreground)]">
                    {selectedItinerary.destination} • {selectedItinerary.client_name} • {formatDate(selectedItinerary.date_created)}
                  </DialogDescription>
                </DialogHeader>
                <div className="mb-6">
                  <h4 className="font-semibold text-[var(--primary)] mb-2">Trip Overview</h4>
                  <ul className="list-disc list-inside text-[var(--foreground)] text-sm space-y-1">
                    {selectedItinerary.days?.slice(0, 3).map((day, idx) => (
                      <li key={idx}>
                        <span className="font-semibold">Day {idx + 1}:</span> {day.activities?.[0]?.description || 'No activities'}
                      </li>
                    ))}
                    {selectedItinerary.days?.length > 3 && (
                      <li>...and {selectedItinerary.days.length - 3} more days</li>
                    )}
                  </ul>
                </div>
                <div className="flex gap-2 mt-8">
                  <Button
                    variant="outline"
                    className="flex-1 bg-white/60 hover:bg-white/80 border-[var(--border)] hover:border-[var(--primary)]/30 transition-all duration-300"
                    onClick={() => {
                      setViewModalOpen(false);
                      navigate(`/itinerary/${selectedItinerary.id}`);
                    }}
                  >
                    View Full Details
                  </Button>
                  <DialogClose asChild>
                    <Button variant="secondary" className="flex-1">Close</Button>
                  </DialogClose>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Itineraries Grid */}
      {filteredItineraries.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterDestination !== 'all' 
                ? 'No itineraries match your filters' 
                : 'No itineraries found'}
            </p>
            {searchTerm || filterDestination !== 'all' ? (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setFilterDestination('all');
                }}
              >
                Clear Filters
              </Button>
            ) : (
              <Link to="/new-proposal">
                <Button>Create Your First Itinerary</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedItineraries.map((itinerary) => {
              const heroImage = itinerary.days?.[0]?.imageUrl || undefined;
              return (
                <Card key={itinerary.id} className="group gap-2 pt-0 pb-0 relative overflow-hidden bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 rounded-2xl flex flex-col">
                  {/* Hero Image */}
                  <div className="relative h-40 w-full rounded-t-2xl overflow-hidden bg-gray-100 flex items-center justify-center">
                    {heroImage ? (
                      <img 
                        src={heroImage} 
                        alt="Itinerary" 
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          // Hide the broken image and show fallback
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) {
                            fallback.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div className="flex flex-col items-center justify-center w-full h-full text-gray-300" style={{ display: heroImage ? 'none' : 'flex' }}>
                      <MapPin className="h-10 w-10 mb-2" />
                      <span className="text-xs">No Image</span>
                    </div>
                    {/* Gradient overlay for readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    {/* LUXURY badge */}
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 text-white border-0 text-xs font-medium px-2 py-1 shadow-md">
                        {((itinerary.preferences as any)?.style?.tone || 'LUXURY').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </Badge>
                    </div>
                    {/* Delete icon overlay */}
                    <button
                      className="absolute top-3 right-3 bg-white/80 hover:bg-red-100 text-red-500 hover:text-red-700 rounded-full p-1 shadow transition-all z-10"
                      title="Delete itinerary"
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (window.confirm('Are you sure you want to delete this itinerary?')) {
                          await handleDeleteItinerary(itinerary.id);
                        }
                      }}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  <CardContent className="flex-1 flex flex-col p-6 relative">
                    {/* Header with title */}
                    <div className="mb-4">
                      <h3 className="font-bold text-lg leading-tight text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors duration-300 line-clamp-2">
                        {itinerary.title}
                      </h3>
                    </div>
                    {/* Info section with icons */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 p-2 bg-[var(--primary)]/5 rounded-lg">
                        <div className="w-8 h-8 bg-[var(--primary)]/10 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-[var(--primary)]" />
                        </div>
                        <div>
                          <p className="text-xs text-[var(--muted-foreground)] font-medium uppercase tracking-wide">Client</p>
                          <p className="text-sm font-semibold text-[var(--foreground)]">{itinerary.client_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-2 bg-[var(--primary)]/5 rounded-lg">
                        <div className="w-8 h-8 bg-[var(--primary)]/10 rounded-full flex items-center justify-center">
                          <MapPin className="h-4 w-4 text-[var(--primary)]" />
                        </div>
                        <div>
                          <p className="text-xs text-[var(--muted-foreground)] font-medium uppercase tracking-wide">Destination</p>
                          <p className="text-sm font-semibold text-[var(--foreground)]">{itinerary.destination}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-2 bg-[var(--primary)]/5 rounded-lg">
                        <div className="w-8 h-8 bg-[var(--primary)]/10 rounded-full flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-[var(--primary)]" />
                        </div>
                        <div>
                          <p className="text-xs text-[var(--muted-foreground)] font-medium uppercase tracking-wide">Created</p>
                          <p className="text-sm font-semibold text-[var(--foreground)]">{formatDate(itinerary.date_created)}</p>
                        </div>
                      </div>
                    </div>
                    {/* Action buttons always at the bottom */}
                    <div className="mt-auto flex gap-2 pt-2 border-t border-[var(--border)]/30">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-white/60 hover:bg-white/80 border-[var(--border)] hover:border-[var(--primary)]/30 transition-all duration-300"
                        onClick={() => handleView(itinerary)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Link to={`/edit-itinerary/${itinerary.id}`} className="flex-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full bg-white/60 hover:bg-white/80 border-[var(--border)] hover:border-[var(--primary)]/30 transition-all duration-300"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                      <PDFExportButton 
                        itinerary={itinerary} 
                        className="flex-1 bg-white/60 hover:bg-white/80 border-[var(--border)] hover:border-[var(--primary)]/30 transition-all duration-300"
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 