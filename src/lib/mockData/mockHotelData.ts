// Hotel mock data for travel services
// This file provides realistic mock data for hotels

export interface MockHotel {
  id: string;
  name: string;
  brand: string;
  rating: number;
  stars: number;
  location: {
    city: string;
    country: string;
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    area: string;
    distanceFromAirport: string;
    distanceFromCityCenter: string;
  };
  description: string;
  amenities: string[];
  images: string[];
  rooms: MockHotelRoom[];
  policies: {
    checkIn: string;
    checkOut: string;
    cancellationPolicy: string;
    petPolicy: string;
    smokingPolicy: string;
  };
  reviews: {
    average: number;
    total: number;
    breakdown: {
      cleanliness: number;
      service: number;
      location: number;
      value: number;
    };
  };
  available: boolean;
}

export interface MockHotelRoom {
  id: string;
  name: string;
  type: 'standard' | 'deluxe' | 'suite' | 'presidential';
  description: string;
  size: string;
  maxOccupancy: number;
  bedConfiguration: string;
  amenities: string[];
  images: string[];
  price: {
    amount: number;
    currency: string;
    perNight: boolean;
    originalAmount?: number;
  };
  available: boolean;
  cancellationPolicy: string;
  includes: string[];
  extras: {
    name: string;
    price: number;
    currency: string;
  }[];
}

// Mock hotel data for Abu Dhabi
export const mockHotels: MockHotel[] = [
  {
    id: 'hotel_1',
    name: 'Emirates Palace Mandarin Oriental',
    brand: 'Mandarin Oriental',
    rating: 4.9,
    stars: 5,
    location: {
      city: 'Abu Dhabi',
      country: 'United Arab Emirates',
      address: 'West Corniche Road, Abu Dhabi',
      coordinates: {
        latitude: 24.4539,
        longitude: 54.3773
      },
      area: 'West Corniche',
      distanceFromAirport: '45 minutes',
      distanceFromCityCenter: '10 minutes'
    },
    description: 'Iconic luxury hotel featuring opulent Arabian architecture, private beach access, and world-class dining.',
    amenities: [
      'Private Beach',
      'Spa & Wellness Center',
      'Multiple Swimming Pools',
      'Fine Dining Restaurants',
      '24/7 Room Service',
      'Concierge Service',
      'Fitness Center',
      'Business Center',
      'Valet Parking',
      'Free WiFi'
    ],
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
    ],
    rooms: [
      {
        id: 'room_1_1',
        name: 'Palace Deluxe Room',
        type: 'deluxe',
        description: 'Spacious room with city or sea views, featuring elegant Arabian décor and modern amenities.',
        size: '55 sqm',
        maxOccupancy: 3,
        bedConfiguration: '1 King Bed or 2 Twin Beds',
        amenities: [
          'Marble Bathroom',
          'Balcony',
          'City or Sea View',
          'Mini Bar',
          'Coffee Maker',
          'In-room Safe',
          'Flat-screen TV',
          'Free WiFi'
        ],
        images: [
          'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600',
          'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600'
        ],
        price: {
          amount: 850,
          currency: 'GBP',
          perNight: true,
          originalAmount: 950
        },
        available: true,
        cancellationPolicy: 'Free cancellation up to 24 hours before arrival',
        includes: [
          'Daily Housekeeping',
          'Welcome Drink',
          'Access to Spa Facilities',
          'Beach Access'
        ],
        extras: [
          {
            name: 'Airport Transfer',
            price: 120,
            currency: 'GBP'
          },
          {
            name: 'Breakfast Buffet',
            price: 45,
            currency: 'GBP'
          }
        ]
      }
    ],
    policies: {
      checkIn: '3:00 PM',
      checkOut: '12:00 PM',
      cancellationPolicy: 'Free cancellation up to 24 hours before arrival',
      petPolicy: 'Pets allowed with prior arrangement',
      smokingPolicy: 'Designated smoking areas only'
    },
    reviews: {
      average: 4.9,
      total: 567,
      breakdown: {
        cleanliness: 4.9,
        service: 4.9,
        location: 4.8,
        value: 4.7
      }
    },
    available: true
  },
  {
    id: 'hotel_2',
    name: 'St. Regis Abu Dhabi',
    brand: 'St. Regis',
    rating: 4.8,
    stars: 5,
    location: {
      city: 'Abu Dhabi',
      country: 'United Arab Emirates',
      address: 'Nation Towers, Corniche, Abu Dhabi',
      coordinates: {
        latitude: 24.4539,
        longitude: 54.3773
      },
      area: 'Corniche',
      distanceFromAirport: '40 minutes',
      distanceFromCityCenter: '5 minutes'
    },
    description: 'Luxury hotel in the iconic Nation Towers with stunning views of the Arabian Gulf and city skyline.',
    amenities: [
      'Infinity Pool',
      'Spa & Wellness Center',
      'Multiple Restaurants',
      'Butler Service',
      'Fitness Center',
      'Business Center',
      'Valet Parking',
      'Free WiFi',
      'Concierge Service'
    ],
    images: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'
    ],
    rooms: [
      {
        id: 'room_2_1',
        name: 'St. Regis Suite',
        type: 'suite',
        description: 'Luxurious suite with separate living area, stunning views, and personalized butler service.',
        size: '75 sqm',
        maxOccupancy: 4,
        bedConfiguration: '1 King Bed + Living Room',
        amenities: [
          'Separate Living Room',
          'Marble Bathroom',
          'Gulf View',
          'Butler Service',
          'Mini Bar',
          'Coffee Maker',
          'In-room Safe',
          'Flat-screen TV',
          'Free WiFi'
        ],
        images: [
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600'
        ],
        price: {
          amount: 1200,
          currency: 'GBP',
          perNight: true
        },
        available: true,
        cancellationPolicy: 'Free cancellation up to 24 hours before arrival',
        includes: [
          'Daily Housekeeping',
          'Butler Service',
          'Welcome Amenities',
          'Access to Spa Facilities'
        ],
        extras: [
          {
            name: 'Airport Transfer',
            price: 100,
            currency: 'GBP'
          },
          {
            name: 'Breakfast Buffet',
            price: 50,
            currency: 'GBP'
          }
        ]
      }
    ],
    policies: {
      checkIn: '3:00 PM',
      checkOut: '12:00 PM',
      cancellationPolicy: 'Free cancellation up to 24 hours before arrival',
      petPolicy: 'Pets allowed with prior arrangement',
      smokingPolicy: 'Designated smoking areas only'
    },
    reviews: {
      average: 4.8,
      total: 423,
      breakdown: {
        cleanliness: 4.8,
        service: 4.9,
        location: 4.8,
        value: 4.7
      }
    },
    available: true
  }
];

