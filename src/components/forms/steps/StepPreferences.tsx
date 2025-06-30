import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Heart, 
  DollarSign, 
  Globe, 
  FileText,
  Zap,
  Clock,
  Star,
  Shield,
  TrendingDown
} from 'lucide-react';

import { NewIntake, Tone, Currency, TravelPriority } from '@/types/newIntake';

interface StepPreferencesProps {
  disabled?: boolean;
}

const TONE_OPTIONS: { value: Tone; label: string; icon: any; description: string }[] = [
  { value: 'luxury', label: 'Luxury', icon: Star, description: 'Premium experiences and high-end accommodations' },
  { value: 'romantic', label: 'Romantic', icon: Heart, description: 'Intimate settings and couple-focused activities' },
  { value: 'relaxed', label: 'Relaxed', icon: Clock, description: 'Leisurely pace with plenty of downtime' },
  { value: 'vip', label: 'VIP', icon: Shield, description: 'Exclusive access and personalized service' },
  { value: 'family', label: 'Family', icon: Heart, description: 'Kid-friendly activities and family accommodations' },
];

const CURRENCY_OPTIONS: { value: Currency; label: string; symbol: string }[] = [
  { value: 'GBP', label: 'British Pound', symbol: '£' },
  { value: 'USD', label: 'US Dollar', symbol: '$' },
  { value: 'EUR', label: 'Euro', symbol: '€' },
];

const TRAVEL_PRIORITIES: { value: TravelPriority; label: string; icon: any; description: string }[] = [
  { value: 'comfort', label: 'Comfort', icon: Star, description: 'Premium seating, spacious accommodations' },
  { value: 'speed', label: 'Speed', icon: Zap, description: 'Direct flights, express services' },
  { value: 'experience', label: 'Experience', icon: Heart, description: 'Unique activities, local immersion' },
  { value: 'privacy', label: 'Privacy', icon: Shield, description: 'Private transfers, exclusive access' },
  { value: 'cost', label: 'Cost', icon: TrendingDown, description: 'Budget-friendly options, value for money' },
];

