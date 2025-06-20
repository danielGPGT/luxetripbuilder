import { loadStripe, Stripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

// Initialize Stripe
let stripe: Stripe | null = null;

const initializeStripe = async () => {
  if (!stripe) {
    stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
  }
  return stripe;
};

// Stripe Product IDs for each tier
const STRIPE_PRODUCTS = {
  starter: import.meta.env.VITE_STRIPE_STARTER_PRICE_ID,
  professional: import.meta.env.VITE_STRIPE_PROFESSIONAL_PRICE_ID,
  enterprise: import.meta.env.VITE_STRIPE_ENTERPRISE_PRICE_ID,
};

export interface SubscriptionData {
  id: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' | 'incomplete_expired';
  plan_type: 'starter' | 'professional' | 'enterprise';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  stripe_subscription_id: string;
  stripe_customer_id: string;
}

export class StripeService {
  /**
   * Create a new subscription
   */
  static async createSubscription(
    userId: string,
    planType: 'starter' | 'professional' | 'enterprise',
    customerEmail: string,
    customerName?: string
  ): Promise<{ success: boolean; subscriptionId?: string; error?: string }> {
    try {
      const stripe = await initializeStripe();
      if (!stripe) {
        throw new Error('Stripe failed to initialize');
      }

      // Create the checkout session
      const session = await this.createCheckoutSession(
        userId,
        planType,
        customerEmail,
        customerName
      );

      if (!session.success) {
        return { success: false, error: session.error };
      }

      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId: session.sessionId!,
      });

      if (error) {
        console.error('Stripe checkout error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, subscriptionId: session.sessionId };
    } catch (error) {
      console.error('Error creating subscription:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Create a Stripe checkout session
   */
  static async createCheckoutSession(
    userId: string,
    planType: 'starter' | 'professional' | 'enterprise',
    customerEmail: string,
    customerName?: string
  ): Promise<{ success: boolean; sessionId?: string; error?: string }> {
    try {
      const priceId = STRIPE_PRODUCTS[planType];
      if (!priceId) {
        return { success: false, error: 'Invalid plan type' };
      }

      // Create checkout session using our local server
      const response = await fetch('http://localhost:3001/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          customerEmail,
          userId,
          planType,
          successUrl: `${window.location.origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/pricing?subscription=cancelled`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Server error:', errorData);
        return { success: false, error: `Server error: ${response.status}` };
      }

      const result = await response.json();
      
      if (!result.success) {
        return { success: false, error: result.error };
      }

      return { success: true, sessionId: result.sessionId };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Get current subscription for a user
   */
  static async getCurrentSubscription(userId: string): Promise<SubscriptionData | null> {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No subscription found
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting current subscription:', error);
      return null;
    }
  }

  /**
   * Update subscription (upgrade/downgrade)
   */
  static async updateSubscription(
    userId: string,
    newPlanType: 'starter' | 'professional' | 'enterprise'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const currentSubscription = await this.getCurrentSubscription(userId);
      if (!currentSubscription?.stripe_subscription_id) {
        return { success: false, error: 'No active subscription found to update.' };
      }

      const newPriceId = STRIPE_PRODUCTS[newPlanType];
      if (!newPriceId) {
        return { success: false, error: 'Invalid new plan type.' };
      }

      // Use the server endpoint to update the subscription in place
      const response = await fetch('http://localhost:3001/api/update-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: currentSubscription.stripe_subscription_id,
          newPriceId: newPriceId,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }

    } catch (error) {
      console.error('Error updating subscription:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const currentSubscription = await this.getCurrentSubscription(userId);
      if (!currentSubscription?.stripe_subscription_id) {
        return { success: false, error: 'No active subscription found to cancel.' };
      }

      const response = await fetch('http://localhost:3001/api/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: currentSubscription.stripe_subscription_id }),
      });

      const result = await response.json();
      return { success: result.success, error: result.error };

    } catch (error) {
      console.error('Error canceling subscription:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Reactivate a canceled subscription
   */
  static async reactivateSubscription(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: currentSubscription } = await supabase
        .from('subscriptions')
        .select('stripe_subscription_id')
        .eq('user_id', userId)
        .single();
        
      if (!currentSubscription?.stripe_subscription_id) {
        return { success: false, error: 'No subscription found to reactivate.' };
      }

      const response = await fetch('http://localhost:3001/api/reactivate-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: currentSubscription.stripe_subscription_id }),
      });

      const result = await response.json();
      return { success: result.success, error: result.error };
      
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Get billing portal URL for customer
   */
  static async getBillingPortalUrl(userId: string): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const { data: subscription, error: dbError } = await supabase
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', userId)
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        return { success: false, error: 'Failed to retrieve subscription data.' };
      }

      if (!subscription?.stripe_customer_id) {
        return { success: false, error: 'No active subscription found. Please create a subscription first.' };
      }

      console.log('Found customer ID:', subscription.stripe_customer_id);

      const response = await fetch('http://localhost:3001/api/create-billing-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: subscription.stripe_customer_id }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        return { success: false, error: `Server error: ${response.status}` };
      }

      const result = await response.json();
      return { success: result.success, url: result.url, error: result.error };

    } catch (error) {
      console.error('Error getting billing portal URL:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Get pricing information from Stripe
   */
  static async getPricing(): Promise<{ success: boolean; pricing?: any; error?: string }> {
    try {
      const response = await fetch('http://localhost:3001/api/pricing', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        return { success: false, error: `Server error: ${response.status}` };
      }

      const result = await response.json();
      return { success: result.success, pricing: result.pricing, error: result.error };

    } catch (error) {
      console.error('Error fetching pricing:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }

  /**
   * Format price for display
   */
  static formatPrice(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  }

  /**
   * Create or get customer record
   */
  static async createOrGetCustomer(
    userId: string,
    email: string,
    name?: string
  ): Promise<{ success: boolean; customerId?: string; error?: string }> {
    try {
      // For now, return a placeholder customer ID
      // In production, you'd create or retrieve the customer from Stripe
      return { success: true, customerId: `cust_${userId}` };
    } catch (error) {
      console.error('Error creating/getting customer:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }
}