export const getMockHotels = (city?: string, stars?: number): MockHotel[] => {
  let filteredHotels = mockHotels;

  if (city) {
    filteredHotels = filteredHotels.filter(hotel => 
      hotel.location.city.toLowerCase().includes(city.toLowerCase())
    );
  }

  if (stars) {
    filteredHotels = filteredHotels.filter(hotel => hotel.stars >= stars);
  }

  return filteredHotels;
};

export interface RateHawkHotelRate {
  match_hash: string;
  search_hash: string;
  daily_prices: string[];
  meal: string;
  meal_data: {
    value: string;
    has_breakfast: boolean;
    no_child_meal: boolean;
  };
  payment_options: {
    payment_types: Array<{
      amount: string;
      show_amount: string;
      currency_code: string;
      show_currency_code: string;
      by: string | null;
      is_need_credit_card_data: boolean;
      is_need_cvc: boolean;
      type: string;
      vat_data: {
        included: boolean;
        applied: boolean;
        amount: string;
        currency_code: string;
        value: string;
      };
      tax_data: any;
      perks: any;
      commission_info: {
        show: {
          amount_gross: string;
          amount_net: string;
          amount_commission: string;
        };
        charge: {
          amount_gross: string;
          amount_net: string;
          amount_commission: string;
        };
      };
      cancellation_penalties: {
        policies: Array<{
          start_at: string | null;
          end_at: string | null;
          amount_charge: string;
          amount_show: string;
          commission_info: {
            show: {
              amount_gross: string;
              amount_net: string;
              amount_commission: string;
            };
            charge: {
              amount_gross: string;
              amount_net: string;
              amount_commission: string;
            };
          };
        }>;
        free_cancellation_before: string;
      };
      recommended_price: string | null;
    }>;
  };
  bar_rate_price_data: any;
  rg_ext: {
    class: number;
    quality: number;
    sex: number;
    bathroom: number;
    bedding: number;
    family: number;
    capacity: number;
    club: number;
    bedrooms: number;
    balcony: number;
    view: number;
    floor: number;
  };
  legal_info: any;
  room_name: string;
  room_name_info: {
    original_rate_name: string;
  };
  serp_filters: string[];
  sell_price_limits: any;
  allotment: number;
  amenities_data: string[];
  any_residency: boolean;
  deposit: any;
  no_show: any;
  room_data_trans: {
    main_room_type: string;
    main_name: string;
    bathroom: string | null;
    bedding_type: string;
    misc_room_type: string | null;
  };
}

