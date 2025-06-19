import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Lock, 
  Crown, 
  TrendingUp, 
  AlertTriangle,
  Zap,
  Users,
  Palette,
  Code,
  Headphones,
  FileText,
  Download
} from 'lucide-react';
import { useTier } from '@/hooks/useTier';
import { Link } from 'react-router-dom';

interface TierRestrictionProps {
  type: 'itineraries' | 'pdf_downloads' | 'api_calls' | 'custom_branding' | 'white_label' | 'priority_support' | 'team_collaboration' | 'advanced_ai';
  children?: React.ReactNode;
  showUpgradePrompt?: boolean;
}

const featureConfig = {
  itineraries: {
    icon: FileText,
    title: 'Itinerary Creation',
    description: 'Create AI-powered travel itineraries',
    starter: '5 per month',
    professional: 'Unlimited',
    enterprise: 'Unlimited',
  },
  pdf_downloads: {
    icon: Download,
    title: 'PDF Downloads',
    description: 'Download itineraries as PDF files',
    starter: '10 per month',
    professional: 'Unlimited',
    enterprise: 'Unlimited',
  },
  api_calls: {
    icon: Code,
    title: 'API Access',
    description: 'Integrate with your own applications',
    starter: '100 per month',
    professional: '1,000 per month',
    enterprise: 'Unlimited',
  },
  custom_branding: {
    icon: Palette,
    title: 'Custom Branding',
    description: 'Add your logo and colors to itineraries',
    starter: 'Not included',
    professional: 'Included',
    enterprise: 'Included',
  },
  white_label: {
    icon: Crown,
    title: 'White Label Solution',
    description: 'Remove our branding completely',
    starter: 'Not included',
    professional: 'Included',
    enterprise: 'Included',
  },
  priority_support: {
    icon: Headphones,
    title: 'Priority Support',
    description: 'Get help when you need it most',
    starter: 'Email support',
    professional: 'Priority support',
    enterprise: 'Dedicated account manager',
  },
  team_collaboration: {
    icon: Users,
    title: 'Team Collaboration',
    description: 'Work together with your team',
    starter: 'Not included',
    professional: 'Included',
    enterprise: 'Included',
  },
  advanced_ai: {
    icon: Zap,
    title: 'Advanced AI Features',
    description: 'Access to premium AI capabilities',
    starter: 'Basic AI',
    professional: 'Advanced AI',
    enterprise: 'Advanced AI + Custom Models',
  },
};

export function TierRestriction({ type, children, showUpgradePrompt = true }: TierRestrictionProps) {
  const { 
    currentPlan, 
    canCreateItinerary, 
    canDownloadPDF, 
    canUseAPI,
    hasCustomBranding,
    hasWhiteLabel,
    hasPrioritySupport,
    hasTeamCollaboration,
    hasAdvancedAIFeatures,
    getLimitReachedMessage
  } = useTier();

  const config = featureConfig[type];
  const Icon = config.icon;

  // Check if user has access to this feature
  const hasAccess = (() => {
    switch (type) {
      case 'itineraries':
        return canCreateItinerary();
      case 'pdf_downloads':
        return canDownloadPDF();
      case 'api_calls':
        return canUseAPI();
      case 'custom_branding':
        return hasCustomBranding();
      case 'white_label':
        return hasWhiteLabel();
      case 'priority_support':
        return hasPrioritySupport();
      case 'team_collaboration':
        return hasTeamCollaboration();
      case 'advanced_ai':
        return hasAdvancedAIFeatures();
      default:
        return false;
    }
  })();

  // If user has access, render children
  if (hasAccess) {
    return <>{children}</>;
  }

  // If user doesn't have access, show restriction
  return (
    <Card className="border-2 border-muted/50 bg-muted/20">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {config.title}
              <Badge variant="secondary" className="text-xs">
                {currentPlan === 'starter' ? 'Professional+' : 'Enterprise'}
              </Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {config.description}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {type === 'itineraries' || type === 'pdf_downloads' || type === 'api_calls' ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {getLimitReachedMessage(type)}
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center p-3 rounded-lg bg-background">
                <div className="font-semibold text-blue-600">Starter</div>
                <div className="text-muted-foreground mt-1">{config.starter}</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-background border-2 border-[var(--primary)]/20">
                <div className="font-semibold text-[var(--primary)]">Professional</div>
                <div className="text-muted-foreground mt-1">{config.professional}</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-background">
                <div className="font-semibold text-purple-600">Enterprise</div>
                <div className="text-muted-foreground mt-1">{config.enterprise}</div>
              </div>
            </div>
          </div>
        )}

        {showUpgradePrompt && (
          <div className="mt-6 text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Lock className="h-4 w-4" />
              <span className="text-sm">
                {currentPlan === 'starter' 
                  ? 'Upgrade to Professional to unlock this feature'
                  : 'Upgrade to Enterprise for unlimited access'
                }
              </span>
            </div>
            <Link to="/pricing">
              <Button className="bg-[var(--primary)] hover:bg-[var(--primary)]/90">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Plans
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Higher-order component for easy usage
export function withTierRestriction<T extends object>(
  Component: React.ComponentType<T>,
  type: TierRestrictionProps['type'],
  showUpgradePrompt = true
) {
  return function WrappedComponent(props: T) {
    return (
      <TierRestriction type={type} showUpgradePrompt={showUpgradePrompt}>
        <Component {...props} />
      </TierRestriction>
    );
  };
} 