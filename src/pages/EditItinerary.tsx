import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { loadItinerary, updateItinerary, type SavedItinerary } from '@/lib/itineraryService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Check } from 'lucide-react';
import { toast } from 'sonner';
import { ItineraryEditor } from '@/components/ItineraryEditor';
import { PDFExportButton } from '@/components/PDFExportButton';

export default function EditItinerary() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [itinerary, setItinerary] = useState<SavedItinerary | null>(null);
  const [editableDays, setEditableDays] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  // Inline editing state
  const [editingField, setEditingField] = useState<string | null>(null);
  const [localFields, setLocalFields] = useState({ title: '', client_name: '', summary: '' });
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (id) fetchItinerary(id);
  }, [id]);

  useEffect(() => {
    if (itinerary) {
      setEditableDays(itinerary.days);
      setLocalFields({
        title: itinerary.title,
        client_name: itinerary.client_name,
        summary: (itinerary.preferences as any)?.summary || '',
      });
    }
  }, [itinerary]);

  useEffect(() => {
    if (editingField && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingField]);

  const fetchItinerary = async (itineraryId: string) => {
    setLoading(true);
    try {
      const data = await loadItinerary(itineraryId);
      setItinerary(data);
    } catch (error) {
      toast.error('Failed to load itinerary');
      navigate('/itineraries');
    } finally {
      setLoading(false);
    }
  };

  const handleDaysChange = (days: any[]) => {
    setEditableDays(days);
  };

  const handleRegenerateDay = (index: number) => {
    toast.info('Regenerate Day with AI coming soon!');
  };

  // Inline edit handlers
  const handleFieldClick = (field: string) => {
    setEditingField(field);
  };

  const handleFieldBlur = (field: string) => {
    setEditingField(null);
    // Update itinerary local state
    setItinerary((prev) => prev ? { ...prev, [field]: localFields[field] } : prev);
  };

  const handleFieldChange = (field: string, value: string) => {
    setLocalFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!itinerary) return;
    setIsSaving(true);
    try {
      // Store summary in preferences JSON since it doesn't exist as a separate field
      const updatedPreferences = {
        ...itinerary.preferences,
        summary: localFields.summary
      };
      
      const updated = await updateItinerary(itinerary.id, {
        title: localFields.title,
        client_name: localFields.client_name,
        days: editableDays,
        preferences: updatedPreferences,
      });
      setItinerary(updated);
      toast.success('Itinerary updated successfully!');
    } catch (error) {
      toast.error('Failed to update itinerary.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg text-[var(--muted-foreground)] mb-4">Itinerary not found.</p>
        <Button onClick={() => navigate('/itineraries')}>Back to Itineraries</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white/90 to-white/80 flex flex-col items-center py-8 px-2">
      <div className="w-full max-w-3xl mx-auto rounded-2xl shadow-2xl overflow-hidden bg-white/80 backdrop-blur-2xl border-0">
        <div className="relative h-20 flex items-center px-8 border-b border-[var(--border)]/20">
          <div className="absolute left-4 top-4 flex gap-2">
            <Button
              variant="secondary"
              size="icon"
              className="bg-white/80 hover:bg-gray-200 rounded-full p-1 shadow"
              onClick={() => navigate(-1)}
              title="Back"
            >
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </Button>
            <PDFExportButton 
              itinerary={itinerary} 
              className="bg-white/80 hover:bg-gray-200 rounded-full p-2 shadow"
            />
          </div>
          {/* Inline editable title */}
          <div className="mx-auto w-full max-w-xl">
            {editingField === 'title' ? (
              <input
                ref={inputRef as any}
                className="text-2xl font-bold text-[var(--foreground)] bg-white/80 border border-[var(--primary)] rounded px-2 py-1 w-full outline-none focus:ring-2 focus:ring-[var(--primary)] transition"
                value={localFields.title}
                onChange={e => handleFieldChange('title', e.target.value)}
                onBlur={() => handleFieldBlur('title')}
                onKeyDown={e => { if (e.key === 'Enter') inputRef.current?.blur(); }}
              />
            ) : (
              <h1
                className="text-2xl font-bold text-[var(--foreground)] cursor-pointer hover:bg-[var(--primary)]/10 rounded px-2 py-1 transition"
                onClick={() => handleFieldClick('title')}
                title="Click to edit"
              >
                {localFields.title}
              </h1>
            )}
          </div>
        </div>
        <div className="p-8">
          {/* Inline editable client name */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-1">Client Name</label>
            {editingField === 'client_name' ? (
              <input
                ref={inputRef as any}
                className="text-base font-medium text-[var(--foreground)] bg-white/80 border border-[var(--primary)] rounded px-2 py-1 w-full outline-none focus:ring-2 focus:ring-[var(--primary)] transition"
                value={localFields.client_name}
                onChange={e => handleFieldChange('client_name', e.target.value)}
                onBlur={() => handleFieldBlur('client_name')}
                onKeyDown={e => { if (e.key === 'Enter') inputRef.current?.blur(); }}
              />
            ) : (
              <div
                className="text-base font-medium text-[var(--foreground)] cursor-pointer hover:bg-[var(--primary)]/10 rounded px-2 py-1 transition"
                onClick={() => handleFieldClick('client_name')}
                title="Click to edit"
              >
                {localFields.client_name}
              </div>
            )}
          </div>
          {/* Inline editable summary */}
          <div className="mb-8">
            <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-1">Trip Summary</label>
            {editingField === 'summary' ? (
              <textarea
                ref={inputRef as any}
                className="text-sm text-[var(--foreground)] bg-white/80 border border-[var(--primary)] rounded px-2 py-1 w-full outline-none focus:ring-2 focus:ring-[var(--primary)] transition min-h-[60px]"
                value={localFields.summary}
                onChange={e => handleFieldChange('summary', e.target.value)}
                onBlur={() => handleFieldBlur('summary')}
              />
            ) : (
              <div
                className="text-sm text-[var(--foreground)] cursor-pointer hover:bg-[var(--primary)]/10 rounded px-2 py-1 transition min-h-[60px]"
                onClick={() => handleFieldClick('summary')}
                title="Click to edit"
              >
                {localFields.summary || <span className="text-[var(--muted-foreground)] italic">Click to add a summary...</span>}
              </div>
            )}
          </div>
          <ItineraryEditor
            days={editableDays}
            onChange={handleDaysChange}
            onRegenerateDay={handleRegenerateDay}
            destination={itinerary.destination}
          />
          <div className="flex justify-end mt-8">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-[var(--primary-foreground)] font-bold shadow-md border-0"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 