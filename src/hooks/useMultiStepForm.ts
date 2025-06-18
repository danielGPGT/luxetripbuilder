import { useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tripIntakeSchema, TripIntake } from '@/types/trip';

export function useMultiStepForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  const form = useForm<TripIntake>({
    resolver: zodResolver(tripIntakeSchema),
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
    },
    mode: 'onChange',
  });

  const nextStep = async () => {
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
        return ['travelerInfo'];
      case 2:
        return ['destinations'];
      case 3:
        return ['style'];
      case 4:
        return ['experience'];
      case 5:
        return ['budget'];
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
  };
} 