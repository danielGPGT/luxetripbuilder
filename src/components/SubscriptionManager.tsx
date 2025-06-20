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
  Info
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
    pricing,
    pricingLoading,
    createSubscription,
    updateSubscription,
    cancelSubscription,
    openBillingPortal,
    getCurrentPlan,
    getPlanPrice,
    getPlanFeatures,
    isSubscriptionActive,
    isSubscriptionCanceled,
    getDaysUntilRenewal,
    getFormattedRenewalDate,
  } = useStripeSubscription();

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showPlanChangeDialog, setShowPlanChangeDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'professional' | 'enterprise'>('professional');
  const [planChangeType, setPlanChangeType] = useState<'upgrade' | 'downgrade'>('upgrade');
  const [targetPlan, setTargetPlan] = useState<'starter' | 'professional' | 'enterprise'>('professional');

  const handleUpgrade = async () => {
    if (!user?.email) {
      toast.error('User email not found');
      return;
    }

    const result = await updateSubscription(selectedPlan);

    if (result.success) {
      setShowUpgradeDialog(false);
    }
  };

  const handleCancelSubscription = async () => {
    const result = await cancelSubscription();
    if (result.success) {
      setShowCancelDialog(false);
    }
  };

  const handlePlanChange = async (newPlan: 'starter' | 'professional' | 'enterprise') => {
    const currentPlan = getCurrentPlan();
    
    if (newPlan === currentPlan) {
      toast.info('You are already on this plan');
      return;
    }

    const isUpgrade = ['starter', 'professional', 'enterprise'].indexOf(newPlan) > 
                     ['starter', 'professional', 'enterprise'].indexOf(currentPlan);

    setPlanChangeType(isUpgrade ? 'upgrade' : 'downgrade');
    setTargetPlan(newPlan);
    setShowPlanChangeDialog(true);
  };

  const confirmPlanChange = async () => {
    const result = await updateSubscription(targetPlan);
    
    if (result.success) {
      setShowPlanChangeDialog(false);
      const isUpgrade = planChangeType === 'upgrade';
      toast.success(`Successfully ${isUpgrade ? 'upgraded' : 'downgraded'} to ${targetPlan} plan`);
    }
  };

  const getLocalPlanFeatures = (plan: string) => {
    // Try to get features from Stripe first
    const stripeFeatures = getPlanFeatures(plan as 'starter' | 'professional' | 'enterprise');
    if (stripeFeatures.length > 0) {
      return {
        price: getPlanPrice(plan as 'starter' | 'professional' | 'enterprise'),
        features: stripeFeatures,
        limitations: []
      };
    }

    // Fallback to hardcoded features if Stripe data is not available
    switch (plan) {
      case 'starter':
        return {
          price: getPlanPrice('starter'),
          features: [
            '5 itineraries per month',
            'Basic itinerary templates',
            'Email support',
            'Standard export formats'
          ],
          limitations: [
            'Limited to 5 itineraries',
            'No media library access',
            'Basic templates only'
          ]
        };
      case 'professional':
        return {
          price: getPlanPrice('professional'),
          features: [
            'Unlimited itineraries',
            'Advanced itinerary templates',
            'Media library access',
            'Priority email support',
            'PDF & Word exports',
            'Custom branding options',
            'Advanced analytics'
          ],
          limitations: []
        };
      case 'enterprise':
        return {
          price: getPlanPrice('enterprise'),
          features: [
            'Unlimited itineraries',
            'Advanced itinerary templates', 
            'Media library access',
            'Priority email support',
            'PDF & Word exports',
            'Custom branding options',
            'Advanced analytics',
            'Custom integrations',
            'Dedicated account manager',
            'White-label solutions',
            'API access',
            'Custom feature development',
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
    
    if (['starter', 'professional', 'enterprise'].indexOf(targetPlan) > 
        ['starter', 'professional', 'enterprise'].indexOf(currentPlan)) {
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
      case 'professional':
        return <Crown className="h-5 w-5" />;
      case 'enterprise':
        return <Globe className="h-5 w-5" />;
      default:
        return <Users className="h-5 w-5" />;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'professional':
        return 'bg-purple-500';
      case 'enterprise':
        return 'bg-green-500';
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
              <div className={`w-10 h-10 rounded-full ${getPlanColor(currentPlan)} flex items-center justify-center text-foreground`}>
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

          <Button 
            variant="outline" 
            className="w-full mt-4" 
            onClick={openBillingPortal}
            disabled={processing}
          >
            {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
            <span className="ml-2">Manage Billing & Invoices</span>
          </Button>
        </CardContent>
      </Card>

      {/* Plan Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Plan Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Starter Plan */}
            <div className={`p-4 rounded-lg border-2 ${currentPlan === 'starter' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4" />
                <span className="font-semibold">Starter</span>
                {currentPlan === 'starter' && <CheckCircle className="h-4 w-4 text-blue-500" />}
              </div>
              <div className="text-2xl font-bold mb-2">{getPlanPrice('starter')}</div>
              <div className="text-sm text-muted-foreground mb-3">
                5 itineraries/month, Basic features
              </div>
              {currentPlan !== 'starter' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => handlePlanChange('starter')}
                  disabled={processing}
                >
                  {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingDown className="h-4 w-4" />}
                  Downgrade
                </Button>
              )}
            </div>

            {/* Professional Plan */}
            <div className={`p-4 rounded-lg border-2 ${currentPlan === 'professional' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-4 w-4" />
                <span className="font-semibold">Professional</span>
                {currentPlan === 'professional' && <CheckCircle className="h-4 w-4 text-purple-500" />}
              </div>
              <div className="text-2xl font-bold mb-2">{getPlanPrice('professional')}</div>
              <div className="text-sm text-muted-foreground mb-3">
                Unlimited, Media Library, Advanced features
              </div>
              {currentPlan !== 'professional' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => handlePlanChange('professional')}
                  disabled={processing}
                >
                  {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 
                   currentPlan === 'starter' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {currentPlan === 'starter' ? 'Upgrade' : 'Downgrade'}
                </Button>
              )}
            </div>

            {/* Enterprise Plan */}
            <div className={`p-4 rounded-lg border-2 ${currentPlan === 'enterprise' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Globe className="h-4 w-4" />
                <span className="font-semibold">Enterprise</span>
                {currentPlan === 'enterprise' && <CheckCircle className="h-4 w-4 text-green-500" />}
              </div>
              <div className="text-2xl font-bold mb-2">{getPlanPrice('enterprise')}</div>
              <div className="text-sm text-muted-foreground mb-3">
                Everything + Custom solutions
              </div>
              {currentPlan !== 'enterprise' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => handlePlanChange('enterprise')}
                  disabled={processing}
                >
                  {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
                  Upgrade
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Billing & Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={openBillingPortal}
            disabled={processing || !isSubscriptionActive()}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Manage Billing & Payment Methods
          </Button>

          {isSubscriptionActive() && !isSubscriptionCanceled() && (
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
              onClick={() => updateSubscription(currentPlan)}
              disabled={processing}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Reactivate Subscription
            </Button>
          )}
        </CardContent>
      </Card>

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
        <DialogContent className="max-w-md">
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
              {planChangeType === 'upgrade' ? (
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
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Info className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Pricing</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      Your subscription will be prorated. You'll only pay for the difference between plans.
                    </p>
                  </div>
                </div>
              ) : (
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
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-800">Important</span>
                    </div>
                    <p className="text-sm text-orange-700">
                      You'll keep your current features until the end of your billing period, then switch to the new plan.
                    </p>
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowPlanChangeDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant={planChangeType === 'upgrade' ? 'default' : 'destructive'}
              onClick={confirmPlanChange}
              disabled={processing}
            >
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 
               planChangeType === 'upgrade' ? 'Confirm Upgrade' : 'Confirm Downgrade'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 