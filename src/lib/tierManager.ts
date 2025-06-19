import { supabase } from './supabase';
import { Database } from '@/types/supabase';

type PlanType = 'starter' | 'professional' | 'enterprise';
type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';

interface PlanLimits {
  itineraries_per_month: number;
  pdf_downloads_per_month: number;
  api_calls_per_month: number;
  custom_branding: boolean;
  white_label: boolean;
  priority_support: boolean;
  team_collaboration: boolean;
  advanced_ai_features: boolean;
}

interface UsageStats {
  itineraries_created: number;
  pdf_downloads: number;
  api_calls: number;
  limit_reached: {
    itineraries: boolean;
    pdf_downloads: boolean;
    api_calls: boolean;
  };
}

const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  starter: {
    itineraries_per_month: 5,
    pdf_downloads_per_month: 10,
    api_calls_per_month: 100,
    custom_branding: false,
    white_label: false,
    priority_support: false,
    team_collaboration: false,
    advanced_ai_features: false,
  },
  professional: {
    itineraries_per_month: -1, // unlimited
    pdf_downloads_per_month: -1, // unlimited
    api_calls_per_month: 1000,
    custom_branding: true,
    white_label: true,
    priority_support: true,
    team_collaboration: true,
    advanced_ai_features: true,
  },
  enterprise: {
    itineraries_per_month: -1, // unlimited
    pdf_downloads_per_month: -1, // unlimited
    api_calls_per_month: -1, // unlimited
    custom_branding: true,
    white_label: true,
    priority_support: true,
    team_collaboration: true,
    advanced_ai_features: true,
  },
};

export class TierManager {
  private static instance: TierManager;
  private currentUser: string | null = null;
  private currentPlan: PlanType = 'starter';
  private currentUsage: UsageStats | null = null;

  static getInstance(): TierManager {
    if (!TierManager.instance) {
      TierManager.instance = new TierManager();
    }
    return TierManager.instance;
  }

  async initialize(userId: string): Promise<void> {
    this.currentUser = userId;
    await this.loadUserSubscription();
    await this.loadCurrentUsage();
  }

