import { useFormContext } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Hotel, 
  Star, 
  MapPin, 
  Users, 
  CreditCard, 
  Wifi, 
  Waves, 
  Utensils, 
  Heart,
  CheckCircle,
  XCircle,
  Loader2,
  Search,
  SkipForward
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { rateHawkService, type RateHawkSearchResponse, type RateHawkHotelWithRooms } from '@/lib/api/ratehawk';
import { toast } from 'sonner';

export function StepHotelSelection() {
  console.log('🏨 StepHotelSelection component rendering...');
  
  const form = useFormContext();
  const [hotels, setHotels] = useState<RateHawkSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skipHotelSelection, setSkipHotelSelection] = useState(false);

  // Get form values
  const destination = form.watch('destinations.primary');
  const startDate = form.watch('travelerInfo.startDate');
  const endDate = form.watch('travelerInfo.endDate');
  const adults = form.watch('travelerInfo.travelers.adults');
  const children = form.watch('travelerInfo.travelers.children');
  const currency = form.watch('budget.currency');

  console.log('📋 Form values:', { destination, startDate, endDate, adults, children, currency, skipHotelSelection });

  // Search for hotels when component mounts or when search params change
  useEffect(() => {
    console.log('🔍 useEffect triggered with:', { destination, startDate, endDate, adults, skipHotelSelection });
    if (destination && startDate && endDate && adults && !skipHotelSelection) {
      console.log('✅ All required fields present, triggering hotel search...');
      searchHotels();
    } else {
      console.log('❌ Missing required fields or hotel selection skipped:', { 
        hasDestination: !!destination, 
        hasStartDate: !!startDate, 
        hasEndDate: !!endDate, 
        hasAdults: !!adults, 
        skipHotelSelection 
      });
    }
  }, [destination, startDate, endDate, adults, children, currency, skipHotelSelection]);

  const searchHotels = async () => {
    console.log('🔍 Starting hotel search...');
    if (!destination || !startDate || !endDate || !adults) {
      console.log('❌ Missing required search parameters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const searchParams = {
        destination,
        checkIn: startDate,
        checkOut: endDate,
        adults,
        children: children || 0,
        rooms: 1,
        currency: currency || 'USD',
        language: 'en'
      };

      console.log('📤 Search params:', searchParams);

      // Update form with search params
      form.setValue('hotelSelection.searchParams', searchParams);

      console.log('🔍 Calling rateHawkService.searchHotels...');
      const result = await rateHawkService.searchHotels(searchParams);
      console.log('✅ Hotel search result:', result);
      setHotels(result);
    } catch (err) {
      console.error('❌ Hotel search error:', err);
      setError('Failed to search for hotels. Please try again.');
      toast.error('Failed to search for hotels');
    } finally {
      setLoading(false);
    }
  };

  const handleHotelSelection = (hotel: RateHawkHotelWithRooms, roomId: string) => {
    const selectedRoom = hotel.rooms.find(room => room.id === roomId);
    if (!selectedRoom) return;

    const selectedHotel = {
      hotel: {
        id: hotel.id,
        name: hotel.name,
        rating: hotel.rating,
        stars: hotel.stars,
        address: hotel.address,
        location: hotel.location,
        images: hotel.images,
        amenities: hotel.amenities,
        description: hotel.description,
      },
      room: selectedRoom,
      selectedAt: new Date().toISOString(),
    };

    form.setValue('hotelSelection.selectedHotel', selectedHotel);
    form.setValue('hotelSelection.skipHotelSelection', false);
    toast.success(`Selected ${hotel.name} - ${selectedRoom.name}`);
  };

  const handleSkipHotelSelection = (skip: boolean) => {
    setSkipHotelSelection(skip);
    form.setValue('hotelSelection.skipHotelSelection', skip);
    if (skip) {
      form.setValue('hotelSelection.selectedHotel', undefined);
    }
  };

  const getAmenityIcon = (amenity: string) => {
    const amenityMap: Record<string, any> = {
      'WiFi': Wifi,
      'Internet access': Wifi,
      'Pool': Waves,
      'Spa': Heart,
      'Restaurant': Utensils,
      'Gym': Users,
      '24-hour reception': Users,
      'Early check-in': Users,
      'Late check-out': Users,
      'Concierge services': Users,
      'Bar': Utensils,
      'Breakfast': Utensils,
      'Parking': CreditCard,
      'Parking nearby': CreditCard,
      'Spa tub': Waves,
      'Sauna': Heart,
      'Fitness': Users,
      'Golf': Users,
      'Kitchen': Utensils,
      'Private bathroom': Users,
      'Shared bathroom': Users,
      'TV': CreditCard,
      'Telephone': CreditCard,
      'Safe': CreditCard,
      'Air conditioning': Wifi,
      'Heating': Wifi,
      'Pets allowed': Heart,
    };
    
    // Try exact match first
    if (amenityMap[amenity]) {
      return amenityMap[amenity];
    }
    
    // Try partial matches
    const lowerAmenity = amenity.toLowerCase();
    for (const [key, icon] of Object.entries(amenityMap)) {
      if (lowerAmenity.includes(key.toLowerCase())) {
        return icon;
      }
    }
    
    return Hotel;
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const renderStars = (stars: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          'h-4 w-4',
          i < stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        )}
      />
    ));
  };

  if (skipHotelSelection) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Hotel Selection</h3>
          <div className="flex items-center space-x-2">
            <Switch
              checked={skipHotelSelection}
              onCheckedChange={handleSkipHotelSelection}
            />
            <Label>Skip hotel selection</Label>
          </div>
        </div>
        
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <SkipForward className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Hotel selection skipped. You can add hotels later in the itinerary.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Select Your Hotel</h3>
        <div className="flex items-center space-x-2">
          <Switch
            checked={skipHotelSelection}
            onCheckedChange={handleSkipHotelSelection}
          />
          <Label>Skip hotel selection</Label>
        </div>
      </div>

      {/* Search Info */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Search className="h-4 w-4" />
            <span>
              Searching for hotels in <strong>{destination}</strong> from{' '}
              <strong>{new Date(startDate).toLocaleDateString()}</strong> to{' '}
              <strong>{new Date(endDate).toLocaleDateString()}</strong>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Skeleton className="h-24 w-24 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
            <Button 
              onClick={searchHotels} 
              variant="outline" 
              size="sm" 
              className="mt-2"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Hotel Results */}
      {!loading && !error && hotels && (
        <div className="space-y-4">
          {hotels.hotels.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Hotel className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No hotels found for your search criteria. Try adjusting your dates or destination.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            hotels.hotels.map((hotel) => (
              <Card key={hotel.id} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex gap-4">
                    {/* Hotel Image */}
                    <div className="relative">
                      <img
                        src={hotel.images[0] || '/placeholder-hotel.jpg'}
                        alt={hotel.name}
                        className="h-24 w-24 object-cover rounded-lg"
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          e.currentTarget.src = '/placeholder-hotel.jpg';
                        }}
                      />
                      <Badge className="absolute top-2 left-2 bg-black/70 text-white">
                        {hotel.stars}★
                      </Badge>
                      {hotel.isClosed && (
                        <Badge className="absolute bottom-2 left-2 bg-red-600 text-white text-xs">
                          Closed
                        </Badge>
                      )}
                    </div>

                    {/* Hotel Info */}
                    <div className="flex-1">
                      <CardTitle className="text-lg">{hotel.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        {renderStars(hotel.stars)}
                        <span className="text-sm text-muted-foreground">
                          ({hotel.rating}/5)
                        </span>
                        {hotel.hotelChain && hotel.hotelChain !== 'No chain' && (
                          <Badge variant="outline" className="text-xs">
                            {hotel.hotelChain}
                          </Badge>
                        )}
                        {hotel.kind && (
                          <Badge variant="secondary" className="text-xs">
                            {hotel.kind}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{hotel.address.city}, {hotel.address.country}</span>
                      </div>
                      
                      {/* Hotel Details */}
                      <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
                        {hotel.phone && (
                          <span className="flex items-center gap-1">
                            <CreditCard className="h-3 w-3" />
                            {hotel.phone}
                          </span>
                        )}
                        {hotel.checkInTime && (
                          <span>Check-in: {hotel.checkInTime}</span>
                        )}
                        {hotel.checkOutTime && (
                          <span>Check-out: {hotel.checkOutTime}</span>
                        )}
                      </div>
                      
                      {/* Payment Methods */}
                      {hotel.paymentMethods && hotel.paymentMethods.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {hotel.paymentMethods.slice(0, 4).map((method) => (
                            <Badge key={method} variant="outline" className="text-xs">
                              {method.toUpperCase()}
                            </Badge>
                          ))}
                          {hotel.paymentMethods.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{hotel.paymentMethods.length - 4} more
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      {/* Amenities */}
                      <div className="flex gap-2 mt-3">
                        {hotel.amenities.slice(0, 6).map((amenity) => {
                          const Icon = getAmenityIcon(amenity);
                          return (
                            <Badge key={amenity} variant="secondary" className="text-xs">
                              <Icon className="h-3 w-3 mr-1" />
                              {amenity}
                            </Badge>
                          );
                        })}
                        {hotel.amenities.length > 6 && (
                          <Badge variant="outline" className="text-xs">
                            +{hotel.amenities.length - 6} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <Accordion type="single" collapsible>
                    <AccordionItem value="rooms">
                      <AccordionTrigger className="text-sm">
                        View Available Rooms ({hotel.rooms.length})
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 pt-4">
                          <RadioGroup
                            value={form.watch('hotelSelection.selectedHotel')?.hotel.id === hotel.id 
                              ? form.watch('hotelSelection.selectedHotel')?.room.id 
                              : undefined}
                            onValueChange={(roomId) => handleHotelSelection(hotel, roomId)}
                          >
                            {hotel.rooms.map((room) => (
                              <div
                                key={room.id}
                                className={cn(
                                  'flex items-center justify-between p-4 rounded-lg border-2 transition-all',
                                  form.watch('hotelSelection.selectedHotel')?.room.id === room.id
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/30'
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <RadioGroupItem value={room.id} />
                                  <div>
                                    <h4 className="font-medium">{room.name}</h4>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                      <span className="flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        {room.capacity?.adults || 2} adults, {room.capacity?.children || 0} children
                                      </span>
                                      {room.boardType && (
                                        <span>{room.boardType}</span>
                                      )}
                                    </div>
                                    {room.cancellationPolicy && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {room.cancellationPolicy}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="text-right">
                                  <div className="font-semibold text-lg">
                                    {formatPrice(room.price.amount, room.price.currency)}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    per night
                                  </div>
                                  {room.refundable && (
                                    <Badge variant="outline" className="text-xs mt-1">
                                      Refundable
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Selected Hotel Summary */}
      {form.watch('hotelSelection.selectedHotel') && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span className="font-medium text-primary">Hotel Selected</span>
            </div>
            <div className="flex items-center gap-4">
              <img
                src={form.watch('hotelSelection.selectedHotel.hotel.images[0]')}
                alt={form.watch('hotelSelection.selectedHotel.hotel.name')}
                className="h-16 w-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h4 className="font-medium">
                  {form.watch('hotelSelection.selectedHotel.hotel.name')}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {form.watch('hotelSelection.selectedHotel.room.name')}
                </p>
                <p className="text-sm font-medium text-primary">
                  {formatPrice(
                    form.watch('hotelSelection.selectedHotel.room.price.amount'),
                    form.watch('hotelSelection.selectedHotel.room.price.currency')
                  )} per night
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  form.setValue('hotelSelection.selectedHotel', undefined);
                }}
              >
                Change
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 