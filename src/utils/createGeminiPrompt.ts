import type { IntakeData } from '@/store/intake';

export function createGeminiPrompt(data: IntakeData): string {
  return `Create a 7-day luxury travel itinerary for the following client preferences:

Destination: ${data.destination}
Dates: ${data.startDate} to ${data.endDate}
Interests: ${data.interests.join(', ')}
Tone: ${data.tone}
Travel Type: ${data.travelType}
Budget: ${data.budget.amount} ${data.budget.currency}

Format the response as a JSON array, where each day is an object with:
- day (number)
- title (string)
- narrative (string)
- activities (array of strings)

Example:
[
  {
    "day": 1,
    "title": "Arrival & Sunset Cruise",
    "narrative": "Begin your journey with a luxurious...",
    "activities": [
      "Private airport pickup",
      "Check-in at Le Meurice",
      "Champagne sunset Seine cruise"
    ]
  },
  ...
]
`;
} 