import { useAuth } from '@/lib/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { auth } from '@/lib/auth';
import type { UserProfile } from '@/lib/auth';

export function Settings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Settings</h1>
      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Agency Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Agency Name</label>
              <Input placeholder="Enter your agency name" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Logo URL</label>
              <Input placeholder="Enter your logo URL" />
            </div>
            <Button disabled={loading}>
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Gemini API Key</label>
              <Input type="password" placeholder="Enter your Gemini API key" />
            </div>
            <Button disabled={loading}>
              Update API Key
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 