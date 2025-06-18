import { useState } from 'react';
import { IntakeForm } from '@/components/forms/IntakeForm';
import { generateItineraryWithGemini, GeminiItineraryDay } from '@/lib/geminiClient';
import { ItineraryCard, ItineraryCardProps } from '@/components/ItineraryCard';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableItineraryCard(props: ItineraryCardProps & { id: number }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: props.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    touchAction: 'manipulation',
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ItineraryCard {...props} />
    </div>
  );
}

export default function NewProposal() {
  const [itinerary, setItinerary] = useState<GeminiItineraryDay[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleSubmit = async (formData: any) => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateItineraryWithGemini(formData);
      setItinerary(result);
    } catch (err: any) {
      setError(err.message || 'Failed to generate itinerary');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id && itinerary) {
      const oldIndex = itinerary.findIndex((d) => d.day === active.id);
      const newIndex = itinerary.findIndex((d) => d.day === over.id);
      setItinerary(arrayMove(itinerary, oldIndex, newIndex));
    }
  };

  const handleDayChange = (idx: number, updated: GeminiItineraryDay) => {
    if (!itinerary) return;
    const newItinerary = [...itinerary];
    newItinerary[idx] = updated;
    setItinerary(newItinerary);
  };

  const handleRegenerateDay = (idx: number) => {
    // TODO: Call Gemini API to regenerate just this day
    alert('Regenerate Day with AI (not implemented)');
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">New Proposal</h1>
      {!itinerary && (
        <IntakeForm onSubmit={handleSubmit} />
      )}
      {loading && <div className="mt-8 text-lg">Generating itinerary...</div>}
      {error && <div className="mt-8 text-red-500">{error}</div>}
      {itinerary && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={itinerary.map((d) => d.day)}
            strategy={verticalListSortingStrategy}
          >
            <div className="mt-10 space-y-8">
              <h2 className="text-2xl font-semibold mb-4">Generated Itinerary</h2>
              {itinerary.map((day, idx) => (
                <SortableItineraryCard
                  key={day.day}
                  id={day.day}
                  day={day}
                  onChange={(updated: GeminiItineraryDay) => handleDayChange(idx, updated)}
                  onRegenerate={() => handleRegenerateDay(idx)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
} 