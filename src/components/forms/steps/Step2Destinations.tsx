import { useFormContext, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  X, 
  MapPin, 
  Plane, 
  Train, 
  Car, 
  Ship, 
  CalendarIcon,
  Users,
  Route,
  Sparkles,
  CheckCircle,
  User,
  Heart,
  Baby,
  Users2,
  Calendar,
  CalendarDays,
  Clock,
  TrendingUp,
  Star,
  ArrowRight
} from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import { useGooglePlaces } from '@/hooks/useGooglePlaces';
import { Skeleton } from '@/components/ui/skeleton';
import type { FieldError } from 'react-hook-form';
import { TripIntake } from '@/types/trip';
import { cn } from '@/lib/utils';
import { format, isAfter, isBefore, startOfDay, addDays, addMonths, subMonths, startOfYear, endOfYear, differenceInDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { DayPicker, DateRange } from 'react-day-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import 'react-day-picker/dist/style.css';
import { Label } from '@/components/ui/label';

// Custom styles for react-day-picker using proper CSS variables
const dayPickerStyles = `
  .rdp-root {
    --rdp-accent-color: var(--primary);
    --rdp-accent-background-color: var(--primary-100);
    --rdp-day-height: 40px;
    --rdp-day-width: 40px;
    --rdp-day_button-height: 40px;
    --rdp-day_button-width: 40px;
    --rdp-day_button-border-radius: 8px;
    --rdp-selected-border: 2px solid var(--primary);
    --rdp-disabled-opacity: 0.4;
    --rdp-outside-opacity: 0.4;
    --rdp-today-color: var(--accent-foreground);
    --rdp-months-gap: 1rem;
    --rdp-nav_button-height: 36px;
    --rdp-nav_button-width: 36px;
    --rdp-range_middle-background-color: var(--primary-100);
    --rdp-range_middle-color: var(--primary);
    --rdp-range_start-background: var(--primary);
    --rdp-range_start-color: var(--primary-foreground);
    --rdp-range_end-background: var(--primary);
    --rdp-range_end-color: var(--primary-foreground);
    --rdp-weekday-opacity: 0.7;
    --rdp-weekday-padding: 0.5rem 0;
    --rdp-weekday-text-align: center;
  }
  
  .rdp {
    margin: 0;
    font-family: var(--font-sans);
    background: var(--background);
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
    border: 1px solid var(--border);
  }
  
  .rdp-day_button {
    width: 100%;
    height: 100%;
    border: none;
    background: transparent;
    border-radius: 8px;
    padding: 0;
    font-size: 14px;
    font-weight: 500;
    color: var(--foreground);
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  
  .rdp-day_button:hover:not([disabled]):not(.rdp-day_selected) {
    background-color: var(--accent);
    color: var(--accent-foreground);
    transform: scale(1.05);
  }
  
  .rdp-day_button:focus-visible {
    outline: 2px solid var(--ring);
    outline-offset: 2px;
    border-radius: 8px;
  }
  
  .rdp-day_button[disabled] {
    color: var(--muted-foreground);
    cursor: not-allowed;
    opacity: 0.4;
  }
  
  .rdp-day_button.rdp-day_selected {
    background-color: var(--primary);
    color: var(--primary-foreground);
    font-weight: 600;
    box-shadow: 0 2px 8px var(--primary) / 0.3;
  }
  
  .rdp-day_button.rdp-day_today {
    background-color: var(--accent);
    color: var(--accent-foreground);
    font-weight: 600;
    border: 2px solid var(--accent);
  }
  
  .rdp-day_button.rdp-day_today.rdp-day_selected {
    background-color: var(--primary);
    color: var(--primary-foreground);
    border-color: var(--primary);
  }
  
  .rdp-caption {
    color: var(--foreground);
    font-weight: 600;
    font-size: 16px;
    text-align: center;
    margin-bottom: 16px;
  }
  
  .rdp-head_cell {
    color: var(--muted-foreground);
    font-weight: 500;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .rdp-nav_button {
    color: var(--muted-foreground);
    background-color: transparent;
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 8px;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .rdp-nav_button:hover {
    background-color: var(--accent);
    color: var(--accent-foreground);
    border-color: var(--accent);
    transform: scale(1.05);
  }
  
  .rdp-nav_button:focus-visible {
    outline: 2px solid var(--ring);
    outline-offset: 2px;
  }
  
  .rdp-months {
    display: flex;
    gap: 1rem;
  }
  
  .rdp-month {
    flex: 1;
  }
  
  .rdp-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .rdp-tbody {
    border: none;
  }
  
  .rdp-tfoot {
    border: none;
  }
  
  .rdp-tbody td {
    border: none;
    padding: 2px;
  }
  
  .rdp-tbody th {
    border: none;
    padding: 8px 2px;
  }
  
  .rdp-caption_label {
    font-size: 16px;
    font-weight: 600;
  }
  
  .rdp-dropdown {
    background-color: var(--background);
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--foreground);
    font-size: 14px;
    padding: 4px 8px;
    margin: 0 4px;
  }
  
  .rdp-dropdown:focus {
    outline: 2px solid var(--ring);
    outline-offset: 2px;
  }
  
  /* Custom animations */
  .rdp-day_button {
    animation: fadeIn 0.2s ease-in-out;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  /* Hover effects */
  .rdp-day_button:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgb(0 0 0 / 0.1);
  }
  
  /* Selected state with better visual feedback */
  .rdp-day_button.rdp-day_selected {
    animation: selectPulse 0.3s ease-in-out;
  }
  
  @keyframes selectPulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
    }
  }
  
  /* Today indicator */
  .rdp-day_button.rdp-day_today::before {
    content: '';
    position: absolute;
    top: 2px;
    right: 2px;
    width: 6px;
    height: 6px;
    background-color: var(--accent-foreground);
    border-radius: 50%;
  }
  
  .rdp-day_button.rdp-day_today.rdp-day_selected::before {
    background-color: var(--primary-foreground);
  }
`;

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

const travelTypeOptions = [
  {
    value: 'solo',
    label: 'Solo',
    description: 'Individual',
    icon: User,
  },
  {
    value: 'couple',
    label: 'Couple',
    description: 'Two people',
    icon: Heart,
  },
  {
    value: 'family',
    label: 'Family',
    description: 'Family trip',
    icon: Baby,
  },
  {
    value: 'group',
    label: 'Group',
    description: 'Group travel',
    icon: Users2,
  },
];

// Generate years (current year + 5 years)
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 6 }, (_: any, i: number) => currentYear + i);

