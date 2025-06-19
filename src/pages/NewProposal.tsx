import { useMultiStepForm } from '@/hooks/useMultiStepForm';
import { Step1TravelerInfo } from '@/components/forms/steps/Step1TravelerInfo';
import { Step2Destinations } from '@/components/forms/steps/Step2Destinations';
import { Step3TripStyle } from '@/components/forms/steps/Step3TripStyle';
import { Step4Experience } from '@/components/forms/steps/Step4Experience';
import { Step5Budget } from '@/components/forms/steps/Step5Budget';
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

import bgImg from '@/assets/imgs/spencer-davis-Ivwyqtw3PzU-unsplash.jpg';

export default function NewProposal() {
  const {
    form,
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    isFirstStep,
    isLastStep,
  } = useMultiStepForm();

  const { isLoaded, error } = useGoogleMapsScript();
  const [isGenerating, setIsGenerating] = useState(false);
  const [itinerary, setItinerary] = useState<GeneratedItinerary | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [editableDays, setEditableDays] = useState<GeneratedItinerary['days']>([]);
  const { user } = useAuth();
  const [savedItinerary, setSavedItinerary] = useState<SavedItinerary | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (itinerary) {
      setEditableDays(itinerary.days);
    }
  }, [itinerary]);

  const transformFormData = (data: TripIntake): TripPreferences => {
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
      specialRequests: data.experience.specialRequests,
      transportType: data.travelerInfo.transportType,
      fromLocation: data.destinations.from,
      travelType: data.travelerInfo.travelType,
    };
  };

  const onSubmit = async (data: any) => {
    setIsGenerating(true);
    setGenerationError(null);
    
    try {
      console.log('Form data:', data);
      
      const preferences = transformFormData(data as TripIntake);
      console.log('Transformed preferences:', preferences);
      
      const generatedItinerary = await gemini.generateItinerary(preferences);
      setItinerary(generatedItinerary);
      
      console.log('Generated itinerary:', generatedItinerary);
    } catch (error) {
      console.error('Itinerary generation failed:', error);
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
        {/* Background image with gradient overlay */}
        
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

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center">
      {/* Background image with gradient overlay */}
      <div className="absolute inset-0 z-0"></div>
      {/* Responsive grid: sticky stepper left, wide form right */}
      <div className="relative z-10 w-full grid grid-cols-1 md:grid-cols-[260px_1fr] gap-0 min-h-screen py-8 px-2 md:px-8">
        {/* Sticky Stepper (left) */}
        <div className="hidden md:block pr-8">
          <div className="sticky top-28">
            <Stepper currentStep={currentStep} totalSteps={totalSteps} labels={["Traveler Info", "Destinations", "Trip Style", "Experience", "Budget"]} vertical />
      </div>
        </div>
        {/* Form Card (right) */}
        <div className="w-full max-w-3xl mx-auto">
          <Card className="w-full bg-white/60 backdrop-blur-2xl shadow-2xl border-0">
            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardHeader className="px-8 md:px-12 border-b-0">
                  <CardTitle className="text-4xl font-bold text-[var(--foreground)] mb-4 tracking-tight font-sans">
                    {currentStep === 1 && <span>Traveler Information</span>}
                    {currentStep === 2 && <span>Destinations</span>}
                    {currentStep === 3 && <span>Trip Style</span>}
                    {currentStep === 4 && <span>Experience Preferences</span>}
                    {currentStep === 5 && <span>Budget & Preferences</span>}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-8 md:px-12 py-8 space-y-8">
                  {generationError && (
                    <Alert variant="destructive">
                      <AlertDescription>{generationError}</AlertDescription>
                    </Alert>
                  )}
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
                </CardContent>
                <CardFooter className="flex flex-row gap-4 px-8 md:px-12 pb-8 pt-6 w-full justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={isFirstStep || isGenerating}
                    className="border-[var(--border)] bg-[var(--card)]/80 hover:bg-[var(--muted)] text-[var(--foreground)]"
                  >
                    <ChevronLeft className="h-5 w-5 mr-0" />
                    Back
                  </Button>
                  {isLastStep ? (
                    <Button 
                      type="submit" 
                      disabled={isGenerating}
                      className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-[var(--primary-foreground)] font-bold shadow-md border-0"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-5 w-5 mr-2" />
                          Generate Itinerary
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={nextStep}
                      disabled={isGenerating}
                      className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-[var(--primary-foreground)] font-bold shadow-md border-0"
                    >
                      Next
                      <ChevronRight className="h-5 w-5 ml-0" />
                    </Button>
                  )}
                </CardFooter>
              </form>
            </FormProvider>
          </Card>
        </div>
      </div>
    </div>
  );
} 