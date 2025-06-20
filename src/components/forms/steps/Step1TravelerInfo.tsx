import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { TripIntake } from '@/types/trip';
import { User, Users, UserPlus, UsersRound } from 'lucide-react';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

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

export function Step1TravelerInfo({ disabled }: Step1TravelerInfoProps) {
  const form = useFormContext<TripIntake>();

  if (!form || disabled) {
    return (
      <div className="space-y-6">
        <div className="h-12 bg-card rounded animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-32 bg-card rounded animate-pulse" />
          <div className="h-32 bg-card rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-12 bg-card rounded animate-pulse" />
          <div className="h-12 bg-card rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-12 bg-card rounded animate-pulse" />
          <div className="h-12 bg-card rounded animate-pulse" />
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

      {/* Contact Information */}
      <div>
        <label className="block text-xl font-semibold mb-6 text-[var(--foreground)]">Contact Information</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--foreground)]">Email Address</label>
            <Input
              {...form.register('travelerInfo.email')}
              type="email"
              placeholder="your.email@example.com"
              className="bg-white/80 backdrop-blur-sm border-2 border-[var(--border)] focus:border-[var(--primary)] transition-colors duration-300"
            />
            {form.formState.errors.travelerInfo?.email && (
              <p className="text-sm text-destructive mt-2 font-medium">
                {form.formState.errors.travelerInfo.email.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--foreground)]">Phone Number</label>
            <Input
              {...form.register('travelerInfo.phone')}
              type="tel"
              placeholder="+1 (555) 123-4567"
              className="bg-white/80 backdrop-blur-sm border-2 border-[var(--border)] focus:border-[var(--primary)] transition-colors duration-300"
            />
            {form.formState.errors.travelerInfo?.phone && (
              <p className="text-sm text-destructive mt-2 font-medium">
                {form.formState.errors.travelerInfo.phone.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div>
        <label className="block text-xl font-semibold mb-6 text-[var(--foreground)]">Address</label>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--foreground)]">Street Address</label>
            <Input
              {...form.register('travelerInfo.address.street')}
              placeholder="123 Main Street"
              className="bg-white/80 backdrop-blur-sm border-2 border-[var(--border)] focus:border-[var(--primary)] transition-colors duration-300"
            />
            {form.formState.errors.travelerInfo?.address?.street && (
              <p className="text-sm text-destructive mt-2 font-medium">
                {form.formState.errors.travelerInfo.address.street.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--foreground)]">City</label>
              <Input
                {...form.register('travelerInfo.address.city')}
                placeholder="New York"
                className="bg-white/80 backdrop-blur-sm border-2 border-[var(--border)] focus:border-[var(--primary)] transition-colors duration-300"
              />
              {form.formState.errors.travelerInfo?.address?.city && (
                <p className="text-sm text-destructive mt-2 font-medium">
                  {form.formState.errors.travelerInfo.address.city.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--foreground)]">State/Province</label>
              <Input
                {...form.register('travelerInfo.address.state')}
                placeholder="NY"
                className="bg-white/80 backdrop-blur-sm border-2 border-[var(--border)] focus:border-[var(--primary)] transition-colors duration-300"
              />
              {form.formState.errors.travelerInfo?.address?.state && (
                <p className="text-sm text-destructive mt-2 font-medium">
                  {form.formState.errors.travelerInfo.address.state.message}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--foreground)]">ZIP/Postal Code</label>
              <Input
                {...form.register('travelerInfo.address.zipCode')}
                placeholder="10001"
                className="bg-white/80 backdrop-blur-sm border-2 border-[var(--border)] focus:border-[var(--primary)] transition-colors duration-300"
              />
              {form.formState.errors.travelerInfo?.address?.zipCode && (
                <p className="text-sm text-destructive mt-2 font-medium">
                  {form.formState.errors.travelerInfo.address.zipCode.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--foreground)]">Country</label>
              <Input
                {...form.register('travelerInfo.address.country')}
                placeholder="United States"
                className="bg-white/80 backdrop-blur-sm border-2 border-[var(--border)] focus:border-[var(--primary)] transition-colors duration-300"
              />
              {form.formState.errors.travelerInfo?.address?.country && (
                <p className="text-sm text-destructive mt-2 font-medium">
                  {form.formState.errors.travelerInfo.address.country.message}
                </p>
              )}
            </div>
          </div>
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