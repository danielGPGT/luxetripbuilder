import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GeminiItineraryDay } from '@/lib/geminiClient';

export type ItineraryCardProps = {
  day: GeminiItineraryDay;
  onChange: (updated: GeminiItineraryDay) => void;
  onRegenerate: () => void;
};

export function ItineraryCard({ day, onChange, onRegenerate }: ItineraryCardProps) {
  const [editing, setEditing] = useState(false);
  const [localDay, setLocalDay] = useState(day);

  const handleFieldChange = (field: keyof GeminiItineraryDay, value: any) => {
    const updated = { ...localDay, [field]: value };
    setLocalDay(updated);
    onChange(updated);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-bold">Day {day.day}</h3>
        <Button size="sm" variant="outline" onClick={onRegenerate}>
          Regenerate Day with AI
        </Button>
      </div>
      {editing ? (
        <div className="space-y-2">
          <input
            className="w-full border rounded px-2 py-1 mb-2"
            value={localDay.title}
            onChange={e => handleFieldChange('title', e.target.value)}
          />
          <textarea
            className="w-full border rounded px-2 py-1 mb-2"
            value={localDay.narrative}
            onChange={e => handleFieldChange('narrative', e.target.value)}
          />
          <ul className="space-y-1">
            {localDay.activities.map((activity, idx) => (
              <li key={idx}>
                <input
                  className="w-full border rounded px-2 py-1"
                  value={activity}
                  onChange={e => {
                    const updated = [...localDay.activities];
                    updated[idx] = e.target.value;
                    handleFieldChange('activities', updated);
                  }}
                />
              </li>
            ))}
          </ul>
          <Button size="sm" onClick={() => setEditing(false)}>
            Save
          </Button>
        </div>
      ) : (
        <div>
          <h4 className="text-lg font-semibold mb-1">{day.title}</h4>
          <p className="mb-2 text-gray-700">{day.narrative}</p>
          <ul className="list-disc list-inside text-gray-600 mb-2">
            {day.activities.map((activity, idx) => (
              <li key={idx}>{activity}</li>
            ))}
          </ul>
          <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
            Edit
          </Button>
        </div>
      )}
    </div>
  );
} 