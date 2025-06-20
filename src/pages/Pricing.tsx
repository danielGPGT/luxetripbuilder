import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Star, Zap, Crown, Users, Globe, Shield, Clock, MessageCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthProvider';
import { useStripeSubscription } from '@/hooks/useStripeSubscription';
import { toast } from 'sonner';
import img3 from "@/assets/imgs/spencer-davis-Ivwyqtw3PzU-unsplash.jpg";
import { Footer } from '@/components/layout/Footer';

export function Pricing() {
  const { user } = useAuth();
  const {
    subscription,
    loading,
    processing,
    pricing,
    pricingLoading,
    createSubscription,
    getCurrentPlan,
    getPlanPrice,
    getPlanFeatures,
    isSubscriptionActive,
  } = useStripeSubscription();

  const plans = [
    {
      name: "Starter",
      planType: "starter" as const,
      price: pricingLoading ? "Loading..." : getPlanPrice('starter'),
      period: "/month",
      description: "Perfect for individual travel agents",
      popular: false,
      features: pricingLoading ? [
        "5 itineraries per month",
        "10 PDF downloads per month",
        "Basic AI recommendations",
        "Standard templates",
        "Basic analytics (30 days)",
        "Email support"
      ] : getPlanFeatures('starter').length > 0 ? getPlanFeatures('starter') : [
        "5 itineraries per month",
        "10 PDF downloads per month",
        "Basic AI recommendations",
        "Standard templates",
        "Basic analytics (30 days)",
        "Email support"
      ],
      limitations: [
        "No Media Library access",
        "No custom branding",
        "No API access",
        "No priority support",
        "No team collaboration"
      ],
      icon: <Users className="h-8 w-8" />,
      color: "from-blue-500 to-cyan-500"
    },
    {
      name: "Professional",
      planType: "professional" as const,
      price: pricingLoading ? "Loading..." : getPlanPrice('professional'),
      period: "/month",
      description: "Ideal for growing travel agencies",
      popular: true,
      features: pricingLoading ? [
        "Unlimited itineraries",
        "Unlimited PDF downloads",
        "Full Media Library access",
        "Advanced AI features",
        "Custom branding & white-label",
        "Analytics dashboard (1 year)",
        "API access (1000 calls/month)",
        "Priority support",
        "Team collaboration (up to 5 users)",
        "Bulk operations"
      ] : getPlanFeatures('professional').length > 0 ? getPlanFeatures('professional') : [
        "Unlimited itineraries",
        "Unlimited PDF downloads",
        "Full Media Library access",
        "Advanced AI features",
        "Custom branding & white-label",
        "Analytics dashboard (1 year)",
        "API access (1000 calls/month)",
        "Priority support",
        "Team collaboration (up to 5 users)",
        "Bulk operations"
      ],
      limitations: [],
      icon: <Crown className="h-8 w-8" />,
      color: "from-purple-500 to-pink-500"
    },
    {
      name: "Enterprise",
      planType: "enterprise" as const,
      price: pricingLoading ? "Loading..." : getPlanPrice('enterprise'),
      period: "",
      description: "For large travel organizations",
      popular: false,
      features: pricingLoading ? [
        "Everything in Professional",
        "Unlimited API calls",
        "White-label solution",
        "Dedicated account manager",
        "Custom integrations",
        "Training & onboarding",
        "SLA guarantee",
        "Advanced security",
        "Custom AI training",
        "Unlimited team members"
      ] : getPlanFeatures('enterprise').length > 0 ? getPlanFeatures('enterprise') : [
        "Everything in Professional",
        "Unlimited API calls",
        "White-label solution",
        "Dedicated account manager",
        "Custom integrations",
        "Training & onboarding",
        "SLA guarantee",
        "Advanced security",
        "Custom AI training",
        "Unlimited team members"
      ],
      limitations: [],
      icon: <Globe className="h-8 w-8" />,
      color: "from-green-500 to-emerald-500"
    }
  ];

  const features = [
    {
      title: "AI-Powered Planning",
      description: "Advanced AI creates personalized luxury itineraries in minutes",
      icon: <Zap className="h-6 w-6" />
    },
    {
      title: "Global Destinations",
      description: "Access to thousands of destinations with insider knowledge",
      icon: <Globe className="h-6 w-6" />
    },
    {
      title: "Professional Presentations",
      description: "Beautiful PDF exports with your branding",
      icon: <Star className="h-6 w-6" />
    },
    {
      title: "24/7 Support",
      description: "Round-the-clock support for all your needs",
      icon: <MessageCircle className="h-6 w-6" />
    },
    {
      title: "Enterprise Security",
      description: "Bank-level security for your sensitive data",
      icon: <Shield className="h-6 w-6" />
    },
    {
      title: "Lightning Fast",
      description: "Generate complete itineraries in seconds",
      icon: <Clock className="h-6 w-6" />
    }
  ];

  const faqs = [
    {
      question: "Can I change my plan at any time?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and are prorated."
    },
    {
      question: "Is there a free trial available?",
      answer: "Yes, we offer a 14-day free trial for all plans. No credit card required to start."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and bank transfers for Enterprise plans."
    },
    {
      question: "Can I cancel my subscription?",
      answer: "Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period."
    },
    {
      question: "Do you offer discounts for non-profits?",
      answer: "Yes, we offer special pricing for non-profit organizations and educational institutions. Contact us for details."
    },
    {
      question: "What kind of support do you provide?",
      answer: "Starter plans include email support, Professional plans include priority support, and Enterprise plans include dedicated account management."
    }
  ];

  const handleSubscribe = async (planType: 'starter' | 'professional' | 'enterprise') => {
    if (!user?.email) {
      toast.error('Please log in to subscribe');
      return;
    }

    if (planType === 'enterprise') {
      // For enterprise, redirect to contact form or open email
      window.location.href = 'mailto:sales@luxetripbuilder.com?subject=Enterprise Plan Inquiry';
      return;
    }

    const result = await createSubscription(
      planType,
      user.email,
      user.user_metadata?.name
    );

    if (!result.success) {
      toast.error(result.error || 'Failed to create subscription');
    }
  };

  const getCurrentPlanName = () => {
    if (!subscription) return null;
    return plans.find(plan => plan.planType === subscription.plan_type)?.name;
  };

  const isCurrentPlan = (planType: string) => {
    return subscription?.plan_type === planType;
  };

  const getButtonText = (plan: typeof plans[0]) => {
    if (plan.planType === 'enterprise') {
      return 'Contact Sales';
    }

    if (!user) {
      return 'Start Free Trial';
    }

    if (!isSubscriptionActive()) {
      return 'Subscribe Now';
    }

    if (isCurrentPlan(plan.planType)) {
      return 'Current Plan';
    }

    const currentPlanIndex = plans.findIndex(p => p.planType === getCurrentPlan());
    const thisPlanIndex = plans.findIndex(p => p.planType === plan.planType);
    
    if (thisPlanIndex > currentPlanIndex) {
      return 'Upgrade';
    } else {
      return 'Downgrade';
    }
  };

  const getButtonVariant = (plan: typeof plans[0]) => {
    if (plan.planType === 'enterprise') {
      return 'outline' as const;
    }

    if (isCurrentPlan(plan.planType)) {
      return 'secondary' as const;
    }

    return plan.popular ? 'default' as const : 'outline' as const;
  };

  const isButtonDisabled = (plan: typeof plans[0]) => {
    return processing || (isCurrentPlan(plan.planType) && isSubscriptionActive());
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--primary)] via-[var(--primary)]/90 to-purple-600 text-white py-24 pt-44">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={img3}
            alt="Luxury travel destination"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/30 via-[var(--primary)]/25 to-purple-600/30" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-white/30">
            <Star className="h-4 w-4 mr-2" />
            Simple, Transparent Pricing
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Choose Your
            <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Perfect Plan
            </span>
          </h1>
          
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Start free and scale as you grow. No hidden fees, no surprises. 
            Cancel anytime with full access until the end of your billing period.
          </p>

          {user && isSubscriptionActive() && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 inline-block">
              <p className="text-white/90">
                Current Plan: <span className="font-semibold">{getCurrentPlanName()}</span>
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'ring-2 ring-[var(--primary)] scale-105 shadow-xl' : 'hover:shadow-lg'} transition-all duration-300`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[var(--primary)]">
                    Most Popular
                  </Badge>
                )}

                {isCurrentPlan(plan.planType) && isSubscriptionActive() && (
                  <Badge className="absolute -top-3 right-4 bg-green-500">
                    Current Plan
                  </Badge>
                )}
                
                <CardHeader className="text-center pb-8">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center text-white`}>
                    {plan.icon}
                  </div>
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <div className="flex items-baseline justify-center gap-1 mb-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="text-muted-foreground">{plan.description}</p>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">What's included:</h4>
                    <ul className="space-y-3">
                      {plan.features.map((feature: string, featureIndex: number) => (
                        <li key={featureIndex} className="flex items-center gap-3">
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {plan.limitations.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Not included:</h4>
                      <ul className="space-y-3">
                        {plan.limitations.map((limitation: string, limitationIndex: number) => (
                          <li key={limitationIndex} className="flex items-center gap-3">
                            <X className="h-5 w-5 text-red-500 flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="pt-4">
                    {plan.planType === "enterprise" ? (
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => handleSubscribe(plan.planType)}
                        disabled={processing}
                      >
                        {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Contact Sales'}
                      </Button>
                    ) : user ? (
                      <Button 
                        className="w-full" 
                        variant={getButtonVariant(plan)}
                        onClick={() => handleSubscribe(plan.planType)}
                        disabled={isButtonDisabled(plan)}
                      >
                        {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : getButtonText(plan)}
                      </Button>
                    ) : (
                      <Link to="/login">
                        <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                          Start Free Trial
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need to Succeed</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to help you create amazing travel experiences
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="w-12 h-12 mx-auto mb-4 bg-[var(--primary)]/10 rounded-full flex items-center justify-center text-[var(--primary)]">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about our pricing and plans
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-3">{faq.question}</h3>
                  <p className="text-muted-foreground text-sm">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-[var(--primary)] to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Travel Business?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of travel professionals who are already using LuxeTripBuilder to create amazing experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link to="/dashboard">
                <Button size="lg" className="bg-white text-[var(--primary)] hover:bg-white/90 text-lg px-8 py-6">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button size="lg" className="bg-white text-[var(--primary)] hover:bg-white/90 text-lg px-8 py-6">
                    Start Free Trial
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6">
                    Schedule Demo
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
} 