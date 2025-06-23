import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SubscriptionManager } from '@/components/SubscriptionManager';
import { User, KeyRound, CreditCard, Settings as SettingsIcon, Users, Building2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthProvider';
import { useStripeSubscription } from '@/hooks/useStripeSubscription';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { toast } from 'sonner';

const ProfileSettings = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.user_metadata?.name || '');
  const [agencyName, setAgencyName] = useState(user?.user_metadata?.agency_name || '');

  const handleSave = async () => {
    // TODO: Implement profile update logic
    toast.success('Profile updated successfully');
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Settings
        </CardTitle>
        <CardDescription>
          Manage your personal information and agency details.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isEditing}
              placeholder="Enter your full name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={user?.email || ''}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="agency">Agency Name</Label>
          <Input
            id="agency"
            value={agencyName}
            onChange={(e) => setAgencyName(e.target.value)}
            disabled={!isEditing}
            placeholder="Enter your agency name"
          />
        </div>

        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button onClick={handleSave}>Save Changes</Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const SecuritySettings = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    // TODO: Implement password change logic
    toast.success('Password changed successfully');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-5 w-5" />
          Security Settings
        </CardTitle>
        <CardDescription>
          Change your password and manage security settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="current-password">Current Password</Label>
          <Input
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="new-password">New Password</Label>
          <Input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm New Password</Label>
          <Input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
          />
        </div>

        <Button onClick={handlePasswordChange} disabled={!currentPassword || !newPassword || !confirmPassword}>
          Change Password
        </Button>
      </CardContent>
    </Card>
  );
};

const TeamManagement = () => {
  const { subscription } = useStripeSubscription();
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberName, setNewMemberName] = useState('');

  const handleInviteMember = async () => {
    if (!newMemberEmail || !newMemberName) {
      toast.error('Please fill in all fields');
      return;
    }

    // TODO: Implement team member invitation logic
    toast.success(`Invitation sent to ${newMemberEmail}`);
    setNewMemberEmail('');
    setNewMemberName('');
  };

  const canManageTeam = subscription?.plan_type === 'agency' || subscription?.plan_type === 'enterprise';

  if (!canManageTeam) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Management
          </CardTitle>
          <CardDescription>
            Manage your team members and permissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Team Management Not Available</h3>
            <p className="text-muted-foreground mb-4">
              Team management is available on Agency and Enterprise plans.
            </p>
            <Button asChild>
              <a href="/pricing">Upgrade Plan</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Team Management
        </CardTitle>
        <CardDescription>
          Invite team members and manage their permissions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="member-email">Email Address</Label>
            <Input
              id="member-email"
              type="email"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              placeholder="team@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="member-name">Full Name</Label>
            <Input
              id="member-name"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              placeholder="John Doe"
            />
          </div>
        </div>

        <Button onClick={handleInviteMember} disabled={!newMemberEmail || !newMemberName}>
          Invite Team Member
        </Button>

        <div className="border-t pt-6">
          <h4 className="font-semibold mb-4">Current Team Members</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="font-medium">You</p>
                <p className="text-sm text-muted-foreground">Owner</p>
              </div>
              <Badge variant="secondary">Owner</Badge>
            </div>
            {/* TODO: Add actual team members list */}
            <p className="text-sm text-muted-foreground">No additional team members yet.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export function Settings() {
  const { user } = useAuth();
  const { subscription } = useStripeSubscription();

  const getPlanBadgeColor = (planType: string) => {
    switch (planType) {
      case 'free':
        return 'bg-blue-100 text-blue-800';
      case 'pro':
        return 'bg-purple-100 text-purple-800';
      case 'agency':
        return 'bg-green-100 text-green-800';
      case 'enterprise':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Account Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings, subscription, and billing information.
        </p>
      </div>

      {/* Current Plan Summary */}
      {subscription && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold capitalize">{subscription.plan_type} Plan</div>
                  <div className="text-sm text-muted-foreground">
                    {subscription.status === 'active' ? 'Active' : subscription.status}
                  </div>
                </div>
              </div>
              <Badge className={getPlanBadgeColor(subscription.plan_type)}>
                {subscription.plan_type.toUpperCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="subscription" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="subscription">
            <CreditCard className="mr-2 h-4 w-4" />
            Subscription
          </TabsTrigger>
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="team">
            <Users className="mr-2 h-4 w-4" />
            Team
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
        
        <TabsContent value="team" className="space-y-4">
          <TeamManagement />
        </TabsContent>
        
        <TabsContent value="security" className="space-y-4">
          <SecuritySettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Settings; 