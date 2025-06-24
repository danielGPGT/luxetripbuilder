import { useMultiStepForm } from '@/hooks/useMultiStepForm';
import { Step1TravelerInfo } from '@/components/forms/steps/Step1TravelerInfo';
import { Step2Destinations } from '@/components/forms/steps/Step2Destinations';
import { Step3TripStyle } from '@/components/forms/steps/Step3TripStyle';
import { Step4Experience } from '@/components/forms/steps/Step4Experience';
import { Step5Budget } from '@/components/forms/steps/Step5Budget';
import { Step6Events } from '@/components/forms/steps/Step6Events';
import { Step6Review } from '@/components/forms/steps/Step6Review';
import { StepHotelSelection } from '@/components/forms/steps/StepHotelSelection';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { StepTransition } from '@/components/forms/StepTransition';
import { useGoogleMapsScript } from '@/hooks/useGoogleMapsScript';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FormProvider } from 'react-hook-form';
import { Stepper } from '@/components/ui/stepper';
import { useState } from 'react';
import { TripIntake } from '@/types/trip';
import { useAuth } from '@/lib/AuthProvider';
import { toast } from 'sonner';
import { useIntakeStore } from '@/store/intake';
import { useQuoteService } from '@/hooks/useQuoteService';
import { createQuotePayload } from '@/utils/createQuotePayload';
import { useNavigate } from 'react-router-dom';

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
    setCurrentStep,
  } = useMultiStepForm();

  // Debug logging
  console.log('NewProposal render:', { currentStep, totalSteps, isFirstStep, isLastStep });

  const { isLoaded, error } = useGoogleMapsScript();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const { user } = useAuth();
  const { createQuote, isCreatingQuote, error: quoteError, clearError } = useQuoteService();
  const navigate = useNavigate();

  const onSubmit = async (data: any) => {
    setIsGenerating(true);
    setGenerationError(null);
    clearError();
    
    // Debug: Check store contents right before submission
    const { intakeData } = useIntakeStore.getState();
    console.log('🚀 Form submission - Store contents:', {
      hasSelectedEvent: !!(intakeData as any)?.selectedEvent,
      hasSelectedTicket: !!(intakeData as any)?.selectedTicket,
      eventName: (intakeData as any)?.selectedEvent?.name,
      ticketType: (intakeData as any)?.selectedTicket?.categoryName,
      fullIntakeData: intakeData
    });
    
    try {
      // Create quote payload using the new quote service
      const quotePayload = createQuotePayload(data as TripIntake);
      console.log('📋 Creating quote with payload:', quotePayload);
      
      // Create quote using the quote service
      const quote = await createQuote(quotePayload);
      
      if (quote && quote.id) {
        console.log('✅ Quote created successfully:', quote);
        toast.success('Quote generated successfully!');
        
        // Redirect to the ViewQuote page
        navigate(`/quote/${quote.id}`);
      } else {
        throw new Error('Failed to create quote');
      }
    } catch (error) {
      console.error('Failed to create quote:', error);
      setGenerationError(error instanceof Error ? error.message : 'Failed to generate quote');
      toast.error('Failed to generate quote. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetForm = () => {
    setGenerationError(null);
    form.reset();
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

  // Steps array with events as final step
  const steps = [
    <Step1TravelerInfo key="step1" />, // 0
    <Step2Destinations key="step2" />, // 1
    <Step3TripStyle key="step3" />,    // 2
    <Step4Experience key="step4" />,   // 3
    <Step5Budget key="step5" />,       // 4
    <StepHotelSelection key="step6" />, // 5 - Hotel Selection
    <Step6Events key="step7" />,       // 6 - Events
  ];

  return (
    <div className="relative w-full min-h-screen">
      {/* Compact Layout */}
      <div className="relative z-10 w-full max-w-7xl mx-auto py-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          {/* Sticky Stepper (left) */}
          <div className="lg:block">
            <div className="sticky top-20">
              <div className="bg-card backdrop-blur-sm rounded-xl p-6 shadow-lg border border-border/50">
                <h2 className="text-lg font-semibold text-foreground mb-4">Create Your Trip</h2>
                <Stepper 
                  currentStep={currentStep} 
                  totalSteps={totalSteps} 
                  labels={["Traveler Info", "Destinations", "Trip Style", "Experience", "Budget", "Hotel", "Events", "Review"]} 
                  vertical 
                />
              </div>
            </div>
          </div>

          {/* Form Card (right) */}
          <div className="w-full">
            <Card className="w-full bg-card backdrop-blur-sm shadow-xl border border-border/50">
              <FormProvider {...form}>
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    if (isLastStep) {
                      form.handleSubmit(onSubmit)();
                    } else {
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
                      {currentStep === 6 && "Hotel Selection"}
                      {currentStep === 7 && "Events & Activities"}
                      {currentStep === 8 && "Review & Generate Quote"}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Step {currentStep} of {totalSteps}
                    </p>
                    {/* Debug button - remove in production */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="mt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Set some default values to bypass validation
                            form.setValue('travelerInfo.name', 'Test User');
                            form.setValue('travelerInfo.email', 'test@example.com');
                            form.setValue('travelerInfo.phone', '1234567890');
                            form.setValue('travelerInfo.address.street', '123 Test St');
                            form.setValue('travelerInfo.address.city', 'Test City');
                            form.setValue('travelerInfo.address.state', 'Test State');
                            form.setValue('travelerInfo.address.zipCode', '12345');
                            form.setValue('travelerInfo.address.country', 'Test Country');
                            form.setValue('destinations.from', 'New York');
                            form.setValue('destinations.primary', 'Paris');
                            form.setValue('travelerInfo.startDate', '2025-09-15');
                            form.setValue('travelerInfo.endDate', '2025-09-20');
                            form.setValue('style.interests', ['fine-dining']);
                            form.setValue('budget.amount', 5000);
                            // Jump to hotel selection step
                            setCurrentStep(6);
                          }}
                        >
                          Debug: Jump to Hotel Selection
                        </Button>
                      </div>
                    )}
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
                        <StepHotelSelection />
                      </StepTransition>
                      <StepTransition step={7} currentStep={currentStep}>
                        <Step6Events />
                      </StepTransition>
                      <StepTransition step={8} currentStep={currentStep}>
                        <Step6Review />
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
                            setTimeout(() => {
                              document.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                            }, 0);
                          }}
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Generating Quote...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 mr-2" />
                              Generate Quote
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