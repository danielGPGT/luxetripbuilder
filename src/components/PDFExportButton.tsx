import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import type { SavedItinerary } from '@/lib/itineraryService';

interface PDFExportButtonProps {
  itinerary: SavedItinerary;
  onExportStart?: () => void;
  onExportComplete?: (url: string) => void;
  onExportError?: (error: Error) => void;
}

export function PDFExportButton({
  itinerary,
  onExportStart,
  onExportComplete,
  onExportError,
}: PDFExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      onExportStart?.();

      // TODO: Implement PDF generation logic
      // This will be implemented later using a PDF generation library
      const pdfUrl = '';

      onExportComplete?.(pdfUrl);
    } catch (error) {
      onExportError?.(error as Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-2"
    >
      <Download className="w-4 h-4" />
      {loading ? 'Generating PDF...' : 'Export PDF'}
    </Button>
  );
} 