// Generate months
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Travel agent optimized date presets
const datePresets = [
  { label: 'This Weekend', duration: 3, offset: 0 },
  { label: 'Next Weekend', duration: 3, offset: 7 },
  { label: '1 Week', duration: 7, offset: 0 },
  { label: '2 Weeks', duration: 14, offset: 0 },
  { label: '1 Month', duration: 30, offset: 0 },
  { label: '3 Months', duration: 90, offset: 0 },
  { label: '6 Months', duration: 180, offset: 0 },
  { label: '1 Year', duration: 365, offset: 0 },
];

// Popular travel seasons
const travelSeasons = [
  { label: 'Summer (Jun-Aug)', months: [5, 6, 7] },
  { label: 'Fall (Sep-Nov)', months: [8, 9, 10] },
  { label: 'Winter (Dec-Feb)', months: [11, 0, 1] },
  { label: 'Spring (Mar-May)', months: [2, 3, 4] },
  { label: 'Holiday Season', months: [11, 0] },
  { label: 'Peak Season', months: [5, 6, 7, 11, 0] },
];

// Quick duration buttons
const quickDurations = [
  { label: '3 Days', value: 3 },
  { label: '5 Days', value: 5 },
  { label: '1 Week', value: 7 },
  { label: '10 Days', value: 10 },
  { label: '2 Weeks', value: 14 },
  { label: '3 Weeks', value: 21 },
  { label: '1 Month', value: 30 },
];

