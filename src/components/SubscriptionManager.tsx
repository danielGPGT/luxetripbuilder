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
  Clock
} from 'lucide-react';
import { useStripeSubscription } from '@/hooks/useStripeSubscription';
import { useAuth } from '@/lib/AuthProvider';
import { StripeService } from '@/lib/stripeService';
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
    loadSubscription,
    getCurrentPlan,
    getPlanPrice,
    getPlanFeatures,
    isSubscriptionActive,
    isSubscriptionCanceled,
    getDaysUntilRenewal,
    getFormattedRenewalDate,
    isTrialActive,
    getTrialDaysRemaining,
    getTrialEndDate,
  } = useStripeSubscription();

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [showPlanChangeDialog, setShowPlanChangeDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'professional' | 'enterprise'>('professional');
  const [planChangeType, setPlanChangeType] = useState<'upgrade' | 'downgrade'>('upgrade');
  const [targetPlan, setTargetPlan] = useState<'starter' | 'professional' | 'enterprise'>('professional');
  const [syncing, setSyncing] = useState(false);

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
    if (!user?.id) {
      toast.error('User not found');
      return;
    }

    try {
      setSyncing(true);
      const response = await fetch('http://localhost:3001/api/change-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: user.id, 
          newPlanType: targetPlan
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setShowPlanChangeDialog(false);
        const isUpgrade = planChangeType === 'upgrade';
        toast.success(`Successfully ${isUpgrade ? 'upgraded' : 'downgraded'} to ${targetPlan} plan`);
        console.log('Plan change successful:', result.changes);
        // Reload subscription data
        await loadSubscription();
      } else {
        toast.error(result.error || 'Failed to change plan');
      }
    } catch (error) {
      console.error('Error changing plan:', error);
      toast.error('Failed to change plan');
    } finally {
      setSyncing(false);
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

  const getBillingDetails = (currentPlan: string, targetPlan: string) => {
    const planPrices = {
      starter: 29,
      professional: 79,
      enterprise: 199
    };

    const currentPrice = planPrices[currentPlan as keyof typeof planPrices] || 0;
    const targetPrice = planPrices[targetPlan as keyof typeof planPrices] || 0;
    const priceDifference = targetPrice - currentPrice;

    // Calculate prorated amount (simplified - in real app you'd get this from Stripe)
    const daysInMonth = 30;
    const daysRemaining = getDaysUntilRenewal() || daysInMonth;
    const proratedAmount = Math.round((priceDifference * daysRemaining) / daysInMonth * 100) / 100;

    const renewalDate = getFormattedRenewalDate();
    const nextBillingDate = renewalDate || 'End of current period';

    return {
      currentPrice,
      targetPrice,
      priceDifference,
      proratedAmount,
      nextBillingDate,
      daysRemaining
    };
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

  // Sync function - REMOVED
  /*
  const handleSyncSubscription = async () => {
    if (!user?.id) {
      toast.error('User not found');
      return;
    }

    try {
      setSyncing(true);
      const result = await StripeService.syncSubscription(user.id);
      
      if (result.success) {
        toast.success('Subscription synced successfully');
        // Reload subscription data
        await loadSubscription();
      } else {
        toast.error(result.error || 'Failed to sync subscription');
      }
    } catch (error) {
      console.error('Error syncing subscription:', error);
      toast.error('Failed to sync subscription');
    } finally {
      setSyncing(false);
    }
  };
  */

  const handleFixTrialConversion = async () => {
    if (!user?.id) {
      toast.error('User not found');
      return;
    }

    try {
      setSyncing(true);
      const response = await fetch('http://localhost:3001/api/fix-trial-conversion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(result.message || 'Trial conversion fixed successfully');
        // Reload subscription data
        await loadSubscription();
      } else {
        toast.error(result.error || 'Failed to fix trial conversion');
      }
    } catch (error) {
      console.error('Error fixing trial conversion:', error);
      toast.error('Failed to fix trial conversion');
    } finally {
      setSyncing(false);
    }
  };

  const handleManualUpgrade = async () => {
    if (!user?.id) {
      toast.error('User not found');
      return;
    }

    try {
      setSyncing(true);
      const response = await fetch('http://localhost:3001/api/manual-upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: user.id, 
          planType: 'starter' // or get from current plan
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(result.message || 'Manual upgrade successful');
        console.log('Upgrade changes:', result.changes);
        // Reload subscription data
        await loadSubscription();
      } else {
        toast.error(result.error || 'Failed to upgrade manually');
      }
    } catch (error) {
      console.error('Error with manual upgrade:', error);
      toast.error('Failed to upgrade manually');
    } finally {
      setSyncing(false);
    }
  };

  const handleRefreshSubscription = async () => {
    if (!user?.id) {
      toast.error('User not found');
      return;
    }

    try {
      setSyncing(true);
      await loadSubscription();
      toast.success('Subscription data refreshed');
    } catch (error) {
      console.error('Error refreshing subscription:', error);
      toast.error('Failed to refresh subscription data');
    } finally {
      setSyncing(false);
    }
  };

  const handleDebugSubscription = () => {
    console.log('Current subscription data:', subscription);
    console.log('Current period end:', subscription?.current_period_end);
    console.log('Formatted renewal date:', getFormattedRenewalDate());
    console.log('Days until renewal:', getDaysUntilRenewal());
    toast.success('Subscription data logged to console');
  };

  const handleFixBillingDates = async () => {
    if (!user?.id) {
      toast.error('User not found');
      return;
    }

    try {
      setSyncing(true);
      const response = await fetch('http://localhost:3001/api/fix-billing-dates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(result.message || 'Billing dates fixed successfully');
        console.log('Fix result:', result);
        // Reload subscription data
        await loadSubscription();
      } else {
        toast.error(result.error || 'Failed to fix billing dates');
      }
    } catch (error) {
      console.error('Error fixing billing dates:', error);
      toast.error('Failed to fix billing dates');
    } finally {
      setSyncing(false);
    }
  };

  const handleQuickPlanChange = async (newPlan: 'starter' | 'professional' | 'enterprise') => {
    if (!user?.id) {
      toast.error('User not found');
      return;
    }

    const currentPlan = getCurrentPlan();

    if (newPlan === currentPlan) {
      toast.info('You are already on this plan');
      return;
    }

    try {
      setSyncing(true);
      const response = await fetch('http://localhost:3001/api/change-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: user.id, 
          newPlanType: newPlan
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(`Successfully changed to ${newPlan} plan`);
        console.log('Quick plan change successful:', result.changes);
        // Reload subscription data
        await loadSubscription();
      } else {
        toast.error(result.error || 'Failed to change plan');
      }
    } catch (error) {
      console.error('Error with quick plan change:', error);
      toast.error('Failed to change plan');
    } finally {
      setSyncing(false);
    }
  };

  const handleCreateTrialSubscription = async () => {
    if (!user?.id) {
      toast.error('User not found');
      return;
    }

    try {
      setSyncing(true);
      const response = await fetch('http://localhost:3001/api/create-trial-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(result.message || 'Trial subscription created successfully');
        console.log('Trial subscription created:', result.subscription);
        // Reload subscription data
        await loadSubscription();
      } else {
        toast.error(result.error || 'Failed to create trial subscription');
      }
    } catch (error) {
      console.error('Error creating trial subscription:', error);
      toast.error('Failed to create trial subscription');
    } finally {
      setSyncing(false);
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
  const isCurrentlyTrialing = isTrialActive();
  const trialDaysRemaining = getTrialDaysRemaining();
  const trialEndDate = getTrialEndDate();

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
                  {isCurrentlyTrialing ? 'Free Trial' : isSubscriptionActive() ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>
            <Badge variant={isCurrentlyTrialing ? 'secondary' : isSubscriptionActive() ? 'default' : 'secondary'}>
              {isCurrentlyTrialing ? 'Trial' : isSubscriptionActive() ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {isCurrentlyTrialing && (
            <Alert className="border-blue-200 bg-blue-50">
              <Clock className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <div className="font-medium mb-1">Free Trial Active</div>
                <div>You have <span className="font-semibold">{trialDaysRemaining} days</span> remaining in your trial.</div>
                {trialEndDate && <div className="text-sm mt-1">Trial ends: {trialEndDate}</div>}
              </AlertDescription>
            </Alert>
          )}

          {isSubscriptionCanceled() && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                Your subscription will be canceled at the end of the current billing period.
              </AlertDescription>
            </Alert>
          )}

          {renewalDate && !isCurrentlyTrialing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {isSubscriptionCanceled() ? 'Access until' : 'Next billing'} {renewalDate}
                {daysUntilRenewal !== null && ` (${daysUntilRenewal} days)`}
              </span>
            </div>
          )}

          {!isCurrentlyTrialing && (
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

          {/* Manual Sync Button for debugging - REMOVED */}
          {/* <Button 
            variant="outline" 
            className="w-full mt-2" 
            onClick={handleSyncSubscription}
            disabled={syncing}
          >
            {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Settings className="h-4 w-4" />}
            <span className="ml-2">Sync Subscription Status</span>
          </Button> */}

          {/* Create Trial Subscription Button */}
          {!subscription && (
            <Button 
              variant="default" 
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700" 
              onClick={handleCreateTrialSubscription}
              disabled={syncing}
            >
              {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              <span className="ml-2">Create Trial Subscription</span>
            </Button>
          )}

          {/* Fix Trial Conversion Button */}
          {isCurrentlyTrialing && (
            <Button 
              variant="outline" 
              className="w-full mt-2" 
              onClick={handleFixTrialConversion}
              disabled={syncing}
            >
              {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              <span className="ml-2">Fix Trial Conversion</span>
            </Button>
          )}

          {/* Manual Upgrade Button */}
          {isCurrentlyTrialing && (
            <Button 
              variant="default" 
              className="w-full mt-2 bg-green-600 hover:bg-green-700" 
              onClick={handleManualUpgrade}
              disabled={syncing}
            >
              {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
              <span className="ml-2">Manual Upgrade to Paid</span>
            </Button>
          )}

          {/* Refresh Button */}
          <div className="mt-4">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleRefreshSubscription}
              disabled={syncing}
            >
              {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Settings className="h-4 w-4" />}
              <span className="ml-2">Refresh Subscription Data</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full mt-2" 
              onClick={handleDebugSubscription}
              disabled={syncing}
            >
              <Info className="h-4 w-4" />
              <span className="ml-2">Debug Subscription Data</span>
            </Button>
          </div>

          {/* Test Checkout Session Button - REMOVED */}
          {/* <Button 
            variant="outline" 
            className="w-full mt-2 bg-yellow-100 hover:bg-yellow-200" 
            onClick={handleTestCheckoutSession}
            disabled={syncing}
          >
            {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Info className="h-4 w-4" />}
            <span className="ml-2">Test Checkout Session Processing</span>
          </Button> */}

          {/* Quick Plan Change Buttons - REMOVED */}
          {/* <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Quick Plan Changes (Testing)</h4>
            <div className="grid grid-cols-3 gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleQuickPlanChange('starter')}
                disabled={syncing || currentPlan === 'starter'}
              >
                {syncing ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Starter'}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleQuickPlanChange('professional')}
                disabled={syncing || currentPlan === 'professional'}
              >
                {syncing ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Pro'}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleQuickPlanChange('enterprise')}
                disabled={syncing || currentPlan === 'enterprise'}
              >
                {syncing ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Enterprise'}
              </Button>
            </div>
          </div> */}
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
                  
                  {/* Billing Details */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <CreditCard className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Billing Details</span>
                    </div>
                    {(() => {
                      const billing = getBillingDetails(getCurrentPlan(), targetPlan);
                      return (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-blue-700">Current Plan:</span>
                            <span className="font-medium">£{billing.currentPrice}/month</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700">New Plan:</span>
                            <span className="font-medium">£{billing.targetPrice}/month</span>
                          </div>
                          <div className="flex justify-between border-t border-blue-200 pt-2">
                            <span className="text-blue-700 font-medium">Prorated Amount:</span>
                            <span className={`font-bold ${billing.proratedAmount > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                              {billing.proratedAmount > 0 ? '+' : ''}£{billing.proratedAmount}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-blue-700">Billed on:</span>
                            <span className="font-medium">{billing.nextBillingDate}</span>
                          </div>
                          <div className="text-xs text-blue-600 mt-2">
                            * You'll be charged the prorated difference immediately. Your next full billing cycle will be £{billing.targetPrice}/month.
                          </div>
                        </div>
                      );
                    })()}
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
                  
                  {/* Billing Details for Downgrade */}
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <CreditCard className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-800">Billing Details</span>
                    </div>
                    {(() => {
                      const billing = getBillingDetails(getCurrentPlan(), targetPlan);
                      return (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-orange-700">Current Plan:</span>
                            <span className="font-medium">£{billing.currentPrice}/month</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-orange-700">New Plan:</span>
                            <span className="font-medium">£{billing.targetPrice}/month</span>
                          </div>
                          <div className="flex justify-between border-t border-orange-200 pt-2">
                            <span className="text-orange-700 font-medium">Credit Applied:</span>
                            <span className="font-bold text-green-600">
                              +£{Math.abs(billing.proratedAmount)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-orange-700">Effective from:</span>
                            <span className="font-medium">{billing.nextBillingDate}</span>
                          </div>
                          <div className="text-xs text-orange-600 mt-2">
                            * You'll keep current features until {billing.nextBillingDate}. Your next billing cycle will be £{billing.targetPrice}/month.
                          </div>
                        </div>
                      );
                    })()}
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
              disabled={syncing}
            >
              {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : 
               planChangeType === 'upgrade' ? 'Confirm Upgrade' : 'Confirm Downgrade'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 