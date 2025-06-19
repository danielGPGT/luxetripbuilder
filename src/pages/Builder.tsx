import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IntakeForm } from '@/components/forms/IntakeForm';
import { ItineraryEditor } from '@/components/ItineraryEditor';
import { gemini, type TripPreferences, type GeneratedItinerary, type ItineraryDay } from '@/lib/gemini';
import { toast } from 'sonner';
import { useIntakeStore } from '@/store/intake';

// Mock itinerary days for demo
const mockDays = [
  {
    date: '2024-07-01',
    activities: [
      { time: 'Morning', description: 'Arrive in Paris' },
      { time: 'Afternoon', description: 'Check in to hotel' },
    ],
    imageUrl: '',
  },
  {
    date: '2024-07-02',
    activities: [
      { time: 'Morning', description: 'Louvre Museum' },
    ],
    imageUrl: '',
  },
];

export function Builder() {
  const [step, setStep] = useState<'preferences' | 'editor'>('preferences');
  const [intake, setIntake] = useState<any>(null);
  const [days, setDays] = useState<ItineraryDay[]>(mockDays as ItineraryDay[]);
  const [loading, setLoading] = useState(false);
  const { intakeData } = useIntakeStore();

  const handleIntakeSubmit = async (data: any) => {
    setIntake(data);
    setLoading(true);
    
    try {
      // Get event data from the intake store
      const selectedEvent = intakeData?.selectedEvent;
      const selectedTicket = intakeData?.selectedTicket;
      
      console.log('🎫 Using event data from store:', {
        event: selectedEvent?.name,
        ticket: selectedTicket?.categoryName,
        hasEvent: !!selectedEvent,
        hasTicket: !!selectedTicket,
        fullEventData: selectedEvent,
        fullTicketData: selectedTicket
      });
      
      // Convert intake data to TripPreferences format
      const tripPreferences: TripPreferences = {
        clientName: data.travelerInfo?.name || 'Client',
        destination: data.destination,
        startDate: data.startDate,
        endDate: data.endDate,
        numberOfTravelers: data.travelerInfo?.numberOfTravelers || 1,
        budget: {
          min: data.budget.amount * 0.8,
          max: data.budget.amount,
          currency: data.budget.currency,
        },
        preferences: {
          tone: data.tone,
          pace: 'moderate',
          interests: data.interests,
          accommodationType: ['luxury', 'resort'],
          diningPreferences: ['fine dining', 'local cuisine'],
        },
        travelType: data.travelType,
        specialRequests: selectedEvent ? `EVENT FOCUSED TRIP: The main purpose of this trip is to attend ${selectedEvent.name} on ${selectedEvent.dateOfEvent}. Ticket type: ${selectedTicket?.categoryName}. This event should be the absolute centerpiece of the entire itinerary. All activities should be planned around this event, including proper transportation to/from the venue, accommodation near the event location, and complementary activities that enhance the event experience.` : undefined,
      };

      console.log('📋 TripPreferences created:', {
        specialRequests: tripPreferences.specialRequests,
        destination: tripPreferences.destination,
        hasEventRequest: !!tripPreferences.specialRequests
      });

      // Generate itinerary with Gemini
      const generatedItinerary: GeneratedItinerary = await gemini.generateItinerary(tripPreferences);

      // Convert to the format expected by ItineraryEditor
      const formattedDays = generatedItinerary.days.map(day => ({
        date: day.date,
        activities: day.activities.map(activity => ({
          time: activity.time,
          description: activity.description,
          location: activity.location,
          notes: activity.notes,
          estimatedCost: activity.estimatedCost,
          costType: activity.costType,
        })),
        imageUrl: day.imageUrl || '',
      }));

      setDays(formattedDays);
      toast.success('Itinerary generated successfully!');
    } catch (error) {
      console.error('Failed to generate itinerary:', error);
      toast.error('Failed to generate itinerary. Please try again.');
    } finally {
      setLoading(false);
      setStep('editor');
    }
  };

  const handleDaysChange = (newDays: ItineraryDay[]) => {
    setDays(newDays);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Create New Itinerary</h1>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {step === 'preferences' ? 'Trip Preferences' : 'Itinerary Editor'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {step === 'preferences' ? (
              <IntakeForm onSubmit={handleIntakeSubmit} />
            ) : (
              <ItineraryEditor
                days={days}
                onChange={handleDaysChange}
                onRegenerateDay={() => {}}
                destination={intake?.destination}
                includeInventory={intake?.includeInventory}
                inventoryTypes={intake?.inventoryTypes}
              />
            )}
            {loading && (
              <div className="mt-4 text-center">
                <p className="text-muted-foreground">Generating your luxury itinerary...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 