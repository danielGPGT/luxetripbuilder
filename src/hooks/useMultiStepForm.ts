import { useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tripIntakeSchema, TripIntake } from '@/types/trip';

export function useMultiStepForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7;

  const form = useForm<TripIntake>({
    resolver: zodResolver(tripIntakeSchema) as any,
    defaultValues: {
      travelerInfo: {
        name: '',
        travelType: 'solo',
        transportType: 'plane',
        startDate: '',
        endDate: '',
        travelers: {
          adults: 1,
          children: 0,
        },
      },
      destinations: {
        from: '',
        primary: '',
        additional: [],
        duration: 0,
      },
      style: {
        tone: 'luxury',
        interests: [],
      },
      experience: {
        pace: 'balanced',
        accommodation: 'boutique',
        specialRequests: '',
      },
      budget: {
        amount: 0,
        currency: 'USD',
        experienceType: 'exclusive',
        travelClass: 'business',
      },
      eventRequests: '',
      eventTypes: [],
      includeInventory: { flights: false, hotels: false, events: false },
      flightFilters: undefined,
      hotelFilters: undefined,
      eventFilters: undefined,
      agentContext: undefined,
    },
    mode: 'onTouched',
  });

  const nextStep = async () => {
    // Get specific fields to validate for the current step
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await form.trigger(fieldsToValidate);
    
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const getFieldsForStep = (step: number): (keyof TripIntake)[] => {
    switch (step) {
      case 1:
        // Step 1: Only validate traveler info fields that are actually in step 1
        return [
          'travelerInfo.name',
          'travelerInfo.email', 
          'travelerInfo.phone',
          'travelerInfo.address.street',
          'travelerInfo.address.city',
          'travelerInfo.address.state',
          'travelerInfo.address.zipCode',
          'travelerInfo.address.country',
          'travelerInfo.travelType',
          'travelerInfo.travelers.adults',
          'travelerInfo.travelers.children'
        ] as any;
      case 2:
        // Step 2: Only validate destinations and the moved fields
        return [
          'destinations.from',
          'destinations.primary',
          'travelerInfo.transportType',
          'travelerInfo.startDate',
          'travelerInfo.endDate'
        ] as any;
      case 3:
        return ['style.tone', 'style.interests'] as any;
      case 4:
        return ['experience.pace', 'experience.accommodation'] as any;
      case 5:
        return ['budget.amount', 'budget.currency', 'budget.experienceType', 'budget.travelClass'] as any;
      case 6:
        return ['eventRequests', 'eventTypes'] as any;
      case 7:
        return []; // Review step - no validation needed
      default:
        return [];
    }
  };

  return {
    form,
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    isFirstStep: currentStep === 1,
    isLastStep: currentStep === totalSteps,
    stepIndex: currentStep - 1,
  };
} 