import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DayPicker } from 'react-day-picker';
import { format, differenceInDays, addDays } from 'date-fns';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Plus, 
  Minus,
  Trash2, 
  Copy,
  Edit,
  CheckCircle,
  AlertCircle,
  Plane,
  Building2,
  Heart,
  Clock,
  ArrowRight,
  CalendarDays,
  UserPlus,
  Group,
  Sparkles,
  Star,
  Globe,
  TrendingUp,
  User
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

import { NewIntake, TravelerGroup, TripPurpose } from '@/types/newIntake';
import { useNewIntakeStore } from '@/store/newIntake';

interface StepTripDetailsProps {
  disabled?: boolean;
}

const PURPOSE_OPTIONS: { value: TripPurpose; label: string; icon: any; description: string; color: string }[] = [
  { value: 'leisure', label: 'Leisure', icon: Plane, description: 'Vacation and relaxation', color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
  { value: 'honeymoon', label: 'Honeymoon', icon: Heart, description: 'Romantic getaway', color: 'bg-pink-500/10 text-pink-600 border-pink-200' },
  { value: 'business', label: 'Business', icon: Building2, description: 'Work-related travel', color: 'bg-gray-500/10 text-gray-600 border-gray-200' },
  { value: 'group-celebration', label: 'Group Celebration', icon: Users, description: 'Special events and celebrations', color: 'bg-purple-500/10 text-purple-600 border-purple-200' },
];

// Date selection helpers
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 6 }, (_, i) => currentYear + i);
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
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

// Popular travel periods
const popularPeriods = [
  { label: 'Winter', startMonth: 11, startDay: 20, endMonth: 0, endDay: 5, icon: Star, color: 'bg-red-100 text-red-700' },
  { label: 'Spring', startMonth: 2, startDay: 15, endMonth: 3, endDay: 15, icon: Star, color: 'bg-pink-100 text-pink-700' },
  { label: 'Summer', startMonth: 5, startDay: 15, endMonth: 7, endDay: 31, icon: Star, color: 'bg-yellow-100 text-yellow-700' },
];

// Quick traveler presets
const travelerPresets = [
  { label: 'Solo', adults: 1, children: 0, icon: User, color: 'bg-blue-100 text-blue-700' },
  { label: 'Couple', adults: 2, children: 0, icon: Heart, color: 'bg-pink-100 text-pink-700' },
  { label: 'Family', adults: 2, children: 2, icon: Users, color: 'bg-green-100 text-green-700' },
  { label: 'Group', adults: 4, children: 0, icon: Group, color: 'bg-purple-100 text-purple-700' },
];

