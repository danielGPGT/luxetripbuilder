// Shared inventory types for hotels, events, flights

export interface Hotel {
  id: string;
  name: string;
  location: string;
  rating: number; // 1-5
  pricePerNight: number;
  imageUrl: string;
  description: string;
  amenities: string[];
}

export interface HotelSearchParams {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  roomCount: number;
  maxPrice?: number;
  amenities?: string[];
}

export interface StandardHotelResult {
  id: string;
  name: string;
  image: string;
  description: string;
  rating: number;
  price: number;
  currency: string;
  refundPolicy: string;
  location: string;
  tags: string[];
}

// TODO: Add Event and Flight types
// export interface Event { ... }
// export interface Flight { ... } 