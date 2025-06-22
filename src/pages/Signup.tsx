import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Lock, Mail, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { auth } from '@/lib/auth';
import { useAuth } from '@/lib/AuthProvider';
import { StripeService } from '@/lib/stripeService';
import { toast } from 'sonner';

const planInfo = {
  starter: {
    name: 'Starter',
    price: '£29',
    description: 'Perfect for small businesses'
  },
  professional: {
    name: 'Professional', 
    price: '£79',
    description: 'For growing teams'
  },
  enterprise: {
    name: 'Enterprise',
    price: '£199',
    description: 'For large organizations'
  }
};

export default function Signup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedPlan = searchParams.get('plan') as 'starter' | 'professional' | 'enterprise' | null;
  
  // Form data
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [localSelectedPlan, setLocalSelectedPlan] = useState<'starter' | 'professional' | 'enterprise'>(
    selectedPlan || 'starter'
  );

  // Redirect if already signed in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const validateForm = () => {
    if (!name.trim()) {
      setError("Name is required");
      return false;
    }
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!password) {
      setError("Password is required");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError("");
    
    try {
      // Create Stripe checkout session with signup data
      const result = await StripeService.createSubscription(
        null, // No userId yet - will be created after payment
        localSelectedPlan,
        email,
        name,
        { email, password, name } // Pass signup data for account creation after payment
      );
      
      if (result.success) {
        toast.success("Redirecting to secure payment...");
        // Stripe will handle the redirect to checkout
        // After successful payment, user will be redirected to success page
      } else {
        setError(result.error || 'Failed to create subscription');
      }
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <User className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <p className="text-muted-foreground">Start your free trial today</p>
          </CardHeader>
          
          <CardContent>
            {/* Plan Selector */}
            <div className="mb-6">
              <h3 className="font-medium text-sm text-muted-foreground mb-3">Choose Your Plan</h3>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(planInfo).map(([planKey, plan]) => (
                  <button
                    key={planKey}
                    type="button"
                    className={`p-3 rounded-lg border transition-all text-left ${
                      localSelectedPlan === planKey 
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                        : 'border-gray-200 bg-white hover:border-blue-300'
                    }`}
                    onClick={() => setLocalSelectedPlan(planKey as 'starter' | 'professional' | 'enterprise')}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-sm">{plan.name}</div>
                        <div className="text-xs text-muted-foreground">{plan.description}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm">{plan.price}/mo</div>
                        {planKey === 'starter' ? (
                          <div className="text-xs text-green-600 font-medium">7-day free trial</div>
                        ) : (
                          <div className="text-xs text-blue-600 font-medium">Paid immediately</div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Signup Form */}
            <form onSubmit={handleSignup} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="pl-10"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="pl-10"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="pl-10"
                    placeholder="Create a password"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    {localSelectedPlan === 'starter' ? 'Start Free Trial' : 'Subscribe Now'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign in
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 