export function StepTripDetails({ disabled }: StepTripDetailsProps) {
  const form = useFormContext<NewIntake>();
  const { addGroup, updateGroup, removeGroup, duplicateGroup } = useNewIntakeStore();
  
  // Add error boundary
  if (!form) {
    console.error('Form context not found');
    return <div>Form context not available</div>;
  }
  
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  
  // Date selection state
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedEndMonth, setSelectedEndMonth] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Watch form values efficiently - only watch what we need
  const useSubgroups = form.watch('tripDetails.useSubgroups');
  const groups = form.watch('tripDetails.groups');
  const startDate = form.watch('tripDetails.startDate');
  const endDate = form.watch('tripDetails.endDate');
  const totalAdults = form.watch('tripDetails.totalTravelers.adults') || 0;
  const totalChildren = form.watch('tripDetails.totalTravelers.children') || 0;
  const hasPrimaryDestination = form.watch('tripDetails.primaryDestination');
  const hasPurpose = form.watch('tripDetails.purpose');

  // Calculate duration when dates change - simplified
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 0) {
        form.setValue('tripDetails.duration', diffDays);
      }
    }
  }, [startDate, endDate]);

  // Check completion status
  const hasStartDate = startDate;
  const hasEndDate = endDate;
  const hasAdults = totalAdults;

  const isComplete = hasPrimaryDestination && hasStartDate && hasEndDate && hasAdults && hasPurpose;

  // Simplified handlers
  const handleAddGroup = () => {
    const newGroup: TravelerGroup = {
      id: `group_${Date.now()}`,
      name: `Group ${(groups?.length || 0) + 1}`,
      adults: 1,
      children: 0,
      childAges: [],
      travelerNames: [],
      notes: '',
    };

    addGroup(newGroup);
    setShowGroupForm(true);
    setEditingGroupId(newGroup.id);
  };

  const handleUpdateGroup = (groupId: string, updates: Partial<TravelerGroup>) => {
    updateGroup(groupId, updates);
    setEditingGroupId(null);
    setShowGroupForm(false);
    toast.success('Group updated successfully');
  };

  const handleRemoveGroup = (groupId: string) => {
    removeGroup(groupId);
    toast.success('Group removed');
  };

  const handleDuplicateGroup = (groupId: string) => {
    duplicateGroup(groupId);
    toast.success('Group duplicated');
  };

  const handleEditGroup = (groupId: string) => {
    setEditingGroupId(groupId);
    setShowGroupForm(true);
  };

  const handleCancelEdit = () => {
    setEditingGroupId(null);
    setShowGroupForm(false);
  };

  // Date selection handlers
  const handleStartDateSelect = (date: Date | undefined) => {
    if (date) {
      form.setValue('tripDetails.startDate', format(date, 'yyyy-MM-dd'));
      setStartDateOpen(false);
      
      // Auto-set end date to 7 days after start date if no end date is set
      if (!endDate) {
        const defaultEndDate = addDays(date, 6); // 7 days total
        form.setValue('tripDetails.endDate', format(defaultEndDate, 'yyyy-MM-dd'));
        setSelectedEndMonth(defaultEndDate);
      }
    }
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    if (date) {
      form.setValue('tripDetails.endDate', format(date, 'yyyy-MM-dd'));
      setEndDateOpen(false);
      setSelectedEndMonth(date);
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

  // Quick duration selection
  const selectDurationFromToday = (days: number) => {
    const startDate = new Date();
    const endDate = addDays(startDate, days - 1);
    
    form.setValue('tripDetails.startDate', format(startDate, 'yyyy-MM-dd'));
    form.setValue('tripDetails.endDate', format(endDate, 'yyyy-MM-dd'));
    form.setValue('tripDetails.duration', days);
    
    setSelectedMonth(startDate);
    setSelectedEndMonth(endDate);
  };

  // Popular period selection
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
    
    form.setValue('tripDetails.startDate', format(startDate, 'yyyy-MM-dd'));
    form.setValue('tripDetails.endDate', format(endDate, 'yyyy-MM-dd'));
    form.setValue('tripDetails.duration', differenceInDays(endDate, startDate) + 1);
    
    setSelectedMonth(startDate);
    setSelectedEndMonth(endDate);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mx-auto space-y-8 max-w-4xl"
    >
      {/* Trip Purpose & Destination */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gradient-to-br from-[var(--card)] via-[var(--card)]/95 to-[var(--background)]/30 border border-[var(--border)] rounded-3xl shadow-lg overflow-hidden backdrop-blur-sm">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-4 text-[var(--card-foreground)]">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/10 flex items-center justify-center border border-[var(--primary)]/30 shadow-sm">
                <Globe className="h-6 w-6 text-[var(--primary)]" />
              </div>
              <div>
                <div className="text-xl font-bold">Trip Purpose & Destination</div>
                <div className="text-sm font-normal text-[var(--muted-foreground)] mt-1">
                  Tell us about your travel plans and where you're headed
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Trip Purpose Selection */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
                <Star className="h-4 w-4 text-[var(--primary)]" />
                Trip Purpose
              </Label>
              <Controller
                name="tripDetails.purpose"
                control={form.control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger disabled={disabled} className="h-12 rounded-xl border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20 transition-all duration-200">
                      <SelectValue placeholder="Select your trip purpose" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-[var(--border)] bg-[var(--background)]">
                      {PURPOSE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="rounded-lg">
                          <div className="flex items-center gap-3 py-1">
                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center border", option.color)}>
                              <option.icon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-medium text-[var(--foreground)]">{option.label}</div>
                              <div className="text-xs text-[var(--muted-foreground)]">{option.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Destination Input */}
            <div className="space-y-4">
              <Label htmlFor="primaryDestination" className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[var(--primary)]" />
                Primary Destination *
              </Label>
              <div className="relative">
                <Controller
                  name="tripDetails.primaryDestination"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="primaryDestination"
                      placeholder="e.g., Paris, France or Tokyo, Japan"
                      disabled={disabled}
                      className="h-12 rounded-xl border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20 pl-12 transition-all duration-200"
                    />
                  )}
                />
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--muted-foreground)]" />
              </div>
              {form.formState.errors.tripDetails?.primaryDestination && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {form.formState.errors.tripDetails.primaryDestination.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Travel Dates */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gradient-to-br from-[var(--card)] via-[var(--card)]/95 to-[var(--background)]/30 border border-[var(--border)] rounded-3xl shadow-lg overflow-hidden backdrop-blur-sm">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-4 text-[var(--card-foreground)]">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--secondary)]/20 to-[var(--secondary)]/10 flex items-center justify-center border border-[var(--secondary)]/30 shadow-sm">
                <CalendarDays className="h-6 w-6 text-[var(--secondary)]" />
              </div>
              <div>
                <div className="text-xl font-bold">Travel Dates</div>
                <div className="text-sm font-normal text-[var(--muted-foreground)] mt-1">
                  When are you planning to travel?
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Popular Periods */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
                <Star className="h-4 w-4 text-[var(--primary)]" />
                Popular Periods
              </Label>
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
                      className={cn("text-xs h-8 px-3 rounded-lg", period.color)}
                    >
                      <Icon className="h-3 w-3 mr-1" />
                      {period.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Quick Duration Selection */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
                <Clock className="h-4 w-4 text-[var(--primary)]" />
                Quick Duration
              </Label>
              <div className="flex flex-wrap gap-2">
                {quickDurations.map((duration) => (
                  <Button
                    key={duration.label}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => selectDurationFromToday(duration.value)}
                    className="text-xs h-8 px-3 rounded-lg border-[var(--border)] bg-[var(--background)] hover:bg-[var(--accent)] hover:border-[var(--primary)]/30 transition-all duration-200"
                  >
                    {duration.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Date Selection */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[var(--primary)]" />
                Select Dates
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Start Date */}
                <div className="space-y-2">
                  <Label className="text-xs text-[var(--muted-foreground)]">Start Date *</Label>
                  <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-12 rounded-xl border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]/30 transition-all duration-200",
                          !startDate && "text-[var(--muted-foreground)]"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {startDate ? format(new Date(startDate), "MMM dd, yyyy") : "Select start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-xl border-[var(--border)] bg-[var(--background)]" align="start">
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
                        selected={startDate ? new Date(startDate) : undefined}
                        onSelect={handleStartDateSelect}
                        month={selectedMonth}
                        onMonthChange={setSelectedMonth}
                        disabled={(date) => date < new Date()}
                        className="p-2"
                      />
                    </PopoverContent>
                  </Popover>
                  {form.formState.errors.tripDetails?.startDate && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      {form.formState.errors.tripDetails.startDate.message}
                    </p>
                  )}
                </div>

                {/* End Date */}
                <div className="space-y-2">
                  <Label className="text-xs text-[var(--muted-foreground)]">End Date *</Label>
                  <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-12 rounded-xl border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]/30 transition-all duration-200",
                          !endDate && "text-[var(--muted-foreground)]"
                        )}
                        disabled={!startDate}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {endDate ? format(new Date(endDate), "MMM dd, yyyy") : "Select end date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-xl border-[var(--border)] bg-[var(--background)]" align="start">
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
                        selected={endDate ? new Date(endDate) : undefined}
                        onSelect={handleEndDateSelect}
                        month={selectedEndMonth}
                        onMonthChange={setSelectedEndMonth}
                        disabled={(date) => !startDate || date <= new Date(startDate)}
                        className="p-2"
                      />
                    </PopoverContent>
                  </Popover>
                  {form.formState.errors.tripDetails?.endDate && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      {form.formState.errors.tripDetails.endDate.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Trip Duration Display */}
            {startDate && endDate && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-[var(--primary)]/10 to-[var(--primary)]/5 rounded-2xl border border-[var(--primary)]/20"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/20 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-[var(--primary)]" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-[var(--primary)]">
                    {form.watch('tripDetails.duration') || 0} day{(form.watch('tripDetails.duration') || 0) !== 1 ? 's' : ''} trip
                  </div>
                  <div className="text-xs text-[var(--muted-foreground)]">
                    {new Date(startDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })} - {new Date(endDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-[var(--primary)]/60" />
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Traveler Count */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="bg-gradient-to-br from-[var(--card)] via-[var(--card)]/95 to-[var(--background)]/30 border border-[var(--border)] rounded-3xl shadow-lg overflow-hidden backdrop-blur-sm">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-4 text-[var(--card-foreground)]">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--primary-600)]/20 to-[var(--primary-600)]/10 flex items-center justify-center border border-[var(--primary-600)]/30 shadow-sm">
                <Users className="h-6 w-6 text-[var(--primary-600)]" />
              </div>
              <div>
                <div className="text-xl font-bold">Traveler Count</div>
                <div className="text-sm font-normal text-[var(--muted-foreground)] mt-1">
                  How many people are traveling with you?
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Quick Presets */}
            <div className="space-y-4">
              <Label className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[var(--primary)]" />
                Quick Presets
              </Label>
              <div className="flex flex-wrap gap-2">
                {travelerPresets.map((preset) => {
                  const Icon = preset.icon;
                  return (
                    <Button
                      key={preset.label}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        form.setValue('tripDetails.totalTravelers.adults', preset.adults);
                        form.setValue('tripDetails.totalTravelers.children', preset.children);
                      }}
                      className={cn("text-xs h-8 px-3 rounded-lg", preset.color)}
                    >
                      <Icon className="h-3 w-3 mr-1" />
                      {preset.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Traveler Count Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label htmlFor="adults" className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
                  <Users className="h-4 w-4 text-[var(--primary)]" />
                  Adults *
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const current = form.watch('tripDetails.totalTravelers.adults') || 0;
                      if (current > 1) {
                        form.setValue('tripDetails.totalTravelers.adults', current - 1);
                      }
                    }}
                    disabled={disabled || (form.watch('tripDetails.totalTravelers.adults') || 0) <= 1}
                    className="h-12 w-12 rounded-xl border-[var(--border)] bg-[var(--background)] hover:bg-[var(--accent)] hover:border-[var(--primary)]/30 transition-all duration-200"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Controller
                    name="tripDetails.totalTravelers.adults"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="adults"
                        type="number"
                        min="1"
                        placeholder="1"
                        disabled={disabled}
                        value={field.value || ''}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          field.onChange(value);
                        }}
                        className="h-12 rounded-xl border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20 transition-all duration-200 text-center text-lg font-semibold"
                      />
                    )}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const current = form.watch('tripDetails.totalTravelers.adults') || 0;
                      form.setValue('tripDetails.totalTravelers.adults', current + 1);
                    }}
                    disabled={disabled}
                    className="h-12 w-12 rounded-xl border-[var(--border)] bg-[var(--background)] hover:bg-[var(--accent)] hover:border-[var(--primary)]/30 transition-all duration-200"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {form.formState.errors.tripDetails?.totalTravelers?.adults && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {form.formState.errors.tripDetails.totalTravelers.adults.message}
                  </p>
                )}
                <p className="text-xs text-[var(--muted-foreground)]">
                  Adults are travelers 18 years and older
                </p>
              </div>

              <div className="space-y-4">
                <Label htmlFor="children" className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
                  <Users className="h-4 w-4 text-[var(--secondary)]" />
                  Children
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const current = form.watch('tripDetails.totalTravelers.children') || 0;
                      if (current > 0) {
                        form.setValue('tripDetails.totalTravelers.children', current - 1);
                      }
                    }}
                    disabled={disabled || (form.watch('tripDetails.totalTravelers.children') || 0) <= 0}
                    className="h-12 w-12 rounded-xl border-[var(--border)] bg-[var(--background)] hover:bg-[var(--accent)] hover:border-[var(--secondary)]/30 transition-all duration-200"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Controller
                    name="tripDetails.totalTravelers.children"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="children"
                        type="number"
                        min="0"
                        placeholder="0"
                        disabled={disabled}
                        value={field.value || ''}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          field.onChange(value);
                        }}
                        className="h-12 rounded-xl border-[var(--border)] bg-[var(--background)] focus:border-[var(--secondary)] focus:ring-[var(--secondary)]/20 transition-all duration-200 text-center text-lg font-semibold"
                      />
                    )}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const current = form.watch('tripDetails.totalTravelers.children') || 0;
                      form.setValue('tripDetails.totalTravelers.children', current + 1);
                    }}
                    disabled={disabled}
                    className="h-12 w-12 rounded-xl border-[var(--border)] bg-[var(--background)] hover:bg-[var(--accent)] hover:border-[var(--secondary)]/30 transition-all duration-200"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {form.formState.errors.tripDetails?.totalTravelers?.children && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {form.formState.errors.tripDetails.totalTravelers.children.message}
                  </p>
                )}
                <p className="text-xs text-[var(--muted-foreground)]">
                  Children are travelers under 18 years old
                </p>
              </div>
            </div>

            {/* Total Travelers Summary */}
            {((form.watch('tripDetails.totalTravelers.adults') || 0) + (form.watch('tripDetails.totalTravelers.children') || 0)) > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-[var(--accent)]/20 to-[var(--accent)]/10 rounded-2xl border border-[var(--accent)]/20"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/20 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-[var(--accent-foreground)]" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-[var(--accent-foreground)]">
                    Total Travelers: {(form.watch('tripDetails.totalTravelers.adults') || 0) + (form.watch('tripDetails.totalTravelers.children') || 0)}
                  </div>
                  <div className="text-xs text-[var(--muted-foreground)]">
                    {form.watch('tripDetails.totalTravelers.adults') || 0} adults, {form.watch('tripDetails.totalTravelers.children') || 0} children
                  </div>
                </div>
                <Badge variant="outline" className="bg-[var(--accent)]/20 text-[var(--accent-foreground)] border-[var(--accent)]/30">
                  {(form.watch('tripDetails.totalTravelers.adults') || 0) + (form.watch('tripDetails.totalTravelers.children') || 0)} total
                </Badge>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Advanced Grouping */}
      {(form.watch('tripDetails.totalTravelers.adults') || 0) + (form.watch('tripDetails.totalTravelers.children') || 0) > 1 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="bg-gradient-to-br from-[var(--card)] via-[var(--card)]/95 to-[var(--background)]/30 border border-[var(--border)] rounded-3xl shadow-lg overflow-hidden backdrop-blur-sm">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-4 text-[var(--card-foreground)]">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--secondary-600)]/20 to-[var(--secondary-600)]/10 flex items-center justify-center border border-[var(--secondary-600)]/30 shadow-sm">
                  <Group className="h-6 w-6 text-[var(--secondary-600)]" />
                </div>
                <div>
                  <div className="text-xl font-bold">Travel Groups</div>
                  <div className="text-sm font-normal text-[var(--muted-foreground)] mt-1">
                    Organize travelers into groups for different preferences
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[var(--muted)]/20 to-[var(--muted)]/10 rounded-2xl border border-[var(--muted)]/20">
                <div className="flex items-center gap-3">
                  <Switch
                    id="useSubgroups"
                    checked={useSubgroups}
                    onCheckedChange={(checked) => form.setValue('tripDetails.useSubgroups', checked)}
                    disabled={disabled}
                  />
                  <div>
                    <Label htmlFor="useSubgroups" className="text-sm font-semibold text-[var(--foreground)]">
                      Use travel subgroups
                    </Label>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Create separate groups for different booking preferences
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20 px-3 py-1">
                  {(form.watch('tripDetails.totalTravelers.adults') || 0) + (form.watch('tripDetails.totalTravelers.children') || 0)} travelers
                </Badge>
              </div>

              {useSubgroups && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-[var(--foreground)] flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-[var(--primary)]" />
                      Travel Groups
                    </h4>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const totalAdults = form.watch('tripDetails.totalTravelers.adults') || 0;
                          const totalChildren = form.watch('tripDetails.totalTravelers.children') || 0;
                          
                          if (totalAdults + totalChildren > 1) {
                            const newGroups: TravelerGroup[] = [];
                            
                            // Create smart groups based on traveler composition
                            if (totalAdults > 0 && totalChildren > 0) {
                              // Mixed group - create separate groups
                              newGroups.push({
                                id: `group_${Date.now()}_adults`,
                                name: 'Adults Group',
                                adults: totalAdults,
                                children: 0,
                                childAges: [],
                                travelerNames: Array.from({ length: totalAdults }, (_, i) => ({
                                  name: `Adult ${i + 1}`,
                                  type: 'adult' as const,
                                })),
                                notes: 'Adult travelers group',
                              });
                              newGroups.push({
                                id: `group_${Date.now()}_children`,
                                name: 'Children Group',
                                adults: 0,
                                children: totalChildren,
                                childAges: Array.from({ length: totalChildren }, (_, i) => 10 + i),
                                travelerNames: Array.from({ length: totalChildren }, (_, i) => ({
                                  name: `Child ${i + 1}`,
                                  type: 'child' as const,
                                  age: 10 + i,
                                })),
                                notes: 'Children travelers group',
                              });
                            } else if (totalAdults > 1) {
                              // Multiple adults - create groups of 2
                              const groupCount = Math.ceil(totalAdults / 2);
                              for (let i = 0; i < groupCount; i++) {
                                const groupAdults = Math.min(2, totalAdults - (i * 2));
                                newGroups.push({
                                  id: `group_${Date.now()}_${i}`,
                                  name: `Group ${i + 1}`,
                                  adults: groupAdults,
                                  children: 0,
                                  childAges: [],
                                  travelerNames: Array.from({ length: groupAdults }, (_, j) => ({
                                    name: `Adult ${(i * 2) + j + 1}`,
                                    type: 'adult' as const,
                                  })),
                                  notes: `Travel group ${i + 1}`,
                                });
                              }
                            } else if (totalChildren > 1) {
                              // Multiple children - create groups by age
                              const childAges = Array.from({ length: totalChildren }, (_, i) => 10 + i);
                              const olderChildren = childAges.filter(age => age >= 12).length;
                              const youngerChildren = childAges.filter(age => age < 12).length;
                              
                              if (olderChildren > 0) {
                                newGroups.push({
                                  id: `group_${Date.now()}_older`,
                                  name: 'Older Children',
                                  adults: 0,
                                  children: olderChildren,
                                  childAges: childAges.filter(age => age >= 12),
                                  travelerNames: childAges
                                    .map((age, index) => ({ age, index }))
                                    .filter(({ age }) => age >= 12)
                                    .map(({ index }) => ({
                                      name: `Child ${index + 1}`,
                                      type: 'child' as const,
                                      age: childAges[index],
                                    })),
                                  notes: 'Children 12+ years old',
                                });
                              }
                              
                              if (youngerChildren > 0) {
                                newGroups.push({
                                  id: `group_${Date.now()}_younger`,
                                  name: 'Younger Children',
                                  adults: 0,
                                  children: youngerChildren,
                                  childAges: childAges.filter(age => age < 12),
                                  travelerNames: childAges
                                    .map((age, index) => ({ age, index }))
                                    .filter(({ age }) => age < 12)
                                    .map(({ index }) => ({
                                      name: `Child ${index + 1}`,
                                      type: 'child' as const,
                                      age: childAges[index],
                                    })),
                                  notes: 'Children under 12 years old',
                                });
                              }
                            }
                            
                            form.setValue('tripDetails.groups', newGroups);
                            toast.success(`Created ${newGroups.length} smart groups based on your travelers`);
                          }
                        }}
                        disabled={disabled}
                        className="h-9 px-3 rounded-xl border-[var(--border)] bg-[var(--background)] hover:bg-[var(--accent)] hover:border-[var(--primary)]/30 transition-all duration-200 text-xs"
                      >
                        <Sparkles className="h-3 w-3 mr-1" />
                        Smart Create
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Auto-create groups based on total travelers
                          const totalAdults = form.watch('tripDetails.totalTravelers.adults') || 0;
                          const totalChildren = form.watch('tripDetails.totalTravelers.children') || 0;
                          
                          if (totalAdults + totalChildren > 1) {
                            // Create default groups
                            const newGroups: TravelerGroup[] = [];
                            
                            if (totalAdults > 0) {
                              newGroups.push({
                                id: `group_${Date.now()}_adults`,
                                name: 'Adults Group',
                                adults: totalAdults,
                                children: 0,
                                childAges: [],
                                travelerNames: Array.from({ length: totalAdults }, (_, i) => ({
                                  name: `Adult ${i + 1}`,
                                  type: 'adult' as const,
                                })),
                                notes: 'Adult travelers group',
                              });
                            }
                            
                            if (totalChildren > 0) {
                              newGroups.push({
                                id: `group_${Date.now()}_children`,
                                name: 'Children Group',
                                adults: 0,
                                children: totalChildren,
                                childAges: Array.from({ length: totalChildren }, (_, i) => 10 + i),
                                travelerNames: Array.from({ length: totalChildren }, (_, i) => ({
                                  name: `Child ${i + 1}`,
                                  type: 'child' as const,
                                  age: 10 + i,
                                })),
                                notes: 'Children travelers group',
                              });
                            }
                            
                            form.setValue('tripDetails.groups', newGroups);
                            toast.success('Default groups created based on traveler count');
                          }
                        }}
                        disabled={disabled}
                        className="h-9 px-3 rounded-xl border-[var(--border)] bg-[var(--background)] hover:bg-[var(--accent)] hover:border-[var(--primary)]/30 transition-all duration-200 text-xs"
                      >
                        <Sparkles className="h-3 w-3 mr-1" />
                        Auto Create
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddGroup}
                        disabled={disabled}
                        className="h-9 px-4 rounded-xl border-[var(--border)] bg-[var(--background)] hover:bg-[var(--accent)] hover:border-[var(--primary)]/30 transition-all duration-200"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Group
                      </Button>
                    </div>
                  </div>

                  {/* Groups Summary */}
                  {groups.length > 0 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gradient-to-r from-[var(--muted)]/20 to-[var(--muted)]/10 rounded-2xl border border-[var(--muted)]/20">
                        <div className="text-center">
                          <div className="text-lg font-bold text-[var(--foreground)]">{groups.length}</div>
                          <div className="text-xs text-[var(--muted-foreground)]">Groups</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-[var(--foreground)]">
                            {groups.reduce((sum, group) => sum + (group.adults || 0), 0)}
                          </div>
                          <div className="text-xs text-[var(--muted-foreground)]">Total Adults</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-[var(--foreground)]">
                            {groups.reduce((sum, group) => sum + (group.children || 0), 0)}
                          </div>
                          <div className="text-xs text-[var(--muted-foreground)]">Total Children</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-[var(--foreground)]">
                            {groups.reduce((sum, group) => sum + (group.adults || 0) + (group.children || 0), 0)}
                          </div>
                          <div className="text-xs text-[var(--muted-foreground)]">Total Travelers</div>
                        </div>
                      </div>

                      {/* Validation Warning */}
                      {(() => {
                        const groupAdults = groups.reduce((sum, group) => sum + (group.adults || 0), 0);
                        const groupChildren = groups.reduce((sum, group) => sum + (group.children || 0), 0);
                        
                        if (groupAdults !== totalAdults || groupChildren !== totalChildren) {
                          return (
                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                              <div className="flex items-center gap-3">
                                <AlertCircle className="h-5 w-5 text-amber-600" />
                                <div className="flex-1">
                                  <div className="text-sm font-semibold text-amber-800">
                                    Group totals don't match traveler count
                                  </div>
                                  <div className="text-xs text-amber-700 mt-1">
                                    Groups: {groupAdults} adults, {groupChildren} children | 
                                    Total: {totalAdults} adults, {totalChildren} children
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    // Auto-adjust groups to match totals
                                    const newGroups = [...groups];
                                    let remainingAdults = totalAdults;
                                    let remainingChildren = totalChildren;
                                    
                                    // Distribute remaining travelers to existing groups
                                    for (let i = 0; i < newGroups.length && (remainingAdults > 0 || remainingChildren > 0); i++) {
                                      const group = newGroups[i];
                                      const currentAdults = group.adults || 0;
                                      const currentChildren = group.children || 0;
                                      
                                      // Add remaining adults to this group
                                      if (remainingAdults > 0) {
                                        const adultsToAdd = Math.min(remainingAdults, 2); // Max 2 per group
                                        group.adults = currentAdults + adultsToAdd;
                                        remainingAdults -= adultsToAdd;
                                      }
                                      
                                      // Add remaining children to this group
                                      if (remainingChildren > 0) {
                                        const childrenToAdd = Math.min(remainingChildren, 2); // Max 2 per group
                                        group.children = currentChildren + childrenToAdd;
                                        remainingChildren -= childrenToAdd;
                                        
                                        // Add ages for new children
                                        for (let j = 0; j < childrenToAdd; j++) {
                                          group.childAges.push(10 + j);
                                        }
                                      }
                                    }
                                    
                                    // Create new groups if needed
                                    if (remainingAdults > 0 || remainingChildren > 0) {
                                      if (remainingAdults > 0) {
                                        newGroups.push({
                                          id: `group_${Date.now()}_remaining_adults`,
                                          name: 'Additional Adults',
                                          adults: remainingAdults,
                                          children: 0,
                                          childAges: [],
                                          travelerNames: Array.from({ length: remainingAdults }, (_, i) => ({
                                            name: `Adult ${totalAdults - remainingAdults + i + 1}`,
                                            type: 'adult' as const,
                                          })),
                                          notes: 'Additional adult travelers',
                                        });
                                      }
                                      
                                      if (remainingChildren > 0) {
                                        newGroups.push({
                                          id: `group_${Date.now()}_remaining_children`,
                                          name: 'Additional Children',
                                          adults: 0,
                                          children: remainingChildren,
                                          childAges: Array.from({ length: remainingChildren }, (_, i) => 10 + i),
                                          travelerNames: Array.from({ length: remainingChildren }, (_, i) => ({
                                            name: `Child ${totalChildren - remainingChildren + i + 1}`,
                                            type: 'child' as const,
                                            age: 10 + i,
                                          })),
                                          notes: 'Additional child travelers',
                                        });
                                      }
                                    }
                                    
                                    form.setValue('tripDetails.groups', newGroups);
                                    toast.success('Groups adjusted to match traveler count');
                                  }}
                                  className="h-8 text-xs bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200"
                                >
                                  Auto Fix
                                </Button>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  )}

                  <AnimatePresence>
                    {groups.map((group, index) => (
                      <motion.div
                        key={group.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="border border-[var(--border)] rounded-2xl p-6 space-y-4 bg-gradient-to-br from-[var(--background)]/50 to-[var(--background)]/20 backdrop-blur-sm hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center border border-[var(--primary)]/20">
                              <Users className="h-5 w-5 text-[var(--primary)]" />
                            </div>
                            <div>
                              <span className="font-semibold text-[var(--foreground)]">{group.name}</span>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-xs bg-[var(--accent)]/20 text-[var(--accent-foreground)]">
                                  {group.adults + group.children} travelers
                                </Badge>
                                {group.adults > 0 && (
                                  <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                                    {group.adults} adults
                                  </Badge>
                                )}
                                {group.children > 0 && (
                                  <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-200">
                                    {group.children} children
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDuplicateGroup(group.id)}
                              disabled={disabled}
                              className="h-8 w-8 p-0 rounded-lg hover:bg-[var(--accent)] transition-colors"
                              title="Duplicate group"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditGroup(group.id)}
                              disabled={disabled}
                              className="h-8 w-8 p-0 rounded-lg hover:bg-[var(--accent)] transition-colors"
                              title="Edit group"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveGroup(group.id)}
                              disabled={disabled}
                              className="h-8 w-8 p-0 rounded-lg hover:bg-red-100 hover:text-red-700 transition-colors"
                              title="Remove group"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-2 p-3 bg-[var(--accent)]/10 rounded-xl">
                            <Users className="h-4 w-4 text-[var(--accent-foreground)]" />
                            <div>
                              <span className="text-[var(--muted-foreground)]">Adults:</span>
                              <span className="ml-2 font-semibold text-[var(--foreground)]">{group.adults}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-3 bg-[var(--accent)]/10 rounded-xl">
                            <Users className="h-4 w-4 text-[var(--accent-foreground)]" />
                            <div>
                              <span className="text-[var(--muted-foreground)]">Children:</span>
                              <span className="ml-2 font-semibold text-[var(--foreground)]">{group.children}</span>
                            </div>
                          </div>
                        </div>

                        {/* Child Ages Display */}
                        {group.children > 0 && group.childAges && group.childAges.length > 0 && (
                          <div className="p-3 bg-[var(--secondary)]/10 rounded-xl">
                            <div className="text-sm text-[var(--muted-foreground)] mb-2 flex items-center gap-2">
                              <Users className="h-3 w-3" />
                              Child Ages:
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {group.childAges.map((age, ageIndex) => (
                                <Badge key={ageIndex} variant="outline" className="text-xs">
                                  {age} years old
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Traveler Names Display */}
                        {group.travelerNames && group.travelerNames.length > 0 && (
                          <div className="p-3 bg-[var(--muted)]/10 rounded-xl">
                            <div className="text-sm text-[var(--muted-foreground)] mb-2 flex items-center gap-2">
                              <User className="h-3 w-3" />
                              Travelers:
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {group.travelerNames.map((traveler, travelerIndex) => (
                                <Badge 
                                  key={travelerIndex} 
                                  variant="outline" 
                                  className={cn(
                                    "text-xs",
                                    traveler.type === 'adult' 
                                      ? "bg-blue-100 text-blue-700 border-blue-200" 
                                      : "bg-green-100 text-green-700 border-green-200"
                                  )}
                                >
                                  {traveler.name} ({traveler.type})
                                  {traveler.type === 'child' && traveler.age && `, ${traveler.age}y`}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Group Notes */}
                        {group.notes && (
                          <div className="p-3 bg-[var(--muted)]/10 rounded-xl">
                            <div className="text-sm text-[var(--muted-foreground)]">
                              <span className="font-medium text-[var(--foreground)]">Notes:</span> {group.notes}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Empty State */}
                  {groups.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12 border-2 border-dashed border-[var(--border)] rounded-2xl bg-[var(--muted)]/10"
                    >
                      <Users className="h-12 w-12 text-[var(--muted-foreground)] mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">No groups created yet</h3>
                      <p className="text-sm text-[var(--muted-foreground)] mb-4">
                        Create travel groups to organize travelers with different preferences
                      </p>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const totalAdults = form.watch('tripDetails.totalTravelers.adults') || 0;
                            const totalChildren = form.watch('tripDetails.totalTravelers.children') || 0;
                            
                            if (totalAdults + totalChildren > 1) {
                              const newGroups: TravelerGroup[] = [];
                              
                              if (totalAdults > 0) {
                                newGroups.push({
                                  id: `group_${Date.now()}_adults`,
                                  name: 'Adults Group',
                                  adults: totalAdults,
                                  children: 0,
                                  childAges: [],
                                  travelerNames: Array.from({ length: totalAdults }, (_, i) => ({
                                    name: `Adult ${i + 1}`,
                                    type: 'adult' as const,
                                  })),
                                  notes: 'Adult travelers group',
                                });
                              }
                              
                              if (totalChildren > 0) {
                                newGroups.push({
                                  id: `group_${Date.now()}_children`,
                                  name: 'Children Group',
                                  adults: 0,
                                  children: totalChildren,
                                  childAges: Array.from({ length: totalChildren }, (_, i) => 10 + i),
                                  travelerNames: Array.from({ length: totalChildren }, (_, i) => ({
                                    name: `Child ${i + 1}`,
                                    type: 'child' as const,
                                    age: 10 + i,
                                  })),
                                  notes: 'Children travelers group',
                                });
                              }
                              
                              form.setValue('tripDetails.groups', newGroups);
                              toast.success('Default groups created based on traveler count');
                            }
                          }}
                          disabled={disabled}
                          className="rounded-xl"
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          Auto Create Groups
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAddGroup}
                          disabled={disabled}
                          className="rounded-xl"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Create Manual Group
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Status Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="flex justify-between items-center pt-8"
      >
        <div className="text-sm text-[var(--muted-foreground)] flex items-center gap-2">
          {isComplete ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-500" />
              Trip details complete - ready for next step
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 text-orange-500" />
              Please fill in all required trip details
            </>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {isComplete && (
            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200 px-3 py-1">
              <CheckCircle className="h-3 w-3 mr-1" />
              Complete
            </Badge>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Group Form Modal Component
interface GroupFormModalProps {
  group?: TravelerGroup;
  onSave: (groupId: string, updates: Partial<TravelerGroup>) => void;
  onCancel: () => void;
  disabled?: boolean;
}

function GroupFormModal({ group, onSave, onCancel, disabled }: GroupFormModalProps) {
  const [formData, setFormData] = useState<TravelerGroup>(
    group || {
      id: `group_${Date.now()}`,
      name: '',
      adults: 1,
      children: 0,
      childAges: [],
      travelerNames: [{ name: 'Adult 1', type: 'adult' as const }],
      notes: '',
    }
  );

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Smart traveler name generation
  const generateTravelerNames = (adults: number, children: number, childAges: number[]) => {
    const names: Array<{ name: string; type: 'adult' | 'child'; age?: number }> = [];
    
    // Generate adult names
    for (let i = 0; i < adults; i++) {
      names.push({
        name: `Adult ${i + 1}`,
        type: 'adult' as const,
      });
    }
    
    // Generate child names with ages
    for (let i = 0; i < children; i++) {
      names.push({
        name: `Child ${i + 1}`,
        type: 'child' as const,
        age: childAges[i] || 10 + i,
      });
    }
    
    return names;
  };

  const handleSave = () => {
    // Validation
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Group name is required';
    }
    
    if (formData.adults + formData.children === 0) {
      newErrors.travelers = 'At least one traveler is required';
    }
    
    if (formData.children > 0 && formData.childAges.length !== formData.children) {
      newErrors.childAges = 'All children must have ages specified';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Generate traveler names if not already set
    const updatedFormData = {
      ...formData,
      travelerNames: formData.travelerNames.length === 0 
        ? generateTravelerNames(formData.adults, formData.children, formData.childAges)
        : formData.travelerNames
    };
    
    onSave(formData.id, updatedFormData);
  };

  const handleAdultChange = (newAdultCount: number) => {
    if (newAdultCount < 0) return;
    
    const newChildAges = [...formData.childAges];
    const newTravelerNames = [...formData.travelerNames];
    
    // Update adult names
    const currentAdults = newTravelerNames.filter(t => t.type === 'adult').length;
    if (newAdultCount > currentAdults) {
      // Add new adults
      for (let i = currentAdults; i < newAdultCount; i++) {
        newTravelerNames.push({
          name: `Adult ${i + 1}`,
          type: 'adult' as const,
        });
      }
    } else if (newAdultCount < currentAdults) {
      // Remove excess adults
      const adultsToKeep = newTravelerNames.filter(t => t.type === 'adult').slice(0, newAdultCount);
      const childrenToKeep = newTravelerNames.filter(t => t.type === 'child');
      newTravelerNames.splice(0, newTravelerNames.length, ...adultsToKeep, ...childrenToKeep);
    }
    
    setFormData({
      ...formData,
      adults: newAdultCount,
      travelerNames: newTravelerNames,
    });
    
    // Clear validation errors
    if (errors.travelers) {
      setErrors({ ...errors, travelers: undefined });
    }
  };

  const handleChildChange = (newChildCount: number) => {
    if (newChildCount < 0) return;
    
    const newChildAges = [...formData.childAges];
    const newTravelerNames = [...formData.travelerNames];
    
    // Update child ages array
    if (newChildCount > newChildAges.length) {
      // Add new child ages
      for (let i = newChildAges.length; i < newChildCount; i++) {
        newChildAges.push(10 + i);
      }
    } else if (newChildCount < newChildAges.length) {
      // Remove excess child ages
      newChildAges.splice(newChildCount);
    }
    
    // Update child names
    const currentChildren = newTravelerNames.filter(t => t.type === 'child').length;
    if (newChildCount > currentChildren) {
      // Add new children
      for (let i = currentChildren; i < newChildCount; i++) {
        newTravelerNames.push({
          name: `Child ${i + 1}`,
          type: 'child' as const,
          age: newChildAges[i],
        });
      }
    } else if (newChildCount < currentChildren) {
      // Remove excess children
      const adultsToKeep = newTravelerNames.filter(t => t.type === 'adult');
      const childrenToKeep = newTravelerNames.filter(t => t.type === 'child').slice(0, newChildCount);
      newTravelerNames.splice(0, newTravelerNames.length, ...adultsToKeep, ...childrenToKeep);
    }
    
    setFormData({
      ...formData,
      children: newChildCount,
      childAges: newChildAges,
      travelerNames: newTravelerNames,
    });
    
    // Clear validation errors
    if (errors.travelers || errors.childAges) {
      setErrors({ ...errors, travelers: undefined, childAges: undefined });
    }
  };

  const updateTravelerName = (index: number, name: string) => {
    const newTravelerNames = [...formData.travelerNames];
    newTravelerNames[index] = { ...newTravelerNames[index], name };
    setFormData({ ...formData, travelerNames: newTravelerNames });
  };

  const updateChildAge = (index: number, age: number) => {
    if (age < 0 || age > 17) return;
    
    const newChildAges = [...formData.childAges];
    newChildAges[index] = age;
    
    // Update corresponding traveler name age
    const newTravelerNames = [...formData.travelerNames];
    const childTravelers = newTravelerNames.filter(t => t.type === 'child');
    if (childTravelers[index]) {
      childTravelers[index].age = age;
    }
    
    setFormData({
      ...formData,
      childAges: newChildAges,
      travelerNames: newTravelerNames,
    });
    
    // Clear validation errors
    if (errors.childAges) {
      setErrors({ ...errors, childAges: undefined });
    }
  };

  const totalTravelers = formData.adults + formData.children;
  const isGroupValid = formData.name.trim() && totalTravelers > 0 && 
    (formData.children === 0 || formData.childAges.length === formData.children);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[var(--background)] rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto border border-[var(--border)] shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-[var(--foreground)]">
            {group ? 'Edit Group' : 'New Travel Group'}
          </h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-8 w-8 p-0"
          >
            ×
          </Button>
        </div>
        
        <div className="space-y-6">
          {/* Group Name */}
          <div className="space-y-2">
            <Label htmlFor="groupName" className="text-sm font-semibold text-[var(--foreground)]">
              Group Name *
            </Label>
            <Input
              id="groupName"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) {
                  setErrors({ ...errors, name: undefined });
                }
              }}
              placeholder="e.g., London Departure Group, Family Group, Business Travelers"
              disabled={disabled}
              className={cn(
                "h-12 rounded-xl border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20",
                errors.name && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
              )}
            />
            {errors.name && (
              <p className="text-red-500 text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Group Summary */}
          {totalTravelers > 0 && (
            <div className="p-4 bg-gradient-to-r from-[var(--accent)]/20 to-[var(--accent)]/10 rounded-2xl border border-[var(--accent)]/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/20 flex items-center justify-center">
                  <Users className="h-5 w-5 text-[var(--accent-foreground)]" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-[var(--accent-foreground)]">
                    Group Summary: {totalTravelers} total travelers
                  </div>
                  <div className="text-xs text-[var(--muted-foreground)]">
                    {formData.adults} adults, {formData.children} children
                  </div>
                </div>
                <Badge variant="outline" className="bg-[var(--accent)]/20 text-[var(--accent-foreground)] border-[var(--accent)]/30">
                  {totalTravelers} total
                </Badge>
              </div>
            </div>
          )}

          {/* Traveler Counts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Label className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
                <Users className="h-4 w-4 text-[var(--primary)]" />
                Adults
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAdultChange(Math.max(0, formData.adults - 1))}
                  disabled={disabled || formData.adults <= 0}
                  className="h-12 w-12 rounded-xl border-[var(--border)] bg-[var(--background)] hover:bg-[var(--accent)] hover:border-[var(--primary)]/30 transition-all duration-200"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  disabled={disabled}
                  value={formData.adults}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    handleAdultChange(value);
                  }}
                  className="h-12 rounded-xl border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20 transition-all duration-200 text-center text-lg font-semibold"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAdultChange(formData.adults + 1)}
                  disabled={disabled}
                  className="h-12 w-12 rounded-xl border-[var(--border)] bg-[var(--background)] hover:bg-[var(--accent)] hover:border-[var(--primary)]/30 transition-all duration-200"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-[var(--muted-foreground)]">
                Adults are travelers 18 years and older
              </p>
            </div>

            <div className="space-y-4">
              <Label className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
                <Users className="h-4 w-4 text-[var(--secondary)]" />
                Children
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleChildChange(Math.max(0, formData.children - 1))}
                  disabled={disabled || formData.children <= 0}
                  className="h-12 w-12 rounded-xl border-[var(--border)] bg-[var(--background)] hover:bg-[var(--accent)] hover:border-[var(--secondary)]/30 transition-all duration-200"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  disabled={disabled}
                  value={formData.children}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    handleChildChange(value);
                  }}
                  className="h-12 rounded-xl border-[var(--border)] bg-[var(--background)] focus:border-[var(--secondary)] focus:ring-[var(--secondary)]/20 transition-all duration-200 text-center text-lg font-semibold"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleChildChange(formData.children + 1)}
                  disabled={disabled}
                  className="h-12 w-12 rounded-xl border-[var(--border)] bg-[var(--background)] hover:bg-[var(--accent)] hover:border-[var(--secondary)]/30 transition-all duration-200"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-[var(--muted-foreground)]">
                Children are travelers under 18 years old
              </p>
            </div>
          </div>

          {/* Validation Error for Travelers */}
          {errors.travelers && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {errors.travelers}
              </p>
            </div>
          )}

          {/* Child Ages */}
          {formData.children > 0 && (
            <div className="space-y-4">
              <Label className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
                <Users className="h-4 w-4 text-[var(--secondary)]" />
                Child Ages
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Array.from({ length: formData.children }, (_, index) => (
                  <div key={index} className="space-y-2">
                    <Label className="text-xs text-[var(--muted-foreground)]">
                      Child {index + 1} Age
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      max="17"
                      placeholder="10"
                      disabled={disabled}
                      value={formData.childAges[index] || ''}
                      onChange={(e) => {
                        const age = parseInt(e.target.value) || 0;
                        updateChildAge(index, age);
                      }}
                      className="h-10 rounded-lg border-[var(--border)] bg-[var(--background)] focus:border-[var(--secondary)] focus:ring-[var(--secondary)]/20"
                    />
                  </div>
                ))}
              </div>
              {errors.childAges && (
                <p className="text-red-500 text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {errors.childAges}
                </p>
              )}
            </div>
          )}

          {/* Traveler Names */}
          {formData.travelerNames.length > 0 && (
            <div className="space-y-4">
              <Label className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
                <User className="h-4 w-4 text-[var(--primary)]" />
                Traveler Names
              </Label>
              <div className="space-y-3">
                {formData.travelerNames.map((traveler, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-[var(--muted)]/10 rounded-xl">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold",
                      traveler.type === 'adult' 
                        ? "bg-blue-100 text-blue-700" 
                        : "bg-green-100 text-green-700"
                    )}>
                      {traveler.type === 'adult' ? 'A' : 'C'}
                    </div>
                    <div className="flex-1">
                      <Input
                        value={traveler.name}
                        onChange={(e) => updateTravelerName(index, e.target.value)}
                        placeholder={`${traveler.type === 'adult' ? 'Adult' : 'Child'} ${index + 1} name`}
                        disabled={disabled}
                        className="h-9 rounded-lg border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20"
                      />
                    </div>
                    {traveler.type === 'child' && traveler.age && (
                      <Badge variant="outline" className="text-xs">
                        {traveler.age}y
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Group Notes */}
          <div className="space-y-2">
            <Label htmlFor="groupNotes" className="text-sm font-semibold text-[var(--foreground)]">
              Group Notes (Optional)
            </Label>
            <Textarea
              id="groupNotes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any special requirements or preferences for this group..."
              disabled={disabled}
              className="min-h-[80px] rounded-xl border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-[var(--border)]">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={disabled}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={disabled || !isGroupValid}
            className="rounded-xl"
          >
            {group ? 'Update Group' : 'Create Group'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
} 