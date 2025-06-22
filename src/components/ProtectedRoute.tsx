import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthProvider';
import { useStripeSubscription } from '@/hooks/useStripeSubscription';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { subscription, loading: subscriptionLoading, hasAccess } = useStripeSubscription();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [checkAttempts, setCheckAttempts] = useState(0);

  useEffect(() => {
    // Only check access when both auth and subscription are loaded
    if (!authLoading && !subscriptionLoading) {
      setIsChecking(false);
    }
  }, [authLoading, subscriptionLoading]);

  // Prevent infinite loops by limiting check attempts
  useEffect(() => {
    if (checkAttempts > 5) {
      console.error('🚨 Too many check attempts, allowing access to prevent infinite loop');
      setIsChecking(false);
    }
  }, [checkAttempts]);

  // Show loading while checking auth and subscription
  if (authLoading || subscriptionLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has access (active subscription or active trial)
  // Add a small delay to prevent rapid re-renders
  const accessCheck = hasAccess();
  if (!accessCheck) {
    setCheckAttempts(prev => prev + 1);
    // Redirect to choose plan page with trial expired message
    return <Navigate to="/choose-plan" state={{ trialExpired: true }} replace />;
  }

  return <>{children}</>;
} 