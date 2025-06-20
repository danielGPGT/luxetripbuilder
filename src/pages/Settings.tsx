import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SubscriptionManager } from '@/components/SubscriptionManager';
import { User, KeyRound } from 'lucide-react';

const ProfileSettings = () => (
  <Card>
    <CardHeader>
      <CardTitle>Profile</CardTitle>
      <CardDescription>
        This is how others will see you on the site.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <p className="text-sm text-muted-foreground">
        (Profile editing is coming soon.)
      </p>
      {/* Placeholder for profile form */}
    </CardContent>
  </Card>
);

const SecuritySettings = () => (
  <Card>
    <CardHeader>
      <CardTitle>Password</CardTitle>
      <CardDescription>
        Change your password here.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <p className="text-sm text-muted-foreground">
        (Password management is coming soon.)
      </p>
       {/* Placeholder for password change form */}
    </CardContent>
  </Card>
);

export function Settings() {
  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings, subscription, and billing information.
        </p>
      </div>
      <Tabs defaultValue="subscription" className="space-y-4">
        <TabsList>
          <TabsTrigger value="subscription">
            <User className="mr-2 h-4 w-4" />
            Subscription
          </TabsTrigger>
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
           <TabsTrigger value="security">
            <KeyRound className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>
        <TabsContent value="subscription" className="space-y-4">
          <SubscriptionManager />
        </TabsContent>
        <TabsContent value="profile" className="space-y-4">
          <ProfileSettings />
        </TabsContent>
        <TabsContent value="security" className="space-y-4">
          <SecuritySettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Settings; 