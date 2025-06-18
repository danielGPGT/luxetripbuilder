import type { IntakeData } from '@/store/intake';
import { createGeminiPrompt } from '@/utils/createGeminiPrompt';

export type GeminiItineraryDay = {
  day: number;
  title: string;
  narrative: string;
  activities: string[];
};

export async function generateItineraryWithGemini(data: IntakeData): Promise<GeminiItineraryDay[]> {
  const prompt = createGeminiPrompt(data);
  // TODO: Replace with real Gemini API call
  // For now, return a mocked itinerary
  return [
    {
      day: 1,
      title: 'Arrival & Sunset Cruise',
      narrative: 'Begin your journey with a luxurious arrival and a sunset cruise.',
      activities: [
        'Private airport pickup',
        'Check-in at Le Meurice',
        'Champagne sunset Seine cruise',
      ],
    },
    {
      day: 2,
      title: 'Gourmet Food Tour',
      narrative: "Explore the city's finest cuisine with a private guide.",
      activities: [
        'Breakfast at Angelina',
        'Private gourmet food tour',
        'Dinner at Michelin-starred restaurant',
      ],
    },
    // ...more days
  ];
} 