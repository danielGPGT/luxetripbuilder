import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Lock, Crown, Zap, Users, Globe, Eye, Upload, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TierManager } from '@/lib/tierManager';

interface TierRestrictionProps {
  feature: 'media_library' | 'custom_branding' | 'api_access' | 'priority_support' | 'team_collaboration' | 'advanced_ai' | 'bulk_operations' | 'analytics';
  children?: React.ReactNode;
  showUpgradePrompt?: boolean;
  mode?: 'overlay' | 'inline';
}

const featureConfig = {
  media_library: {
    title: 'Media Library',
    description: 'Upload, organize, and AI-tag your travel images',
    icon: <Eye className="h-6 w-6" />,
    availableIn: ['professional', 'enterprise'],
    upgradeMessage: 'Upgrade to Professional to access the Media Library with AI-powered tagging and unlimited uploads.',
    benefits: [
      'AI-powered image tagging',
      'Unlimited image uploads',
      'Organize by categories',
      'Search and filter images'
    ],
    overlayIcon: <Eye className="h-8 w-8" />,
    overlayFeatures: [
      {
        icon: <Eye className="h-4 w-4" />,
        title: 'AI-Powered Tagging',
        description: 'Automatic image analysis and tagging'
      },
      {
        icon: <Upload className="h-4 w-4" />,
        title: 'Unlimited Uploads',
        description: 'Store all your travel images'
      },
      {
        icon: <Search className="h-4 w-4" />,
        title: 'Smart Search',
        description: 'Find images by tags and categories'
      }
    ]
  },
  custom_branding: {
    title: 'Custom Branding',
    description: 'Add your logo and branding to all exports',
    icon: <Crown className="h-6 w-6" />,
    availableIn: ['professional', 'enterprise'],
    upgradeMessage: 'Upgrade to Professional to add your custom branding to all itineraries and exports.',
    benefits: [
      'Custom logo placement',
      'Branded PDF exports',
      'White-label solutions',
      'Professional presentation'
    ]
  },
  api_access: {
    title: 'API Access',
    description: 'Integrate with your existing systems',
    icon: <Zap className="h-6 w-6" />,
    availableIn: ['professional', 'enterprise'],
    upgradeMessage: 'Upgrade to Professional to access our API for seamless integrations.',
    benefits: [
      'RESTful API access',
      '1000 API calls per month',
      'Webhook support',
      'Custom integrations'
    ]
  },
  priority_support: {
    title: 'Priority Support',
    description: 'Get help when you need it most',
    icon: <Users className="h-6 w-6" />,
    availableIn: ['professional', 'enterprise'],
    upgradeMessage: 'Upgrade to Professional for priority support and faster response times.',
    benefits: [
      'Priority ticket handling',
      'Faster response times',
      'Dedicated support team',
      'Phone support available'
    ]
  },
  team_collaboration: {
    title: 'Team Collaboration',
    description: 'Work together with your team',
    icon: <Users className="h-6 w-6" />,
    availableIn: ['professional', 'enterprise'],
    upgradeMessage: 'Upgrade to Professional to collaborate with your team members.',
    benefits: [
      'Up to 5 team members',
      'Shared workspaces',
      'Role-based permissions',
      'Team analytics'
    ]
  },
  advanced_ai: {
    title: 'Advanced AI Features',
    description: 'Enhanced AI-powered recommendations',
    icon: <Zap className="h-6 w-6" />,
    availableIn: ['professional', 'enterprise'],
    upgradeMessage: 'Upgrade to Professional for advanced AI features and detailed customization.',
    benefits: [
      'Detailed AI recommendations',
      'Custom AI prompts',
      'Advanced personalization',
      'Learning preferences'
    ]
  },
  bulk_operations: {
    title: 'Bulk Operations',
    description: 'Manage multiple items at once',
    icon: <Globe className="h-6 w-6" />,
    availableIn: ['professional', 'enterprise'],
    upgradeMessage: 'Upgrade to Professional for bulk operations and time-saving features.',
    benefits: [
      'Bulk itinerary creation',
      'Mass PDF exports',
      'Batch updates',
      'Time-saving workflows'
    ]
  },
  analytics: {
    title: 'Advanced Analytics',
    description: 'Comprehensive business insights',
    icon: <Globe className="h-6 w-6" />,
    availableIn: ['professional', 'enterprise'],
    upgradeMessage: 'Upgrade to Professional for comprehensive analytics and business insights.',
    benefits: [
      'Full analytics history',
      'Revenue tracking',
      'Conversion analytics',
      'Performance metrics'
    ]
  }
};

export function TierRestriction({ feature, children, showUpgradePrompt = true, mode = 'inline' }: TierRestrictionProps) {
  const tierManager = TierManager.getInstance();
  const config = featureConfig[feature];
  const hasAccess = tierManager[`has${feature.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('')}`]?.() || 
                   (feature === 'media_library' && tierManager.hasMediaLibraryAccess()) ||
                   (feature === 'api_access' && tierManager.canUseAPI()) ||
                   false;

  if (hasAccess) {
    return <>{children}</>;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  if (mode === 'overlay') {
    return (
      <div className="relative">
        {/* Blurred content */}
        <div className="blur-sm pointer-events-none">
          {children}
        </div>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="w-full max-w-md mx-4 border-dashed border-2 border-muted-foreground/30">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                {config.overlayIcon || config.icon}
              </div>
              
              <h2 className="text-2xl font-bold mb-4">{config.title}</h2>
              <p className="text-muted-foreground mb-6">
                {config.description}
              </p>
              
              {config.overlayFeatures && (
                <div className="space-y-4 mb-8">
                  {config.overlayFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        {feature.icon}
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{feature.title}</div>
                        <div className="text-sm text-muted-foreground">{feature.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="space-y-3">
                <Button asChild className="w-full">
                  <Link to="/pricing">
                    Upgrade to Professional
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/pricing">
                    View All Plans
                  </Link>
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground mt-4">
                Available in Professional and Enterprise plans
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Inline mode (original behavior)
  return (
    <Card className="border-dashed border-2 border-muted-foreground/30">
      <CardHeader className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
          <Lock className="h-6 w-6 text-muted-foreground" />
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          {config.icon}
          {config.title}
        </CardTitle>
        <p className="text-muted-foreground">{config.description}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-center">
          <Badge variant="secondary" className="mb-2">
            Professional Feature
          </Badge>
          <p className="text-sm text-muted-foreground mb-4">
            {config.upgradeMessage}
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-sm">What you'll get:</h4>
          <ul className="space-y-1">
            {config.benefits.map((benefit, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-2 pt-4">
          <Button asChild className="flex-1">
            <Link to="/pricing">
              View Plans
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/pricing">
              Upgrade Now
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Higher-order component for easy usage
export function withTierRestriction<T extends object>(
  Component: React.ComponentType<T>,
  feature: TierRestrictionProps['feature'],
  showUpgradePrompt = true
) {
  return function WrappedComponent(props: T) {
    return (
      <TierRestriction feature={feature} showUpgradePrompt={showUpgradePrompt}>
        <Component {...props} />
      </TierRestriction>
    );
  };
} 