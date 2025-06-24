// RateHawk API Types
export interface RateHawkHotelSearchParams {
  destination: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children?: number;
  rooms?: number;
  currency?: string;
  language?: string;
}

export interface RateHawkHotel {
  id: string;
  name: string;
  rating: number;
  stars: number;
  address: {
    country: string;
    city: string;
    street: string;
    zip: string;
  };
  location: {
    latitude: number;
    longitude: number;
  };
  images: string[];
  amenities: string[];
  description?: string;
  phone?: string;
  email?: string;
  checkInTime?: string;
  checkOutTime?: string;
  hotelChain?: string;
  kind?: string;
  isClosed?: boolean;
  starCertificate?: any;
  paymentMethods?: string[];
  roomGroups?: any[];
  serpFilters?: string[];
  hid?: number;
  region?: {
    country_code: string;
    iata: string;
    id: number;
    name: string;
    type: string;
  };
  facts?: any;
  keysPickup?: any;
  metapolicyExtraInfo?: string;
  policyStruct?: any[];
}

export interface RateHawkRoom {
  id: string;
  name: string;
  type: string;
  capacity: {
    adults: number;
    children: number;
  };
  price: {
    amount: number;
    currency: string;
    originalAmount?: number;
  };
  cancellationPolicy?: string;
  boardType?: string;
  refundable: boolean;
  available: boolean;
}

export interface RateHawkHotelWithRooms extends RateHawkHotel {
  rooms: RateHawkRoom[];
}

export interface RateHawkSearchResponse {
  hotels: RateHawkHotelWithRooms[];
  totalResults: number;
  searchId: string;
}

export interface RateHawkError {
  code: string;
  message: string;
}

class RateHawkService {
  private baseUrl: string;

  constructor() {
    // Use the Express server endpoint instead of Supabase Edge Functions
    this.baseUrl = 'http://localhost:3001/api';
  }

  /**
   * Search for hotels using RateHawk API via Express server
   */
  async searchHotels(params: RateHawkHotelSearchParams): Promise<RateHawkSearchResponse> {
    console.log('🔍 RateHawkService.searchHotels called with params:', params);
    
    try {
      // Use POST endpoint to call RateHawk API (which returns real room data)
      const url = `${this.baseUrl}/search-hotels`;
      console.log('📤 Making POST request to:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Server error:', errorData);
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      console.log('📋 Raw server response:', result);
      
      if (!result.success) {
        console.error('❌ Server returned success: false');
        throw new Error(result.error || 'Failed to search hotels');
      }

      console.log('✅ Server response successful, returning RateHawk data...');

      // Return the RateHawk data directly (it's already in the correct format)
      return result.data;
    } catch (error) {
      console.error('❌ RateHawk search error:', error);
      // Fall back to mock data if API fails
      console.log('🔄 Falling back to mock data...');
      return this.getMockHotels();
    }
  }

  /**
   * Get hotel details by ID via Express server
   */
  async getHotelDetails(hotelId: string, searchParams: RateHawkHotelSearchParams): Promise<RateHawkHotelWithRooms> {
    try {
      const response = await fetch(`${this.baseUrl}/get-hotel-details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hotelId,
          ...searchParams
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Server error:', errorData);
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to get hotel details');
      }

      return result.data;
    } catch (error) {
      console.error('RateHawk hotel details error:', error);
      // Fall back to mock data if API fails
      const mockHotels = this.getMockHotels();
      const mockHotel = mockHotels.hotels.find(h => h.id === hotelId);
      if (!mockHotel) {
        throw new Error('Hotel not found');
      }
      return mockHotel;
    }
  }

  /**
   * Mock data for development/testing when API is not available
   */
  getMockHotels(): RateHawkSearchResponse {
    return {
      hotels: [
        {
          id: 'hotel_1',
          name: 'Luxury Grand Hotel',
          rating: 4.8,
          stars: 5,
          address: {
            country: 'France',
            city: 'Paris',
            street: '123 Champs-Élysées',
            zip: '75008'
          },
          location: {
            latitude: 48.8566,
            longitude: 2.3522
          },
          images: [
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
            'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800'
          ],
          amenities: ['WiFi', 'Spa', 'Restaurant', 'Pool', 'Gym', '24-hour reception'],
          description: 'Luxurious 5-star hotel in the heart of Paris',
          phone: '+33 1 42 65 12 34',
          email: 'reservations@luxurygrandhotel.com',
          checkInTime: '15:00:00',
          checkOutTime: '12:00:00',
          hotelChain: 'Luxury Collection',
          kind: 'Hotel',
          isClosed: false,
          paymentMethods: ['visa', 'mastercard', 'amex', 'cash'],
          serpFilters: ['has_internet', 'has_parking', 'has_spa', 'has_pool'],
          hid: 12345,
          region: {
            country_code: 'FR',
            iata: 'CDG',
            id: 1234,
            name: 'Paris',
            type: 'City'
          },
          rooms: [
            {
              id: 'room_1',
              name: 'Deluxe King Room',
              type: 'King',
              capacity: { adults: 2, children: 1 },
              price: { amount: 450, currency: 'USD' },
              cancellationPolicy: 'Free cancellation until 24h before check-in',
              boardType: 'Room Only',
              refundable: true,
              available: true
            },
            {
              id: 'room_2',
              name: 'Executive Suite',
              type: 'Suite',
              capacity: { adults: 2, children: 2 },
              price: { amount: 750, currency: 'USD' },
              cancellationPolicy: 'Free cancellation until 24h before check-in',
              boardType: 'Breakfast Included',
              refundable: true,
              available: true
            }
          ]
        },
        {
          id: 'hotel_2',
          name: 'Boutique Hotel de Paris',
          rating: 4.6,
          stars: 4,
          address: {
            country: 'France',
            city: 'Paris',
            street: '456 Rue de Rivoli',
            zip: '75001'
          },
          location: {
            latitude: 48.8606,
            longitude: 2.3376
          },
          images: [
            'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
            'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800'
          ],
          amenities: ['WiFi', 'Restaurant', 'Bar', 'Concierge', 'Early check-in'],
          description: 'Charming boutique hotel with authentic Parisian charm',
          phone: '+33 1 42 97 48 51',
          email: 'info@boutiquehoteldeparis.com',
          checkInTime: '14:00:00',
          checkOutTime: '11:00:00',
          hotelChain: 'Independent',
          kind: 'Hotel',
          isClosed: false,
          paymentMethods: ['visa', 'mastercard', 'cash'],
          serpFilters: ['has_internet', 'has_restaurant', 'kitchen'],
          hid: 67890,
          region: {
            country_code: 'FR',
            iata: 'CDG',
            id: 1234,
            name: 'Paris',
            type: 'City'
          },
          rooms: [
            {
              id: 'room_3',
              name: 'Classic Double Room',
              type: 'Double',
              capacity: { adults: 2, children: 0 },
              price: { amount: 280, currency: 'USD' },
              cancellationPolicy: 'Free cancellation until 48h before check-in',
              boardType: 'Room Only',
              refundable: true,
              available: true
            }
          ]
        }
      ],
      totalResults: 2,
      searchId: 'mock_search_123'
    };
  }
}

export const rateHawkService = new RateHawkService(); 