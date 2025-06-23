import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { 
  CreditCard, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Crown,
  Users,
  Globe,
  Loader2,
  Settings,
  TrendingUp,
  TrendingDown,
  Info,
  Building2
} from 'lucide-react';
import { useStripeSubscription } from '@/hooks/useStripeSubscription';
import { useAuth } from '@/lib/AuthProvider';
import { toast } from 'sonner';

export function SubscriptionManager() {
  const { user } = useAuth();
  const {
    subscription,
    loading,
    processing,
    createSubscription,
    updateSubscription,
    cancelSubscription,
    openBillingPortal,
    loadSubscription,
    getCurrentPlan,
    getPlanPrice,
    getPlanFeatures,
    isSubscriptionActive,
    isSubscriptionCanceled,
    getDaysUntilRenewal,
    getFormattedRenewalDate,
  } = useStripeSubscription();

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showPlanChangeDialog, setShowPlanChangeDialog] = useState(false);
  const [planChangeType, setPlanChangeType] = useState<'upgrade' | 'downgrade'>('upgrade');
  const [targetPlan, setTargetPlan] = useState<'free' | 'pro' | 'agency' | 'enterprise'>('pro');

  const handleCancelSubscription = async () => {
    const result = await cancelSubscription();
    if (result.success) {
      setShowCancelDialog(false);
    }
  };

  const handlePlanChange = async (newPlan: 'free' | 'pro' | 'agency' | 'enterprise') => {
    const currentPlan = getCurrentPlan();
    
    if (newPlan === currentPlan) {
      toast.info('You are already on this plan');
      return;
    }

    const planHierarchy = ['free', 'pro', 'agency', 'enterprise'];
    const isUpgrade = planHierarchy.indexOf(newPlan) > planHierarchy.indexOf(currentPlan);

    setPlanChangeType(isUpgrade ? 'upgrade' : 'downgrade');
    setTargetPlan(newPlan);
    setShowPlanChangeDialog(true);
  };

  const confirmPlanChange = async () => {
    if (!user?.email) {
      toast.error('User email not found');
      return;
    }

    try {
      const result = await updateSubscription(targetPlan);
      
      if (result.success) {
        setShowPlanChangeDialog(false);
        const isUpgrade = planChangeType === 'upgrade';
        toast.success(`Successfully ${isUpgrade ? 'upgraded' : 'downgraded'} to ${targetPlan} plan`);
        await loadSubscription();
      } else {
        toast.error(result.error || 'Failed to change plan');
      }
    } catch (error) {
      console.error('Error changing plan:', error);
      toast.error('Failed to change plan');
    }
  };

  const getLocalPlanFeatures = (plan: string) => {
    // Fallback to hardcoded features if Stripe data is not available
    switch (plan) {
      case 'free':
        return {
          price: '£0',
          features: [
            'Basic booking tools with markup',
            'AI itinerary generator',
            '5 itineraries per month',
            '10 PDF downloads per month',
            'Basic AI recommendations',
            'Standard templates',
            'Email support'
          ],
          limitations: [
            'No Media Library access',
            'No custom branding',
            'No API access',
            'No priority support',
            'No team collaboration'
          ]
        };
      case 'pro':
        return {
          price: '£39',
          features: [
            'All Free features',
            'PDF branding & customization',
            'Logo upload & management',
            'Custom portal branding',
            'Unlimited itineraries',
            'Unlimited PDF downloads',
            'Full Media Library access',
            'Advanced AI features',
            'Analytics dashboard (1 year)',
            'API access (1000 calls/month)',
            'Priority support',
            'Bulk operations'
          ],
          limitations: []
        };
      case 'agency':
        return {
          price: '£99 + £10/seat',
          features: [
            'All Pro features',
            'Multi-seat dashboard (up to 10 seats)',
            'Team collaboration tools',
            'Role-based permissions',
            'Shared media library',
            'Team analytics & reporting',
            'Bulk team operations',
            'Advanced team management',
            'Dedicated team support'
          ],
          limitations: [
            'Limited to 10 team members',
            'No custom integrations'
          ]
        };
      case 'enterprise':
        return {
          price: 'Custom',
          features: [
            'All Agency features',
            'Unlimited seats',
            'API access',
            'Premium support',
            'Custom integrations',
            'White-label solution',
            'Dedicated account manager',
            'Training & onboarding',
            'SLA guarantee',
            'Advanced security',
            'Custom AI training',
            '24/7 phone support'
          ],
          limitations: []
        };
      default:
        return { price: '', features: [], limitations: [] };
    }
  };

  const getPlanComparison = (currentPlan: string, targetPlan: string) => {
    const current = getLocalPlanFeatures(currentPlan);
    const target = getLocalPlanFeatures(targetPlan);
    
    const planHierarchy = ['free', 'pro', 'agency', 'enterprise'];
    if (planHierarchy.indexOf(targetPlan) > planHierarchy.indexOf(currentPlan)) {
      // Upgrade
      return {
        type: 'upgrade',
        gains: target.features.filter((f: string) => !current.features.includes(f)),
        losses: []
      };
    } else {
      // Downgrade
      return {
        type: 'downgrade',
        gains: [],
        losses: current.features.filter((f: string) => !target.features.includes(f))
      };
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'free':
        return <Users className="h-5 w-5" />;
      case 'pro':
        return <Crown className="h-5 w-5" />;
      case 'agency':
        return <Building2 className="h-5 w-5" />;
      case 'enterprise':
        return <Globe className="h-5 w-5" />;
      default:
        return <Users className="h-5 w-5" />;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free':
        return 'bg-blue-500';
      case 'pro':
        return 'bg-purple-500';
      case 'agency':
        return 'bg-green-500';
      case 'enterprise':
        return 'bg-orange-500';
      default:
        return 'bg-blue-500';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading subscription...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentPlan = getCurrentPlan();
  const daysUntilRenewal = getDaysUntilRenewal();
  const renewalDate = getFormattedRenewalDate();

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Subscription
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${getPlanColor(currentPlan)} flex items-center justify-center text-white`}>
                {getPlanIcon(currentPlan)}
              </div>
              <div>
                <div className="font-semibold capitalize">{currentPlan} Plan</div>
                <div className="text-sm text-muted-foreground">
                  {isSubscriptionActive() ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>
            <Badge variant={isSubscriptionActive() ? 'default' : 'secondary'}>
              {isSubscriptionActive() ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {isSubscriptionCanceled() && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                Your subscription will be canceled at the end of the current billing period.
              </AlertDescription>
            </Alert>
          )}

          {renewalDate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {isSubscriptionCanceled() ? 'Access until' : 'Next billing'} {renewalDate}
                {daysUntilRenewal !== null && ` (${daysUntilRenewal} days)`}
              </span>
            </div>
          )}

          {isSubscriptionActive() && (
            <Button 
              variant="outline" 
              className="w-full mt-4" 
              onClick={openBillingPortal}
              disabled={processing}
            >
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
              <span className="ml-2">Manage Billing & Invoices</span>
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Plan Management */}
      {currentPlan !== 'free' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Plan Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Free Plan */}
              <div className={`p-4 rounded-lg border-2 ${currentPlan === 'free' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4" />
                  <span className="font-semibold">Free</span>
                  {currentPlan === 'free' && <CheckCircle className="h-4 w-4 text-blue-500" />}
                </div>
                <div className="text-2xl font-bold mb-2">£0</div>
                <div className="text-sm text-muted-foreground mb-3">
                  Basic features for solo agents
                </div>
                {currentPlan !== 'free' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handlePlanChange('free')}
                    disabled={processing}
                  >
                    {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingDown className="h-4 w-4" />}
                    Downgrade
                  </Button>
                )}
              </div>

              {/* Pro Plan */}
              <div className={`p-4 rounded-lg border-2 ${currentPlan === 'pro' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-4 w-4" />
                  <span className="font-semibold">Pro</span>
                  {currentPlan === 'pro' && <CheckCircle className="h-4 w-4 text-purple-500" />}
                </div>
                <div className="text-2xl font-bold mb-2">£39</div>
                <div className="text-sm text-muted-foreground mb-3">
                  White-label features
                </div>
                {currentPlan !== 'pro' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handlePlanChange('pro')}
                    disabled={processing}
                  >
                    {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 
                      currentPlan === 'free' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {currentPlan === 'free' ? 'Upgrade' : 'Downgrade'}
                  </Button>
                )}
              </div>

              {/* Agency Plan */}
              <div className={`p-4 rounded-lg border-2 ${currentPlan === 'agency' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-4 w-4" />
                  <span className="font-semibold">Agency</span>
                  {currentPlan === 'agency' && <CheckCircle className="h-4 w-4 text-green-500" />}
                </div>
                <div className="text-2xl font-bold mb-2">£99+</div>
                <div className="text-sm text-muted-foreground mb-3">
                  Team collaboration
                </div>
                {currentPlan !== 'agency' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handlePlanChange('agency')}
                    disabled={processing}
                  >
                    {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
                    Upgrade
                  </Button>
                )}
              </div>

              {/* Enterprise Plan */}
              <div className={`p-4 rounded-lg border-2 ${currentPlan === 'enterprise' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="h-4 w-4" />
                  <span className="font-semibold">Enterprise</span>
                  {currentPlan === 'enterprise' && <CheckCircle className="h-4 w-4 text-orange-500" />}
                </div>
                <div className="text-2xl font-bold mb-2">Custom</div>
                <div className="text-sm text-muted-foreground mb-3">
                  Large organizations
                </div>
                {currentPlan !== 'enterprise' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => window.location.href = 'mailto:sales@luxetripbuilder.com?subject=Enterprise Plan Inquiry'}
                    disabled={processing}
                  >
                    Contact Sales
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing & Account */}
      {isSubscriptionActive() && (
        <Card>
          <CardHeader>
            <CardTitle>Billing & Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={openBillingPortal}
              disabled={processing}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Manage Billing & Payment Methods
            </Button>

            {!isSubscriptionCanceled() && (
              <Button 
                variant="outline" 
                className="w-full justify-start text-red-600 hover:text-red-700"
                onClick={() => setShowCancelDialog(true)}
                disabled={processing}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancel Subscription
              </Button>
            )}

            {isSubscriptionCanceled() && (
              <Button 
                variant="outline" 
                className="w-full justify-start text-green-600 hover:text-green-700"
                onClick={() => updateSubscription(currentPlan as 'free' | 'pro' | 'agency' | 'enterprise')}
                disabled={processing}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Reactivate Subscription
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Cancel Subscription Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Are you sure you want to cancel your subscription? You'll continue to have access until the end of your current billing period.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                Keep Subscription
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleCancelSubscription}
                disabled={processing}
              >
                {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Cancel Subscription'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Plan Change Confirmation Dialog */}
      <Dialog open={showPlanChangeDialog} onOpenChange={setShowPlanChangeDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {planChangeType === 'upgrade' ? (
                <>
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Upgrade to {targetPlan.charAt(0).toUpperCase() + targetPlan.slice(1)}
                </>
              ) : (
                <>
                  <TrendingDown className="h-5 w-5 text-orange-600" />
                  Downgrade to {targetPlan.charAt(0).toUpperCase() + targetPlan.slice(1)}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {planChangeType === 'upgrade' ?
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">You'll gain access to:</span>
                  </div>
                  <ul className="space-y-2">
                    {getPlanComparison(getCurrentPlan(), targetPlan).gains.map((gain: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{gain}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-800">You'll lose access to:</span>
                  </div>
                  <ul className="space-y-2">
                    {getPlanComparison(getCurrentPlan(), targetPlan).losses.map((loss: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <XCircle className="h-3 w-3 text-orange-600 mt-0.5 flex-shrink-0" />
                        <span>{loss}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end mt-6">
            <Button variant="outline" onClick={() => setShowPlanChangeDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmPlanChange}
              disabled={processing}
            >
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 
                planChangeType === 'upgrade' ? 'Upgrade Now' : 'Downgrade Now'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 