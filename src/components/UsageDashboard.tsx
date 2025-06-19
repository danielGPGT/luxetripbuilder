import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Download, 
  Code, 
  AlertTriangle, 
  Crown, 
  Zap,
  TrendingUp,
  Lock
} from 'lucide-react';
import { useTier } from '@/hooks/useTier';
import { Link } from 'react-router-dom';

export function UsageDashboard() {
  const { 
    isLoading, 
    currentPlan, 
    usage, 
    getPlanLimits, 
    getUpgradeMessage,
    hasCustomBranding,
    hasWhiteLabel,
    hasPrioritySupport,
    hasTeamCollaboration,
    hasAdvancedAIFeatures
  } = useTier();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-4 bg-muted rounded animate-pulse" />
        <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
        <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
      </div>
    );
  }

  const limits = getPlanLimits();
  const planNames = {
    starter: 'Starter',
    professional: 'Professional',
    enterprise: 'Enterprise',
  };

  const planColors = {
    starter: 'bg-blue-500',
    professional: 'bg-purple-500',
    enterprise: 'bg-gradient-to-r from-purple-600 to-pink-600',
  };

  const calculateProgress = (current: number, limit: number) => {
    if (limit === -1) return 0; // unlimited
    return Math.min((current / limit) * 100, 100);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'bg-red-500';
    if (progress >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      {/* Current Plan Header */}
      <Card className="border-2 border-[var(--primary)]/20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${planColors[currentPlan]}`} />
              <CardTitle className="text-xl">
                {planNames[currentPlan]} Plan
              </CardTitle>
              <Badge variant="secondary" className="ml-2">
                Current
              </Badge>
            </div>
            <Link to="/pricing">
              <Button variant="outline" size="sm">
                <TrendingUp className="h-4 w-4 mr-2" />
                Upgrade
              </Button>
            </Link>
          </div>
        </CardHeader>
      </Card>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Itineraries */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-sm">Itineraries</CardTitle>
              </div>
              {limits.itineraries_per_month === -1 && (
                <Badge variant="secondary" className="text-xs">
                  Unlimited
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {usage?.itineraries_created || 0} used
                </span>
                {limits.itineraries_per_month !== -1 && (
                  <span className="text-muted-foreground">
                    of {limits.itineraries_per_month}
                  </span>
                )}
              </div>
              {limits.itineraries_per_month !== -1 && (
                <Progress 
                  value={calculateProgress(usage?.itineraries_created || 0, limits.itineraries_per_month)} 
                  className="h-2"
                />
              )}
              {usage?.limit_reached.itineraries && (
                <Alert className="mt-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Limit reached. Upgrade to create more itineraries.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* PDF Downloads */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Download className="h-5 w-5 text-green-500" />
                <CardTitle className="text-sm">PDF Downloads</CardTitle>
              </div>
              {limits.pdf_downloads_per_month === -1 && (
                <Badge variant="secondary" className="text-xs">
                  Unlimited
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {usage?.pdf_downloads || 0} used
                </span>
                {limits.pdf_downloads_per_month !== -1 && (
                  <span className="text-muted-foreground">
                    of {limits.pdf_downloads_per_month}
                  </span>
                )}
              </div>
              {limits.pdf_downloads_per_month !== -1 && (
                <Progress 
                  value={calculateProgress(usage?.pdf_downloads || 0, limits.pdf_downloads_per_month)} 
                  className="h-2"
                />
              )}
              {usage?.limit_reached.pdf_downloads && (
                <Alert className="mt-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Limit reached. Upgrade for unlimited downloads.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* API Calls */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="h-5 w-5 text-purple-500" />
                <CardTitle className="text-sm">API Calls</CardTitle>
              </div>
              {limits.api_calls_per_month === -1 && (
                <Badge variant="secondary" className="text-xs">
                  Unlimited
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {usage?.api_calls || 0} used
                </span>
                {limits.api_calls_per_month !== -1 && (
                  <span className="text-muted-foreground">
                    of {limits.api_calls_per_month}
                  </span>
                )}
              </div>
              {limits.api_calls_per_month !== -1 && (
                <Progress 
                  value={calculateProgress(usage?.api_calls || 0, limits.api_calls_per_month)} 
                  className="h-2"
                />
              )}
              {usage?.limit_reached.api_calls && (
                <Alert className="mt-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Limit reached. Upgrade for unlimited API access.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plan Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Plan Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {hasCustomBranding ? (
                  <Crown className="h-5 w-5 text-green-500" />
                ) : (
                  <Lock className="h-5 w-5 text-muted-foreground" />
                )}
                <span className={hasCustomBranding ? '' : 'text-muted-foreground'}>
                  Custom Branding
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                {hasWhiteLabel ? (
                  <Crown className="h-5 w-5 text-green-500" />
                ) : (
                  <Lock className="h-5 w-5 text-muted-foreground" />
                )}
                <span className={hasWhiteLabel ? '' : 'text-muted-foreground'}>
                  White Label Solution
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                {hasPrioritySupport ? (
                  <Crown className="h-5 w-5 text-green-500" />
                ) : (
                  <Lock className="h-5 w-5 text-muted-foreground" />
                )}
                <span className={hasPrioritySupport ? '' : 'text-muted-foreground'}>
                  Priority Support
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {hasTeamCollaboration ? (
                  <Crown className="h-5 w-5 text-green-500" />
                ) : (
                  <Lock className="h-5 w-5 text-muted-foreground" />
                )}
                <span className={hasTeamCollaboration ? '' : 'text-muted-foreground'}>
                  Team Collaboration
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                {hasAdvancedAIFeatures ? (
                  <Crown className="h-5 w-5 text-green-500" />
                ) : (
                  <Lock className="h-5 w-5 text-muted-foreground" />
                )}
                <span className={hasAdvancedAIFeatures ? '' : 'text-muted-foreground'}>
                  Advanced AI Features
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-green-500" />
                <span>AI-Powered Itineraries</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade CTA */}
      {currentPlan !== 'enterprise' && (
        <Card className="bg-gradient-to-r from-[var(--primary)]/10 to-purple-500/10 border-[var(--primary)]/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="h-5 w-5 text-[var(--primary)]" />
                <h3 className="text-lg font-semibold">Ready to Upgrade?</h3>
              </div>
              <p className="text-muted-foreground">
                {getUpgradeMessage()}
              </p>
              <Link to="/pricing">
                <Button className="bg-[var(--primary)] hover:bg-[var(--primary)]/90">
                  View Plans
                  <TrendingUp className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 