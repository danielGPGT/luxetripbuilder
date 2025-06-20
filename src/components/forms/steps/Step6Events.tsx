import { useFormContext, Controller } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIntakeStore } from '@/store/intake';

const eventTypesList = [
  { label: 'Concerts', value: 'concerts' },
  { label: 'Sports', value: 'sports' },
  { label: 'Theater', value: 'theater' },
  { label: 'Festivals', value: 'festivals' },
  { label: 'Exhibitions', value: 'exhibitions' },
];

// Helper to fetch all countries from Sports Events 365 API
async function fetchCountries() {
  // Check cache first
  const cached = localStorage.getItem('sports365_countries');
  const cacheTime = localStorage.getItem('sports365_countries_time');
  
  // Cache is valid for 24 hours, but only if it has more than 50 countries (to avoid old limited cache)
  if (cached && cacheTime && (Date.now() - parseInt(cacheTime)) < 24 * 60 * 60 * 1000) {
    const cachedCountries = JSON.parse(cached);
    if (cachedCountries.length > 50) {
      return cachedCountries;
    } else {
      // Clear old limited cache
      localStorage.removeItem('sports365_countries');
      localStorage.removeItem('sports365_countries_time');
    }
  }

  const API_KEY = import.meta.env.VITE_SPORTSEVENTS365_API_KEY || '';
  const USERNAME = import.meta.env.VITE_SPORTSEVENTS365_USERNAME || '';
  const PASSWORD = import.meta.env.VITE_SPORTSEVENTS365_PASSWORD || '';
  
  // Create Base64 encoded credentials
  const credentials = btoa(`${USERNAME}:${PASSWORD}`);
  
  let allCountries: any[] = [];
  let currentPage = 1;
  let hasMorePages = true;
  
  while (hasMorePages) {
    const url = `https://api-v2.sandbox365.com/countries?apiKey=${API_KEY}&page=${currentPage}`;
    
    const res = await fetch(url, {
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Accept': 'application/json',
      },
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch countries page ${currentPage}: ${res.status} ${res.statusText}`);
    }
    
    const data = await res.json();
    const pageCountries = data.data || [];
    allCountries = [...allCountries, ...pageCountries];
    
    // Check if there are more pages
    hasMorePages = data.meta?.current_page < data.meta?.last_page;
    currentPage++;
    
    // Add a small delay to avoid overwhelming the API
    if (hasMorePages) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  // Cache the results
  localStorage.setItem('sports365_countries', JSON.stringify(allCountries));
  localStorage.setItem('sports365_countries_time', Date.now().toString());
  
  return allCountries;
}

// Helper to fetch cities by country ID
async function fetchCitiesByCountry(countryId: string) {
  // Check cache first
  const cacheKey = `sports365_cities_${countryId}`;
  const cached = localStorage.getItem(cacheKey);
  const cacheTime = localStorage.getItem(`${cacheKey}_time`);
  
  // Cache is valid for 24 hours
  if (cached && cacheTime && (Date.now() - parseInt(cacheTime)) < 24 * 60 * 60 * 1000) {
    return JSON.parse(cached);
  }

  const API_KEY = import.meta.env.VITE_SPORTSEVENTS365_API_KEY || '';
  const USERNAME = import.meta.env.VITE_SPORTSEVENTS365_USERNAME || '';
  const PASSWORD = import.meta.env.VITE_SPORTSEVENTS365_PASSWORD || '';
  
  // Create Base64 encoded credentials
  const credentials = btoa(`${USERNAME}:${PASSWORD}`);
  
  const url = `https://api-v2.sandbox365.com/countries/${countryId}/city?apiKey=${API_KEY}`;
  
  const res = await fetch(url, {
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Accept': 'application/json',
    },
  });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch cities: ${res.status} ${res.statusText}`);
  }
  
  const data = await res.json();
  
  // Handle different possible response structures
  let cities = [];
  if (Array.isArray(data)) {
    cities = data;
  } else if (Array.isArray(data.data)) {
    cities = data.data;
  } else if (Array.isArray(data.cities)) {
    cities = data.cities;
  } else if (data && typeof data === 'object') {
    if (data.data && typeof data.data === 'object' && data.data.id) {
      cities = [data.data];
    } else if (data.id) {
      cities = [data];
    }
  }
  
  // Cache the results
  localStorage.setItem(cacheKey, JSON.stringify(cities));
  localStorage.setItem(`${cacheKey}_time`, Date.now().toString());
  
  return cities;
}

// Helper to fetch events by city ID
async function fetchEventsByCity(cityId: string) {
  const API_KEY = import.meta.env.VITE_SPORTSEVENTS365_API_KEY || '';
  const USERNAME = import.meta.env.VITE_SPORTSEVENTS365_USERNAME || '';
  const PASSWORD = import.meta.env.VITE_SPORTSEVENTS365_PASSWORD || '';
  
  // Create Base64 encoded credentials
  const credentials = btoa(`${USERNAME}:${PASSWORD}`);
  
  const url = `https://api-v2.sandbox365.com/events/city/${cityId}?apiKey=${API_KEY}`;
  
  const res = await fetch(url, {
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Accept': 'application/json',
    },
  });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch events: ${res.status} ${res.statusText}`);
  }
  
  const data = await res.json();
  
  // Handle different possible response structures
  let events = [];
  if (Array.isArray(data)) {
    events = data;
  } else if (Array.isArray(data.data)) {
    events = data.data;
  } else if (Array.isArray(data.events)) {
    events = data.events;
  } else if (data && typeof data === 'object') {
    if (data.data && typeof data.data === 'object' && data.data.id) {
      events = [data.data];
    } else if (data.id) {
      events = [data];
    }
  }
  
  return events;
}

// Helper to fetch tickets by event ID
async function fetchTicketsByEvent(eventId: string) {
  const API_KEY = import.meta.env.VITE_SPORTSEVENTS365_API_KEY || '';
  const USERNAME = import.meta.env.VITE_SPORTSEVENTS365_USERNAME || '';
  const PASSWORD = import.meta.env.VITE_SPORTSEVENTS365_PASSWORD || '';
  
  // Create Base64 encoded credentials
  const credentials = btoa(`${USERNAME}:${PASSWORD}`);
  
  const url = `https://api-v2.sandbox365.com/tickets/${eventId}?apiKey=${API_KEY}`;
  
  const res = await fetch(url, {
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Accept': 'application/json',
    },
  });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch tickets: ${res.status} ${res.statusText}`);
  }
  
  const data = await res.json();
  
  // Handle different possible response structures
  let tickets = [];
  if (Array.isArray(data)) {
    tickets = data;
  } else if (Array.isArray(data.data)) {
    tickets = data.data;
  } else if (Array.isArray(data.tickets)) {
    tickets = data.tickets;
  } else if (data && typeof data === 'object') {
    if (data.data && typeof data.data === 'object' && data.data.id) {
      tickets = [data.data];
    } else if (data.id) {
      tickets = [data];
    }
  }
  
  return tickets;
}

// Helper to convert DD/MM/YYYY to YYYY-MM-DD
function normalizeDate(dateStr: string) {
  if (!dateStr) return '';
  const [day, month, year] = dateStr.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

// Filter events by trip date range
function isEventInRange(event: any, startDate: string, endDate: string) {
  const eventDate = normalizeDate(event.dateOfEvent);
  return eventDate >= startDate && eventDate <= endDate;
}

export function Step6Events() {
  const form = useFormContext();
  
  // Try to get dates from different possible field structures
  const startDate = form.watch('travelerInfo.startDate') || form.watch('startDate');
  const endDate = form.watch('travelerInfo.endDate') || form.watch('endDate');
  
  // Check if we're in NewProposal form (which doesn't have eventCountryId/eventCityId)
  const isNewProposalForm = !form.watch('eventCountryId');

  const [countries, setCountries] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countryOpen, setCountryOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [eventOpen, setEventOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  
  // For NewProposal form, we'll use local state instead of form fields
  const [selectedCountryId, setSelectedCountryId] = useState<string>('');
  const [selectedCityId, setSelectedCityId] = useState<string>('');

  // Handle ticket selection
  const handleTicketSelection = (ticketId: string) => {
    const newSelectedId = selectedTicketId === ticketId ? null : ticketId;
    setSelectedTicketId(newSelectedId);
    
    // Find the selected ticket and its event
    const selectedTicket = tickets.find(t => t.id.toString() === newSelectedId);
    const selectedEventData = selectedEvent;
    
    // Save to intake store
    const { updateEventData } = useIntakeStore.getState();
    if (selectedEventData && selectedTicket) {
      updateEventData(selectedEventData, selectedTicket);
    }
  };

  // Fetch countries on mount
  useEffect(() => {
    setLoadingCountries(true);
    fetchCountries()
      .then(countries => {
        setCountries(countries);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setLoadingCountries(false));
  }, []);

  // Fetch cities when country changes
  useEffect(() => {
    if (!selectedCountryId) return;
    
    setLoadingCities(true);
    setCities([]);
    
    // Update form field if it exists, otherwise just update local state
    if (!isNewProposalForm) {
      (form as any).setValue('eventCityId', ''); // Reset city selection
    } else {
      setSelectedCityId(''); // Reset local state
    }
    
    fetchCitiesByCountry(selectedCountryId)
      .then(cities => {
        setCities(cities);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setLoadingCities(false));
  }, [selectedCountryId, countries, isNewProposalForm]);

  // Fetch events when city changes
  useEffect(() => {
    if (!selectedCityId) return;
    setLoadingEvents(true);
    setError(null);
    setSelectedEvent(null);
    setTickets([]);
    
    // Update form field if it exists, otherwise just update local state
    if (!isNewProposalForm) {
      (form as any).setValue('eventId', ''); // Reset event selection
    }
    
    fetchEventsByCity(selectedCityId)
      .then(events => {
        setEvents(events);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setLoadingEvents(false));
  }, [selectedCityId, isNewProposalForm]);

  // Fetch tickets when event is selected
  useEffect(() => {
    if (!selectedEvent) return;
    setLoadingTickets(true);
    setError(null);
    fetchTicketsByEvent(selectedEvent.id.toString())
      .then(tickets => {
        setTickets(tickets);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => setLoadingTickets(false));
  }, [selectedEvent]);

  // Filter events by date
  const filteredEvents = events.filter((event: any) => isEventInRange(event, startDate, endDate));

  // Get selected country name for display
  const selectedCountry = countries.find((country: any) => country.id.toString() === selectedCountryId);
  const selectedCity = cities.find((city: any) => {
    return city && city.id && city.id.toString() === selectedCityId;
  });

  return (
    <div className="space-y-8">
      <div>
        <label className="block font-medium mb-2">Select Country</label>
        {isNewProposalForm ? (
          // For NewProposal form, use direct state management
          <Popover open={countryOpen} onOpenChange={setCountryOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={countryOpen}
                className="w-full justify-between"
                disabled={loadingCountries}
              >
                {loadingCountries ? 'Loading countries...' : 
                 selectedCountry ? selectedCountry.name : 'Select a country...'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search countries..." />
                <CommandList>
                  <CommandEmpty>No country found.</CommandEmpty>
                  <CommandGroup>
                    {countries.map((country: any) => (
                      <CommandItem
                        key={country.id}
                        value={country.name}
                        onSelect={() => {
                          setSelectedCountryId(country.id.toString());
                          setCountryOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedCountryId === country.id.toString() ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {country.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        ) : (
          // For IntakeForm, use Controller
          <Controller
            name="eventCountryId"
            control={form.control}
            defaultValue={''}
            render={({ field }) => (
              <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={countryOpen}
                    className="w-full justify-between"
                    disabled={loadingCountries}
                  >
                    {loadingCountries ? 'Loading countries...' : 
                     selectedCountry ? selectedCountry.name : 'Select a country...'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search countries..." />
                    <CommandList>
                      <CommandEmpty>No country found.</CommandEmpty>
                      <CommandGroup>
                        {countries.map((country: any) => (
                          <CommandItem
                            key={country.id}
                            value={country.name}
                            onSelect={() => {
                              field.onChange(country.id.toString());
                              setCountryOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedCountryId === country.id.toString() ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {country.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
          />
        )}
      </div>
      <div>
        <label className="block font-medium mb-2">Select City</label>
        {isNewProposalForm ? (
          // For NewProposal form, use direct state management
          <Popover open={cityOpen} onOpenChange={setCityOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={cityOpen}
                className="w-full justify-between"
                disabled={!selectedCountryId || loadingCities}
              >
                {loadingCities ? 'Loading cities...' : 
                 selectedCity ? selectedCity.name : 'Select a city...'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search cities..." />
                <CommandList>
                  <CommandEmpty>No city found.</CommandEmpty>
                  <CommandGroup>
                    {cities.map((city: any) => (
                      <CommandItem
                        key={city.id}
                        value={city.name}
                        onSelect={() => {
                          setSelectedCityId(city.id.toString());
                          setCityOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedCityId === city.id.toString() ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {city.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        ) : (
          // For IntakeForm, use Controller
          <Controller
            name="eventCityId"
            control={form.control}
            defaultValue={''}
            render={({ field }) => (
              <Popover open={cityOpen} onOpenChange={setCityOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={cityOpen}
                    className="w-full justify-between"
                    disabled={!selectedCountryId || loadingCities}
                  >
                    {loadingCities ? 'Loading cities...' : 
                     selectedCity ? selectedCity.name : 'Select a city...'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search cities..." />
                    <CommandList>
                      <CommandEmpty>No city found.</CommandEmpty>
                      <CommandGroup>
                        {cities.map((city: any) => (
                          <CommandItem
                            key={city.id}
                            value={city.name}
                            onSelect={() => {
                              field.onChange(city.id.toString());
                              setCityOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedCityId === city.id.toString() ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {city.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
          />
        )}
      </div>
      
      <div>
        <label className="block font-medium mb-2">Available Events & Tickets</label>
        {loadingEvents && <div className="text-gray-500 italic">Loading events...</div>}
        {error && <div className="text-red-500 italic">{error}</div>}
        <Controller
          name="selectedEvents"
          control={form.control}
          defaultValue={[]}
          render={({ field }) => (
            <div className="grid gap-4">
              {!loadingEvents && !error && filteredEvents.length === 0 && (
                <div className="text-gray-500 italic">No events found for your trip dates and city.</div>
              )}
              {filteredEvents.map((event: any) => {
                const isSelected = field.value?.includes(event.id);
                return (
                  <div
                    key={event.id}
                    className={`border rounded-lg p-4 bg-white/80 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between ${isSelected ? 'border-[var(--primary)] bg-[var(--primary)]/10' : ''}`}
                  >
                    <div>
                      <div className="font-semibold text-lg">{event.name}</div>
                      <div className="text-sm text-gray-500">{event.dateOfEvent} {event.venue?.name && <>• {event.venue.name}</>}</div>
                    </div>
                    <div className="mt-2 md:mt-0 font-bold text-[var(--primary)] text-lg">
                      {event.minTicketPrice?.price ? `${event.minTicketPrice.price.toLocaleString()} ${event.minTicketPrice.currency}` : 'See site for price'}
                    </div>
                    <div className="flex items-center gap-2 mt-2 md:mt-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
                      >
                        {selectedEvent?.id === event.id ? 'Hide Tickets' : 'View Tickets'}
                      </Button>
                      
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        />
        
        {/* Tickets display */}
        {selectedEvent && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Available Tickets</h3>
            
            {loadingTickets && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading tickets...</p>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}
            
            {!loadingTickets && !error && tickets.length === 0 && (
              <div className="text-center py-8 bg-gray-50 rounded-md">
                <p className="text-gray-600">No tickets available for this event.</p>
              </div>
            )}
            
            {!loadingTickets && !error && tickets.length > 0 && (
              <fieldset role="radiogroup" className="space-y-3 border-0 p-0 m-0">
                {tickets.map((ticket: any) => {
                  const ticketId = ticket.id.toString();
                  const isSelected = selectedTicketId === ticketId;
                  return (
                    <label
                      key={ticket.id}
                      htmlFor={`ticket-radio-${ticketId}`}
                      className={`block cursor-pointer bg-card border rounded-xl p-4 transition-all ${
                        isSelected
                          ? 'border-primary shadow-sm ring-1 ring-primary'
                          : 'border-border hover:border-muted-foreground'
                      }`}
                    >
                      <input
                        type="radio"
                        id={`ticket-radio-${ticketId}`}
                        name="selectedTicketId"
                        value={ticketId}
                        checked={isSelected}
                        onChange={() => handleTicketSelection(ticketId)}
                        className="sr-only"
                        aria-checked={isSelected}
                      />
                      <div className="flex items-start justify-between gap-6">
                        <div className="flex-1">
                          <h4 className="font-semibold text-card-foreground text-lg">
                            {ticket.splittedCategoryName.main} • {ticket.splittedCategoryName.secondary}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {ticket.categoryName}
                          </p>
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center space-x-4">
                              {ticket.availableSellingQuantities && (
                                <div className="text-sm text-muted-foreground">
                                  {ticket.availableSellingQuantities.length} tickets available
                                </div>
                              )}
                              {ticket.immediateConfirmation ? (
                                <div className="flex items-center text-sm text-accent-foreground">
                                  <span className="mr-1">●</span> Immediate Confirmation
                                </div>
                              ) : (
                                <div className="flex items-center text-sm text-primary">
                                  <span className="mr-1">●</span> Hold for 24 hours
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <div className="text-1xl font-bold text-primary">
                            {ticket.currency} {ticket.price}
                          </div>
                          <span
                            className={`mt-4 px-6 py-2 rounded-full text-sm font-medium transition-all select-none ${
                              isSelected
                                ? 'bg-primary/10 text-primary border border-primary'
                                : 'bg-primary text-primary-foreground hover:bg-primary/90'
                            }`}
                          >
                            {isSelected ? 'Selected' : 'Select'}
                          </span>
                        </div>
                      </div>
                      {(ticket.categoryRestrictions?.length > 0 || ticket.importantNotes || ticket.purchaseAlert) && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <button
                            className="text-sm text-primary hover:text-primary/90 flex items-center"
                            onClick={e => { e.preventDefault(); /* Toggle notes visibility */ }}
                          >
                            See important notes
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </label>
                  );
                })}
              </fieldset>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 