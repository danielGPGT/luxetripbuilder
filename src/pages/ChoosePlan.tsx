import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthProvider';
import { useStripeSubscription } from '@/hooks/useStripeSubscription';
import { Loader2 } from 'lucide-react';

export function ChoosePlan() {
  const { user } = useAuth();
  const { isTrialActive, hasAccess } = useStripeSubscription();
  const navigate = useNavigate();

  useEffect(() => {
    // If user has access (active subscription or valid trial), redirect to dashboard
    if (hasAccess()) {
      navigate('/dashboard');
      return;
    }

    // If user is on trial, redirect to pricing page
    if (isTrialActive()) {
      navigate('/pricing');
      return;
    }

    // If no access and not on trial, redirect to pricing page
    navigate('/pricing');
  }, [hasAccess, isTrialActive, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>Redirecting to pricing...</span>
      </div>
    </div>
  );
}

export default ChoosePlan; 