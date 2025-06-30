import React from 'react';
import { NewIntakeForm } from '@/components/forms';
import { NewIntake } from '@/types/newIntake';
import { toast } from 'sonner';

export function NewIntakeTest() {
  const handleSubmit = async (data: NewIntake) => {
    console.log('📋 New Intake Form Submitted:', data);
    toast.success('New intake form submitted successfully!');
    
    // Here you would typically:
    // 1. Save to database
    // 2. Generate quote
    // 3. Send notifications
    // 4. Create itinerary
  };

  const handleSaveDraft = (data: NewIntake) => {
    console.log('💾 Draft Saved:', data);
    toast.success('Draft saved successfully!');
  };

  const handleGenerateItinerary = (data: NewIntake) => {
    console.log('🧠 Generate Itinerary:', data);
    toast.success('AI itinerary generation started!');
    
    // Here you would:
    // 1. Call AI service
    // 2. Generate itinerary based on preferences
    // 3. Return structured itinerary
  };

  const handleExportPDF = (data: NewIntake) => {
    console.log('📄 Export PDF:', data);
    toast.success('PDF export started!');
    
    // Here you would:
    // 1. Generate PDF with form data
    // 2. Include pricing and recommendations
    // 3. Download or email PDF
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-[var(--foreground)] mb-2">
            New Intake Form v2.0
          </h1>
          <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
            Agent-friendly travel quote creation with CRM integration, multi-group support, 
            and modular API-driven sections for flights, hotels, transfers, and events.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-[var(--card)] p-4 rounded-[var(--radius)] shadow-sm border border-[var(--border)]">
            <div className="text-[var(--primary)] text-2xl mb-2">👥</div>
            <h3 className="font-semibold mb-1 text-[var(--foreground)]">CRM Integration</h3>
            <p className="text-sm text-[var(--muted-foreground)]">Select existing clients or create new ones with auto-fill</p>
          </div>
          <div className="bg-[var(--card)] p-4 rounded-[var(--radius)] shadow-sm border border-[var(--border)]">
            <div className="text-[var(--secondary)] text-2xl mb-2">🔧</div>
            <h3 className="font-semibold mb-1 text-[var(--foreground)]">Modular Design</h3>
            <p className="text-sm text-[var(--muted-foreground)]">Toggle sections on/off for flights, hotels, transfers, events</p>
          </div>
          <div className="bg-[var(--card)] p-4 rounded-[var(--radius)] shadow-sm border border-[var(--border)]">
            <div className="text-[var(--primary-600)] text-2xl mb-2">👨‍👩‍👧‍👦</div>
            <h3 className="font-semibold mb-1 text-[var(--foreground)]">Multi-Group Travel</h3>
            <p className="text-sm text-[var(--muted-foreground)]">Organize travelers into groups with different preferences</p>
          </div>
          <div className="bg-[var(--card)] p-4 rounded-[var(--radius)] shadow-sm border border-[var(--border)]">
            <div className="text-[var(--secondary-600)] text-2xl mb-2">⚡</div>
            <h3 className="font-semibold mb-1 text-[var(--foreground)]">Agent-Friendly</h3>
            <p className="text-sm text-[var(--muted-foreground)]">Auto-save, draft management, and quick navigation</p>
          </div>
        </div>

        {/* Form */}
        <NewIntakeForm
          onSubmit={handleSubmit}
          onSaveDraft={handleSaveDraft}
          onGenerateItinerary={handleGenerateItinerary}
          onExportPDF={handleExportPDF}
        />

        {/* Footer Info */}
        <div className="mt-12 text-center text-[var(--muted-foreground)]">
          <p className="text-sm">
            This is a demonstration of the new intake form structure. 
            All data is saved locally and can be exported or submitted for processing.
          </p>
        </div>
      </div>
    </div>
  );
} 