export interface RateHawkHotel {
  id: string;
  hid: number;
  rates: RateHawkHotelRate[];
  bar_price_data: any;
}

export interface RateHawkHotelResponse {
  data: {
    hotels: RateHawkHotel[];
    total_hotels: number;
  };
  debug: {
    request: {
      checkin: string;
      checkout: string;
      residency: string;
      language: string;
      guests: Array<{
        adults: number;
        children: any[];
      }>;
      region_id: number;
      currency: string;
    };
    key_id: number;
    validation_error: string | null;
  };
  status: string;
  error: string | null;
}

export const mockRateHawkHotels: RateHawkHotelResponse = {
  data: {
    hotels: [
      {
        id: "rila_muam_castle_hotel",
        hid: 9025546,
        rates: [
          {
            match_hash: "m-e5bd52dd-670c-5fb8-9be0-dc7e1d36be12",
            search_hash: "sr-0193a945-92bb-7190-8455-28cc350f6e9f",
            daily_prices: ["24.00", "24.00", "24.00"],
            meal: "nomeal",
            meal_data: {
              value: "nomeal",
              has_breakfast: false,
              no_child_meal: true
            },
            payment_options: {
              payment_types: [
                {
                  amount: "76.20",
                  show_amount: "72.00",
                  currency_code: "EUR",
                  show_currency_code: "EUR",
                  by: null,
                  is_need_credit_card_data: false,
                  is_need_cvc: false,
                  type: "deposit",
                  vat_data: {
                    included: false,
                    applied: false,
                    amount: "0.00",
                    currency_code: "USD",
                    value: "0.00"
                  },
                  tax_data: {},
                  perks: {},
                  commission_info: {
                    show: {
                      amount_gross: "90.00",
                      amount_net: "72.00",
                      amount_commission: "18.00"
                    },
                    charge: {
                      amount_gross: "9514.00",
                      amount_net: "7611.20",
                      amount_commission: "1902.80"
                    }
                  },
                  cancellation_penalties: {
                    policies: [
                      {
                        start_at: null,
                        end_at: "2025-10-19T18:30:00",
                        amount_charge: "0.00",
                        amount_show: "0.00",
                        commission_info: {
                          show: {
                            amount_gross: "0.00",
                            amount_net: "0.00",
                            amount_commission: "0.00"
                          },
                          charge: {
                            amount_gross: "0.00",
                            amount_net: "0.00",
                            amount_commission: "0.00"
                          }
                        }
                      },
                      {
                        start_at: "2025-10-19T18:30:00",
                        end_at: null,
                        amount_charge: "7611.20",
                        amount_show: "72.00",
                        commission_info: {
                          show: {
                            amount_gross: "90.00",
                            amount_net: "72.00",
                            amount_commission: "18.00"
                          },
                          charge: {
                            amount_gross: "9514.00",
                            amount_net: "7611.20",
                            amount_commission: "1902.80"
                          }
                        }
                      }
                    ],
                    free_cancellation_before: "2025-10-19T18:30:00"
                  },
                  recommended_price: null
                }
              ]
            },
            bar_rate_price_data: null,
            rg_ext: {
              class: 3,
              quality: 2,
              sex: 0,
              bathroom: 2,
              bedding: 3,
              family: 0,
              capacity: 2,
              club: 0,
              bedrooms: 0,
              balcony: 0,
              view: 0,
              floor: 0
            },
            legal_info: null,
            room_name: "Standard Double room (full double bed)",
            room_name_info: {
              original_rate_name: "Basic Room 1 Double Bed Non Smoking 1 Double Bed"
            },
            serp_filters: ["has_bathroom"],
            sell_price_limits: null,
            allotment: 1,
            amenities_data: ["non-smoking"],
            any_residency: false,
            deposit: null,
            no_show: null,
            room_data_trans: {
              main_room_type: "Standard Double room",
              main_name: "Standard Double room",
              bathroom: null,
              bedding_type: "full double bed",
              misc_room_type: null
            }
          },
          {
            match_hash: "m-0afed42a-c8b9-5287-811b-fa29f24813ad",
            search_hash: "sr-0193a945-92bb-7191-917f-b591fa84d38e",
            daily_prices: ["27.20", "27.20", "27.20"],
            meal: "nomeal",
            meal_data: {
              value: "nomeal",
              has_breakfast: false,
              no_child_meal: true
            },
            payment_options: {
              payment_types: [
                {
                  amount: "86.80",
                  show_amount: "81.60",
                  currency_code: "EUR",
                  show_currency_code: "EUR",
                  by: null,
                  is_need_credit_card_data: false,
                  is_need_cvc: false,
                  type: "deposit",
                  vat_data: {
                    included: false,
                    applied: false,
                    amount: "0.00",
                    currency_code: "USD",
                    value: "0.00"
                  },
                  tax_data: {},
                  perks: {},
                  commission_info: {
                    show: {
                      amount_gross: "102.00",
                      amount_net: "81.60",
                      amount_commission: "20.40"
                    },
                    charge: {
                      amount_gross: "10761.00",
                      amount_net: "8608.80",
                      amount_commission: "2152.20"
                    }
                  },
                  cancellation_penalties: {
                    policies: [
                      {
                        start_at: null,
                        end_at: "2025-10-20T23:00:00",
                        amount_charge: "0.00",
                        amount_show: "0.00",
                        commission_info: {
                          show: {
                            amount_gross: "0.00",
                            amount_net: "0.00",
                            amount_commission: "0.00"
                          },
                          charge: {
                            amount_gross: "0.00",
                            amount_net: "0.00",
                            amount_commission: "0.00"
                          }
                        }
                      },
                      {
                        start_at: "2025-10-20T23:00:00",
                        end_at: null,
                        amount_charge: "8608.80",
                        amount_show: "81.60",
                        commission_info: {
                          show: {
                            amount_gross: "102.00",
                            amount_net: "81.60",
                            amount_commission: "20.40"
                          },
                          charge: {
                            amount_gross: "10761.00",
                            amount_net: "8608.80",
                            amount_commission: "2152.20"
                          }
                        }
                      }
                    ],
                    free_cancellation_before: "2025-10-20T23:00:00"
                  },
                  recommended_price: null
                }
              ]
            },
            bar_rate_price_data: null,
            rg_ext: {
              class: 3,
              quality: 18,
              sex: 0,
              bathroom: 2,
              bedding: 3,
              family: 0,
              capacity: 2,
              club: 0,
              bedrooms: 0,
              balcony: 0,
              view: 0,
              floor: 0
            },
            legal_info: null,
            room_name: "Classic Double room (full double bed)",
            room_name_info: {
              original_rate_name: "Classic Room, 1 Double Bed, Non Smoking 1 Double Bed"
            },
            serp_filters: ["has_bathroom"],
            sell_price_limits: null,
            allotment: 1,
            amenities_data: ["non-smoking"],
            any_residency: false,
            deposit: null,
            no_show: null,
            room_data_trans: {
              main_room_type: "Classic Double room",
              main_name: "Classic Double room",
              bathroom: null,
              bedding_type: "full double bed",
              misc_room_type: null
            }
          },
          {
            match_hash: "m-a698ef29-aacf-5ff9-9792-dc73ec17efec",
            search_hash: "sr-0193a945-92bb-719a-bb95-7c443effd5bd",
            daily_prices: ["38.13", "38.13", "38.13"],
            meal: "nomeal",
            meal_data: {
              value: "nomeal",
              has_breakfast: false,
              no_child_meal: true
            },
            payment_options: {
              payment_types: [
                {
                  amount: "120.60",
                  show_amount: "114.40",
                  currency_code: "EUR",
                  show_currency_code: "EUR",
                  by: null,
                  is_need_credit_card_data: false,
                  is_need_cvc: false,
                  type: "deposit",
                  vat_data: {
                    included: false,
                    applied: false,
                    amount: "0.00",
                    currency_code: "USD",
                    value: "0.00"
                  },
                  tax_data: {},
                  perks: {},
                  commission_info: {
                    show: {
                      amount_gross: "143.00",
                      amount_net: "114.40",
                      amount_commission: "28.60"
                    },
                    charge: {
                      amount_gross: "15092.00",
                      amount_net: "12073.60",
                      amount_commission: "3018.40"
                    }
                  },
                  cancellation_penalties: {
                    policies: [
                      {
                        start_at: null,
                        end_at: "2025-10-19T18:30:00",
                        amount_charge: "0.00",
                        amount_show: "0.00",
                        commission_info: {
                          show: {
                            amount_gross: "0.00",
                            amount_net: "0.00",
                            amount_commission: "0.00"
                          },
                          charge: {
                            amount_gross: "0.00",
                            amount_net: "0.00",
                            amount_commission: "0.00"
                          }
                        }
                      },
                      {
                        start_at: "2025-10-19T18:30:00",
                        end_at: null,
                        amount_charge: "12073.60",
                        amount_show: "114.40",
                        commission_info: {
                          show: {
                            amount_gross: "143.00",
                            amount_net: "114.40",
                            amount_commission: "28.60"
                          },
                          charge: {
                            amount_gross: "15092.00",
                            amount_net: "12073.60",
                            amount_commission: "3018.40"
                          }
                        }
                      }
                    ],
                    free_cancellation_before: "2025-10-19T18:30:00"
                  },
                  recommended_price: null
                }
              ]
            },
            bar_rate_price_data: null,
            rg_ext: {
              class: 3,
              quality: 4,
              sex: 0,
              bathroom: 2,
              bedding: 3,
              family: 0,
              capacity: 2,
              club: 0,
              bedrooms: 0,
              balcony: 0,
              view: 0,
              floor: 0
            },
            legal_info: null,
            room_name: "Business Double room (full double bed) (queen size bed)",
            room_name_info: {
              original_rate_name: "Business Room 1 Queen Bed"
            },
            serp_filters: ["has_bathroom"],
            sell_price_limits: null,
            allotment: 1,
            amenities_data: ["non-smoking", "queen-bed"],
            any_residency: false,
            deposit: null,
            no_show: null,
            room_data_trans: {
              main_room_type: "Business Double room",
              main_name: "Business Double room",
              bathroom: null,
              bedding_type: "full double bed",
              misc_room_type: "queen size bed"
            }
          },
          {
            match_hash: "m-bbbbe085-6358-55a4-bb29-85c412c31210",
            search_hash: "sr-0193a945-92bb-7194-b1a8-47e471eb8dee",
            daily_prices: ["50.67", "50.67", "50.67"],
            meal: "nomeal",
            meal_data: {
              value: "nomeal",
              has_breakfast: false,
              no_child_meal: true
            },
            payment_options: {
              payment_types: [
                {
                  amount: "160.80",
                  show_amount: "152.00",
                  currency_code: "EUR",
                  show_currency_code: "EUR",
                  by: null,
                  is_need_credit_card_data: false,
                  is_need_cvc: false,
                  type: "deposit",
                  vat_data: {
                    included: false,
                    applied: false,
                    amount: "0.00",
                    currency_code: "USD",
                    value: "0.00"
                  },
                  tax_data: {},
                  perks: {},
                  commission_info: {
                    show: {
                      amount_gross: "190.00",
                      amount_net: "152.00",
                      amount_commission: "38.00"
                    },
                    charge: {
                      amount_gross: "20101.00",
                      amount_net: "16080.80",
                      amount_commission: "4020.20"
                    }
                  },
                  cancellation_penalties: {
                    policies: [
                      {
                        start_at: null,
                        end_at: "2025-10-19T18:30:00",
                        amount_charge: "0.00",
                        amount_show: "0.00",
                        commission_info: {
                          show: {
                            amount_gross: "0.00",
                            amount_net: "0.00",
                            amount_commission: "0.00"
                          },
                          charge: {
                            amount_gross: "0.00",
                            amount_net: "0.00",
                            amount_commission: "0.00"
                          }
                        }
                      },
                      {
                        start_at: "2025-10-19T18:30:00",
                        end_at: null,
                        amount_charge: "16080.80",
                        amount_show: "152.00",
                        commission_info: {
                          show: {
                            amount_gross: "190.00",
                            amount_net: "152.00",
                            amount_commission: "38.00"
                          },
                          charge: {
                            amount_gross: "20101.00",
                            amount_net: "16080.80",
                            amount_commission: "4020.20"
                          }
                        }
                      }
                    ],
                    free_cancellation_before: "2025-10-19T18:30:00"
                  },
                  recommended_price: null
                }
              ]
            },
            bar_rate_price_data: null,
            rg_ext: {
              class: 3,
              quality: 17,
              sex: 0,
              bathroom: 2,
              bedding: 3,
              family: 0,
              capacity: 2,
              club: 0,
              bedrooms: 0,
              balcony: 0,
              view: 0,
              floor: 0
            },
            legal_info: null,
            room_name: "Premium Double room (full double bed) (queen size bed)",
            room_name_info: {
              original_rate_name: "Premium Room 1 Queen Bed"
            },
            serp_filters: ["has_bathroom"],
            sell_price_limits: null,
            allotment: 1,
            amenities_data: ["non-smoking", "queen-bed"],
            any_residency: false,
            deposit: null,
            no_show: null,
            room_data_trans: {
              main_room_type: "Premium Double room",
              main_name: "Premium Double room",
              bathroom: null,
              bedding_type: "full double bed",
              misc_room_type: "queen size bed"
            }
          }
        ],
        bar_price_data: null
      },
      {
        id: "emirates_palace_mandarin_oriental",
        hid: 9025547,
        rates: [
          {
            match_hash: "m-luxury-suite-001",
            search_hash: "sr-luxury-suite-search",
            daily_prices: ["450.00", "450.00", "450.00", "450.00"],
            meal: "breakfast",
            meal_data: {
              value: "breakfast",
              has_breakfast: true,
              no_child_meal: false
            },
            payment_options: {
              payment_types: [
                {
                  amount: "1800.00",
                  show_amount: "1800.00",
                  currency_code: "EUR",
                  show_currency_code: "EUR",
                  by: null,
                  is_need_credit_card_data: true,
                  is_need_cvc: true,
                  type: "deposit",
                  vat_data: {
                    included: true,
                    applied: true,
                    amount: "180.00",
                    currency_code: "EUR",
                    value: "10.00"
                  },
                  tax_data: {},
                  perks: {
                    free_wifi: true,
                    free_parking: true,
                    spa_access: true
                  },
                  commission_info: {
                    show: {
                      amount_gross: "2160.00",
                      amount_net: "1800.00",
                      amount_commission: "360.00"
                    },
                    charge: {
                      amount_gross: "216000.00",
                      amount_net: "180000.00",
                      amount_commission: "36000.00"
                    }
                  },
                  cancellation_penalties: {
                    policies: [
                      {
                        start_at: null,
                        end_at: "2025-12-01T18:00:00",
                        amount_charge: "0.00",
                        amount_show: "0.00",
                        commission_info: {
                          show: {
                            amount_gross: "0.00",
                            amount_net: "0.00",
                            amount_commission: "0.00"
                          },
                          charge: {
                            amount_gross: "0.00",
                            amount_net: "0.00",
                            amount_commission: "0.00"
                          }
                        }
                      },
                      {
                        start_at: "2025-12-01T18:00:00",
                        end_at: null,
                        amount_charge: "180000.00",
                        amount_show: "1800.00",
                        commission_info: {
                          show: {
                            amount_gross: "2160.00",
                            amount_net: "1800.00",
                            amount_commission: "360.00"
                          },
                          charge: {
                            amount_gross: "216000.00",
                            amount_net: "180000.00",
                            amount_commission: "36000.00"
                          }
                        }
                      }
                    ],
                    free_cancellation_before: "2025-12-01T18:00:00"
                  },
                  recommended_price: null
                }
              ]
            },
            bar_rate_price_data: null,
            rg_ext: {
              class: 5,
              quality: 20,
              sex: 0,
              bathroom: 3,
              bedding: 4,
              family: 1,
              capacity: 4,
              club: 1,
              bedrooms: 1,
              balcony: 1,
              view: 2,
              floor: 10
            },
            legal_info: null,
            room_name: "Palace Suite with Sea View",
            room_name_info: {
              original_rate_name: "Palace Suite with Sea View and Breakfast"
            },
            serp_filters: ["has_bathroom", "sea_view", "balcony", "luxury"],
            sell_price_limits: null,
            allotment: 2,
            amenities_data: ["non-smoking", "sea-view", "balcony", "breakfast", "spa-access", "concierge"],
            any_residency: false,
            deposit: null,
            no_show: null,
            room_data_trans: {
              main_room_type: "Palace Suite",
              main_name: "Palace Suite",
              bathroom: "en-suite",
              bedding_type: "king bed",
              misc_room_type: "sea view"
            }
          }
        ],
        bar_price_data: null
      },
      {
        id: "yas_hotel_abu_dhabi",
        hid: 9025548,
        rates: [
          {
            match_hash: "m-yas-deluxe-001",
            search_hash: "sr-yas-deluxe-search",
            daily_prices: ["180.00", "180.00", "180.00", "180.00"],
            meal: "nomeal",
            meal_data: {
              value: "nomeal",
              has_breakfast: false,
              no_child_meal: true
            },
            payment_options: {
              payment_types: [
                {
                  amount: "720.00",
                  show_amount: "720.00",
                  currency_code: "EUR",
                  show_currency_code: "EUR",
                  by: null,
                  is_need_credit_card_data: false,
                  is_need_cvc: false,
                  type: "deposit",
                  vat_data: {
                    included: false,
                    applied: false,
                    amount: "0.00",
                    currency_code: "EUR",
                    value: "0.00"
                  },
                  tax_data: {},
                  perks: {
                    free_wifi: true,
                    gym_access: true
                  },
                  commission_info: {
                    show: {
                      amount_gross: "864.00",
                      amount_net: "720.00",
                      amount_commission: "144.00"
                    },
                    charge: {
                      amount_gross: "86400.00",
                      amount_net: "72000.00",
                      amount_commission: "14400.00"
                    }
                  },
                  cancellation_penalties: {
                    policies: [
                      {
                        start_at: null,
                        end_at: "2025-12-02T18:00:00",
                        amount_charge: "0.00",
                        amount_show: "0.00",
                        commission_info: {
                          show: {
                            amount_gross: "0.00",
                            amount_net: "0.00",
                            amount_commission: "0.00"
                          },
                          charge: {
                            amount_gross: "0.00",
                            amount_net: "0.00",
                            amount_commission: "0.00"
                          }
                        }
                      },
                      {
                        start_at: "2025-12-02T18:00:00",
                        end_at: null,
                        amount_charge: "72000.00",
                        amount_show: "720.00",
                        commission_info: {
                          show: {
                            amount_gross: "864.00",
                            amount_net: "720.00",
                            amount_commission: "144.00"
                          },
                          charge: {
                            amount_gross: "86400.00",
                            amount_net: "72000.00",
                            amount_commission: "14400.00"
                          }
                        }
                      }
                    ],
                    free_cancellation_before: "2025-12-02T18:00:00"
                  },
                  recommended_price: null
                }
              ]
            },
            bar_rate_price_data: null,
            rg_ext: {
              class: 4,
              quality: 15,
              sex: 0,
              bathroom: 2,
              bedding: 3,
              family: 0,
              capacity: 3,
              club: 0,
              bedrooms: 0,
              balcony: 1,
              view: 1,
              floor: 5
            },
            legal_info: null,
            room_name: "Deluxe Room with Marina View",
            room_name_info: {
              original_rate_name: "Deluxe Room with Marina View"
            },
            serp_filters: ["has_bathroom", "marina_view", "balcony"],
            sell_price_limits: null,
            allotment: 5,
            amenities_data: ["non-smoking", "marina-view", "balcony", "free-wifi"],
            any_residency: false,
            deposit: null,
            no_show: null,
            room_data_trans: {
              main_room_type: "Deluxe Room",
              main_name: "Deluxe Room",
              bathroom: "en-suite",
              bedding_type: "queen bed",
              misc_room_type: "marina view"
            }
          }
        ],
        bar_price_data: null
      }
    ],
    total_hotels: 3
  },
  debug: {
    request: {
      checkin: "2025-12-04",
      checkout: "2025-12-08",
      residency: "gb",
      language: "en",
      guests: [
        {
          adults: 2,
          children: []
        }
      ],
      region_id: 965849721,
      currency: "EUR"
    },
    key_id: 7705,
    validation_error: null
  },
  status: "ok",
  error: null
};

