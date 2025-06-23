import { supabase } from './supabase';
import { Database } from '@/types/supabase';

type PlanType = 'free' | 'pro' | 'agency' | 'enterprise';
type SubscriptionStatus = 'active' | 'canceled' | 'past_due';

interface Subscription {
  id: string;
  plan_type: PlanType;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
  team_id: string;
}

interface FeatureAccess {
  [key: string]: boolean;
}

interface PlanLimits {
  [key: string]: number;
}

// Define feature access for each plan
const PLAN_FEATURES: Record<PlanType, FeatureAccess> = {
  free: {
    basic_booking: true,
    ai_itinerary_generator: true,
    basic_templates: true,
    email_support: true,
    pdf_export: true,
    media_library: false,
    custom_branding: false,
    api_access: false,
    team_collaboration: false,
    white_label: false,
    advanced_ai: false,
    analytics: false,
    bulk_operations: false,
    priority_support: false,
  },
  pro: {
    basic_booking: true,
    ai_itinerary_generator: true,
    basic_templates: true,
    email_support: true,
    pdf_export: true,
    media_library: true,
    custom_branding: true,
    api_access: true,
    team_collaboration: false,
    white_label: true,
    advanced_ai: true,
    analytics: true,
    bulk_operations: true,
    priority_support: true,
  },
  agency: {
    basic_booking: true,
    ai_itinerary_generator: true,
    basic_templates: true,
    email_support: true,
    pdf_export: true,
    media_library: true,
    custom_branding: true,
    api_access: true,
    team_collaboration: true,
    white_label: true,
    advanced_ai: true,
    analytics: true,
    bulk_operations: true,
    priority_support: true,
  },
  enterprise: {
    basic_booking: true,
    ai_itinerary_generator: true,
    basic_templates: true,
    email_support: true,
    pdf_export: true,
    media_library: true,
    custom_branding: true,
    api_access: true,
    team_collaboration: true,
    white_label: true,
    advanced_ai: true,
    analytics: true,
    bulk_operations: true,
    priority_support: true,
  },
};

// Define usage limits for each plan
const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    itineraries_per_month: 5,
    pdf_downloads_per_month: 10,
    api_calls_per_month: 0,
    team_members: 1,
    storage_gb: 1,
  },
  pro: {
    itineraries_per_month: -1, // Unlimited
    pdf_downloads_per_month: -1, // Unlimited
    api_calls_per_month: 1000,
    team_members: 1,
    storage_gb: 10,
  },
  agency: {
    itineraries_per_month: -1, // Unlimited
    pdf_downloads_per_month: -1, // Unlimited
    api_calls_per_month: 5000,
    team_members: 10,
    storage_gb: 50,
  },
  enterprise: {
    itineraries_per_month: -1, // Unlimited
    pdf_downloads_per_month: -1, // Unlimited
    api_calls_per_month: -1, // Unlimited
    team_members: -1, // Unlimited
    storage_gb: -1, // Unlimited
  },
};

export class TierManager {
  private static instance: TierManager;
  private currentUser: string | null = null;
  private currentPlan: PlanType = 'free';
  private subscription: Subscription | null = null;
  private initialized = false;

  private constructor() {}

  static getInstance(): TierManager {
    if (!TierManager.instance) {
      TierManager.instance = new TierManager();
    }
    return TierManager.instance;
  }

  async initialize(userId: string): Promise<void> {
    if (this.initialized && this.currentUser === userId) {
      return;
    }

    this.currentUser = userId;
    await this.loadUserSubscription();
    this.initialized = true;
  }

  private async loadUserSubscription(): Promise<void> {
    if (!this.currentUser) return;
    try {
      // Find the user's team (owner or member)
      const { data: memberTeams } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', this.currentUser);
      const memberTeamIds = memberTeams?.map(tm => tm.team_id) || [];
      let teamId = null;
      if (memberTeamIds.length > 0) {
        teamId = memberTeamIds[0];
      }
      if (!teamId) {
        this.subscription = null;
        this.currentPlan = 'free';
        return;
      }
      // Fetch the team's subscription
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('team_id', teamId)
        .single();
      if (subError || !subscription) {
        this.subscription = null;
        this.currentPlan = 'free';
      } else {
        this.subscription = subscription;
        this.currentPlan = subscription.plan_type;
      }
    } catch (error) {
      this.subscription = null;
      this.currentPlan = 'free';
    }
  }

  getCurrentPlan(): PlanType {
    return this.currentPlan;
  }

  getSubscription(): Subscription | null {
    return this.subscription;
  }

  hasFeature(feature: string): boolean {
    const planFeatures = PLAN_FEATURES[this.currentPlan];
    return planFeatures[feature] || false;
  }

