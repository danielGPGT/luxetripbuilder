import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';

interface SessionData {
  customer_email: string;
  plan_type: string;
  amount_total: number;
  currency: string;
  subscription_status: string;
}

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID found.');
      setLoading(false);
      return;
    }

    const fetchSessionData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3001/api/checkout-session/${sessionId}`);
        const data = await response.json();

        if (data.success) {
          setSessionData(data);
        } else {
          setError(data.error || 'Failed to retrieve session details.');
        }
      } catch (err) {
        setError('An error occurred while fetching your order details.');
      } finally {
        setLoading(false);
      }
    };

    fetchSessionData();
  }, [sessionId]);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center text-center">
          <Loader className="w-12 h-12 animate-spin text-primary mb-4" />
          <p className="text-lg">Loading your order details...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center text-center">
          <XCircle className="w-12 h-12 text-destructive mb-4" />
          <p className="text-lg text-destructive">{error}</p>
          <p>Please contact support if this issue persists.</p>
        </div>
      );
    }

    if (sessionData) {
      return (
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Thank You for Your Subscription!</h2>
          <p className="text-muted-foreground mb-6">
            A confirmation email has been sent to <span className="font-semibold text-primary">{sessionData.customer_email}</span>.
          </p>
          <Card className="text-left max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan:</span>
                <span className="font-bold capitalize">{sessionData.plan_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount Paid:</span>
                <span className="font-bold">{formatCurrency(sessionData.amount_total, sessionData.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subscription Status:</span>
                <span className="font-bold capitalize text-green-600">{sessionData.subscription_status}</span>
              </div>
            </CardContent>
          </Card>
          <Button asChild className="mt-8">
            <Link to="/dashboard">Go to Your Dashboard</Link>
          </Button>
        </div>
      );
    }

    return null;
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-4 md:p-8">
        <Card>
          <CardContent className="p-8">
            {renderContent()}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default OrderConfirmation; 