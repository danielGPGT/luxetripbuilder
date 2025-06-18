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

const interestsList = ["food", "romance", "adventure", "wellness", "culture"];
const toneList = ["luxury", "romantic", "playful", "family"];
const travelTypeList = ["solo", "couple", "group"];

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
});

type IntakeFormValues = z.infer<typeof intakeSchema>;

export function IntakeForm({ onSubmit }: { onSubmit: (data: IntakeFormValues) => void }) {
  const [step, setStep] = useState(0);
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
    const valid = await form.trigger();
    if (valid) setStep((s) => s + 1);
  };
  const handlePrev = () => setStep((s) => s - 1);

  const handleFinalSubmit = form.handleSubmit((data) => {
    setIntakeData(data);
    onSubmit(data);
  });

  return (
    <form onSubmit={handleFinalSubmit} className="space-y-8 max-w-xl mx-auto">
      {step === 0 && (
        <div className="space-y-4">
          <div>
            <label htmlFor="destination" className="block mb-1 font-medium">Destination</label>
            <Input id="destination" {...form.register("destination")} placeholder="e.g. Paris" />
            {form.formState.errors.destination && (
              <p className="text-red-500 text-sm">{form.formState.errors.destination.message}</p>
            )}
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="startDate" className="block mb-1 font-medium">Start Date</label>
              <Input id="startDate" type="date" {...form.register("startDate")} />
              {form.formState.errors.startDate && (
                <p className="text-red-500 text-sm">{form.formState.errors.startDate.message}</p>
              )}
            </div>
            <div className="flex-1">
              <label htmlFor="endDate" className="block mb-1 font-medium">End Date</label>
              <Input id="endDate" type="date" {...form.register("endDate")} />
              {form.formState.errors.endDate && (
                <p className="text-red-500 text-sm">{form.formState.errors.endDate.message}</p>
              )}
            </div>
          </div>
          <Button type="button" onClick={handleNext} className="mt-4">Next</Button>
        </div>
      )}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <div className="mb-2 font-medium">Interests</div>
            <div className="flex flex-wrap gap-2">
              {interestsList.map((interest) => (
                <label key={interest} className="flex items-center gap-2">
                  <Checkbox value={interest} {...form.register("interests")} />
                  {interest.charAt(0).toUpperCase() + interest.slice(1)}
                </label>
              ))}
            </div>
            {form.formState.errors.interests && (
              <p className="text-red-500 text-sm mt-2">{form.formState.errors.interests.message}</p>
            )}
          </div>
          <Button type="button" onClick={handlePrev}>Back</Button>
          <Button type="button" onClick={handleNext} className="ml-2">Next</Button>
        </div>
      )}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <div className="mb-2 font-medium">Tone</div>
            <Controller
              control={form.control}
              name="tone"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select tone" /></SelectTrigger>
                  <SelectContent>
                    {toneList.map((tone) => (
                      <SelectItem key={tone} value={tone}>{tone.charAt(0).toUpperCase() + tone.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div>
            <div className="mb-2 font-medium">Travel Type</div>
            <Controller
              control={form.control}
              name="travelType"
              render={({ field }) => (
                <RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-4">
                  {travelTypeList.map((type) => (
                    <div key={type} className="flex items-center gap-2">
                      <RadioGroupItem value={type} id={type} />
                      <label htmlFor={type} className="text-sm">{type.charAt(0).toUpperCase() + type.slice(1)}</label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            />
          </div>
          <Button type="button" onClick={handlePrev}>Back</Button>
          <Button type="button" onClick={handleNext} className="ml-2">Next</Button>
        </div>
      )}
      {step === 3 && (
        <div className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label htmlFor="budgetAmount" className="block mb-1 font-medium">Budget</label>
              <Input
                id="budgetAmount"
                type="number"
                {...form.register("budget.amount", { valueAsNumber: true })}
                placeholder="e.g. 5000"
              />
              {form.formState.errors.budget?.amount && (
                <p className="text-red-500 text-sm">{form.formState.errors.budget.amount.message}</p>
              )}
            </div>
            <div className="flex-1">
              <label htmlFor="budgetCurrency" className="block mb-1 font-medium">Currency</label>
              <Controller
                control={form.control}
                name="budget.currency"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="budgetCurrency"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.budget?.currency && (
                <p className="text-red-500 text-sm">{form.formState.errors.budget.currency.message}</p>
              )}
            </div>
          </div>
          <Button type="button" onClick={handlePrev}>Back</Button>
          <Button type="submit" className="ml-2">Submit</Button>
        </div>
      )}
    </form>
  );
} 