// Efficient travel agent date presets
const quickPresets = [
  { label: 'This Weekend', days: 3, offset: 0, icon: Calendar },
  { label: 'Next Weekend', days: 3, offset: 7, icon: Calendar },
  { label: '1 Week', days: 7, offset: 0, icon: Clock },
  { label: '2 Weeks', days: 14, offset: 0, icon: Clock },
  { label: '1 Month', days: 30, offset: 0, icon: Clock },
  { label: '3 Months', days: 90, offset: 0, icon: Clock },
];

// Popular travel periods
const popularPeriods = [
  { label: 'Winter', startMonth: 11, startDay: 20, endMonth: 0, endDay: 5, icon: Star, color: 'bg-red-100 text-red-700' },
  { label: 'Spring', startMonth: 2, startDay: 15, endMonth: 3, endDay: 15, icon: Star, color: 'bg-pink-100 text-pink-700' },
  { label: 'Summer', startMonth: 5, startDay: 15, endMonth: 7, endDay: 31, icon: Star, color: 'bg-yellow-100 text-yellow-700' },
];

export function Step2Destinations({ disabled = false }: { disabled?: boolean }) {
  const form = useFormContext();
  const fromInputRef = useRef<HTMLInputElement>(null);
  const primaryInputRef = useRef<HTMLInputElement>(null);
  const { place: fromPlace } = useGooglePlaces(fromInputRef);
  const { place: primaryPlace } = useGooglePlaces(primaryInputRef);
  const [dateRangeOpen, setDateRangeOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedEndMonth, setSelectedEndMonth] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  // Get date range from form values
  const watchStartDate = form.watch('travelerInfo.startDate');
  const watchEndDate = form.watch('travelerInfo.endDate');
  const startDate = watchStartDate ? new Date(watchStartDate) : undefined;
  const endDate = watchEndDate ? new Date(watchEndDate) : undefined;
  const tripDuration = startDate && endDate ? differenceInDays(endDate, startDate) + 1 : 0;

  // Update form when date range changes
  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range?.from) {
      const startDateString = format(range.from, 'yyyy-MM-dd');
      form.setValue('travelerInfo.startDate', startDateString);
    } else {
      form.setValue('travelerInfo.startDate', '');
    }
    
    if (range?.to) {
      const endDateString = format(range.to, 'yyyy-MM-dd');
      form.setValue('travelerInfo.endDate', endDateString);
    } else {
      form.setValue('travelerInfo.endDate', '');
    }
  };

  // Helper function to format date range for display
  const formatDateRange = (range: DateRange | undefined) => {
    if (!range?.from) return 'Select travel dates';
    if (!range.to) return `${format(range.from, 'MMM dd')} - Select end date`;
    return `${format(range.from, 'MMM dd')} - ${format(range.to, 'MMM dd, yyyy')}`;
  };

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

  // Set default traveler counts based on travel type
  useEffect(() => {
    const travelType = form.watch('travelerInfo.travelType');
    
    switch (travelType) {
      case 'solo':
        form.setValue('travelerInfo.travelers.adults', 1);
        form.setValue('travelerInfo.travelers.children', 0);
        break;
      case 'couple':
        form.setValue('travelerInfo.travelers.adults', 2);
        form.setValue('travelerInfo.travelers.children', 0);
        break;
      case 'family':
        form.setValue('travelerInfo.travelers.adults', 2);
        form.setValue('travelerInfo.travelers.children', 2);
        break;
      case 'group':
        form.setValue('travelerInfo.travelers.adults', 4);
        form.setValue('travelerInfo.travelers.children', 0);
        break;
    }
  }, [form.watch('travelerInfo.travelType')]);

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

  // Check completion status
  const hasFromLocation = form.watch('destinations.from');
  const hasPrimaryDestination = form.watch('destinations.primary');
  const hasTransportType = form.watch('travelerInfo.transportType');
  const hasStartDate = form.watch('travelerInfo.startDate');
  const hasEndDate = form.watch('travelerInfo.endDate');
  const hasAdults = form.watch('travelerInfo.travelers.adults');
  const hasTravelType = form.watch('travelerInfo.travelType');

  const isComplete = hasFromLocation && hasPrimaryDestination && hasTransportType && 
                    hasStartDate && hasEndDate && hasAdults && hasTravelType;

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    if (range?.from) {
      form.setValue('travelerInfo.startDate', format(range.from, 'yyyy-MM-dd'));
      setStartDateOpen(false);
      // Update start calendar to show the month of the start date
      setSelectedMonth(range.from);
    }
    if (range?.to) {
      form.setValue('travelerInfo.endDate', format(range.to, 'yyyy-MM-dd'));
      setEndDateOpen(false);
      // Update end calendar to show the month of the end date
      setSelectedEndMonth(range.to);
    }
  };

  const handleMonthChange = (monthIndex: number) => {
    const newDate = new Date(selectedYear, monthIndex, 1);
    setSelectedMonth(newDate);
  };

  const handleYearChange = (year: number) => {
    const newDate = new Date(year, selectedMonth.getMonth(), 1);
    setSelectedMonth(newDate);
    setSelectedYear(year);
  };

  // Travel agent optimized date selection helpers
  const selectDatePreset = (preset: typeof datePresets[0]) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + preset.offset);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + preset.duration - 1);
    
    handleDateRangeSelect({ from: startDate, to: endDate });
  };

  const selectDurationFromToday = (days: number) => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days - 1);
    
    handleDateRangeSelect({ from: startDate, to: endDate });
  };

  const selectTravelSeason = (season: typeof travelSeasons[0]) => {
    const currentYear = new Date().getFullYear();
    const today = new Date();
    let startDate = new Date(currentYear, season.months[0], 1);
    let endDate = new Date(currentYear, season.months[season.months.length - 1] + 1, 0);
    
    // If the season has already passed this year, use next year
    if (endDate < today) {
      startDate = new Date(currentYear + 1, season.months[0], 1);
      endDate = new Date(currentYear + 1, season.months[season.months.length - 1] + 1, 0);
    }
    
    handleDateRangeSelect({ from: startDate, to: endDate });
    // Update calendar to show the first month of the season
    setSelectedMonth(startDate);
  };

  const selectSpecificMonth = (monthIndex: number, year: number) => {
    const startDate = new Date(year, monthIndex, 1);
    const endDate = new Date(year, monthIndex + 1, 0); // Last day of the month
    
    handleDateRangeSelect({ from: startDate, to: endDate });
  };

  // Efficient preset handlers
  const handleQuickPreset = (preset: typeof quickPresets[0]) => {
    const today = new Date();
    
    if (preset.label.includes('Weekend')) {
      // Find next Saturday
      const daysUntilSaturday = (6 - today.getDay() + 7) % 7;
      const saturday = addDays(today, daysUntilSaturday + preset.offset);
      const sunday = addDays(saturday, 1);
      handleDateRangeSelect({ from: saturday, to: sunday });
      // Update calendar to show the month of the selected date
      setSelectedMonth(saturday);
    } else {
      const startDate = addDays(today, preset.offset);
      const endDate = addDays(startDate, preset.days - 1);
      handleDateRangeSelect({ from: startDate, to: endDate });
      // Update calendar to show the month of the selected date
      setSelectedMonth(startDate);
    }
  };

  const handleSeasonSelect = (season: typeof travelSeasons[0]) => {
    const currentYear = new Date().getFullYear();
    const today = new Date();
    let startDate = new Date(currentYear, season.months[0], 1);
    let endDate = new Date(currentYear, season.months[season.months.length - 1] + 1, 0);
    
    // If the season has already passed this year, use next year
    if (endDate < today) {
      startDate = new Date(currentYear + 1, season.months[0], 1);
      endDate = new Date(currentYear + 1, season.months[season.months.length - 1] + 1, 0);
    }
    
    handleDateRangeSelect({ from: startDate, to: endDate });
    // Update calendar to show the first month of the season
    setSelectedMonth(startDate);
  };

  const handlePopularPeriod = (period: typeof popularPeriods[0]) => {
    const currentYear = new Date().getFullYear();
    const today = new Date();
    let startDate = new Date(currentYear, period.startMonth, period.startDay);
    let endDate = new Date(currentYear, period.endMonth, period.endDay);
    
    // Handle year rollover (e.g., Holiday Season)
    if (period.endMonth < period.startMonth) {
      endDate.setFullYear(currentYear + 1);
    }
    
    // If the period has already passed this year, use next year
    if (endDate < today) {
      startDate = new Date(currentYear + 1, period.startMonth, period.startDay);
      endDate = new Date(currentYear + 1, period.endMonth, period.endDay);
      
      // Handle year rollover for next year
      if (period.endMonth < period.startMonth) {
        endDate.setFullYear(currentYear + 2);
      }
    }
    
    handleDateRangeSelect({ from: startDate, to: endDate });
    // Update calendar to show the month of the start date
    setSelectedMonth(startDate);
  };

  const handleStartDateSelect = (date: Date | undefined) => {
    if (date) {
      form.setValue('travelerInfo.startDate', format(date, 'yyyy-MM-dd'));
      setStartDateOpen(false);
      
      // Auto-set end date to 7 days after start date if no end date is set
      if (!endDate) {
        const defaultEndDate = addDays(date, 6); // 7 days total
        form.setValue('travelerInfo.endDate', format(defaultEndDate, 'yyyy-MM-dd'));
        // Update end calendar to show the month of the new end date
        setSelectedEndMonth(defaultEndDate);
      }
    }
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    if (date) {
      form.setValue('travelerInfo.endDate', format(date, 'yyyy-MM-dd'));
      setEndDateOpen(false);
      // Update end calendar to show the month of the selected end date
      setSelectedEndMonth(date);
    }
  };

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
    <>
      <style dangerouslySetInnerHTML={{ __html: dayPickerStyles }} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-4xl mx-auto space-y-8"
      >

        {/* Travel Route Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-b from-[var(--card)]/95 to-[var(--background)]/20 border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-[var(--card-foreground)]">
                <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center border border-[var(--primary)]/20">
                  <Route className="h-5 w-5 text-[var(--primary)]" />
                </div>
      <div>
                  <div className="text-lg font-semibold">Travel Route</div>
                  <div className="text-sm font-normal text-[var(--muted-foreground)]">
                    Where are you traveling from and to?
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--foreground)]">From</label>
          <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
            <Input
              ref={(e) => {
                fromInputRef.current = e;
                fromRegisterRef(e);
              }}
              {...fromRegisterProps}
                      placeholder="e.g. London, UK"
                      className="pl-10 h-11 rounded-xl border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20"
              disabled={disabled}
            />
          </div>
          {getError('from') && (
                    <p className="text-sm text-red-500">{getError('from')?.message}</p>
          )}
      </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--foreground)]">To</label>
        <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
          <Input
            ref={(e) => {
              primaryInputRef.current = e;
              primaryRegisterRef(e);
            }}
            {...primaryRegisterProps}
                      placeholder="e.g. Paris, France"
                      className="pl-10 h-11 rounded-xl border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20"
            disabled={disabled}
          />
        </div>
        {getError('primary') && (
                    <p className="text-sm text-destructive">{getError('primary')?.message}</p>
        )}
      </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Transport & Travel Type Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
      {/* Transport Type */}
          <Card className="bg-gradient-to-b from-[var(--card)]/95 to-[var(--background)]/20 border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-[var(--card-foreground)]">
                <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center border border-[var(--primary)]/20">
                  <Plane className="h-5 w-5 text-[var(--primary)]" />
                </div>
      <div>
                  <div className="text-lg font-semibold">Transport</div>
                  <div className="text-sm font-normal text-[var(--muted-foreground)]">
                    How will you travel?
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent>
        <RadioGroup
          value={form.watch('travelerInfo.transportType')}
          onValueChange={(value) => form.setValue('travelerInfo.transportType', value as any)}
                className="grid grid-cols-2 gap-3"
        >
          {transportTypeOptions.map(({ value, label, description, icon: Icon }) => {
            const isSelected = form.watch('travelerInfo.transportType') === value;
            return (
              <div
                key={value}
                className={cn(
                        'relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer',
                        'bg-[var(--background)] hover:bg-[var(--accent)]',
                  isSelected 
                          ? 'border-[var(--primary)] bg-[var(--primary)]/5 shadow-md' 
                    : 'border-[var(--border)] hover:border-[var(--primary)]/30'
                )}
              >
                <RadioGroupItem
                  value={value}
                  id={value}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                      <div className="flex flex-col items-center text-center gap-2 pointer-events-none">
                  <Icon className={cn(
                          'h-6 w-6 transition-colors duration-300',
                    isSelected ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'
                  )} />
                  <div>
                          <label htmlFor={value} className="text-sm font-semibold text-[var(--foreground)] block">
                      {label}
                    </label>
                          <p className="text-xs text-[var(--muted-foreground)]">{description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </RadioGroup>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-b from-[var(--card)]/95 to-[var(--background)]/20 border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-[var(--card-foreground)]">
                <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center border border-[var(--primary)]/20">
                  <CalendarIcon className="h-5 w-5 text-[var(--primary)]" />
      </div>
      <div>
                  <div className="text-lg font-semibold">Travel Dates</div>
                  <div className="text-sm font-normal text-[var(--muted-foreground)]">
                    When are you traveling?
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Popular Periods */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-[var(--foreground)]">Popular Periods</Label>
                <div className="flex flex-wrap gap-2">
                  {popularPeriods.map((period) => {
                    const Icon = period.icon;
                    return (
                      <Button
                        key={period.label}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handlePopularPeriod(period)}
                        className={cn("text-xs h-8 px-3", period.color)}
                      >
                        <Icon className="h-3 w-3 mr-1" />
                        {period.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Separate Start and End Date Selection */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {/* Start Date */}
                  <div className="space-y-2">
                    <Label className="text-xs text-[var(--muted-foreground)]">Start Date</Label>
            <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                            "w-full justify-start text-left font-normal h-10 rounded-lg border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]/30 transition-colors duration-300",
                            !startDate && "text-[var(--muted-foreground)]"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "MMM dd") : "Start"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                        {/* Quick Year/Month Selection */}
                        <div className="p-3 border-b border-[var(--border)] bg-[var(--muted)]/30">
                          <div className="flex gap-2">
                            <Select value={selectedMonth.getMonth().toString()} onValueChange={(value) => handleMonthChange(parseInt(value))}>
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {months.map((month: string, index: number) => (
                                  <SelectItem key={index} value={index.toString()}>
                                    {month}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select value={selectedYear.toString()} onValueChange={(value) => handleYearChange(parseInt(value))}>
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {years.map((year: number) => (
                                  <SelectItem key={year} value={year.toString()}>
                                    {year}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DayPicker
                  mode="single"
                          selected={startDate}
                          onSelect={handleStartDateSelect}
                          month={selectedMonth}
                          onMonthChange={setSelectedMonth}
                          disabled={(date) => date < new Date()}
                          className="rdp-root p-2"
                />
              </PopoverContent>
            </Popover>
          </div>

                  {/* End Date */}
                  <div className="space-y-2">
                    <Label className="text-xs text-[var(--muted-foreground)]">End Date</Label>
            <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                            "w-full justify-start text-left font-normal h-10 rounded-lg border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]/30 transition-colors duration-300",
                            !endDate && "text-[var(--muted-foreground)]"
                          )}
                          disabled={!startDate}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "MMM dd") : "End"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                        {/* Quick Year/Month Selection */}
                        <div className="p-3 border-b border-[var(--border)] bg-[var(--muted)]/30">
                          <div className="flex gap-2">
                            <Select value={selectedEndMonth.getMonth().toString()} onValueChange={(value) => setSelectedEndMonth(new Date(parseInt(value)))}>
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {months.map((month: string, index: number) => (
                                  <SelectItem key={index} value={index.toString()}>
                                    {month}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select value={selectedEndMonth.getFullYear().toString()} onValueChange={(value) => setSelectedEndMonth(new Date(parseInt(value), selectedEndMonth.getMonth(), 1))}>
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {years.map((year: number) => (
                                  <SelectItem key={year} value={year.toString()}>
                                    {year}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DayPicker
                  mode="single"
                          selected={endDate}
                          onSelect={handleEndDateSelect}
                          month={selectedEndMonth}
                          onMonthChange={setSelectedEndMonth}
                          disabled={(date) => !startDate || date <= startDate}
                          className="rdp-root px-4"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              {/* Trip Duration Display */}
              {tripDuration > 0 && (
                <div className="flex items-center gap-2 p-3 bg-[var(--primary)]/5 rounded-lg border border-[var(--primary)]/20">
                  <Clock className="h-4 w-4 text-[var(--primary)]" />
                  <span className="text-sm font-medium text-[var(--primary)]">
                    {tripDuration} day{tripDuration !== 1 ? 's' : ''} trip
                  </span>
                  {startDate && endDate && (
                    <>
                      <ArrowRight className="h-4 w-4 text-[var(--primary)]/60" />
                      <span className="text-sm text-[var(--primary)]/80">
                        {format(startDate, 'MMM dd')} - {format(endDate, 'MMM dd, yyyy')}
                      </span>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          
        </motion.div>

        {/* Travel Dates & Count Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
      {/* Travel Dates */}
          
          {/* Travel Type */}
          <Card className="bg-gradient-to-b from-[var(--card)]/95 to-[var(--background)]/20 border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-[var(--card-foreground)]">
                <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center border border-[var(--primary)]/20">
                  <Users className="h-5 w-5 text-[var(--primary)]" />
                </div>
                <div>
                  <div className="text-lg font-semibold">Travel Type</div>
                  <div className="text-sm font-normal text-[var(--muted-foreground)]">
                    Who is traveling?
                  </div>
      </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <RadioGroup
                value={form.watch('travelerInfo.travelType')}
                onValueChange={(value) => form.setValue('travelerInfo.travelType', value as any)}
                className="grid grid-cols-2 gap-3"
              >
                {travelTypeOptions.map(({ value, label, description, icon: Icon }) => {
                  const isSelected = form.watch('travelerInfo.travelType') === value;
                  return (
                    <div
                      key={value}
                      className={cn(
                        'relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer',
                        'bg-[var(--background)] hover:bg-[var(--accent)]',
                        isSelected 
                          ? 'border-[var(--primary)] bg-[var(--primary)]/5 shadow-md' 
                          : 'border-[var(--border)] hover:border-[var(--primary)]/30'
                      )}
                    >
                      <RadioGroupItem
                        value={value}
                        id={value}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex flex-col items-center text-center gap-2 pointer-events-none">
                        <Icon className={cn(
                          'h-6 w-6 transition-colors duration-300',
                          isSelected ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'
                        )} />
                        <div>
                          <label htmlFor={value} className="text-sm font-semibold text-[var(--foreground)] block">
                            {label}
                          </label>
                          <p className="text-xs text-[var(--muted-foreground)]">{description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Traveler Count */}
          <Card className="bg-gradient-to-b from-[var(--card)]/95 to-[var(--background)]/20 border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-[var(--card-foreground)]">
                <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center border border-[var(--primary)]/20">
                  <Users className="h-5 w-5 text-[var(--primary)]" />
                </div>
                <div>
                  <div className="text-lg font-semibold">Group Size</div>
                  <div className="text-sm font-normal text-[var(--muted-foreground)]">
                    {(() => {
                      const travelType = form.watch('travelerInfo.travelType');
                      switch (travelType) {
                        case 'solo': return 'Individual traveler';
                        case 'couple': return 'Two adults traveling together';
                        case 'family': return 'Family with children';
                        case 'group': return 'Group of travelers';
                        default: return 'How many travelers?';
                      }
                    })()}
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--foreground)]">Adults</label>
                <Input
                  type="number"
                  min={(() => {
                    const travelType = form.watch('travelerInfo.travelType');
                    switch (travelType) {
                      case 'solo': return 1;
                      case 'couple': return 2;
                      case 'family': return 1;
                      case 'group': return 2;
                      default: return 1;
                    }
                  })()}
                  max={(() => {
                    const travelType = form.watch('travelerInfo.travelType');
                    switch (travelType) {
                      case 'solo': return 1;
                      case 'couple': return 2;
                      case 'family': return 4;
                      case 'group': return 20;
                      default: return 10;
                    }
                  })()}
                  {...form.register('travelerInfo.travelers.adults', { valueAsNumber: true })}
                  placeholder="Number of adults"
                  className="h-11 rounded-xl border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20"
                  disabled={disabled}
                />
                {form.formState.errors.travelerInfo?.travelers?.adults && (
                  <p className="text-sm text-red-500">{form.formState.errors.travelerInfo.travelers.adults.message}</p>
                )}
                <p className="text-xs text-[var(--muted-foreground)]">
                  {(() => {
                    const travelType = form.watch('travelerInfo.travelType');
                    switch (travelType) {
                      case 'solo': return 'Individual traveler (1 adult)';
                      case 'couple': return 'Two adults traveling together';
                      case 'family': return 'Parents and guardians (1-4 adults)';
                      case 'group': return 'Group of adult travelers (2-20 people)';
                      default: return '';
                    }
                  })()}
                </p>
              </div>

              {(() => {
                const travelType = form.watch('travelerInfo.travelType');
                // Only show children field for family travel type
                if (travelType === 'family') {
                  return (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[var(--foreground)]">Children</label>
                      <Input
                        type="number"
                        min={0}
                        max={8}
                        {...form.register('travelerInfo.travelers.children', { valueAsNumber: true })}
                        placeholder="Number of children"
                        className="h-11 rounded-xl border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20"
                        disabled={disabled}
                      />
                      {form.formState.errors.travelerInfo?.travelers?.children && (
                        <p className="text-sm text-red-500">{form.formState.errors.travelerInfo.travelers.children.message}</p>
                      )}
                      <p className="text-xs text-[var(--muted-foreground)]">
                        Children under 18 years old (0-8 children)
                      </p>
                    </div>
                  );
                }
                return null;
              })()}
            </CardContent>
          </Card>
        </motion.div>

        {/* Additional Stops Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="bg-gradient-to-b from-[var(--card)]/95 to-[var(--background)]/20 border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-[var(--card-foreground)]">
                <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center border border-[var(--primary)]/20">
                  <MapPin className="h-5 w-5 text-[var(--primary)]" />
          </div>
                <div>
                  <div className="text-lg font-semibold">Additional Stops</div>
                  <div className="text-sm font-normal text-[var(--muted-foreground)]">
                    Any other destinations on your route?
        </div>
      </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <AnimatePresence>
          {(form.watch('destinations.additional') || []).map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex gap-3"
                  >
              <Input
                {...form.register(`destinations.additional.${index}`)}
                placeholder="Enter additional destination"
                      className="flex-1 h-11 rounded-xl border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20"
                disabled={disabled}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => removeDestination(index)}
                disabled={disabled}
                      className="h-11 w-11 rounded-xl border-[var(--border)] bg-[var(--background)] hover:bg-[var(--accent)]"
              >
                <X className="h-4 w-4" />
              </Button>
                  </motion.div>
          ))}
              </AnimatePresence>
              
          <Button
            type="button"
            variant="outline"
            onClick={addDestination}
            disabled={disabled}
                className="w-full h-11 rounded-xl border-[var(--border)] bg-[var(--background)] hover:bg-[var(--accent)] hover:border-[var(--primary)]/30"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Stop
          </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Status Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex justify-between items-center pt-6"
        >
          <div className="text-sm text-[var(--muted-foreground)]">
            {isComplete ? 'All travel details complete - ready to proceed' : 'Please fill in all required travel details'}
        </div>
          
          <div className="flex items-center gap-2">
            {isComplete && (
              <Badge variant="outline" className="bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20">
                <CheckCircle className="h-3 w-3 mr-1" />
                Complete
              </Badge>
            )}
      </div>
        </motion.div>
      </motion.div>
    </>
  );
} 