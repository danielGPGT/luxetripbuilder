import { GoogleGenerativeAI } from '@google/generative-ai';
import { toast } from 'sonner';

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
    luxuryLevel: 'ultra-luxury' | 'luxury' | 'premium';
    pace: 'relaxed' | 'moderate' | 'active';
    interests: string[];
    accommodationType: string[];
    diningPreferences: string[];
  };
  specialRequests?: string;
}

export interface ItineraryDay {
  date: string;
  activities: {
    time: string;
    description: string;
    location?: string;
    notes?: string;
  }[];
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
}

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      // Flash model works best with these settings
      generationConfig: {
        temperature: 0.9, // Slightly higher for more creative responses
        topK: 32,
        topP: 0.8,
        maxOutputTokens: 4096, // Increased for longer itineraries
      }
    });
  }

  async generateItinerary(preferences: TripPreferences): Promise<GeneratedItinerary> {
    try {
      const prompt = this.buildPrompt(preferences);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Debug log to see raw response
      console.log('Raw Gemini Response:', text);
      
      try {
        // Try to clean the response if it contains markdown code blocks
        const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
        console.log('Cleaned Response:', cleanedText);
        
        const itinerary = JSON.parse(cleanedText);
        toast.success('Itinerary generated successfully');
        return itinerary;
      } catch (error) {
        console.error('Parse Error:', error);
        toast.error('Failed to parse AI response. Checking response format...');
        
        // If parsing failed, show the error and response for debugging
        throw new Error(`Failed to parse Gemini response as JSON. Raw response: ${text.substring(0, 200)}...`);
      }
    } catch (error) {
      console.error('Generation Error:', error);
      toast.error('Failed to generate itinerary');
      throw error;
    }
  }

  private buildPrompt(preferences: TripPreferences): string {
    return `You are a luxury travel itinerary planning assistant. Generate a detailed luxury travel itinerary based on the following preferences. Your response must be ONLY valid JSON without any additional text or markdown formatting.

Client: ${preferences.clientName}
Destination: ${preferences.destination}
Dates: ${preferences.startDate} to ${preferences.endDate}
Number of Travelers: ${preferences.numberOfTravelers}
Budget: ${preferences.budget.min}-${preferences.budget.max} ${preferences.budget.currency}

Preferences:
- Luxury Level: ${preferences.preferences.luxuryLevel}
- Pace: ${preferences.preferences.pace}
- Interests: ${preferences.preferences.interests.join(', ')}
- Accommodation Types: ${preferences.preferences.accommodationType.join(', ')}
- Dining Preferences: ${preferences.preferences.diningPreferences.join(', ')}
${preferences.specialRequests ? `\nSpecial Requests: ${preferences.specialRequests}` : ''}

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
          "notes": string
        }
      ]
    }
  ],
  "summary": string,
  "totalBudget": {
    "amount": number,
    "currency": string
  }
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