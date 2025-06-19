import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useIntakeStore } from "@/store/intake";
import { Step6Events } from './steps/Step6Events';

const interestsList = ["food", "romance", "adventure", "wellness", "culture"];
const toneList = ["luxury", "romantic", "playful", "family"];
const travelTypeList = ["solo", "couple", "group"];
const inventoryTypesList = [
  { label: 'Hotels', value: 'hotels' },
  { label: 'Flights', value: 'flights' },
  { label: 'Events', value: 'events' },
];

const intakeSchema = z.object({
  destination: z.string().min(2, "Destination is required"),
  startDate: z.string().min(1, "Start date required"),
  endDate: z.string().min(1, "End date required"),
  interests: z.array(z.string()).min(1, "Select at least one interest"),
  tone: z.enum(["luxury", "romantic", "playful", "family"]),
  travelType: z.enum(["solo", "couple", "group"]),
  budget: z.object({
    amount: z.number().min(1, "Budget required"),
    currency: z.enum(["GBP", "USD"]),
  }),
  selectedEvent: z.any().optional(),
  selectedTicket: z.any().optional(),
  eventRequests: z.string().optional(),
  eventTypes: z.array(z.string()).optional(),
});

type IntakeFormValues = z.infer<typeof intakeSchema>;

export function IntakeForm({ onSubmit }: { onSubmit: (data: IntakeFormValues & { includeInventory?: boolean; inventoryTypes?: string[] }) => void }) {
  const [step, setStep] = useState(0);
  const [includeInventory, setIncludeInventory] = useState(false);
  const [inventoryTypes, setInventoryTypes] = useState<string[]>([]);
  const { setIntakeData } = useIntakeStore();
  const form = useForm<IntakeFormValues>({
    resolver: zodResolver(intakeSchema),
    defaultValues: {
      destination: "",
      startDate: "",
      endDate: "",
      interests: [],
      tone: "luxury",
      travelType: "solo",
      budget: { amount: 0, currency: "GBP" },
    },
    mode: "onTouched",
  });

  const handleNext = async () => {
    // Get all field names up to the current step
    const fieldsToValidate: (keyof IntakeFormValues)[] = [];
    if (step === 0) {
      fieldsToValidate.push('destination', 'startDate', 'endDate');
    } else if (step === 1) {
      fieldsToValidate.push('interests');
    } else if (step === 2) {
      fieldsToValidate.push('tone', 'travelType');
    } else if (step === 3) {
      fieldsToValidate.push('budget');
    }

    // Validate only the fields for the current step
    const valid = await form.trigger(fieldsToValidate);
    if (valid) {
      setStep((s) => s + 1);
    }
  };
  const handlePrev = () => setStep((s) => s - 1);

  const handleFinalSubmit = form.handleSubmit((data) => {
    setIntakeData({ ...data, includeInventory, inventoryTypes });
    onSubmit({ ...data, includeInventory, inventoryTypes });
  });

  return (
    <form onSubmit={handleFinalSubmit} className="space-y-6 max-w-2xl mx-auto">
      {step === 0 && (
        <div className="space-y-4">
          <div>
            <label htmlFor="destination" className="block mb-2 text-sm font-medium">Destination</label>
            <Input 
              id="destination" 
              {...form.register("destination")} 
              placeholder="e.g. Paris, France" 
              className="h-10"
            />
            {form.formState.errors.destination && (
              <p className="text-red-500 text-sm mt-1">{form.formState.errors.destination.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block mb-2 text-sm font-medium">Start Date</label>
              <Input 
                id="startDate" 
                type="date" 
                {...form.register("startDate")} 
                className="h-10"
              />
              {form.formState.errors.startDate && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.startDate.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="endDate" className="block mb-2 text-sm font-medium">End Date</label>
              <Input 
                id="endDate" 
                type="date" 
                {...form.register("endDate")} 
                className="h-10"
              />
              {form.formState.errors.endDate && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.endDate.message}</p>
              )}
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button type="button" onClick={handleNext} className="px-6">Next</Button>
          </div>
        </div>
      )}
      
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <div className="mb-3 text-sm font-medium">What interests you most?</div>
            <Controller
              control={form.control}
              name="interests"
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-3">
                  {interestsList.map((interest) => (
                    <label key={interest} className="flex items-center space-x-2 p-3 border border-border/50 rounded-lg hover:bg-muted/30 cursor-pointer">
                      <Checkbox
                        checked={field.value?.includes(interest)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            field.onChange([...(field.value || []), interest]);
                          } else {
                            field.onChange((field.value || []).filter((i) => i !== interest));
                          }
                        }}
                      />
                      <span className="text-sm capitalize">{interest}</span>
                    </label>
                  ))}
                </div>
              )}
            />
            {form.formState.errors.interests && (
              <p className="text-red-500 text-sm mt-2">{form.formState.errors.interests.message}</p>
            )}
          </div>
          <div className="flex justify-between pt-2">
            <Button type="button" variant="outline" onClick={handlePrev}>Back</Button>
            <Button type="button" onClick={handleNext}>Next</Button>
          </div>
        </div>
      )}
      
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <div className="mb-3 text-sm font-medium">Trip Style</div>
            <Controller
              control={form.control}
              name="tone"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select trip style" />
                  </SelectTrigger>
                  <SelectContent>
                    {toneList.map((tone) => (
                      <SelectItem key={tone} value={tone} className="capitalize">{tone}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div>
            <div className="mb-3 text-sm font-medium">Travel Type</div>
            <Controller
              control={form.control}
              name="travelType"
              render={({ field }) => (
                <RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-6">
                  {travelTypeList.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <RadioGroupItem value={type} id={type} />
                      <label htmlFor={type} className="text-sm capitalize cursor-pointer">{type}</label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            />
          </div>
          <div className="flex justify-between pt-2">
            <Button type="button" variant="outline" onClick={handlePrev}>Back</Button>
            <Button type="button" onClick={handleNext}>Next</Button>
          </div>
        </div>
      )}
      
      {step === 3 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="budgetAmount" className="block mb-2 text-sm font-medium">Budget Amount</label>
              <Input
                id="budgetAmount"
                type="number"
                {...form.register("budget.amount", { valueAsNumber: true })}
                placeholder="5000"
                className="h-10"
              />
              {form.formState.errors.budget?.amount && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.budget.amount.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="budgetCurrency" className="block mb-2 text-sm font-medium">Currency</label>
              <Controller
                control={form.control}
                name="budget.currency"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="budgetCurrency" className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.budget?.currency && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.budget.currency.message}</p>
              )}
            </div>
          </div>
          <div className="flex justify-between pt-2">
            <Button type="button" variant="outline" onClick={handlePrev}>Back</Button>
            <Button type="button" onClick={() => setStep(4)}>Next</Button>
          </div>
        </div>
      )}
      
      {step === 4 && (
        <div className="space-y-4">
          <Step6Events />
          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={handlePrev}>Back</Button>
            <Button type="submit" className="px-8">Generate Itinerary</Button>
          </div>
        </div>
      )}
    </form>
  );
} 