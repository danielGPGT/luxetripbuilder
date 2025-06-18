import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, X, MapPin } from 'lucide-react';
import { useRef, useEffect } from 'react';
import { useGooglePlaces } from '@/hooks/useGooglePlaces';
import { Skeleton } from '@/components/ui/skeleton';
import type { FieldError } from 'react-hook-form';
import { TripIntake } from '@/types/trip';

interface AdditionalStop {
  id: string;
  destination: string;
}

interface Step2DestinationsProps {
  disabled?: boolean;
}

export function Step2Destinations({ disabled }: Step2DestinationsProps) {
  const form = useFormContext<TripIntake>();
  const fromInputRef = useRef<HTMLInputElement>(null);
  const primaryInputRef = useRef<HTMLInputElement>(null);
  const { place: fromPlace } = useGooglePlaces(fromInputRef);
  const { place: primaryPlace } = useGooglePlaces(primaryInputRef);

  // Update from location when place is selected
  useEffect(() => {
    if (fromPlace) {
      const locationString = [
        fromPlace.city,
        fromPlace.state,
        fromPlace.country
      ].filter(Boolean).join(', ');
      
      form.setValue('destinations.from', locationString);
    }
  }, [fromPlace]);

  // Update primary destination when place is selected
  useEffect(() => {
    if (primaryPlace) {
      const locationString = [
        primaryPlace.city,
        primaryPlace.state,
        primaryPlace.country
      ].filter(Boolean).join(', ');
      
      form.setValue('destinations.primary', locationString);
    }
  }, [primaryPlace]);

  const addDestination = () => {
    const currentStops = form.getValues('destinations.additional') || [];
    form.setValue('destinations.additional', [...currentStops, '']);
  };

  const removeDestination = (index: number) => {
    const currentStops = form.getValues('destinations.additional') || [];
    form.setValue(
      'destinations.additional',
      currentStops.filter((_, i) => i !== index)
    );
  };

  const getError = (field: string): FieldError | undefined => {
    return form.formState.errors.destinations?.[field as keyof typeof form.formState.errors.destinations] as FieldError;
  };

  const { ref: fromRegisterRef, ...fromRegisterProps } = form.register('destinations.from');
  const { ref: primaryRegisterRef, ...primaryRegisterProps } = form.register('destinations.primary');

  if (disabled) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* From Location */}
      <div>
        <label className="block text-xl font-semibold mb-6 text-[var(--foreground)]">Travel Route</label>
        <div>
          <label className="block text-sm font-medium mb-2 text-[var(--foreground)]">From</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--muted-foreground)]" />
            <Input
              ref={(e) => {
                fromInputRef.current = e;
                fromRegisterRef(e);
              }}
              {...fromRegisterProps}
              placeholder="Enter departure location (e.g. London, UK)"
              className="pl-10 bg-white/80 backdrop-blur-sm border-2 border-[var(--border)] focus:border-[var(--primary)] transition-colors duration-300"
              disabled={disabled}
            />
          </div>
          {getError('from') && (
            <p className="text-sm text-red-500 mt-2 font-medium">{getError('from')?.message}</p>
          )}
        </div>
      </div>

      {/* To Location */}
      <div>
        <label className="block text-sm font-medium mb-2 text-[var(--foreground)]">To</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--muted-foreground)]" />
          <Input
            ref={(e) => {
              primaryInputRef.current = e;
              primaryRegisterRef(e);
            }}
            {...primaryRegisterProps}
            placeholder="Enter destination (e.g. Paris, France)"
            className="pl-10 bg-white/80 backdrop-blur-sm border-2 border-[var(--border)] focus:border-[var(--primary)] transition-colors duration-300"
            disabled={disabled}
          />
        </div>
        {getError('primary') && (
          <p className="text-sm text-red-500 mt-2 font-medium">{getError('primary')?.message}</p>
        )}
      </div>

      {/* Additional Stops */}
      <div>
        <label className="block text-xl font-semibold mb-6 text-[var(--foreground)]">Additional Stops</label>
        <div className="space-y-4">
          {(form.watch('destinations.additional') || []).map((_, index) => (
            <div key={index} className="flex gap-2">
              <Input
                {...form.register(`destinations.additional.${index}`)}
                placeholder="Enter additional destination"
                className="bg-white/80 backdrop-blur-sm border-2 border-[var(--border)] focus:border-[var(--primary)] transition-colors duration-300"
                disabled={disabled}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => removeDestination(index)}
                disabled={disabled}
                className="border-[var(--border)] bg-[var(--card)]/80 hover:bg-[var(--muted)]"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addDestination}
            disabled={disabled}
            className="w-full border-[var(--border)] bg-[var(--card)]/80 hover:bg-[var(--muted)]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Stop
          </Button>
        </div>
      </div>
    </div>
  );
} 