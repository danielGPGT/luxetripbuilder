import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, X, MapPin, Plane, Train, Car, Ship, CalendarIcon } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import { useGooglePlaces } from '@/hooks/useGooglePlaces';
import { Skeleton } from '@/components/ui/skeleton';
import type { FieldError } from 'react-hook-form';
import { TripIntake } from '@/types/trip';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface AdditionalStop {
  id: string;
  destination: string;
}

interface Step2DestinationsProps {
  disabled?: boolean;
}

const transportTypeOptions = [
  {
    value: 'plane',
    label: 'Plane',
    description: 'Air travel',
    icon: Plane,
  },
  {
    value: 'train',
    label: 'Train',
    description: 'Rail travel',
    icon: Train,
  },
  {
    value: 'car',
    label: 'Car',
    description: 'Road trip',
    icon: Car,
  },
  {
    value: 'ship',
    label: 'Ship',
    description: 'Cruise or ferry',
    icon: Ship,
  },
];

export function Step2Destinations({ disabled }: Step2DestinationsProps) {
  const form = useFormContext<TripIntake>();
  const fromInputRef = useRef<HTMLInputElement>(null);
  const primaryInputRef = useRef<HTMLInputElement>(null);
  const { place: fromPlace } = useGooglePlaces(fromInputRef);
  const { place: primaryPlace } = useGooglePlaces(primaryInputRef);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  // Calculate trip duration when dates change
  useEffect(() => {
    const startDate = form.watch('travelerInfo.startDate');
    const endDate = form.watch('travelerInfo.endDate');
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      form.setValue('destinations.duration', duration);
    }
  }, [form.watch('travelerInfo.startDate'), form.watch('travelerInfo.endDate')]);

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

      {/* Transport Type */}
      <div>
        <label className="block text-xl font-semibold mb-6 text-[var(--foreground)]">Preferred Transport</label>
        <RadioGroup
          value={form.watch('travelerInfo.transportType')}
          onValueChange={(value) => form.setValue('travelerInfo.transportType', value as any)}
          className="grid grid-cols-2 gap-4"
        >
          {transportTypeOptions.map(({ value, label, description, icon: Icon }) => {
            const isSelected = form.watch('travelerInfo.transportType') === value;
            return (
              <div
                key={value}
                className={cn(
                  'relative p-6 rounded-lg border-2 transition-all duration-300',
                  'bg-card backdrop-blur-sm hover:bg-primary/10 hover:shadow-lg',
                  isSelected 
                    ? 'border-[var(--primary)] bg-[var(--primary)]/5 shadow-lg' 
                    : 'border-[var(--border)] hover:border-[var(--primary)]/30'
                )}
              >
                <RadioGroupItem
                  value={value}
                  id={value}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center text-center gap-3 pointer-events-none">
                  <Icon className={cn(
                    'h-8 w-8 transition-colors duration-300',
                    isSelected ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'
                  )} />
                  <div>
                    <label htmlFor={value} className="text-lg font-semibold text-[var(--foreground)] block">
                      {label}
                    </label>
                    <p className="text-sm text-[var(--muted-foreground)] mt-1">{description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </RadioGroup>
      </div>

      {/* Travel Dates */}
      <div>
        <label className="block text-xl font-semibold mb-6 text-[var(--foreground)]">Travel Dates</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--foreground)]">Start Date</label>
            <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal bg-white/80 backdrop-blur-sm border-2 border-[var(--border)] hover:border-[var(--primary)]/30 transition-colors duration-300',
                    !form.watch('travelerInfo.startDate') && 'text-[var(--muted-foreground)]'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.watch('travelerInfo.startDate') ? (
                    format(new Date(form.watch('travelerInfo.startDate')), 'PPP')
                  ) : (
                    <span>Pick a start date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={form.watch('travelerInfo.startDate') ? new Date(form.watch('travelerInfo.startDate')) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      // Use local date string to avoid timezone issues
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const day = String(date.getDate()).padStart(2, '0');
                      const dateString = `${year}-${month}-${day}`;
                      form.setValue('travelerInfo.startDate', dateString);
                      setStartDateOpen(false);
                    }
                  }}
                  disabled={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date < today;
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {form.formState.errors.travelerInfo?.startDate && (
              <p className="text-sm text-destructive mt-2 font-medium">
                {form.formState.errors.travelerInfo.startDate.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--foreground)]">End Date</label>
            <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal bg-white/80 backdrop-blur-sm border-2 border-[var(--border)] hover:border-[var(--primary)]/30 transition-colors duration-300',
                    !form.watch('travelerInfo.endDate') && 'text-[var(--muted-foreground)]'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.watch('travelerInfo.endDate') ? (
                    format(new Date(form.watch('travelerInfo.endDate')), 'PPP')
                  ) : (
                    <span>Pick an end date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={form.watch('travelerInfo.endDate') ? new Date(form.watch('travelerInfo.endDate')) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      // Use local date string to avoid timezone issues
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const day = String(date.getDate()).padStart(2, '0');
                      const dateString = `${year}-${month}-${day}`;
                      form.setValue('travelerInfo.endDate', dateString);
                      setEndDateOpen(false);
                    }
                  }}
                  disabled={(date) => {
                    const startDate = form.watch('travelerInfo.startDate');
                    if (startDate) {
                      const startDateTime = new Date(startDate);
                      startDateTime.setHours(0, 0, 0, 0);
                      return date < startDateTime;
                    }
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date < today;
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {form.formState.errors.travelerInfo?.endDate && (
              <p className="text-sm text-destructive mt-2 font-medium">
                {form.formState.errors.travelerInfo.endDate.message}
              </p>
            )}
          </div>
        </div>
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