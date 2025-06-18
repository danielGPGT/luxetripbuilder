import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function Builder() {
  const [step, setStep] = useState<'preferences' | 'editor'>('preferences');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Create New Itinerary</h1>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {step === 'preferences' ? 'Trip Preferences' : 'Itinerary Editor'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {step === 'preferences' 
                ? 'Coming soon: Trip preferences form'
                : 'Coming soon: Itinerary editor'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 