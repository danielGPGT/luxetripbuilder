import { useMultiStepForm } from '@/hooks/useMultiStepForm';
import { Step1TravelerInfo } from '@/components/forms/steps/Step1TravelerInfo';
import { Step2Destinations } from '@/components/forms/steps/Step2Destinations';
import { Step3TripStyle } from '@/components/forms/steps/Step3TripStyle';
import { Step4Experience } from '@/components/forms/steps/Step4Experience';
import { Step5Budget } from '@/components/forms/steps/Step5Budget';
import { Step6Events } from '@/components/forms/steps/Step6Events';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { StepTransition } from '@/components/forms/StepTransition';
import { useGoogleMapsScript } from '@/hooks/useGoogleMapsScript';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FormProvider } from 'react-hook-form';
import { Stepper } from '@/components/ui/stepper';
import { useState, useEffect } from 'react';
import { gemini, type TripPreferences, type GeneratedItinerary } from '@/lib/gemini';
import { TripIntake } from '@/types/trip';
import { ItineraryEditor } from '@/components/ItineraryEditor';
import { saveItinerary, updateItinerary, type SavedItinerary } from '@/lib/itineraryService';
import { useAuth } from '@/lib/AuthProvider';
import { toast } from 'sonner';
import { PDFExportButton } from '@/components/PDFExportButton';
import { useIntakeStore } from '@/store/intake';

import bgImg from '@/assets/imgs/spencer-davis-Ivwyqtw3PzU-unsplash.jpg';

// Helper to fetch event details and tickets from Sports Events 365 API
async function fetchEventDetailsAndTickets(eventId: string) {
  const API_KEY = import.meta.env.VITE_SPORTSEVENTS365_API_KEY || '';
  // Fetch event details
  const eventRes = await fetch(`https://api-v2.sandbox365.com/events/${eventId}`, {
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Accept': 'application/json',
    },
  });
  if (!eventRes.ok) throw new Error('Failed to fetch event');
  const event = await eventRes.json();

  // Fetch ticket options for the event
  const ticketRes = await fetch(`https://api-v2.sandbox365.com/events/${eventId}/tickets`, {
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Accept': 'application/json',
    },
  });
  if (!ticketRes.ok) throw new Error('Failed to fetch tickets');
  const tickets = await ticketRes.json();

  return { ...event, tickets: tickets.categories || [] };
}

