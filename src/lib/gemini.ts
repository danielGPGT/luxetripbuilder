import { GoogleGenerativeAI } from '@google/generative-ai';
import { toast } from 'sonner';
import { jsonrepair } from 'jsonrepair';

export interface TripPreferences {
  clientName: string;
  destination: string;
  startDate: string;
  endDate: string;
  numberOfTravelers: number;
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  preferences: {
    tone: string;
    pace: 'relaxed' | 'moderate' | 'active';
    interests: string[];
    accommodationType: string[];
    diningPreferences: string[];
  };
  specialRequests?: string;
  transportType?: string;
  fromLocation?: string;
  travelType?: string;
}

export interface ItineraryDay {
  date: string;
  activities: {
    time: string;
    description: string;
    location?: string;
    notes?: string;
    estimatedCost?: number;
    costType?: 'per-person' | 'total';
  }[];
  imageUrl?: string;
}

export interface HotelRecommendation {
  name: string;
  location: string;
  pricePerNight: number;
  rating: string;
  amenities: string[];
}

export interface TransportBreakdown {
  type: string;
  description: string;
  cost: number;
}

export interface ActivityBreakdown {
  name: string;
  cost: number;
  type: string;
}

export interface DiningRecommendation {
  name: string;
  cuisine: string;
  priceRange: string;
  location: string;
}

export interface BudgetBreakdown {
  accommodation: {
    total: number;
    perNight: number;
    hotelRecommendations: HotelRecommendation[];
  };
  transportation: {
    total: number;
    breakdown: TransportBreakdown[];
  };
  activities: {
    total: number;
    breakdown: ActivityBreakdown[];
  };
  dining: {
    total: number;
    perDay: number;
    recommendations: DiningRecommendation[];
  };
  miscellaneous: {
    total: number;
    description: string;
  };
}

export interface LuxuryHighlight {
  title: string;
  description: string;
  whyLuxury: string;
}

export interface TravelTip {
  category: string;
  tips: string[];
}

export interface GeneratedItinerary {
  title: string;
  destination: string;
  clientName: string;
  days: ItineraryDay[];
  summary: string;
  totalBudget: {
    amount: number;
    currency: string;
  };
  budgetBreakdown: BudgetBreakdown;
  luxuryHighlights: LuxuryHighlight[];
  travelTips: TravelTip[];
}

