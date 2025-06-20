import { z } from 'zod';

export const travelTypeEnum = z.enum(['solo', 'couple', 'family', 'group']);
export const transportTypeEnum = z.enum(['plane', 'train', 'car', 'ship']);
export const toneEnum = z.enum(['romantic', 'luxury', 'wellness', 'cultural', 'adventure', 'celebration']);
export const paceEnum = z.enum(['relaxed', 'balanced', 'packed']);
export const accommodationEnum = z.enum(['boutique', 'resort', 'villa', 'eco']);
export const travelClassEnum = z.enum(['economy', 'business', 'first']);
export const experienceTypeEnum = z.enum(['exclusive', 'value']);

export const interestsEnum = z.enum([
  'fine-dining',
  'wine',
  'art',
  'history',
  'nature',
  'shopping',
  'beaches',
  'nightlife',
  'sports',
  'spa',
  'local-culture'
]);

export const flightFiltersSchema = z.object({
  preferredAirlines: z.array(z.string()).optional(),
  nonstopOnly: z.boolean().optional(),
  departureTimeRange: z.tuple([z.string(), z.string()]).optional(),
});

export const hotelFiltersSchema = z.object({
  minStarRating: z.number().optional(),
  roomType: z.string().optional(),
  amenities: z.array(z.string()).optional(),
});

export const eventFiltersSchema = z.object({
  types: z.array(z.string()).optional(),
  regions: z.array(z.string()).optional(),
});

export const agentContextSchema = z.object({
  agentId: z.string(),
  marginOverride: z.number().optional(),
});

export const tripIntakeSchema = z.object({
  // Step 1: Traveler Overview
  travelerInfo: z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().min(10, 'Valid phone number is required'),
    address: z.object({
      street: z.string().min(5, 'Street address is required'),
      city: z.string().min(2, 'City is required'),
      state: z.string().min(2, 'State/Province is required'),
      zipCode: z.string().min(3, 'ZIP/Postal code is required'),
      country: z.string().min(2, 'Country is required'),
    }),
    travelType: travelTypeEnum,
    transportType: transportTypeEnum,
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    travelers: z.object({
      adults: z.number().min(1, 'At least one adult is required'),
      children: z.number().min(0).default(0),
    }),
  }),

  // Step 2: Destination Preferences
  destinations: z.object({
    from: z.string().min(2, 'From location is required'),
    primary: z.string().min(2, 'Primary destination is required'),
    additional: z.array(z.string()).default([]),
    duration: z.number().default(0),
  }),

  // Step 3: Trip Style
  style: z.object({
    tone: toneEnum,
    interests: z.array(interestsEnum).min(1, 'Select at least one interest'),
  }),

  // Step 4: Experience Preferences
  experience: z.object({
    pace: paceEnum,
    accommodation: accommodationEnum,
    specialRequests: z.string().optional(),
  }),

  // Step 5: Budget
  budget: z.object({
    amount: z.number().min(1, 'Budget amount is required'),
    currency: z.string().min(3, 'Currency is required'),
    experienceType: experienceTypeEnum,
    travelClass: travelClassEnum,
  }),

  // Step 6: Events
  eventRequests: z.string().default(''),
  eventTypes: z.array(z.string()).default([]),

  // Step 7: Inventory (updated structure)
  includeInventory: z.object({
    flights: z.boolean(),
    hotels: z.boolean(),
    events: z.boolean(),
  }),
  flightFilters: flightFiltersSchema.optional(),
  hotelFilters: hotelFiltersSchema.optional(),
  eventFilters: eventFiltersSchema.optional(),

  // Agent context
  agentContext: agentContextSchema.optional(),
});

export type TripIntake = z.infer<typeof tripIntakeSchema>;
export type FlightFilters = z.infer<typeof flightFiltersSchema>;
export type HotelFilters = z.infer<typeof hotelFiltersSchema>;
export type EventFilters = z.infer<typeof eventFiltersSchema>;
export type AgentContext = z.infer<typeof agentContextSchema>; 