import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { destination, checkIn, checkOut, adults, children, rooms, currency, language } = await req.json()

    // Validate required parameters
    if (!destination || !checkIn || !checkOut || !adults) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get environment variables
    const apiUrl = Deno.env.get('VITE_ET_API_URL')
    const apiKey = Deno.env.get('VITE_ET_API_KEY')
    const apiId = Deno.env.get('VITE_ET_API_ID')

    if (!apiUrl || !apiKey || !apiId) {
      console.error('RateHawk API credentials not found in environment variables')
      return new Response(
        JSON.stringify({ error: 'API configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Prepare the request payload for RateHawk API
    const searchPayload = {
      location: destination,
      checkin: checkIn,
      checkout: checkOut,
      adults: adults,
      children: children || 0,
      rooms: rooms || 1,
      currency: currency || 'USD',
      language: language || 'en',
      limit: 20, // Limit results for performance
      offset: 0
    }

    // Make request to RateHawk API
    const response = await fetch(`${apiUrl}/hotels/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-API-ID': apiId
      },
      body: JSON.stringify(searchPayload)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('RateHawk API error:', response.status, errorText)
      
      // Return mock data for development if API fails
      return new Response(
        JSON.stringify(getMockHotels()),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const data = await response.json()

    // Transform RateHawk response to our format
    const transformedData = transformRateHawkResponse(data)

    return new Response(
      JSON.stringify(transformedData),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Search hotels error:', error)
    
    // Return mock data for development
    return new Response(
      JSON.stringify(getMockHotels()),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function transformRateHawkResponse(data: any) {
  // This function transforms RateHawk's response format to our expected format
  // You'll need to adjust this based on the actual RateHawk API response structure
  
  try {
    // For now, return mock data while we figure out the exact RateHawk response format
    return getMockHotels()
  } catch (error) {
    console.error('Error transforming RateHawk response:', error)
    return getMockHotels()
  }
}

function getMockHotels() {
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
        amenities: ['WiFi', 'Spa', 'Restaurant', 'Pool', 'Gym'],
        description: 'Luxurious 5-star hotel in the heart of Paris',
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
        amenities: ['WiFi', 'Restaurant', 'Bar', 'Concierge'],
        description: 'Charming boutique hotel with authentic Parisian charm',
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
  }
} 