import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { TripIntake } from '@/types/trip';
import { User, Users, UserPlus, UsersRound, CalendarIcon, Plane, Train, Car, Ship } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface Step1TravelerInfoProps {
  disabled?: boolean;
}

const travelTypeOptions = [
  {
    value: 'solo',
    label: 'Solo Traveler',
    description: 'Individual adventure',
    icon: User,
  },
  {
    value: 'couple',
    label: 'Couple',
    description: 'Romantic getaway',
    icon: Users,
  },
  {
    value: 'family',
    label: 'Family',
    description: 'Family vacation',
    icon: UsersRound,
  },
  {
    value: 'group',
    label: 'Group',
    description: 'Group adventure',
    icon: UserPlus,
  },
];

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

export function Step1TravelerInfo({ disabled }: Step1TravelerInfoProps) {
  const form = useFormContext<TripIntake>();
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

  if (!form || disabled) {
    return (
      <div className="space-y-6">
        <div className="h-12 bg-gray-100 rounded animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-32 bg-gray-100 rounded animate-pulse" />
          <div className="h-32 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-12 bg-gray-100 rounded animate-pulse" />
          <div className="h-12 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-12 bg-gray-100 rounded animate-pulse" />
          <div className="h-12 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-12 bg-gray-100 rounded animate-pulse" />
          <div className="h-12 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Traveler Name */}
      <div>
        <label className="block text-xl font-semibold mb-6 text-[var(--foreground)]">Traveler Information</label>
        <div>
          <label className="block text-sm font-medium mb-2 text-[var(--foreground)]">Full Name</label>
          <Input
            {...form.register('travelerInfo.name')}
            placeholder="Enter your full name"
            className="bg-white/80 backdrop-blur-sm border-2 border-[var(--border)] focus:border-[var(--primary)] transition-colors duration-300"
          />
          {form.formState.errors.travelerInfo?.name && (
            <p className="text-sm text-red-500 mt-2 font-medium">
              {form.formState.errors.travelerInfo.name.message}
            </p>
          )}
        </div>
      </div>

      {/* Travel Type */}
      <div>
        <label className="block text-xl font-semibold mb-6 text-[var(--foreground)]">Travel Type</label>
        <RadioGroup
          value={form.watch('travelerInfo.travelType')}
          onValueChange={(value) => form.setValue('travelerInfo.travelType', value as any)}
          className="grid grid-cols-2 gap-4"
        >
          {travelTypeOptions.map(({ value, label, description, icon: Icon }) => {
            const isSelected = form.watch('travelerInfo.travelType') === value;
            return (
              <div
                key={value}
                className={cn(
                  'relative p-6 rounded-lg border-2 transition-all duration-300',
                  'bg-white/80 backdrop-blur-sm hover:bg-white/90 hover:shadow-lg',
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
                  'bg-white/80 backdrop-blur-sm hover:bg-white/90 hover:shadow-lg',
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
                      form.setValue('travelerInfo.startDate', date.toISOString().split('T')[0]);
                      setStartDateOpen(false);
                    }
                  }}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {form.formState.errors.travelerInfo?.startDate && (
              <p className="text-sm text-red-500 mt-2 font-medium">
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
                      form.setValue('travelerInfo.endDate', date.toISOString().split('T')[0]);
                      setEndDateOpen(false);
                    }
                  }}
                  disabled={(date) => {
                    const startDate = form.watch('travelerInfo.startDate');
                    return date < (startDate ? new Date(startDate) : new Date());
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {form.formState.errors.travelerInfo?.endDate && (
              <p className="text-sm text-red-500 mt-2 font-medium">
                {form.formState.errors.travelerInfo.endDate.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Traveler Count */}
      <div>
        <label className="block text-xl font-semibold mb-6 text-[var(--foreground)]">Traveler Count</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--foreground)]">Number of Adults</label>
            <Input
              type="number"
              min="1"
              {...form.register('travelerInfo.travelers.adults', { valueAsNumber: true })}
              className="bg-white/80 backdrop-blur-sm border-2 border-[var(--border)] focus:border-[var(--primary)] transition-colors duration-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--foreground)]">Number of Children</label>
            <Input
              type="number"
              min="0"
              {...form.register('travelerInfo.travelers.children', { valueAsNumber: true })}
              className="bg-white/80 backdrop-blur-sm border-2 border-[var(--border)] focus:border-[var(--primary)] transition-colors duration-300"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 