// Helper function to get the best rate for a hotel based on criteria
export const getBestRate = (hotel: RateHawkHotel, criteria: {
  maxPrice?: number;
  minCapacity?: number;
  mealPreference?: string;
  quality?: number;
}) => {
  const { maxPrice, minCapacity = 1, mealPreference, quality } = criteria;
  
  let filteredRates = hotel.rates.filter(rate => {
    // Check capacity
    if (rate.rg_ext.capacity < minCapacity) return false;
    
    // Check price
    if (maxPrice) {
      const totalPrice = parseFloat(rate.payment_options.payment_types[0].amount);
      if (totalPrice > maxPrice) return false;
    }
    
    // Check meal preference
    if (mealPreference && rate.meal !== mealPreference) return false;
    
    // Check quality
    if (quality && rate.rg_ext.quality < quality) return false;
    
    return true;
  });
  
  // Sort by price (lowest first) then by quality (highest first)
  filteredRates.sort((a, b) => {
    const priceA = parseFloat(a.payment_options.payment_types[0].amount);
    const priceB = parseFloat(b.payment_options.payment_types[0].amount);
    
    if (priceA !== priceB) return priceA - priceB;
    return b.rg_ext.quality - a.rg_ext.quality;
  });
  
  return filteredRates[0] || hotel.rates[0];
};

// Helper function to calculate total price for multiple nights
export const calculateTotalPrice = (rate: RateHawkHotelRate, nights: number) => {
  const dailyPrices = rate.daily_prices.map(price => parseFloat(price));
  const totalDailyPrice = dailyPrices.reduce((sum, price) => sum + price, 0);
  return totalDailyPrice;
};

// Helper function to get room amenities as readable strings
export const getRoomAmenities = (rate: RateHawkHotelRate) => {
  const amenities = [];
  
  if (rate.meal_data.has_breakfast) amenities.push("Breakfast Included");
  if (rate.amenities_data.includes("non-smoking")) amenities.push("Non-Smoking");
  if (rate.amenities_data.includes("sea-view")) amenities.push("Sea View");
  if (rate.amenities_data.includes("marina-view")) amenities.push("Marina View");
  if (rate.amenities_data.includes("balcony")) amenities.push("Balcony");
  if (rate.amenities_data.includes("queen-bed")) amenities.push("Queen Bed");
  if (rate.amenities_data.includes("spa-access")) amenities.push("Spa Access");
  if (rate.amenities_data.includes("concierge")) amenities.push("Concierge Service");
  
  return amenities;
}; 