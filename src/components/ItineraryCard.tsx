import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { SavedItinerary } from '@/lib/itineraryService';
import { useState } from 'react';
import { GeminiItineraryDay } from '@/lib/geminiClient';

interface ItineraryCardProps {
  itinerary: SavedItinerary;
  onEdit?: () => void;
  onDelete?: () => void;
  onExport?: () => void;
}

export function ItineraryCard({ itinerary, onEdit, onDelete, onExport }: ItineraryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{itinerary.title}</CardTitle>
        <p className="text-sm text-muted-foreground">
          Created {new Date(itinerary.created_at).toLocaleDateString()}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p><strong>Client:</strong> {itinerary.client_name}</p>
          <p><strong>Destination:</strong> {itinerary.destination}</p>
          <p><strong>Duration:</strong> {itinerary.days.length} days</p>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" onClick={onEdit}>
          Edit
        </Button>
        <Button variant="outline" onClick={onExport}>
          Export PDF
        </Button>
        <Button variant="destructive" onClick={onDelete}>
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}

export function ItineraryCardDay({ day, onChange, onRegenerate }: {
  day: GeminiItineraryDay;
  onChange: (updated: GeminiItineraryDay) => void;
  onRegenerate: () => void;
}) {
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