  private async loadUserSubscription(): Promise<void> {
    if (!this.currentUser) return;

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', this.currentUser)
        .eq('status', 'active')
        .single();

      if (error) {
        console.error('Error loading subscription:', error);
        // Handle different error types
        if (error.code === 'PGRST116') {
          // No subscription found, create a starter one
          console.log('No subscription found, creating starter subscription');
          await this.createSubscription(this.currentUser, 'starter');
        } else if (error.code === '42703' || error.code === '42P01') {
          // Table doesn't exist
          console.warn('Subscriptions table not found, defaulting to starter plan');
          this.currentPlan = 'starter';
        } else {
          // Other error, default to starter
          console.warn('Subscription error, defaulting to starter plan:', error);
          this.currentPlan = 'starter';
        }
        return;
      }

      if (data) {
        this.currentPlan = data.plan_type;
      }
    } catch (error) {
      console.error('Error in loadUserSubscription:', error);
      this.currentPlan = 'starter';
    }
  }

  private async loadCurrentUsage(): Promise<void> {
    if (!this.currentUser) return;

    try {
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format

      const { data, error } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', this.currentUser)
        .eq('month', currentMonth)
        .single();

      if (error) {
        console.error('Error loading usage:', error);
        // Handle different error types
        if (error.code === 'PGRST116') {
          // No usage record found, create one
          console.log('No usage record found, creating initial usage record');
          await this.createInitialUsageRecord();
        } else if (error.code === '42703' || error.code === '42P01') {
          // Table doesn't exist - this should be fixed by running the database script
          console.warn('Usage tracking table not found. Please run the database setup script.');
          this.currentUsage = this.getDefaultUsage();
        } else if (error.code === '406') {
          // Not acceptable - likely missing headers or content type
          console.warn('API request format error. Please check Supabase configuration.');
          this.currentUsage = this.getDefaultUsage();
        } else if (error.code === '403') {
          // Forbidden - RLS policy issue
          console.warn('Access denied. Please check RLS policies.');
          this.currentUsage = this.getDefaultUsage();
        } else {
          // Other error, default to zero usage
          console.warn('Usage error, defaulting to zero usage:', error);
          this.currentUsage = this.getDefaultUsage();
        }
        return;
      }

      const limits = PLAN_LIMITS[this.currentPlan];
      this.currentUsage = {
        itineraries_created: data?.itineraries_created || 0,
        pdf_downloads: data?.pdf_downloads || 0,
        api_calls: data?.api_calls || 0,
        limit_reached: {
          itineraries: limits.itineraries_per_month > 0 && (data?.itineraries_created || 0) >= limits.itineraries_per_month,
          pdf_downloads: limits.pdf_downloads_per_month > 0 && (data?.pdf_downloads || 0) >= limits.pdf_downloads_per_month,
          api_calls: limits.api_calls_per_month > 0 && (data?.api_calls || 0) >= limits.api_calls_per_month,
        },
      };
    } catch (error) {
      console.error('Error in loadCurrentUsage:', error);
      // Default to zero usage if there's an error
      this.currentUsage = this.getDefaultUsage();
    }
  }

  private getDefaultUsage(): UsageStats {
    return {
      itineraries_created: 0,
      pdf_downloads: 0,
      api_calls: 0,
      limit_reached: {
        itineraries: false,
        pdf_downloads: false,
        api_calls: false,
      },
    };
  }

  private async createInitialUsageRecord(): Promise<void> {
    if (!this.currentUser) return;

    try {
      const currentMonth = new Date().toISOString().slice(0, 7);
      
      const { error } = await supabase
        .from('usage_tracking')
        .insert({
          user_id: this.currentUser,
          month: currentMonth,
          itineraries_created: 0,
          pdf_downloads: 0,
          api_calls: 0,
        });

      if (error) {
        console.error('Error creating initial usage record:', error);
        // Handle specific error types
        if (error.code === '42703' || error.code === '42P01') {
          console.warn('Usage tracking table not found. Please run the database setup script.');
          this.currentUsage = this.getDefaultUsage();
        } else if (error.code === '409') {
          console.warn('Usage record already exists. This is normal.');
          // Try to load the existing record
          await this.loadCurrentUsage();
        } else if (error.code === '403') {
          console.warn('Access denied creating usage record. Please check RLS policies.');
          this.currentUsage = this.getDefaultUsage();
        } else {
          console.warn('Usage creation error, defaulting to zero usage:', error);
          this.currentUsage = this.getDefaultUsage();
        }
        return;
      }

      this.currentUsage = this.getDefaultUsage();
    } catch (error) {
      console.error('Error in createInitialUsageRecord:', error);
      this.currentUsage = this.getDefaultUsage();
    }
  }

  async incrementUsage(type: 'itineraries' | 'pdf_downloads' | 'api_calls'): Promise<boolean> {
    if (!this.currentUser) return false;

    try {
      const limits = PLAN_LIMITS[this.currentPlan];
      const currentMonth = new Date().toISOString().slice(0, 7);

      // Check if limit would be exceeded
      const currentCount = this.currentUsage?.[`${type}_created` as keyof UsageStats] as number || 0;
      const limit = limits[`${type}_per_month` as keyof PlanLimits] as number;

      if (limit > 0 && currentCount >= limit) {
        return false; // Limit reached
      }

      // Update usage in database
      const { data: existingUsage, error: selectError } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', this.currentUser)
        .eq('month', currentMonth)
        .single();

      if (selectError) {
        if (selectError.code === '42703' || selectError.code === '42P01') {
          console.warn('Usage tracking table not found, skipping usage increment');
          return true; // Allow the operation to continue
        } else if (selectError.code === 'PGRST116') {
          // No record found, create one
          console.log('No usage record found, creating new record');
        } else {
          console.error('Error selecting usage record:', selectError);
          return false;
        }
      }

      if (existingUsage) {
        // Update existing record
        const { error } = await supabase
          .from('usage_tracking')
          .update({
            [`${type}_created`]: (existingUsage[`${type}_created` as keyof typeof existingUsage] as number || 0) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingUsage.id);

        if (error) {
          console.error('Error updating usage:', error);
          if (error.code === '42703' || error.code === '42P01') {
            console.warn('Usage tracking table not found, allowing operation to continue');
            return true;
          }
          return false;
        }
      } else {
        // Create new record
        const { error } = await supabase
          .from('usage_tracking')
          .insert({
            user_id: this.currentUser,
            month: currentMonth,
            [`${type}_created`]: 1,
            itineraries_created: type === 'itineraries' ? 1 : 0,
            pdf_downloads: type === 'pdf_downloads' ? 1 : 0,
            api_calls: type === 'api_calls' ? 1 : 0,
          });

        if (error) {
          console.error('Error creating usage record:', error);
          if (error.code === '42703' || error.code === '42P01') {
            console.warn('Usage tracking table not found, allowing operation to continue');
            return true;
          }
          return false;
        }
      }

      // Update local usage
      await this.loadCurrentUsage();
      return true;
    } catch (error) {
      console.error('Error in incrementUsage:', error);
      return false;
    }
  }

  canCreateItinerary(): boolean {
    if (!this.currentUsage) return false;
    const limits = PLAN_LIMITS[this.currentPlan];
    return limits.itineraries_per_month === -1 || !this.currentUsage.limit_reached.itineraries;
  }

  canDownloadPDF(): boolean {
    if (!this.currentUsage) return false;
    const limits = PLAN_LIMITS[this.currentPlan];
    return limits.pdf_downloads_per_month === -1 || !this.currentUsage.limit_reached.pdf_downloads;
  }

  canUseAPI(): boolean {
    if (!this.currentUsage) return false;
    const limits = PLAN_LIMITS[this.currentPlan];
    return limits.api_calls_per_month === -1 || !this.currentUsage.limit_reached.api_calls;
  }

  hasCustomBranding(): boolean {
    return PLAN_LIMITS[this.currentPlan].custom_branding;
  }

  hasWhiteLabel(): boolean {
    return PLAN_LIMITS[this.currentPlan].white_label;
  }

  hasPrioritySupport(): boolean {
    return PLAN_LIMITS[this.currentPlan].priority_support;
  }

  hasTeamCollaboration(): boolean {
    return PLAN_LIMITS[this.currentPlan].team_collaboration;
  }

  hasAdvancedAIFeatures(): boolean {
    return PLAN_LIMITS[this.currentPlan].advanced_ai_features;
  }

  getCurrentPlan(): PlanType {
    return this.currentPlan;
  }

  getCurrentUsage(): UsageStats | null {
    return this.currentUsage;
  }

  getPlanLimits(): PlanLimits {
    return PLAN_LIMITS[this.currentPlan];
  }

  async createSubscription(userId: string, planType: PlanType): Promise<boolean> {
    try {
      const now = new Date();
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

      const { error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan_type: planType,
          status: 'active',
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          cancel_at_period_end: false,
        });

      if (error) {
        if (error.code === '42703') {
          console.warn('Subscriptions table not found, skipping subscription creation');
          return true; // Allow the operation to continue
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

  async updateSubscription(userId: string, planType: PlanType): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          plan_type: planType,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('status', 'active');

      if (error) {
        if (error.code === '42703') {
          console.warn('Subscriptions table not found, skipping subscription update');
          return true; // Allow the operation to continue
        }
        console.error('Error updating subscription:', error);
        return false;
      }

      // Reload subscription data
      await this.loadUserSubscription();
      return true;
    } catch (error) {
      console.error('Error in updateSubscription:', error);
      return false;
    }
  }

  async cancelSubscription(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          cancel_at_period_end: true,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('status', 'active');

      if (error) {
        if (error.code === '42703') {
          console.warn('Subscriptions table not found, skipping subscription cancellation');
          return true; // Allow the operation to continue
        }
        console.error('Error canceling subscription:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in cancelSubscription:', error);
      return false;
    }
  }

  getUpgradeMessage(): string {
    const limits = PLAN_LIMITS[this.currentPlan];
    
    if (this.currentPlan === 'starter') {
      return 'Upgrade to Professional for unlimited itineraries, custom branding, and priority support.';
    } else if (this.currentPlan === 'professional') {
      return 'Upgrade to Enterprise for unlimited API calls and dedicated account management.';
    }
    
    return '';
  }

  getLimitReachedMessage(type: 'itineraries' | 'pdf_downloads' | 'api_calls'): string {
    const planNames = {
      starter: 'Starter',
      professional: 'Professional',
      enterprise: 'Enterprise',
    };

    const featureNames = {
      itineraries: 'itineraries',
      pdf_downloads: 'PDF downloads',
      api_calls: 'API calls',
    };

    return `You've reached your ${planNames[this.currentPlan]} plan limit for ${featureNames[type]}. Upgrade your plan to continue.`;
  }
}

// Export singleton instance
export const tierManager = TierManager.getInstance(); 