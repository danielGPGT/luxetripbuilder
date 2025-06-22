import { useStripeSubscription } from '@/hooks/useStripeSubscription';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, Crown, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function TrialBanner() {
  const { isTrialActive, getTrialDaysRemaining, getTrialEndDate } = useStripeSubscription();
  const navigate = useNavigate();

  const isCurrentlyTrialing = isTrialActive();
  const trialDaysRemaining = getTrialDaysRemaining();
  const trialEndDate = getTrialEndDate();

  if (!isCurrentlyTrialing) {
    return null;
  }

  const isNearExpiry = trialDaysRemaining <= 3;

  return (
    <Alert className={`mb-6 ${isNearExpiry ? 'border-orange-200 bg-orange-50' : 'border-blue-200 bg-blue-50'}`}>
      <Clock className={`h-4 w-4 ${isNearExpiry ? 'text-orange-600' : 'text-blue-600'}`} />
      <AlertDescription className={`${isNearExpiry ? 'text-orange-800' : 'text-blue-800'}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium mb-1">
              {isNearExpiry ? 'Trial Ending Soon!' : 'Free Trial Active'}
            </div>
            <div className="text-sm">
              You have <span className="font-semibold">{trialDaysRemaining} days</span> remaining in your trial.
              {trialEndDate && <span className="ml-2">Ends: {trialEndDate}</span>}
            </div>
          </div>
          <Button 
            size="sm" 
            onClick={() => navigate('/choose-plan')}
            className={`${isNearExpiry ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            <Crown className="h-4 w-4 mr-2" />
            Choose Plan
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
} 