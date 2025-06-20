require('dotenv').config({ path: './server.env' });

const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Middleware
app.use(cors());

// Use a middleware to handle raw body for webhook
app.use((req, res, next) => {
  if (req.originalUrl === '/api/webhook') {
    express.raw({ type: 'application/json' })(req, res, next);
  } else {
    express.json()(req, res, next);
  }
});

// Create checkout session
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { priceId, customerEmail, userId, planType, successUrl, cancelUrl } = req.body;

    // Check if user already has a subscription in our database
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id, stripe_subscription_id')
      .eq('user_id', userId)
      .single();

    let sessionConfig = {
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: userId,
        plan_type: planType,
      },
      allow_promotion_codes: true,
    };

    // If user has an existing customer ID, use it
    if (existingSubscription?.stripe_customer_id) {
      console.log(`Using existing customer ID: ${existingSubscription.stripe_customer_id}`);
      sessionConfig.customer = existingSubscription.stripe_customer_id;
      
      // Update customer metadata to ensure user_id is available for webhooks
      try {
        await stripe.customers.update(existingSubscription.stripe_customer_id, {
          metadata: {
            user_id: userId,
          }
        });
        console.log(`Updated customer metadata with user_id: ${userId}`);
      } catch (error) {
        console.error('Error updating customer metadata:', error);
      }
    } else {
      // For new customers, use customer_email
      sessionConfig.customer_email = customerEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    res.json({ success: true, sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Webhook handler for subscription events
app.post('/api/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`Received webhook event: ${event.type}`);

  try {
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Webhook event handlers
async function handleCheckoutSessionCompleted(session) {
  console.log('Processing checkout session completed:', session.id);
  
  try {
    const { user_id, plan_type } = session.metadata;
    
    if (!user_id || !plan_type) {
      console.error('Missing user_id or plan_type in session metadata');
      return;
    }

    // Get the subscription from the session
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    
    // FIX: Handle potentially null timestamps from test data
    const periodStart = subscription.current_period_start ? new Date(subscription.current_period_start * 1000) : new Date();
    const periodEnd = subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : new Date();
    
    // Update or create subscription in database
    const { error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: user_id,
        plan_type: plan_type,
        status: subscription.status,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer,
        current_period_start: periodStart.toISOString(),
        current_period_end: periodEnd.toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'stripe_subscription_id'
      });

    if (error) {
      console.error('Error updating subscription in database:', error);
    } else {
      console.log(`Subscription created/updated for user ${user_id}`);
    }
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
  }
}

async function handleSubscriptionCreated(subscription) {
  console.log('Processing subscription created:', subscription.id);
  
  try {
    // Get user_id from customer metadata (set during checkout session creation)
    const customer = await stripe.customers.retrieve(subscription.customer);
    let user_id = customer.metadata?.user_id;

    // If not found in customer metadata, try to find it in recent checkout sessions
    if (!user_id) {
      console.log('User ID not found in customer metadata, checking recent checkout sessions...');
      const sessions = await stripe.checkout.sessions.list({
        customer: subscription.customer,
        limit: 5,
      });
      
      for (const session of sessions.data) {
        if (session.metadata?.user_id) {
          user_id = session.metadata.user_id;
          console.log(`Found user_id in checkout session: ${user_id}`);
          break;
        }
      }
    }

    if (!user_id) {
      console.error('Could not find user_id for subscription:', subscription.id);
      return;
    }

    // Determine plan type from price ID
    const priceId = subscription.items.data[0]?.price.id;
    let plan_type = 'starter'; // default
    
    if (priceId === process.env.STRIPE_PROFESSIONAL_PRICE_ID) {
      plan_type = 'professional';
    } else if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) {
      plan_type = 'enterprise';
    }

    // Update subscription in database
    const { error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: user_id,
        plan_type: plan_type,
        status: subscription.status,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'stripe_subscription_id'
      });

    if (error) {
      console.error('Error updating subscription in database:', error);
    } else {
      console.log(`Subscription created for user ${user_id}`);
    }
  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

async function handleSubscriptionUpdated(subscription) {
  console.log('Processing subscription updated:', subscription.id);
  
  try {
    // Get user_id from existing subscription in database
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscription.id)
      .single();

    if (!existingSub) {
      console.warn(`⚠️ Subscription not found in database: ${subscription.id}. It may be created by another event handler.`);
      return;
    }

    // Determine plan type from price ID
    const priceId = subscription.items.data[0]?.price.id;
    let plan_type = 'starter'; // default
    
    if (priceId === process.env.STRIPE_PROFESSIONAL_PRICE_ID) {
      plan_type = 'professional';
    } else if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) {
      plan_type = 'enterprise';
    }

    // Update subscription in database
    const { error } = await supabase
      .from('subscriptions')
      .update({
        plan_type: plan_type,
        status: subscription.status,
        current_period_start: subscription.current_period_start ? new Date(subscription.current_period_start * 1000).toISOString() : new Date().toISOString(),
        current_period_end: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : new Date().toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id);

    if (error) {
      console.error('Error updating subscription in database:', error);
    } else {
      console.log(`Subscription updated for user ${existingSub.user_id}`);
    }
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

async function handleSubscriptionDeleted(subscription) {
  console.log('Processing subscription deleted:', subscription.id);
  
  try {
    // Update subscription status in database
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        cancel_at_period_end: true,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id);

    if (error) {
      console.error('Error updating subscription in database:', error);
    } else {
      console.log(`Subscription canceled: ${subscription.id}`);
    }
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}

async function handleInvoicePaymentSucceeded(invoice) {
  console.log('Processing invoice payment succeeded:', invoice.id);
  
  try {
    // Update subscription status if it was past_due
    if (invoice.subscription) {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', invoice.subscription);

      if (error) {
        console.error('Error updating subscription status:', error);
      } else {
        console.log(`Subscription reactivated: ${invoice.subscription}`);
      }
    }
  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error);
  }
}

async function handleInvoicePaymentFailed(invoice) {
  console.log('Processing invoice payment failed:', invoice.id);
  
  try {
    // Update subscription status to past_due
    if (invoice.subscription) {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'past_due',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', invoice.subscription);

      if (error) {
        console.error('Error updating subscription status:', error);
      } else {
        console.log(`Subscription marked as past_due: ${invoice.subscription}`);
      }
    }
  } catch (error) {
    console.error('Error handling invoice payment failed:', error);
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get checkout session details
app.get('/api/checkout-session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'Session ID is required' });
    }

    console.log(`Retrieving checkout session: ${sessionId}`);

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer', 'subscription'],
    });
    
    console.log('Session retrieved:', {
      id: session.id,
      customer_email: session.customer_details?.email,
      subscription_id: session.subscription?.id,
      amount_total: session.amount_total,
      currency: session.currency
    });

    // Get plan type from metadata or subscription
    let planType = 'Unknown Plan';
    if (session.metadata?.plan_type) {
      planType = session.metadata.plan_type;
    } else if (session.subscription?.items?.data?.[0]?.price?.nickname) {
      planType = session.subscription.items.data[0].price.nickname;
    } else if (session.subscription?.items?.data?.[0]?.price?.id) {
      // Fallback: determine plan from price ID
      const priceId = session.subscription.items.data[0].price.id;
      if (priceId === process.env.STRIPE_PROFESSIONAL_PRICE_ID) {
        planType = 'Professional';
      } else if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) {
        planType = 'Enterprise';
      } else {
        planType = 'Starter';
      }
    }
    
    // We only want to expose the necessary information to the client
    res.json({
      success: true,
      customer_email: session.customer_details?.email || session.customer?.email || 'Unknown',
      plan_type: planType,
      amount_total: session.amount_total || 0,
      currency: session.currency || 'usd',
      subscription_status: session.subscription?.status || 'unknown',
    });

  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update a subscription
app.post('/api/update-subscription', async (req, res) => {
  try {
    const { subscriptionId, newPriceId } = req.body;
    if (!subscriptionId || !newPriceId) {
      return res.status(400).json({ success: false, error: 'Subscription ID and New Price ID are required.' });
    }

    // Retrieve the subscription to find the subscription item ID
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const subscriptionItemId = subscription.items.data[0].id;

    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: subscriptionItemId,
        price: newPriceId,
      }],
      proration_behavior: 'create_prorations', // Prorate the changes
    });

    res.json({ success: true, subscription: updatedSubscription });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Cancel a subscription
app.post('/api/cancel-subscription', async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    if (!subscriptionId) {
      return res.status(400).json({ success: false, error: 'Subscription ID is required.' });
    }

    const canceledSubscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    res.json({ success: true, subscription: canceledSubscription });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Reactivate a subscription
app.post('/api/reactivate-subscription', async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    if (!subscriptionId) {
      return res.status(400).json({ success: false, error: 'Subscription ID is required.' });
    }

    const reactivatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });

    res.json({ success: true, subscription: reactivatedSubscription });
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create a billing portal session
app.post('/api/create-billing-portal-session', async (req, res) => {
  try {
    const { customerId } = req.body;
    console.log('Creating billing portal session for customer:', customerId);
    
    if (!customerId) {
      console.error('No customer ID provided');
      return res.status(400).json({ success: false, error: 'Customer ID is required.' });
    }

    // Validate that the customer exists in Stripe
    try {
      const customer = await stripe.customers.retrieve(customerId);
      console.log('Customer found in Stripe:', customer.id);
    } catch (stripeError) {
      console.error('Customer not found in Stripe:', customerId, stripeError.message);
      return res.status(400).json({ success: false, error: 'Customer not found in Stripe.' });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${req.headers.origin}/dashboard`, // Redirect back to the app
    });

    console.log('Billing portal session created successfully');
    res.json({ success: true, url: portalSession.url });
  } catch (error) {
    console.error('Error creating billing portal session:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get pricing information from Stripe
app.get('/api/pricing', async (req, res) => {
  try {
    const prices = await stripe.prices.list({
      active: true,
      expand: ['data.product'],
    });

    // Filter for subscription prices and organize by plan type
    const pricingData = {
      starter: null,
      professional: null,
      enterprise: null
    };

    prices.data.forEach(price => {
      const product = price.product;
      
      // Determine plan type based on price ID or product metadata
      let planType = null;
      if (price.id === process.env.STRIPE_STARTER_PRICE_ID) {
        planType = 'starter';
      } else if (price.id === process.env.STRIPE_PROFESSIONAL_PRICE_ID) {
        planType = 'professional';
      } else if (price.id === process.env.STRIPE_ENTERPRISE_PRICE_ID) {
        planType = 'enterprise';
      }

      if (planType && price.type === 'recurring') {
        pricingData[planType] = {
          id: price.id,
          amount: price.unit_amount,
          currency: price.currency,
          interval: price.recurring.interval,
          productName: product.name,
          productDescription: product.description,
          features: product.metadata?.features ? JSON.parse(product.metadata.features) : []
        };
      }
    });

    res.json({ success: true, pricing: pricingData });
  } catch (error) {
    console.error('Error fetching pricing:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Webhook endpoint: http://localhost:${PORT}/api/webhook`);
}); 