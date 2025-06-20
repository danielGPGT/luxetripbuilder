import { TripIntake, FlightFilters, HotelFilters, EventFilters, AgentContext } from '@/types/trip';
import { useIntakeStore } from '@/store/intake';

export interface QuoteInput {
  tripDetails: {
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    clientAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    destination: string;
    startDate: string;
    endDate: string;
    numberOfTravelers: number;
  };
  preferences: {
    tone: string;
    interests: string[];
    pace: string;
    accommodationType: string[];
    diningPreferences: string[];
    specialRequests?: string;
  };
  budget: {
    amount: number;
    currency: string;
    travelClass: string;
  };
  includeInventory: {
    flights: boolean;
    hotels: boolean;
    events: boolean;
  };
  filters: {
    flightFilters?: FlightFilters;
    hotelFilters?: HotelFilters;
    eventFilters?: EventFilters;
  };
  agentContext?: AgentContext;
  selectedEvent?: {
    id: string;
    name: string;
    dateOfEvent: string;
    venue: {
      name: string;
      city: string;
      country: string;
    };
  };
  selectedTicket?: {
    id: string;
    categoryName: string;
    price: number;
    currency: string;
    available: boolean;
  };
}

export function createQuotePayload(formData: TripIntake): QuoteInput {
  // Convert interests to accommodation types and dining preferences
  const accommodationType = [formData.experience.accommodation];
  const diningPreferences = formData.style.interests.filter(interest => 
    ['fine-dining', 'wine', 'local-culture'].includes(interest)
  );

  // Get event data from the intake store
  const { intakeData } = useIntakeStore.getState();
  const selectedEvent = (intakeData as any)?.selectedEvent;
  const selectedTicket = (intakeData as any)?.selectedTicket;
  
  // Create event-specific special requests if an event is selected
  const eventSpecialRequests = selectedEvent ? 
    `EVENT FOCUSED TRIP: The main purpose of this trip is to attend ${selectedEvent.name} on ${selectedEvent.dateOfEvent}. Ticket type: ${selectedTicket?.categoryName}. This event should be the absolute centerpiece of the entire itinerary. All activities should be planned around this event, including proper transportation to/from the venue, accommodation near the event location, and complementary activities that enhance the event experience.` : 
    undefined;
  
  // Combine existing special requests with event requests
  const combinedSpecialRequests = [formData.experience.specialRequests, eventSpecialRequests]
    .filter(Boolean)
    .join(' ');

  return {
    tripDetails: {
      clientName: formData.travelerInfo.name,
      clientEmail: formData.travelerInfo.email,
      clientPhone: formData.travelerInfo.phone,
      clientAddress: formData.travelerInfo.address,
      destination: formData.destinations.primary,
      startDate: formData.travelerInfo.startDate,
      endDate: formData.travelerInfo.endDate,
      numberOfTravelers: formData.travelerInfo.travelers.adults + formData.travelerInfo.travelers.children,
    },
    preferences: {
      tone: formData.style.tone,
      interests: formData.style.interests,
      pace: formData.experience.pace,
      accommodationType: accommodationType,
      diningPreferences: diningPreferences,
      specialRequests: combinedSpecialRequests || undefined,
    },
    budget: {
      amount: formData.budget.amount,
      currency: formData.budget.currency,
      travelClass: formData.budget.travelClass,
    },
    includeInventory: formData.includeInventory,
    filters: {
      flightFilters: formData.flightFilters,
      hotelFilters: formData.hotelFilters,
      eventFilters: formData.eventFilters,
    },
    agentContext: formData.agentContext,
    selectedEvent: selectedEvent ? {
      id: selectedEvent.id,
      name: selectedEvent.name,
      dateOfEvent: selectedEvent.dateOfEvent,
      venue: {
        name: selectedEvent.venue.name,
        city: selectedEvent.venue.city,
        country: selectedEvent.venue.country,
      },
    } : undefined,
    selectedTicket: selectedTicket ? {
      id: selectedTicket.id,
      categoryName: selectedTicket.categoryName,
      price: selectedTicket.price,
      currency: selectedTicket.currency,
      available: selectedTicket.available,
    } : undefined,
  };
} 