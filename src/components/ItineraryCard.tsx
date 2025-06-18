import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import type { ItineraryDay } from '@/lib/gemini';
import { ImageUpload } from './ImageUpload';
import { Trash2 } from 'lucide-react';

export type ItineraryCardProps = {
  day: ItineraryDay;
  onChange: (updated: ItineraryDay) => void;
  onRegenerate: () => void;
  index: number;
  dragHandleProps?: any;
  destination?: string;
};

export function ItineraryCard({ day, onChange, onRegenerate, index, dragHandleProps, destination }: ItineraryCardProps) {
  const [editing, setEditing] = useState(false);
  const [localDay, setLocalDay] = useState(day);
  // Inline editing state for activities
  const [editingActivity, setEditingActivity] = useState<{ idx: number; field: string } | null>(null);
  const [activityDraft, setActivityDraft] = useState<string | number>('');
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const handleFieldChange = (field: keyof ItineraryDay, value: any) => {
    const updated = { ...localDay, [field]: value };
    setLocalDay(updated);
    onChange(updated);
  };

  const handleActivityChange = (idx: number, field: string, value: any) => {
    const updatedActivities = localDay.activities.map((a, i) =>
      i === idx ? { ...a, [field]: value } : a
    );
    handleFieldChange('activities', updatedActivities);
  };

  // Inline edit handlers for activities
  const handleActivityFieldClick = (idx: number, field: string, value: any) => {
    setEditingActivity({ idx, field });
    setActivityDraft(value ?? '');
  };

  const handleActivityFieldBlur = (idx: number, field: string) => {
    setEditingActivity(null);
    handleActivityChange(idx, field, activityDraft);
  };

  const handleActivityFieldChange = (value: string | number) => {
    setActivityDraft(value);
  };

  const addActivity = () => {
    const newActivity = { time: '', description: '', location: '', notes: '', estimatedCost: 0, costType: 'total' };
    handleFieldChange('activities', [...localDay.activities, newActivity]);
  };

  const removeActivity = (idx: number) => {
    const updated = localDay.activities.filter((_, i) => i !== idx);
    handleFieldChange('activities', updated);
  };

  const handleImageChange = (imageUrl: string) => {
    handleFieldChange('imageUrl', imageUrl);
  };

  return (
    <div className="bg-background shadow p-6 mb-4 rounded-lg border border-[var(--border)]/30">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <span {...dragHandleProps} className="cursor-move select-none text-xl font-bold text-[var(--primary)]">≡</span>
          <h3 className="text-xl font-bold">Day {index + 1}</h3>
        </div>
        <Button size="sm" variant="outline" onClick={onRegenerate}>
          Regenerate Day with AI
        </Button>
      </div>

      {/* Image Section */}
      <div className="mb-4">
        <ImageUpload
          currentImage={localDay.imageUrl}
          onImageChange={handleImageChange}
          destination={destination}
          activity={localDay.activities[0]?.description}
        />
      </div>

      <p className="mb-2 text-gray-700">{day.date}</p>
      <ul className="list-disc list-inside text-gray-600 mb-2">
        {localDay.activities.map((activity, idx) => (
          <li key={idx} className="mb-1 flex flex-col gap-1 bg-white/40 rounded p-2">
            <div className="flex gap-2 items-center flex-wrap">
              {/* Inline editable time */}
              {editingActivity?.idx === idx && editingActivity.field === 'time' ? (
                <input
                  ref={inputRef as any}
                  className="w-20 text-xs font-semibold bg-transparent border-b border-[var(--primary)] focus:outline-none focus:border-[var(--primary)] px-1"
                  value={activityDraft}
                  onChange={e => handleActivityFieldChange(e.target.value)}
                  onBlur={() => handleActivityFieldBlur(idx, 'time')}
                  onKeyDown={e => { if (e.key === 'Enter') inputRef.current?.blur(); }}
                />
              ) : (
                <span
                  className="font-semibold text-xs cursor-pointer hover:bg-[var(--primary)]/10 rounded px-1 py-0.5"
                  onClick={() => handleActivityFieldClick(idx, 'time', activity.time)}
                  title="Click to edit"
                >
                  {activity.time || <span className="text-gray-400 italic">Time</span>}
                </span>
              )}
              
              {/* Inline editable description */}
              {editingActivity?.idx === idx && editingActivity.field === 'description' ? (
                <input
                  ref={inputRef as any}
                  className="flex-1 text-xs font-medium bg-transparent border-b border-[var(--primary)] focus:outline-none focus:border-[var(--primary)] px-1"
                  value={activityDraft}
                  onChange={e => handleActivityFieldChange(e.target.value)}
                  onBlur={() => handleActivityFieldBlur(idx, 'description')}
                  onKeyDown={e => { if (e.key === 'Enter') inputRef.current?.blur(); }}
                />
              ) : (
                <span
                  className="font-medium text-xs cursor-pointer hover:bg-[var(--primary)]/10 rounded px-1 py-0.5"
                  onClick={() => handleActivityFieldClick(idx, 'description', activity.description)}
                  title="Click to edit"
                >
                  {activity.description || <span className="text-gray-400 italic">Description</span>}
                </span>
              )}
              
              {/* Inline editable location */}
              {editingActivity?.idx === idx && editingActivity.field === 'location' ? (
                <input
                  ref={inputRef as any}
                  className="w-32 text-xs bg-transparent border-b border-[var(--primary)] focus:outline-none focus:border-[var(--primary)] px-1"
                  value={activityDraft}
                  onChange={e => handleActivityFieldChange(e.target.value)}
                  onBlur={() => handleActivityFieldBlur(idx, 'location')}
                  onKeyDown={e => { if (e.key === 'Enter') inputRef.current?.blur(); }}
                />
              ) : (
                <span
                  className="text-xs text-gray-500 cursor-pointer hover:bg-[var(--primary)]/10 rounded px-1 py-0.5"
                  onClick={() => handleActivityFieldClick(idx, 'location', activity.location)}
                  title="Click to edit"
                >
                  {activity.location || <span className="text-gray-300 italic">Location</span>}
                </span>
              )}
              
              {/* Inline editable notes */}
              {editingActivity?.idx === idx && editingActivity.field === 'notes' ? (
                <input
                  ref={inputRef as any}
                  className="w-32 text-xs bg-transparent border-b border-[var(--primary)] focus:outline-none focus:border-[var(--primary)] px-1"
                  value={activityDraft}
                  onChange={e => handleActivityFieldChange(e.target.value)}
                  onBlur={() => handleActivityFieldBlur(idx, 'notes')}
                  onKeyDown={e => { if (e.key === 'Enter') inputRef.current?.blur(); }}
                />
              ) : (
                <span
                  className="text-xs text-gray-400 italic cursor-pointer hover:bg-[var(--primary)]/10 rounded px-1 py-0.5"
                  onClick={() => handleActivityFieldClick(idx, 'notes', activity.notes)}
                  title="Click to edit"
                >
                  {activity.notes || <span className="text-gray-200 italic">Notes</span>}
                </span>
              )}
              
              {/* Inline editable estimatedCost */}
              {editingActivity?.idx === idx && editingActivity.field === 'estimatedCost' ? (
                <input
                  ref={inputRef as any}
                  className="w-16 text-xs bg-transparent border-b border-[var(--primary)] focus:outline-none focus:border-[var(--primary)] px-1"
                  type="number"
                  value={activityDraft}
                  onChange={e => handleActivityFieldChange(Number(e.target.value))}
                  onBlur={() => handleActivityFieldBlur(idx, 'estimatedCost')}
                  onKeyDown={e => { if (e.key === 'Enter') inputRef.current?.blur(); }}
                />
              ) : (
                <span
                  className="ml-2 text-xs text-[var(--primary)] cursor-pointer hover:bg-[var(--primary)]/10 rounded px-1 py-0.5"
                  onClick={() => handleActivityFieldClick(idx, 'estimatedCost', activity.estimatedCost)}
                  title="Click to edit"
                >
                  {activity.estimatedCost ? activity.estimatedCost : <span className="text-gray-300 italic">Cost</span>}
                </span>
              )}
              
              {/* Inline editable costType */}
              {editingActivity?.idx === idx && editingActivity.field === 'costType' ? (
                <select
                  ref={inputRef as any}
                  className="w-24 text-xs bg-transparent border-b border-[var(--primary)] focus:outline-none focus:border-[var(--primary)] px-1"
                  value={activityDraft}
                  onChange={e => handleActivityFieldChange(e.target.value)}
                  onBlur={() => handleActivityFieldBlur(idx, 'costType')}
                >
                  <option value="total">Total</option>
                  <option value="per-person">Per Person</option>
                </select>
              ) : (
                <span
                  className="ml-1 text-xs text-gray-500 cursor-pointer hover:bg-[var(--primary)]/10 rounded px-1 py-0.5"
                  onClick={() => handleActivityFieldClick(idx, 'costType', activity.costType)}
                  title="Click to edit"
                >
                  {activity.costType || <span className="text-gray-300 italic">Type</span>}
                </span>
              )}
              
              <Button size="icon" variant="ghost" className="p-1 h-6 w-6 text-red-500 hover:bg-red-100" onClick={() => removeActivity(idx)} title="Delete activity">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <Button size="sm" variant="secondary" onClick={addActivity} className="mt-2">+ Add Activity</Button>
    </div>
  );
} 