export function StepPreferences({ disabled }: StepPreferencesProps) {
  const form = useFormContext<NewIntake>();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mx-auto space-y-8"
    >
      {/* Trip Style */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gradient-to-b from-[var(--card)]/95 to-[var(--background)]/20 border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-[var(--card-foreground)]">
              <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center border border-[var(--primary)]/20">
                <Heart className="h-5 w-5 text-[var(--primary)]" />
              </div>
              <div>
                <div className="text-lg font-semibold">Trip Style & Tone</div>
                <div className="text-sm font-normal text-[var(--muted-foreground)]">
                  Define the overall style and atmosphere of the trip
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="tone" className="text-sm font-medium text-[var(--foreground)]">Preferred Tone</Label>
              <Controller
                name="preferences.tone"
                control={form.control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger disabled={disabled} className="h-11 rounded-xl border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20">
                      <SelectValue placeholder="Select trip tone" />
                    </SelectTrigger>
                    <SelectContent>
                      {TONE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <option.icon className="w-4 h-4" />
                            <div>
                              <div className="font-medium">{option.label}</div>
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

            <div>
              <Label htmlFor="language" className="text-sm font-medium text-[var(--foreground)]">Language Preference</Label>
              <Controller
                name="preferences.language"
                control={form.control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger disabled={disabled} className="h-11 rounded-xl border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="it">Italian</SelectItem>
                      <SelectItem value="pt">Portuguese</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Budget */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gradient-to-b from-[var(--card)]/95 to-[var(--background)]/20 border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-[var(--card-foreground)]">
              <div className="w-10 h-10 rounded-xl bg-[var(--secondary)]/10 flex items-center justify-center border border-[var(--secondary)]/20">
                <DollarSign className="h-5 w-5 text-[var(--secondary)]" />
              </div>
              <div>
                <div className="text-lg font-semibold">Budget & Pricing</div>
                <div className="text-sm font-normal text-[var(--muted-foreground)]">
                  Set budget expectations and currency preferences
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budgetAmount" className="text-sm font-medium text-[var(--foreground)]">Budget Amount</Label>
                <Controller
                  name="preferences.budget.amount"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="budgetAmount"
                      type="number"
                      min="0"
                      step="100"
                      placeholder="5000 (optional)"
                      disabled={disabled}
                      className="h-11 rounded-xl border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20"
                    />
                  )}
                />
                {form.formState.errors.preferences?.budget?.amount && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.preferences.budget.amount.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency" className="text-sm font-medium text-[var(--foreground)]">Currency</Label>
                <Controller
                  name="preferences.currency"
                  control={form.control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger disabled={disabled} className="h-11 rounded-xl border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.symbol} {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budgetType" className="text-sm font-medium text-[var(--foreground)]">Budget Type</Label>
              <Controller
                name="preferences.budget.type"
                control={form.control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger disabled={disabled} className="h-11 rounded-xl border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20">
                      <SelectValue placeholder="Select budget type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="total">Total Budget</SelectItem>
                      <SelectItem value="per-person">Per Person</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Travel Priorities */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="bg-gradient-to-b from-[var(--card)]/95 to-[var(--background)]/20 border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-[var(--card-foreground)]">
              <div className="w-10 h-10 rounded-xl bg-[var(--primary-600)]/10 flex items-center justify-center border border-[var(--primary-600)]/20">
                <Zap className="h-5 w-5 text-[var(--primary-600)]" />
              </div>
              <div>
                <div className="text-lg font-semibold">Travel Priorities</div>
                <div className="text-sm font-normal text-[var(--muted-foreground)]">
                  Select what matters most for this trip
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Controller
              name="preferences.travelPriorities"
              control={form.control}
              render={({ field }) => (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {TRAVEL_PRIORITIES.map((priority) => (
                    <label
                      key={priority.value}
                      className={`flex items-center space-x-3 p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                        field.value?.includes(priority.value)
                          ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                          : 'border-[var(--border)] hover:bg-[var(--accent)] hover:border-[var(--primary)]/30'
                      }`}
                    >
                      <Checkbox
                        checked={field.value?.includes(priority.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            field.onChange([...(field.value || []), priority.value]);
                          } else {
                            field.onChange((field.value || []).filter((p) => p !== priority.value));
                          }
                        }}
                        className="data-[state=checked]:bg-[var(--primary)] data-[state=checked]:border-[var(--primary)]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <priority.icon className="w-4 h-4 text-[var(--primary)]" />
                          <span className="font-medium text-[var(--foreground)]">{priority.label}</span>
                        </div>
                        <p className="text-sm text-[var(--muted-foreground)]">{priority.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            />
            {form.formState.errors.preferences?.travelPriorities && (
              <p className="text-red-500 text-sm mt-2">
                {form.formState.errors.preferences.travelPriorities.message}
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Special Requests */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="bg-gradient-to-b from-[var(--card)]/95 to-[var(--background)]/20 border border-[var(--border)] rounded-2xl shadow-sm overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-[var(--card-foreground)]">
              <div className="w-10 h-10 rounded-xl bg-[var(--secondary-600)]/10 flex items-center justify-center border border-[var(--secondary-600)]/20">
                <FileText className="h-5 w-5 text-[var(--secondary-600)]" />
              </div>
              <div>
                <div className="text-lg font-semibold">Special Requests</div>
                <div className="text-sm font-normal text-[var(--muted-foreground)]">
                  Any additional requirements or preferences
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="specialRequests" className="text-sm font-medium text-[var(--foreground)]">
                Additional Notes
              </Label>
              <Controller
                name="preferences.specialRequests"
                control={form.control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    id="specialRequests"
                    placeholder="Any special requests, dietary requirements, accessibility needs, or other preferences..."
                    disabled={disabled}
                    className="min-h-[100px] rounded-xl border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20 resize-none"
                  />
                )}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Status Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="flex justify-between items-center pt-6"
      >
        <div className="text-sm text-[var(--muted-foreground)]">
          Preferences configured - ready for next step
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20">
            <Star className="h-3 w-3 mr-1" />
            Configured
          </Badge>
        </div>
      </motion.div>
    </motion.div>
  );
} 