import { useFormContext, Controller } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

const inventoryTypesList = [
  { label: 'Hotels', value: 'hotels' },
  { label: 'Flights', value: 'flights' },
  { label: 'Events', value: 'events' },
];

export function Step6Inventory({ onBack }: { onBack: () => void }) {
  const form = useFormContext();

  return (
    <div className="space-y-6">
      <Controller
        name="includeInventory"
        control={form.control}
        render={({ field }) => (
          <label className="flex items-center gap-2 font-medium">
            <Checkbox checked={!!field.value} onCheckedChange={checked => field.onChange(!!checked)} />
            Include real-time hotel/flight/ticket options?
          </label>
        )}
      />
      {form.watch('includeInventory') && (
        <div className="flex flex-col gap-2 pl-6">
          <Controller
            name="inventoryTypes"
            control={form.control}
            render={({ field }) => (
              <>
                {inventoryTypesList.map(type => (
                  <label key={type.value} className="flex items-center gap-2">
                    <Checkbox
                      checked={field.value?.includes(type.value)}
                      onCheckedChange={checked => {
                        let updated: string[];
                        if (checked) {
                          updated = [...(field.value || []), type.value];
                        } else {
                          updated = (field.value || []).filter((t: string) => t !== type.value);
                        }
                        field.onChange(updated);
                      }}
                    />
                    {type.label}
                  </label>
                ))}
              </>
            )}
          />
        </div>
      )}
      <div className="flex gap-4 mt-8">
        <Button type="button" variant="outline" onClick={onBack}>Back</Button>
        <Button type="submit" className="ml-2">Submit</Button>
      </div>
    </div>
  );
} 