export default function NewProposal() {
  const {
    form,
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    isFirstStep,
    isLastStep,
    stepIndex,
  } = useMultiStepForm();

  const { isLoaded, error } = useGoogleMapsScript();
  const [isGenerating, setIsGenerating] = useState(false);
  const [itinerary, setItinerary] = useState<GeneratedItinerary | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [editableDays, setEditableDays] = useState<GeneratedItinerary['days']>([]);
  const { user } = useAuth();
  const [savedItinerary, setSavedItinerary] = useState<SavedItinerary | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [allowSubmit, setAllowSubmit] = useState(false);

  useEffect(() => {
    if (itinerary) {
      setEditableDays(itinerary.days);
    }
  }, [itinerary]);

  const transformFormData = (data: TripIntake): TripPreferences => {
    // Get event data from the intake store
    const { intakeData } = useIntakeStore.getState();
    const selectedEvent = intakeData?.selectedEvent;
    const selectedTicket = intakeData?.selectedTicket;
    
    console.log('🎫 NewProposal - Using event data from store:', {
      event: selectedEvent?.name,
      ticket: selectedTicket?.categoryName,
      hasEvent: !!selectedEvent,
      hasTicket: !!selectedTicket,
      fullIntakeData: intakeData
    });
    
    // Create event-specific special requests if an event is selected
    const eventSpecialRequests = selectedEvent ? 
      `EVENT FOCUSED TRIP: The main purpose of this trip is to attend ${selectedEvent.name} on ${selectedEvent.dateOfEvent}. Ticket type: ${selectedTicket?.categoryName}. This event should be the absolute centerpiece of the entire itinerary. All activities should be planned around this event, including proper transportation to/from the venue, accommodation near the event location, and complementary activities that enhance the event experience.` : 
      undefined;
    
    // Combine existing special requests with event requests
    const combinedSpecialRequests = [data.experience.specialRequests, eventSpecialRequests]
      .filter(Boolean)
      .join(' ');
    
    console.log('📋 NewProposal - TripPreferences created:', {
      specialRequests: combinedSpecialRequests,
      destination: data.destinations.primary,
      hasEventRequest: !!eventSpecialRequests,
      eventSpecialRequests,
      existingSpecialRequests: data.experience.specialRequests
    });
    
    return {
      clientName: data.travelerInfo.name,
      destination: data.destinations.primary,
      startDate: data.travelerInfo.startDate,
      endDate: data.travelerInfo.endDate,
      numberOfTravelers: data.travelerInfo.travelers.adults + data.travelerInfo.travelers.children,
      budget: {
        min: data.budget.amount * 0.8, // 80% of budget as min
        max: data.budget.amount,
        currency: data.budget.currency,
      },
      preferences: {
        tone: data.style.tone,
        pace: data.experience.pace === 'relaxed' ? 'relaxed' : 
              data.experience.pace === 'balanced' ? 'moderate' : 'active',
        interests: data.style.interests,
        accommodationType: [data.experience.accommodation],
        diningPreferences: data.style.interests.filter(interest => 
          ['fine-dining', 'wine', 'local-culture'].includes(interest)
        ),
      },
      specialRequests: combinedSpecialRequests || undefined,
      transportType: data.travelerInfo.transportType,
      fromLocation: data.destinations.from,
      travelType: data.travelerInfo.travelType,
    };
  };

  const onSubmit = async (data: any) => {
    setIsGenerating(true);
    setGenerationError(null);
    
    // Debug: Check store contents right before submission
    const { intakeData } = useIntakeStore.getState();
    console.log('🚀 Form submission - Store contents:', {
      hasSelectedEvent: !!intakeData?.selectedEvent,
      hasSelectedTicket: !!intakeData?.selectedTicket,
      eventName: intakeData?.selectedEvent?.name,
      ticketType: intakeData?.selectedTicket?.categoryName,
      fullIntakeData: intakeData
    });
    
    try {
      const preferences = transformFormData(data as TripIntake);
      // Get selected event IDs
      const selectedEventIds: string[] = data.selectedEvents || [];
      // Fetch event details and tickets for selected events
      let selectedEventDetails: any[] = [];
      if (selectedEventIds.length > 0) {
        selectedEventDetails = await Promise.all(selectedEventIds.map(fetchEventDetailsAndTickets));
      }
      // Pass selected events to the generator (if your AI supports it)
      // TODO: Pass selectedEventDetails to Gemini prompt (update Gemini integration as needed)
      const generatedItinerary = await gemini.generateItinerary(preferences);
      // Inject selected events as activities on the correct days
      const updatedDays = generatedItinerary.days.map((day: any) => {
        const eventsForDay = selectedEventDetails.filter((e: any) => e.date === day.date);
        if (eventsForDay.length === 0) return day;
        const eventActivities = eventsForDay.map((e: any) => ({
          time: 'Event',
          description: e.name + (e.tickets?.[0]?.price ? ` (Ticket: ${e.tickets[0].price} ${e.tickets[0].currency})` : ''),
          location: e.venue?.name || '',
          notes: e.tickets?.[0]?.categoryName || '',
          estimatedCost: e.tickets?.[0]?.price || 0,
          costType: 'total',
        }));
        return {
          ...day,
          activities: [...day.activities, ...eventActivities],
        };
      });
      setItinerary({ ...generatedItinerary, days: updatedDays });
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : 'Failed to generate itinerary');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetForm = () => {
    setItinerary(null);
    setGenerationError(null);
    form.reset();
  };

  const handleSaveItinerary = async () => {
    if (!user || !itinerary) return;

    setIsSaving(true);
    try {
      const formData = form.getValues() as TripIntake;
      
      if (savedItinerary) {
        // Update existing itinerary
        const updated = await updateItinerary(savedItinerary.id, {
          title: itinerary.title,
          days: editableDays,
          preferences: formData,
        });
        setSavedItinerary(updated);
        toast.success('Itinerary updated successfully!');
      } else {
        // Save new itinerary
        const saved = await saveItinerary(itinerary, formData, user.id);
        setSavedItinerary(saved);
        toast.success('Itinerary saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save itinerary:', error);
      toast.error('Failed to save itinerary. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (error) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show itinerary if generated
  if (itinerary) {
    const handleDaysChange = (days: GeneratedItinerary['days']) => {
      setEditableDays(days);
      setItinerary({ ...itinerary, days });
    };

    const handleRegenerateDay = (index: number) => {
      // TODO: Implement AI regeneration for a single day
      alert('Regenerate Day with AI coming soon!');
    };

    return (
      <div className="relative w-full min-h-screen flex items-center justify-center">
        {/* Itinerary Display */}
        <div className="relative z-10 w-full max-w-6xl mx-auto p-6">
          <Card className="w-full bg-white/80 backdrop-blur-2xl shadow-2xl border-0">
            <CardHeader className="px-12 border-b border-[var(--border)]/20">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-4xl font-bold text-[var(--foreground)] mb-2 tracking-tight font-sans">
                    {itinerary.title}
                  </CardTitle>
                  <p className="text-lg text-[var(--muted-foreground)]">
                    {itinerary.destination} • {editableDays.length} days • {itinerary.totalBudget.amount.toLocaleString()} {itinerary.totalBudget.currency}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSaveItinerary} 
                    disabled={isSaving || !user}
                    variant="outline" 
                    className="border-[var(--border)] bg-[var(--card)]/80"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : savedItinerary ? (
                      'Update Itinerary'
                    ) : (
                      'Save Itinerary'
                    )}
                  </Button>
                  <Button onClick={resetForm} variant="outline" className="border-[var(--border)] bg-[var(--card)]/80">
                    Create New Itinerary
                  </Button>
                  <PDFExportButton 
                    itinerary={{
                      id: 'temp',
                      title: itinerary.title,
                      client_name: itinerary.clientName,
                      destination: itinerary.destination,
                      generated_by: user?.id || '',
                      date_created: new Date().toISOString(),
                      preferences: form.getValues() as TripIntake,
                      days: editableDays,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                    }} 
                  />
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="px-12 py-8">
              <div className="space-y-8">
                {/* Summary */}
                <div className="bg-[var(--primary)]/5 p-6 rounded-lg border border-[var(--primary)]/20">
                  <h3 className="text-xl font-semibold text-[var(--foreground)] mb-3">Trip Summary</h3>
                  <p className="text-[var(--muted-foreground)] leading-relaxed">{itinerary.summary}</p>
                </div>

                {/* Budget Breakdown */}
                {itinerary.budgetBreakdown && (
                  <div className="bg-white/60 backdrop-blur-sm p-6 rounded-lg border border-[var(--border)]/30">
                    <h3 className="text-2xl font-bold text-[var(--foreground)] mb-6">Budget Breakdown</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-[var(--primary)]/10 p-4 rounded-lg">
                        <h4 className="font-semibold text-[var(--foreground)] mb-2">Accommodation</h4>
                        <p className="text-2xl font-bold text-[var(--primary)]">{itinerary.budgetBreakdown.accommodation.total.toLocaleString()} {itinerary.totalBudget.currency}</p>
                        <p className="text-sm text-[var(--muted-foreground)]">~{itinerary.budgetBreakdown.accommodation.perNight.toLocaleString()} per night</p>
                      </div>
                      <div className="bg-[var(--primary)]/10 p-4 rounded-lg">
                        <h4 className="font-semibold text-[var(--foreground)] mb-2">Transportation</h4>
                        <p className="text-2xl font-bold text-[var(--primary)]">{itinerary.budgetBreakdown.transportation.total.toLocaleString()} {itinerary.totalBudget.currency}</p>
                      </div>
                      <div className="bg-[var(--primary)]/10 p-4 rounded-lg">
                        <h4 className="font-semibold text-[var(--foreground)] mb-2">Activities</h4>
                        <p className="text-2xl font-bold text-[var(--primary)]">{itinerary.budgetBreakdown.activities.total.toLocaleString()} {itinerary.totalBudget.currency}</p>
                      </div>
                      <div className="bg-[var(--primary)]/10 p-4 rounded-lg">
                        <h4 className="font-semibold text-[var(--foreground)] mb-2">Dining</h4>
                        <p className="text-2xl font-bold text-[var(--primary)]">{itinerary.budgetBreakdown.dining.total.toLocaleString()} {itinerary.totalBudget.currency}</p>
                        <p className="text-sm text-[var(--muted-foreground)]">~{itinerary.budgetBreakdown.dining.perDay.toLocaleString()} per day</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Hotel Recommendations */}
                {itinerary.budgetBreakdown?.accommodation.hotelRecommendations && itinerary.budgetBreakdown.accommodation.hotelRecommendations.length > 0 && (
                  <div className="bg-white/60 backdrop-blur-sm p-6 rounded-lg border border-[var(--border)]/30">
                    <h3 className="text-2xl font-bold text-[var(--foreground)] mb-6">Recommended Accommodations</h3>
                    <div className="space-y-4">
                      {itinerary.budgetBreakdown.accommodation.hotelRecommendations.map((hotel, index) => (
                        <div key={index} className="flex justify-between items-center p-4 bg-white/40 rounded-lg">
                          <div>
                            <h4 className="font-semibold text-[var(--foreground)]">{hotel.name}</h4>
                            <p className="text-sm text-[var(--muted-foreground)]">{hotel.location} • {hotel.rating}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {hotel.amenities.slice(0, 3).map((amenity, i) => (
                                <span key={i} className="text-xs bg-[var(--primary)]/20 text-[var(--primary)] px-2 py-1 rounded">
                                  {amenity}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-[var(--foreground)]">{hotel.pricePerNight.toLocaleString()} {itinerary.totalBudget.currency}</p>
                            <p className="text-sm text-[var(--muted-foreground)]">per night</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Luxury Highlights */}
                {itinerary.luxuryHighlights && itinerary.luxuryHighlights.length > 0 && (
                  <div className="bg-gradient-to-r from-[var(--primary)]/10 to-[var(--primary)]/5 p-6 rounded-lg border border-[var(--primary)]/20">
                    <h3 className="text-2xl font-bold text-[var(--foreground)] mb-6">✨ Luxury Highlights</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {itinerary.luxuryHighlights.map((highlight, index) => (
                        <div key={index} className="bg-white/60 backdrop-blur-sm p-4 rounded-lg">
                          <h4 className="font-semibold text-[var(--foreground)] mb-2">{highlight.title}</h4>
                          <p className="text-[var(--muted-foreground)] mb-3">{highlight.description}</p>
                          <p className="text-sm text-[var(--primary)] font-medium">{highlight.whyLuxury}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Daily Itinerary Editor */}
                <div>
                  <h3 className="text-2xl font-bold text-[var(--foreground)] mb-6">Daily Schedule (Drag to Reorder & Edit)</h3>
                  <ItineraryEditor
                    days={editableDays}
                    onChange={handleDaysChange}
                    onRegenerateDay={handleRegenerateDay}
                    destination={itinerary.destination}
                  />
                </div>

                {/* Travel Tips */}
                {itinerary.travelTips && itinerary.travelTips.length > 0 && (
                  <div className="bg-white/60 backdrop-blur-sm p-6 rounded-lg border border-[var(--border)]/30">
                    <h3 className="text-2xl font-bold text-[var(--foreground)] mb-6">💡 Travel Tips</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {itinerary.travelTips.map((tipGroup, index) => (
                        <div key={index}>
                          <h4 className="font-semibold text-[var(--foreground)] mb-3">{tipGroup.category}</h4>
                          <ul className="space-y-2">
                            {tipGroup.tips.map((tip, tipIndex) => (
                              <li key={tipIndex} className="text-sm text-[var(--muted-foreground)] flex items-start gap-2">
                                <span className="text-[var(--primary)] mt-1">•</span>
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Steps array with events as final step
  const steps = [
    <Step1TravelerInfo key="step1" />, // 0
    <Step2Destinations key="step2" />, // 1
    <Step3TripStyle key="step3" />,    // 2
    <Step4Experience key="step4" />,   // 3
    <Step5Budget key="step5" />,       // 4
    <Step6Events key="step6" />,       // 5 - Final step
  ];

  return (
    <div className="relative w-full min-h-screen">
      {/* Compact Layout */}
      <div className="relative z-10 w-full max-w-7xl mx-auto py-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          {/* Sticky Stepper (left) */}
          <div className="lg:block">
            <div className="sticky top-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-border/50">
                <h2 className="text-lg font-semibold text-foreground mb-4">Create Your Trip</h2>
                <Stepper 
                  currentStep={currentStep} 
                  totalSteps={totalSteps} 
                  labels={["Traveler Info", "Destinations", "Trip Style", "Experience", "Budget", "Events"]} 
                  vertical 
                />
              </div>
            </div>
          </div>

          {/* Form Card (right) */}
          <div className="w-full">
            <Card className="w-full bg-white/90 backdrop-blur-sm shadow-xl border border-border/50">
              <FormProvider {...form}>
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    if (isLastStep && allowSubmit) {
                      setAllowSubmit(false);
                      form.handleSubmit(onSubmit)();
                    } else if (!isLastStep) {
                      nextStep();
                    }
                  }}
                  className="min-h-[600px] flex flex-col"
                >
                  <CardHeader className="px-8 py-6 border-b border-border/30">
                    <CardTitle className="text-2xl font-bold text-foreground">
                      {currentStep === 1 && "Traveler Information"}
                      {currentStep === 2 && "Destinations"}
                      {currentStep === 3 && "Trip Style"}
                      {currentStep === 4 && "Experience Preferences"}
                      {currentStep === 5 && "Budget & Preferences"}
                      {currentStep === 6 && "Events"}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Step {currentStep} of {totalSteps}
                    </p>
                  </CardHeader>

                  <CardContent className="px-8 py-6 flex-1">
                    {generationError && (
                      <Alert variant="destructive" className="mb-6">
                        <AlertDescription>{generationError}</AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="space-y-6">
                      <StepTransition step={1} currentStep={currentStep}>
                        <Step1TravelerInfo />
                      </StepTransition>
                      <StepTransition step={2} currentStep={currentStep}>
                        <Step2Destinations disabled={!isLoaded} />
                      </StepTransition>
                      <StepTransition step={3} currentStep={currentStep}>
                        <Step3TripStyle />
                      </StepTransition>
                      <StepTransition step={4} currentStep={currentStep}>
                        <Step4Experience />
                      </StepTransition>
                      <StepTransition step={5} currentStep={currentStep}>
                        <Step5Budget />
                      </StepTransition>
                      <StepTransition step={6} currentStep={currentStep}>
                        <Step6Events />
                      </StepTransition>
                    </div>
                  </CardContent>

                  <CardFooter className="px-8 py-6 border-t border-border/30 bg-muted/20">
                    <div className="flex justify-between items-center w-full">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                        disabled={isFirstStep || isGenerating}
                        className="border-border/50 bg-background hover:bg-muted"
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>
                      
                      {isLastStep ? (
                        <Button
                          type="button"
                          disabled={isGenerating}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md"
                          onClick={() => {
                            setAllowSubmit(true);
                            setTimeout(() => {
                              document.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                            }, 0);
                          }}
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-2" />
                              Generate Itinerary
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          onClick={nextStep}
                          disabled={isGenerating}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md"
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </CardFooter>
                </form>
              </FormProvider>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 