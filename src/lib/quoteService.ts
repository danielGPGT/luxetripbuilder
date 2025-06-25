import { supabase } from './supabase';
import { gemini, type TripPreferences } from './gemini';
import { QuoteInput } from '@/utils/createQuotePayload';

export interface QuoteResponse {
  id: string;
  status: 'draft' | 'confirmed' | 'cancelled';
  totalPrice: number;
  currency: string;
  generatedItinerary: any;
  createdAt: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  destination?: string;
  startDate?: string;
  endDate?: string;
  clientName?: string;
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

export interface QuoteError {
  message: string;
  code: string;
}

export class QuoteService {
  /**
   * Create a new quote with AI-generated itinerary
   */
  static async createQuote(quoteData: QuoteInput): Promise<QuoteResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Calculate base costs
      const baseCost = await this.calculateBaseCosts(quoteData);
      
      // Apply margin
      const margin = quoteData.agentContext?.marginOverride || 0.15; // Default 15% margin
      const totalPrice = baseCost * (1 + margin);

      // Generate AI itinerary using the real Gemini service
      const tripPreferences: TripPreferences = {
        clientName: quoteData.tripDetails.clientName,
        destination: quoteData.tripDetails.destination,
        startDate: quoteData.tripDetails.startDate,
        endDate: quoteData.tripDetails.endDate,
        numberOfTravelers: quoteData.tripDetails.numberOfTravelers,
        budget: {
          min: quoteData.budget.amount * 0.8,
          max: quoteData.budget.amount,
          currency: quoteData.budget.currency,
        },
        preferences: {
          tone: quoteData.preferences.tone,
          pace: quoteData.preferences.pace as 'relaxed' | 'moderate' | 'active',
          interests: quoteData.preferences.interests,
          accommodationType: quoteData.preferences.accommodationType,
          diningPreferences: quoteData.preferences.diningPreferences,
        },
        specialRequests: quoteData.preferences.specialRequests,
        transportType: 'plane', // Default, could be made configurable
        fromLocation: 'Not specified', // Could be made configurable
        travelType: 'solo', // Default, could be made configurable
      };

      console.log('🎯 QuoteService - Generating itinerary with Gemini:', tripPreferences);
      const generatedItinerary = await gemini.generateItinerary(tripPreferences);
      console.log('✅ QuoteService - Itinerary generated successfully:', generatedItinerary);

      // Save to Supabase
      const { data: quote, error } = await supabase
        .from('quotes')
        .insert({
          user_id: user.id,
          client_name: quoteData.tripDetails.clientName,
          client_email: quoteData.tripDetails.clientEmail,
          client_phone: quoteData.tripDetails.clientPhone,
          client_address: quoteData.tripDetails.clientAddress,
          destination: quoteData.tripDetails.destination,
          start_date: quoteData.tripDetails.startDate,
          end_date: quoteData.tripDetails.endDate,
          travelers: { 
            adults: quoteData.tripDetails.numberOfTravelers.adults || 1,
            children: quoteData.tripDetails.numberOfTravelers.children || 0
          },
          trip_details: quoteData.tripDetails,
          preferences: quoteData.preferences,
          budget: quoteData.budget,
          include_inventory: quoteData.includeInventory,
          filters: quoteData.filters,
          agent_context: quoteData.agentContext,
          selected_event: quoteData.selectedEvent,
          selected_ticket: quoteData.selectedTicket,
          base_cost: baseCost,
          margin: margin,
          total_price: totalPrice,
          currency: quoteData.budget.currency,
          generated_itinerary: generatedItinerary,
          status: 'draft',
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to save quote: ${error.message}`);
      }

      return {
        id: quote.id,
        status: quote.status,
        totalPrice: quote.total_price,
        currency: quote.currency,
        generatedItinerary: quote.generated_itinerary,
        createdAt: quote.created_at,
        clientEmail: quote.client_email,
        clientPhone: quote.client_phone,
        clientAddress: quote.client_address,
        destination: quote.destination,
        startDate: quote.start_date,
        endDate: quote.end_date,
        clientName: quote.client_name,
        selectedEvent: quote.selected_event,
        selectedTicket: quote.selected_ticket,
      };

    } catch (error) {
      console.error('Quote creation error:', error);
      throw error;
    }
  }

  /**
   * Get all quotes for the current user
   */
  static async getUserQuotes(): Promise<QuoteResponse[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: quotes, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch quotes: ${error.message}`);
      }