  getLimit(limit: string): number {
    const planLimits = PLAN_LIMITS[this.currentPlan];
    return planLimits[limit] || 0;
  }

  isUnlimited(limit: string): boolean {
    return this.getLimit(limit) === -1;
  }

  canAccess(feature: string): boolean {
    return this.hasFeature(feature);
  }

  getPlanFeatures(): FeatureAccess {
    return PLAN_FEATURES[this.currentPlan];
  }

  getPlanLimits(): PlanLimits {
    return PLAN_LIMITS[this.currentPlan];
  }

  isActive(): boolean {
    if (!this.subscription) return false;
    return this.subscription.status === 'active';
  }

  isCanceled(): boolean {
    if (!this.subscription) return false;
    return this.subscription.cancel_at_period_end;
  }

  getDaysUntilRenewal(): number | null {
    if (!this.subscription?.current_period_end) return null;
    
    const endDate = new Date(this.subscription.current_period_end);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  }

  getRenewalDate(): string | null {
    if (!this.subscription?.current_period_end) return null;
    
    return new Date(this.subscription.current_period_end).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // Check if user can perform an action based on usage limits
  canPerformAction(action: string, currentUsage: number = 0): boolean {
    const limit = this.getLimit(action);
    
    if (this.isUnlimited(action)) {
      return true;
    }
    
    return currentUsage < limit;
  }

  // Get remaining quota for a specific limit
  getRemainingQuota(limit: string, currentUsage: number = 0): number {
    const limitValue = this.getLimit(limit);
    
    if (this.isUnlimited(limit)) {
      return -1; // Unlimited
    }
    
    return Math.max(0, limitValue - currentUsage);
  }

  // Get plan upgrade suggestions based on usage
  getUpgradeSuggestions(currentUsage: Record<string, number>): PlanType[] {
    const suggestions: PlanType[] = [];
    const planHierarchy: PlanType[] = ['free', 'pro', 'agency', 'enterprise'];
    const currentPlanIndex = planHierarchy.indexOf(this.currentPlan);

    // Check if user is hitting limits
    for (const [limit, usage] of Object.entries(currentUsage)) {
      const limitValue = this.getLimit(limit);
      
      if (limitValue !== -1 && usage >= limitValue * 0.8) { // 80% of limit
        // Find the next plan that offers higher limits
        for (let i = currentPlanIndex + 1; i < planHierarchy.length; i++) {
          const nextPlan = planHierarchy[i];
          const nextPlanLimit = PLAN_LIMITS[nextPlan][limit];
          
          if (nextPlanLimit === -1 || nextPlanLimit > limitValue) {
            if (!suggestions.includes(nextPlan)) {
              suggestions.push(nextPlan);
            }
            break;
          }
        }
      }
    }

    return suggestions;
  }

  // Check if user needs a specific feature
  needsFeature(feature: string): boolean {
    return !this.hasFeature(feature);
  }

  // Get the minimum plan required for a feature
  getMinimumPlanForFeature(feature: string): PlanType | null {
    const planHierarchy: PlanType[] = ['free', 'pro', 'agency', 'enterprise'];
    
    for (const plan of planHierarchy) {
      if (PLAN_FEATURES[plan][feature]) {
        return plan;
      }
    }
    
    return null;
  }

  // Get upgrade path for a specific feature
  getUpgradePathForFeature(feature: string): PlanType[] {
    const minimumPlan = this.getMinimumPlanForFeature(feature);
    if (!minimumPlan) return [];
    
    const planHierarchy: PlanType[] = ['free', 'pro', 'agency', 'enterprise'];
    const currentPlanIndex = planHierarchy.indexOf(this.currentPlan);
    const minimumPlanIndex = planHierarchy.indexOf(minimumPlan);
    
    if (minimumPlanIndex <= currentPlanIndex) return [];
    
    return planHierarchy.slice(currentPlanIndex + 1, minimumPlanIndex + 1);
  }

  async createSubscription(userId: string, planType: PlanType): Promise<boolean> {
    try {
      const now = new Date();
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

      // Use upsert to handle duplicate key errors
      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          plan_type: planType,
          status: 'active',
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          cancel_at_period_end: false,
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        if (error.code === '42703') {
          console.warn('Subscriptions table not found, skipping subscription creation');
          return true; // Allow the operation to continue
        }
        if (error.code === '23505') {
          console.log('Subscription already exists for user, skipping creation');
          return true; // Subscription already exists, that's fine
        }
        console.error('Error creating subscription:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in createSubscription:', error);
      return false;
    }
  }

  // Reset the manager (useful for testing or user logout)
  reset(): void {
    this.currentUser = null;
    this.currentPlan = 'free';
    this.subscription = null;
    this.initialized = false;
  }
}

// Export singleton instance
export const tierManager = TierManager.getInstance(); 