// Helper to convert file buffer to Gemini-compatible format
async function fileToGenerativePart(file: File) {
  const base64EncodedData = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
}

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: ReturnType<GoogleGenerativeAI['getGenerativeModel']>;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    // Use the latest Flash model which is multimodal (handles text and vision)
    this.model = this.genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash-latest",
      generationConfig: {
        temperature: 0.9,
        topK: 32,
        topP: 0.8,
        maxOutputTokens: 8192,
      }
    });
  }

  // Use jsonrepair to handle malformed JSON responses from Gemini
  private tryRepairJson(str: string): string {
    try {
      const cleaned = str.replace(/```json|```/gi, '').trim();
      const repaired = jsonrepair(cleaned);
      return repaired;
    } catch (error) {
      console.error('JSON repair failed:', error);
      return this.basicJsonRepair(str);
    }
  }

  // Fallback method for basic JSON repair
  private basicJsonRepair(str: string): string {
    str = str.replace(/```json|```/gi, '').trim();
    const openBraces = (str.match(/{/g) || []).length;
    let closeBraces = (str.match(/}/g) || []).length;
    const openBrackets = (str.match(/\[/g) || []).length;
    let closeBrackets = (str.match(/\]/g) || []).length;
    while (closeBraces < openBraces) {
      str += '}';
      closeBraces++;
    }
    while (closeBrackets < openBrackets) {
      str += ']';
      closeBrackets++;
    }
    return str;
  }

  async generateItinerary(preferences: TripPreferences): Promise<GeneratedItinerary> {
    try {
      const prompt = this.buildPrompt(preferences);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        const cleanedText = this.tryRepairJson(text);
        const itinerary = JSON.parse(cleanedText) as GeneratedItinerary;
        return itinerary;
      } catch (parseError) {
        console.error('❌ Failed to parse JSON response:', parseError);
        console.error('Raw response was:', text);
        throw new Error('Failed to parse AI response. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error generating itinerary:', error);
      throw error;
    }
  }

  async generateContent(prompt: string, imageFile?: File): Promise<{ response: { text: () => string } }> {
    try {
      if (imageFile) {
        // Use the multimodal model for requests with images
        const imagePart = await fileToGenerativePart(imageFile);
        const result = await this.model.generateContent([prompt, imagePart]);
        return result;
      } else {
        // Use the same model for text-only requests
        const result = await this.model.generateContent(prompt);
        return result;
      }
    } catch (error) {
      console.error('❌ Error generating content:', error);
      throw error;
    }
  }

  private buildPrompt(preferences: TripPreferences): string {
    const duration = Math.ceil((new Date(preferences.endDate).getTime() - new Date(preferences.startDate).getTime()) / (1000 * 60 * 60 * 24));
    const budgetPerDay = preferences.budget.max / duration;
    const budgetPerPerson = preferences.budget.max / preferences.numberOfTravelers;

    console.log('🔍 buildPrompt - specialRequests content:', preferences.specialRequests);

    // Check if this is an event-focused trip
    const hasEventRequest = preferences.specialRequests?.toLowerCase().includes('include') && 
                           preferences.specialRequests?.toLowerCase().includes('as the main focus');
    
    // Alternative detection - check for any event-related content
    const hasEventContent = preferences.specialRequests?.toLowerCase().includes('event') ||
                           preferences.specialRequests?.toLowerCase().includes('ticket') ||
                           preferences.specialRequests?.toLowerCase().includes('grand prix') ||
                           preferences.specialRequests?.toLowerCase().includes('f1');
    
    const isEventTrip = hasEventRequest || hasEventContent;
    
    console.log('🔍 Event detection debug:', {
      specialRequests: preferences.specialRequests,
      hasEventRequest,
      hasEventContent,
      isEventTrip,
      specialRequestsLower: preferences.specialRequests?.toLowerCase()
    });
    
    let eventInstructions = '';
    if (isEventTrip) {
      eventInstructions = `

CRITICAL EVENT INFORMATION - THIS IS THE CENTERPIECE OF THE TRIP:
${preferences.specialRequests}

STRICT ITINERARY REQUIREMENTS FOR EVENT:
1. Event Integration:
   - The specified event is the MAIN FOCUS of the trip
   - ALL event sessions must be included in the itinerary
   - Each session should be clearly marked in activities
   - Do not schedule other major activities during event times

2. Transportation & Logistics:
   - Include detailed transport to/from each session
   - Factor in traffic and security check times
   - Suggest optimal departure times from hotel
   - Include parking/drop-off information if available

3. Complementary Activities:
   - Plan activities that enhance the event experience
   - Include relevant fan zones or event villages
   - Suggest nearby attractions for non-event times
   - Include post-session dining or entertainment aligned with event timing

4. Accommodation:
   - Suggest hotels close to the event venue
   - Consider traffic patterns during event days
   - Include luxury properties with event shuttle services if available

5. Special Considerations:
   - Note best times to arrive for optimal experience
   - Include backup plans for weather delays
   - List essential items to bring for the event`;
    }

    return `You are a luxury travel itinerary planning assistant specializing in creating detailed, premium travel experiences. Generate a comprehensive luxury travel itinerary with detailed pricing breakdowns and recommendations.

IMPORTANT:
* Respond with ONLY valid, compact JSON. Do NOT include markdown, code fences, or any extra text.
* Provide comprehensive, detailed itineraries with specific times, locations, and pricing.
* Include multiple activities per day with realistic timing and costs.
* Be thorough in your recommendations and pricing breakdowns.

CLIENT INFORMATION:
- Name: ${preferences.clientName}
- Travel Type: ${preferences.travelType || 'Not specified'}
- From: ${preferences.fromLocation || 'Not specified'}
- To: ${preferences.destination}
- Preferred Transport: ${preferences.transportType || 'Not specified'}
- Dates: ${preferences.startDate} to ${preferences.endDate} (${duration} days)
- Number of Travelers: ${preferences.numberOfTravelers}
- Total Budget: ${preferences.budget.min}-${preferences.budget.max} ${preferences.budget.currency}
- Budget per Day: ~${budgetPerDay.toFixed(0)} ${preferences.budget.currency}
- Budget per Person: ~${budgetPerPerson.toFixed(0)} ${preferences.budget.currency}

PREFERENCES:
- Tone: ${preferences.preferences.tone}
- Pace: ${preferences.preferences.pace}
- Interests: ${preferences.preferences.interests.join(', ')}
- Accommodation Types: ${preferences.preferences.accommodationType.join(', ')}
- Dining Preferences: ${preferences.preferences.diningPreferences.join(', ')}
${preferences.specialRequests ? `- Special Requests: ${preferences.specialRequests}` : ''}${eventInstructions}

INSTRUCTIONS:
1. Create a detailed daily itinerary with specific times, locations, and activities
2. Include realistic pricing for all components (accommodation, transport, activities, dining)
3. Recommend specific luxury hotels/resorts with nightly rates
4. Include transport costs between destinations
5. Suggest premium activities and experiences with pricing
6. Recommend fine dining establishments with price ranges
7. Consider the tone and interests when selecting activities
8. Ensure the total cost stays within budget
9. Include insider tips and luxury touches
10. Add special experiences that match the traveler's preferences${isEventTrip ? `
11. Make the specified event the absolute centerpiece of the itinerary
12. Schedule all activities around the event timing
13. Include event-specific logistics and recommendations` : ''}

Respond with ONLY a JSON object in this exact format, with no additional text or formatting:
{
  "title": string,
  "destination": string,
  "clientName": string,
  "days": [
    {
      "date": string,
      "activities": [
        {
          "time": string,
          "description": string,
          "location": string,
          "notes": string,
          "estimatedCost": number,
          "costType": "per-person" | "total"
        }
      ]
    }
  ],
  "summary": string,
  "totalBudget": {
    "amount": number,
    "currency": string
  },
  "budgetBreakdown": {
    "accommodation": {
      "total": number,
      "perNight": number,
      "hotelRecommendations": [
        {
          "name": string,
          "location": string,
          "pricePerNight": number,
          "rating": string,
          "amenities": string[]
        }
      ]
    },
    "transportation": {
      "total": number,
      "breakdown": [
        {
          "type": string,
          "description": string,
          "cost": number
        }
      ]
    },
    "activities": {
      "total": number,
      "breakdown": [
        {
          "name": string,
          "cost": number,
          "type": string
        }
      ]
    },
    "dining": {
      "total": number,
      "perDay": number,
      "recommendations": [
        {
          "name": string,
          "cuisine": string,
          "priceRange": string,
          "location": string
        }
      ]
    },
    "miscellaneous": {
      "total": number,
      "description": string
    }
  },
  "luxuryHighlights": [
    {
      "title": string,
      "description": string,
      "whyLuxury": string
    }
  ],
  "travelTips": [
    {
      "category": string,
      "tips": string[]
    }
  ]
}`;
  }
}

// Create a singleton instance
let geminiInstance: GeminiService | null = null;

export function getGeminiService(): GeminiService {
  if (!geminiInstance) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('VITE_GEMINI_API_KEY is not defined in environment variables');
    }
    geminiInstance = new GeminiService(apiKey);
  }
  return geminiInstance;
}

export const gemini = getGeminiService(); 