import React, { useState, useEffect, useCallback } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { format } from 'date-fns';
import { 
  Plane, 
  MapPin, 
  Calendar, 
  Users, 
  Star,
  Plus,
  Minus,
  Trash2,
  Copy,
  Edit,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowRight,
  Building2,
  Globe,
  Settings,
  Filter,
  Search,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { NewIntake, CabinClass } from '@/types/newIntake';
import { mockLowFareResult, getAirlineById, getLocationById } from '@/lib/mockData/mockFlightData';

interface Step3FlightsProps {
  disabled?: boolean;
}

// Cabin class options
const cabinClassOptions = [
  { value: 'economy', label: 'Economy', description: 'Standard seating', icon: Plane },
  { value: 'premium_economy', label: 'Premium Economy', description: 'Enhanced comfort', icon: Star },
  { value: 'business', label: 'Business', description: 'Premium service', icon: Building2 },
  { value: 'first', label: 'First Class', description: 'Ultimate luxury', icon: Star },
];

// Popular airports for quick selection
const popularAirports = [
  { code: 'LHR', name: 'London Heathrow', city: 'London' },
  { code: 'LGW', name: 'London Gatwick', city: 'London' },
  { code: 'STN', name: 'London Stansted', city: 'London' },
  { code: 'LCY', name: 'London City', city: 'London' },
  { code: 'JFK', name: 'John F. Kennedy', city: 'New York' },
  { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles' },
  { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris' },
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt' },
  { code: 'DXB', name: 'Dubai International', city: 'Dubai' },
  { code: 'AUH', name: 'Abu Dhabi International', city: 'Abu Dhabi' },
  { code: 'SIN', name: 'Changi Airport', city: 'Singapore' },
  { code: 'HKG', name: 'Hong Kong International', city: 'Hong Kong' },
  { code: 'NRT', name: 'Narita International', city: 'Tokyo' },
  { code: 'SYD', name: 'Sydney Airport', city: 'Sydney' },
];

export function Step3Flights({ disabled }: Step3FlightsProps) {
  const form = useFormContext<NewIntake>();
  
  // Form state
  const flightsEnabled = form.watch('flights.enabled');
  const flightGroups = form.watch('flights.groups') || [];
  const tripGroups = form.watch('tripDetails.groups') || [];
  const primaryDestination = form.watch('tripDetails.primaryDestination');
  const startDate = form.watch('tripDetails.startDate');
  const endDate = form.watch('tripDetails.endDate');

  // Local state
  const [showAirportSearch, setShowAirportSearch] = useState<string | null>(null);
  const [airportSearchQuery, setAirportSearchQuery] = useState('');
  const [showAirlineSearch, setShowAirlineSearch] = useState<string | null>(null);
  const [airlineSearchQuery, setAirlineSearchQuery] = useState('');

  // Get available airlines and airports from mock data
  const availableAirlines = mockLowFareResult.Airlines;
  const availableAirports = mockLowFareResult.Locations;

  // Initialize flight groups when flights are enabled
  useEffect(() => {
    if (flightsEnabled && flightGroups.length === 0 && tripGroups.length > 0) {
      const initialFlightGroups = tripGroups.map(group => ({
        groupId: group.id,
        originAirport: '',
        destinationAirport: '',
        cabinClass: 'economy' as CabinClass,
        preferredAirlines: [] as string[],
        flexibleDates: false,
        frequentFlyerInfo: '',
      }));
      
      form.setValue('flights.groups', initialFlightGroups);
    }
  }, [flightsEnabled, flightGroups.length, tripGroups, form]);

  // Auto-populate destination airport based on primary destination
  useEffect(() => {
    if (flightsEnabled && primaryDestination && flightGroups.length > 0) {
      const updatedGroups = flightGroups.map(group => ({
        ...group,
        destinationAirport: primaryDestination,
      }));
      form.setValue('flights.groups', updatedGroups);
    }
  }, [flightsEnabled, primaryDestination, flightGroups.length, form]);

  // Handlers
  const handleToggleFlights = (enabled: boolean) => {
    form.setValue('flights.enabled', enabled);
    
    if (!enabled) {
      // Clear flight groups when disabled
      form.setValue('flights.groups', []);
    } else if (tripGroups.length > 0) {
      // Initialize flight groups when enabled
      const initialFlightGroups = tripGroups.map(group => ({
        groupId: group.id,
        originAirport: '',
        destinationAirport: primaryDestination || '',
        cabinClass: 'economy' as CabinClass,
        preferredAirlines: [] as string[],
        flexibleDates: false,
        frequentFlyerInfo: '',
      }));
      
      form.setValue('flights.groups', initialFlightGroups);
    }
  };

  const updateFlightGroup = (groupId: string, updates: Partial<typeof flightGroups[0]>) => {
    const updatedGroups = flightGroups.map(group =>
      group.groupId === groupId ? { ...group, ...updates } : group
    );
    form.setValue('flights.groups', updatedGroups);
  };

  const addFlightGroup = () => {
    const newGroup = {
      groupId: `flight-group-${Date.now()}`,
      originAirport: '',
      destinationAirport: primaryDestination || '',
      cabinClass: 'economy' as CabinClass,
      preferredAirlines: [] as string[],
      flexibleDates: false,
      frequentFlyerInfo: '',
    };
    
    form.setValue('flights.groups', [...flightGroups, newGroup]);
  };

  const removeFlightGroup = (groupId: string) => {
    const updatedGroups = flightGroups.filter(group => group.groupId !== groupId);
    form.setValue('flights.groups', updatedGroups);
    toast.success('Flight group removed');
  };

  const duplicateFlightGroup = (groupId: string) => {
    const groupToDuplicate = flightGroups.find(group => group.groupId === groupId);
    if (groupToDuplicate) {
      const duplicatedGroup = {
        ...groupToDuplicate,
        groupId: `flight-group-${Date.now()}`,
      };
      form.setValue('flights.groups', [...flightGroups, duplicatedGroup]);
      toast.success('Flight group duplicated');
    }
  };

  const toggleAirline = (groupId: string, airlineId: string) => {
    const group = flightGroups.find(g => g.groupId === groupId);
    if (group) {
      const currentAirlines = group.preferredAirlines || [];
      const updatedAirlines = currentAirlines.includes(airlineId)
        ? currentAirlines.filter(id => id !== airlineId)
        : [...currentAirlines, airlineId];
      
      updateFlightGroup(groupId, { preferredAirlines: updatedAirlines });
    }
  };

  // Filter airports based on search query
  const filteredAirports = availableAirports.filter(airport =>
    airport.AirportId.toLowerCase().includes(airportSearchQuery.toLowerCase()) ||
    airport.AirportName.toLowerCase().includes(airportSearchQuery.toLowerCase())
  );

  // Filter airlines based on search query
  const filteredAirlines = availableAirlines.filter(airline =>
    airline.AirlineId.toLowerCase().includes(airlineSearchQuery.toLowerCase()) ||
    airline.AirlineName.toLowerCase().includes(airlineSearchQuery.toLowerCase())
  );

  // Check completion status
  const isComplete = flightsEnabled 
    ? flightGroups.length > 0 && flightGroups.every(group => 
        group.originAirport && group.destinationAirport && group.cabinClass
      )
    : true;

  if (disabled) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-muted animate-pulse rounded-lg" />
        <div className="h-10 bg-muted animate-pulse rounded-lg" />
        <div className="h-10 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mx-auto space-y-8 max-w-4xl"
    >
      {/* Flight Section Toggle */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gradient-to-br from-[var(--card)] via-[var(--card)]/95 to-[var(--background)]/30 border border-[var(--border)] rounded-3xl shadow-lg overflow-hidden backdrop-blur-sm">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-[var(--card-foreground)]">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/10 flex items-center justify-center border border-[var(--primary)]/30 shadow-sm">
                  <Plane className="h-6 w-6 text-[var(--primary)]" />
                </div>
                <div>
                  <div className="text-xl font-bold">Flight Preferences</div>
                  <div className="text-sm font-normal text-[var(--muted-foreground)] mt-1">
                    Configure flight options for each travel group
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={flightsEnabled}
                  onCheckedChange={handleToggleFlights}
                  disabled={disabled}
                />
                <Label className="text-sm font-medium">
                  {flightsEnabled ? 'Include Flights' : 'Exclude Flights'}
                </Label>
              </div>
            </CardTitle>
          </CardHeader>
          
          {flightsEnabled && (
            <CardContent className="space-y-6">
              {/* Flight Groups */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
                    <Users className="h-4 w-4 text-[var(--primary)]" />
                    Flight Groups ({flightGroups.length})
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addFlightGroup}
                    disabled={disabled}
                    className="h-8"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Group
                  </Button>
                </div>

                <AnimatePresence>
                  {flightGroups.map((flightGroup, index) => {
                    const tripGroup = tripGroups.find(g => g.id === flightGroup.groupId);
                    const groupName = tripGroup?.name || `Group ${index + 1}`;
                    const groupSize = (tripGroup?.adults || 0) + (tripGroup?.children || 0);

                    return (
                      <motion.div
                        key={flightGroup.groupId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="border border-[var(--border)] rounded-2xl p-6 space-y-6 bg-gradient-to-br from-[var(--background)]/50 to-[var(--background)]/20 backdrop-blur-sm hover:shadow-md transition-all duration-200"
                      >
                        {/* Group Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center border border-[var(--primary)]/20">
                              <Users className="h-5 w-5 text-[var(--primary)]" />
                            </div>
                            <div>
                              <span className="font-semibold text-[var(--foreground)]">{groupName}</span>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-xs bg-[var(--accent)]/20 text-[var(--accent-foreground)]">
                                  {groupSize} travelers
                                </Badge>
                                {tripGroup?.adults > 0 && (
                                  <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                                    {tripGroup.adults} adults
                                  </Badge>
                                )}
                                {tripGroup?.children > 0 && (
                                  <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-200">
                                    {tripGroup.children} children
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => duplicateFlightGroup(flightGroup.groupId)}
                              disabled={disabled}
                              className="h-8 w-8 p-0 rounded-lg hover:bg-[var(--accent)] transition-colors"
                              title="Duplicate group"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFlightGroup(flightGroup.groupId)}
                              disabled={disabled}
                              className="h-8 w-8 p-0 rounded-lg hover:bg-red-100 hover:text-red-700 transition-colors"
                              title="Remove group"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Flight Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Origin Airport */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-[var(--primary)]" />
                              Origin Airport *
                            </Label>
                            <Popover open={showAirportSearch === flightGroup.groupId} onOpenChange={(open) => setShowAirportSearch(open ? flightGroup.groupId : null)}>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal h-11 rounded-xl border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]/30 transition-colors duration-200",
                                    !flightGroup.originAirport && "text-[var(--muted-foreground)]"
                                  )}
                                >
                                  <MapPin className="mr-2 h-4 w-4" />
                                  {flightGroup.originAirport || "Select origin airport"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-80 p-0" align="start">
                                <Command>
                                  <CommandInput 
                                    placeholder="Search airports..." 
                                    value={airportSearchQuery}
                                    onValueChange={setAirportSearchQuery}
                                  />
                                  <CommandList>
                                    <CommandEmpty>No airports found.</CommandEmpty>
                                    <CommandGroup>
                                      {/* Popular airports */}
                                      <div className="px-2 py-1.5 text-sm font-medium text-[var(--muted-foreground)]">
                                        Popular Airports
                                      </div>
                                      {popularAirports.map((airport) => (
                                        <CommandItem
                                          key={airport.code}
                                          value={`${airport.code} ${airport.name} ${airport.city}`}
                                          onSelect={() => {
                                            updateFlightGroup(flightGroup.groupId, { originAirport: airport.code });
                                            setShowAirportSearch(null);
                                            setAirportSearchQuery('');
                                          }}
                                          className="flex items-center gap-3"
                                        >
                                          <MapPin className="h-4 w-4 text-[var(--muted-foreground)]" />
                                          <div>
                                            <div className="font-medium">{airport.code}</div>
                                            <div className="text-xs text-[var(--muted-foreground)]">
                                              {airport.name}, {airport.city}
                                            </div>
                                          </div>
                                        </CommandItem>
                                      ))}
                                      
                                      <Separator className="my-2" />
                                      
                                      {/* All airports */}
                                      <div className="px-2 py-1.5 text-sm font-medium text-[var(--muted-foreground)]">
                                        All Airports
                                      </div>
                                      {filteredAirports.map((airport) => (
                                        <CommandItem
                                          key={airport.AirportId}
                                          value={`${airport.AirportId} ${airport.AirportName}`}
                                          onSelect={() => {
                                            updateFlightGroup(flightGroup.groupId, { originAirport: airport.AirportId });
                                            setShowAirportSearch(null);
                                            setAirportSearchQuery('');
                                          }}
                                          className="flex items-center gap-3"
                                        >
                                          <MapPin className="h-4 w-4 text-[var(--muted-foreground)]" />
                                          <div>
                                            <div className="font-medium">{airport.AirportId}</div>
                                            <div className="text-xs text-[var(--muted-foreground)]">
                                              {airport.AirportName}
                                            </div>
                                          </div>
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>

                          {/* Destination Airport */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
                              <Globe className="h-4 w-4 text-[var(--primary)]" />
                              Destination Airport *
                            </Label>
                            <Input
                              value={flightGroup.destinationAirport}
                              onChange={(e) => updateFlightGroup(flightGroup.groupId, { destinationAirport: e.target.value })}
                              placeholder="e.g., AUH, DXB, JFK"
                              className="h-11 rounded-xl border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20"
                              disabled={disabled}
                            />
                            <p className="text-xs text-[var(--muted-foreground)]">
                              Pre-filled from trip destination
                            </p>
                          </div>
                        </div>

                        {/* Travel Dates */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-[var(--primary)]" />
                            Travel Dates
                          </Label>
                          <div className="flex items-center gap-4 p-3 bg-[var(--accent)]/10 rounded-xl">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-[var(--accent-foreground)]" />
                              <span className="text-sm text-[var(--muted-foreground)]">Outbound:</span>
                              <span className="text-sm font-medium text-[var(--foreground)]">
                                {startDate ? format(new Date(startDate), 'MMM dd, yyyy') : 'Not set'}
                              </span>
                            </div>
                            <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)]" />
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-[var(--accent-foreground)]" />
                              <span className="text-sm text-[var(--muted-foreground)]">Return:</span>
                              <span className="text-sm font-medium text-[var(--foreground)]">
                                {endDate ? format(new Date(endDate), 'MMM dd, yyyy') : 'Not set'}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            Dates from trip details
                          </p>
                        </div>

                        {/* Cabin Class and Flexibility */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Cabin Class */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
                              <Star className="h-4 w-4 text-[var(--primary)]" />
                              Cabin Class
                            </Label>
                            <Select
                              value={flightGroup.cabinClass}
                              onValueChange={(value) => updateFlightGroup(flightGroup.groupId, { cabinClass: value as CabinClass })}
                              disabled={disabled}
                            >
                              <SelectTrigger className="h-11 rounded-xl border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl border-[var(--border)] bg-[var(--background)]">
                                {cabinClassOptions.map((option) => {
                                  const Icon = option.icon;
                                  return (
                                    <SelectItem key={option.value} value={option.value} className="rounded-lg">
                                      <div className="flex items-center gap-3 py-1">
                                        <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center border border-[var(--primary)]/20">
                                          <Icon className="w-4 h-4 text-[var(--primary)]" />
                                        </div>
                                        <div>
                                          <div className="font-medium text-[var(--foreground)]">{option.label}</div>
                                          <div className="text-xs text-[var(--muted-foreground)]">{option.description}</div>
                                        </div>
                                      </div>
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Flexibility */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
                              <Settings className="h-4 w-4 text-[var(--primary)]" />
                              Date Flexibility
                            </Label>
                            <div className="flex items-center space-x-2 p-3 bg-[var(--accent)]/10 rounded-xl">
                              <Switch
                                checked={flightGroup.flexibleDates}
                                onCheckedChange={(checked) => updateFlightGroup(flightGroup.groupId, { flexibleDates: checked })}
                                disabled={disabled}
                              />
                              <Label className="text-sm">
                                {flightGroup.flexibleDates ? 'Flexible dates (±3 days)' : 'Fixed dates'}
                              </Label>
                            </div>
                          </div>
                        </div>

                        {/* Preferred Airlines */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
                            <Plane className="h-4 w-4 text-[var(--primary)]" />
                            Preferred Airlines
                          </Label>
                          <Popover open={showAirlineSearch === flightGroup.groupId} onOpenChange={(open) => setShowAirlineSearch(open ? flightGroup.groupId : null)}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal h-11 rounded-xl border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]/30 transition-colors duration-200"
                              >
                                <Search className="mr-2 h-4 w-4" />
                                {flightGroup.preferredAirlines.length > 0 
                                  ? `${flightGroup.preferredAirlines.length} airline(s) selected`
                                  : "Select preferred airlines (optional)"
                                }
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-0" align="start">
                              <Command>
                                <CommandInput 
                                  placeholder="Search airlines..." 
                                  value={airlineSearchQuery}
                                  onValueChange={setAirlineSearchQuery}
                                />
                                <CommandList>
                                  <CommandEmpty>No airlines found.</CommandEmpty>
                                  <CommandGroup>
                                    {filteredAirlines.map((airline) => (
                                      <CommandItem
                                        key={airline.AirlineId}
                                        value={`${airline.AirlineId} ${airline.AirlineName}`}
                                        onSelect={() => toggleAirline(flightGroup.groupId, airline.AirlineId)}
                                        className="flex items-center gap-3"
                                      >
                                        <Checkbox
                                          checked={flightGroup.preferredAirlines.includes(airline.AirlineId)}
                                          className="mr-2"
                                        />
                                        <div>
                                          <div className="font-medium">{airline.AirlineName}</div>
                                          <div className="text-xs text-[var(--muted-foreground)]">
                                            {airline.AirlineId} • {airline.SkytraxRating}/5 rating
                                          </div>
                                        </div>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          
                          {/* Selected Airlines */}
                          {flightGroup.preferredAirlines.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {flightGroup.preferredAirlines.map((airlineId) => {
                                const airline = getAirlineById(airlineId);
                                return airline ? (
                                  <Badge
                                    key={airlineId}
                                    variant="secondary"
                                    className="flex items-center gap-1 bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20"
                                  >
                                    {airline.AirlineName}
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleAirline(flightGroup.groupId, airlineId)}
                                      disabled={disabled}
                                      className="h-3 w-3 p-0 hover:bg-transparent"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </Badge>
                                ) : null;
                              })}
                            </div>
                          )}
                        </div>

                        {/* Frequent Flyer Info */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
                            <Star className="h-4 w-4 text-[var(--primary)]" />
                            Frequent Flyer Information (Optional)
                          </Label>
                          <Input
                            value={flightGroup.frequentFlyerInfo}
                            onChange={(e) => updateFlightGroup(flightGroup.groupId, { frequentFlyerInfo: e.target.value })}
                            placeholder="e.g., BA Executive Club, EY Guest"
                            className="h-11 rounded-xl border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20"
                            disabled={disabled}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {flightGroups.length === 0 && (
                  <div className="text-center py-8 text-[var(--muted-foreground)]">
                    <Plane className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No flight groups configured</p>
                    <p className="text-sm">Add a flight group to get started</p>
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      </motion.div>

      {/* Status Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex justify-between items-center pt-6"
      >
        <div className="text-sm text-[var(--muted-foreground)]">
          {flightsEnabled 
            ? (isComplete ? 'Flight preferences complete - ready to proceed' : 'Please configure flight preferences for all groups')
            : 'Flights excluded from this trip'
          }
        </div>
        
        <div className="flex items-center gap-2">
          {isComplete && (
            <Badge variant="outline" className="bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20">
              <CheckCircle className="h-3 w-3 mr-1" />
              Complete
            </Badge>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
} 