      return quotes.map(quote => ({
        id: quote.id,
        status: quote.status,
        totalPrice: quote.total_price,
        currency: quote.currency,
        generatedItinerary: quote.generated_itinerary,
        createdAt: quote.created_at,
        clientEmail: quote.client_email,
        clientPhone: quote.client_phone,
        clientAddress: quote.client_address,
        destination: quote.destination,
        startDate: quote.start_date,
        endDate: quote.end_date,
        clientName: quote.client_name,
        selectedEvent: quote.selected_event,
        selectedTicket: quote.selected_ticket,
      }));

    } catch (error) {
      console.error('Fetch quotes error:', error);
      throw error;
    }
  }

  /**
   * Get a specific quote by ID
   */
  static async getQuoteById(quoteId: string): Promise<QuoteResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: quote, error } = await supabase
        .from('quotes')
        .select('*')
        .eq('id', quoteId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        throw new Error(`Failed to fetch quote: ${error.message}`);
      }

      if (!quote) {
        throw new Error('Quote not found');
      }

      return {
        id: quote.id,
        status: quote.status,
        totalPrice: quote.total_price,
        currency: quote.currency,
        generatedItinerary: quote.generated_itinerary,
        createdAt: quote.created_at,
        clientEmail: quote.client_email,
        clientPhone: quote.client_phone,
        clientAddress: quote.client_address,
        destination: quote.destination,
        startDate: quote.start_date,
        endDate: quote.end_date,
        clientName: quote.client_name,
        selectedEvent: quote.selected_event,
        selectedTicket: quote.selected_ticket,
      };

    } catch (error) {
      console.error('Fetch quote error:', error);
      throw error;
    }
  }

  /**
   * Update quote status
   */
  static async updateQuoteStatus(quoteId: string, status: 'draft' | 'confirmed' | 'cancelled'): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('quotes')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', quoteId)
        .eq('user_id', user.id);

      if (error) {
        throw new Error(`Failed to update quote: ${error.message}`);
      }

    } catch (error) {
      console.error('Update quote error:', error);
      throw error;
    }
  }

  /**
   * Confirm a quote and create a booking
   */
  static async confirmQuote(quoteId: string): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get the quote first
      const quote = await this.getQuoteById(quoteId);

      if (quote.status !== 'draft') {
        throw new Error('Only draft quotes can be confirmed');
      }

      // Create booking data from quote
      const bookingData = {
        quoteId: quoteId,
        clientName: quote.generatedItinerary?.clientName || 'Unknown',
        destination: quote.generatedItinerary?.destination || 'Unknown',
        startDate: quote.generatedItinerary?.days?.[0]?.date || new Date().toISOString(),
        endDate: quote.generatedItinerary?.days?.[quote.generatedItinerary?.days?.length - 1]?.date || new Date().toISOString(),
        totalCost: quote.totalPrice,
        currency: quote.currency,
        itinerary: quote.generatedItinerary,
        confirmedAt: new Date().toISOString(),
        supplierRef: null, // Will be filled when actual bookings are made
      };

      // Create the booking
      const bookingId = await this.createBooking(quoteId, bookingData);

      console.log('✅ Quote confirmed and booking created:', {
        quoteId,
        bookingId,
        clientName: bookingData.clientName,
        totalCost: bookingData.totalCost,
        currency: bookingData.currency
      });

      return bookingId;

    } catch (error) {
      console.error('Confirm quote error:', error);
      throw error;
    }
  }

  /**
   * Create a booking from a quote
   */
  static async createBooking(quoteId: string, bookingData: any): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get the quote first
      const quote = await this.getQuoteById(quoteId);

      const bookingPayload = {
        quote_id: quoteId,
        user_id: user.id,
        client_name: quote.generatedItinerary?.clientName || 'Unknown',
        booking_data: bookingData,
        total_cost: quote.totalPrice,
        currency: quote.currency,
        status: 'confirmed',
        supplier_ref: bookingData.supplierRef || null,
      };

      const { data: booking, error } = await supabase
        .from('bookings')
        .insert(bookingPayload)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create booking: ${error.message}`);
      }

      // Update quote status to confirmed
      await this.updateQuoteStatus(quoteId, 'confirmed');

      return booking.id;

    } catch (error) {
      console.error('Create booking error:', error);
      throw error;
    }
  }

  /**
   * Delete a quote by ID
   */
  static async deleteQuote(quoteId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('id', quoteId)
        .eq('user_id', user.id);

      if (error) {
        throw new Error(`Failed to delete quote: ${error.message}`);
      }

    } catch (error) {
      console.error('Delete quote error:', error);
      throw error;
    }
  }

  // Private helper methods

  private static async calculateBaseCosts(quoteData: QuoteInput): Promise<number> {
    // Mock calculation - replace with real API calls to inventory providers
    let baseCost = 0;

    // Base trip cost
    baseCost += quoteData.budget.amount * 0.7; // Assume 70% of budget is base cost

    // Add inventory costs if requested
    if (quoteData.includeInventory.flights) {
      baseCost += 800; // Mock flight cost
    }
    if (quoteData.includeInventory.hotels) {
      baseCost += 1200; // Mock hotel cost
    }
    if (quoteData.includeInventory.events) {
      baseCost += 300; // Mock event cost
    }

    // Add selected event ticket costs per traveler
    if (quoteData.selectedEvent && quoteData.selectedTicket) {
      const ticketCostPerPerson = quoteData.selectedTicket.price;
      const numberOfTravelers = quoteData.tripDetails.numberOfTravelers;
      const totalTicketCost = ticketCostPerPerson * numberOfTravelers;
      
      console.log('🎫 Adding event ticket costs:', {
        eventName: quoteData.selectedEvent.name,
        ticketType: quoteData.selectedTicket.categoryName,
        ticketPrice: ticketCostPerPerson,
        currency: quoteData.selectedTicket.currency,
        numberOfTravelers,
        totalTicketCost
      });
      
      baseCost += totalTicketCost;
    }

    return baseCost;
  }

  private static calculateDuration(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }
} 