import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/AuthProvider';
import { StripeService, type SubscriptionData } from '@/lib/stripeService';
import { TierManager } from '@/lib/tierManager';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export function useStripeSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [pricing, setPricing] = useState<any>(null);
  const [pricingLoading, setPricingLoading] = useState(true);

  const loadSubscription = useCallback(async () => {
    if (!user?.id) {
      console.log('⚠️ No user ID available, skipping subscription load');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Loading subscription for user:', user.id);
      
      // Ensure user is authenticated
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        console.error('❌ User not authenticated');
        setSubscription(null);
        return;
      }
      
      const currentSubscription = await StripeService.getCurrentSubscription(user.id);
      setSubscription(currentSubscription);

      // Update tier manager with subscription data
      if (currentSubscription) {
        const tierManager = TierManager.getInstance();
        await tierManager.initialize(user.id);
      }
    } catch (error) {
      console.error('❌ Error loading subscription:', error);
      // Don't show toast for subscription loading errors to avoid spam
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Manual refresh function that bypasses loading state
  const refreshSubscription = useCallback(async () => {
    if (!user?.id) {
      console.log('⚠️ No user ID available, skipping subscription refresh');
      return;
    }

    try {
      console.log('🔄 Manually refreshing subscription for user:', user.id);
      
      const currentSubscription = await StripeService.getCurrentSubscription(user.id);
      setSubscription(currentSubscription);

      // Update tier manager with subscription data
      if (currentSubscription) {
        const tierManager = TierManager.getInstance();
        await tierManager.initialize(user.id);
      }
    } catch (error) {
      console.error('❌ Error refreshing subscription:', error);
      setSubscription(null);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadSubscription();
    } else {
      setSubscription(null);
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadPricing();
  }, []);

  const loadPricing = async () => {
    try {
      setPricingLoading(true);
      const result = await StripeService.getPricing();
      if (result.success) {
        setPricing(result.pricing);
      } else {
        console.error('Failed to load pricing:', result.error);
      }
    } catch (error) {
      console.error('Error loading pricing:', error);
    } finally {
      setPricingLoading(false);
    }
  };

  const createSubscription = async (
    planType: 'free' | 'pro' | 'agency' | 'enterprise',
    customerEmail: string,
    customerName?: string,
    options?: { seatCount?: number }
  ) => {
    if (!user?.id) {
      toast.error('Please log in to create a subscription');
      return { success: false };
    }

    try {
      setProcessing(true);
      const result = await StripeService.createSubscription(
        user.id,
        planType,
        customerEmail,
        customerName,
        options
      );

      if (result.success) {
        toast.success('Redirecting to checkout...');
      } else {
        toast.error(result.error || 'Failed to create subscription');
      }

      return result;
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast.error('Failed to create subscription');
      return { success: false, error: 'Unknown error occurred' };
    } finally {
      setProcessing(false);
    }
  };

  const updateSubscription = async (newPlanType: 'free' | 'pro' | 'agency' | 'enterprise') => {
    if (!user?.id) {
      toast.error('Please log in to update your subscription');
      return { success: false };
    }

    try {
      setProcessing(true);
      const result = await StripeService.updateSubscription(user.id, newPlanType);

      if (result.success) {
        toast.success('Subscription updated successfully');
        await loadSubscription(); // Reload subscription data
      } else {
        toast.error(result.error || 'Failed to update subscription');
      }

      return result;
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast.error('Failed to update subscription');
      return { success: false, error: 'Unknown error occurred' };
    } finally {
      setProcessing(false);
    }
  };

  const cancelSubscription = async () => {
    if (!user?.id) {
      toast.error('Please log in to cancel your subscription');
      return { success: false };
    }

    if (!subscription) {
      toast.error('No active subscription found');
      return { success: false };
    }

    try {
      setProcessing(true);
      const result = await StripeService.cancelSubscription(user.id);

      if (result.success) {
        toast.success('Subscription will be canceled at the end of the current period');
        await loadSubscription(); // Reload subscription data
      } else {
        toast.error(result.error || 'Failed to cancel subscription');
      }

      return result;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error('Failed to cancel subscription');
      return { success: false, error: 'Unknown error occurred' };
    } finally {
      setProcessing(false);
    }
  };

  const openBillingPortal = async () => {
    if (!user?.id) {
      toast.error('Please log in to access billing portal');
      return { success: false };
    }

    try {
      setProcessing(true);
      const result = await StripeService.getBillingPortalUrl(user.id);

      if (result.success && result.url) {
        window.open(result.url, '_blank');
      } else {
        toast.error(result.error || 'Failed to open billing portal');
      }

      return result;
    } catch (error) {
      console.error('Error opening billing portal:', error);
      toast.error('Failed to open billing portal');
      return { success: false, error: 'Unknown error occurred' };
    } finally {
      setProcessing(false);
    }
  };

  const getPlanPrice = (planType: 'free' | 'pro' | 'agency' | 'enterprise') => {
    if (!pricing || !pricing[planType]) {
      // Fallback to hardcoded prices if Stripe pricing is not available
      const fallbackPrices = {
        free: '£0',
        pro: '£39',
        agency: '£99 + £10/seat',
        enterprise: 'Custom'
      };
      return fallbackPrices[planType];
    }

    const plan = pricing[planType];
    if (plan.amount && plan.currency) {
      return StripeService.formatPrice(plan.amount, plan.currency);
    }
    
    return plan.productName || 'Custom';
  };

  const getPlanFeatures = (planType: 'free' | 'pro' | 'agency' | 'enterprise') => {
    if (!pricing || !pricing[planType]) {
      // Fallback to hardcoded features if Stripe pricing is not available
      return [];
    }

    return pricing[planType].features || [];
  };

  const getCurrentPlan = () => {
    return subscription?.plan_type || 'free';
  };

  const isSubscriptionActive = () => {
    return subscription?.status === 'active';
  };

  const isSubscriptionCanceled = () => {
    return subscription?.cancel_at_period_end === true;
  };

  const hasAccess = () => {
    if (!subscription) return false;
    
    // Active subscription
    if (subscription.status === 'active') return true;
    
    // Canceled but still within period
    if (subscription.cancel_at_period_end && new Date(subscription.current_period_end) > new Date()) return true;
    
    return false;
  };

  const getDaysUntilRenewal = () => {
    if (!subscription?.current_period_end) return null;
    
    const endDate = new Date(subscription.current_period_end);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };

  const getFormattedRenewalDate = () => {
    if (!subscription?.current_period_end) return null;
    
    return new Date(subscription.current_period_end).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return {
    // State
    subscription,
    loading,
    processing,
    pricing,
    pricingLoading,
    
    // Actions
    createSubscription,
    updateSubscription,
    cancelSubscription,
    openBillingPortal,
    loadSubscription,
    refreshSubscription,
    
    // Computed values
    getPlanPrice,
    getPlanFeatures,
    getCurrentPlan,
    isSubscriptionActive,
    isSubscriptionCanceled,
    hasAccess,
    getDaysUntilRenewal,
    getFormattedRenewalDate,
  };
} 