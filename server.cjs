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
    const { priceId, customerEmail, userId, planType, signupData, successUrl, cancelUrl } = req.body;

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
        plan_type: planType,
      },
      allow_promotion_codes: true,
    };

    // Handle new signup (no userId) vs existing user
    if (!userId && signupData) {
      // New signup - store signup data in metadata for account creation after payment
      console.log('🆕 Creating checkout session for new signup');
      sessionConfig.metadata.signup_email = signupData.email;
      sessionConfig.metadata.signup_password = signupData.password;
      sessionConfig.metadata.signup_name = signupData.name;
      sessionConfig.metadata.needs_account_creation = 'true';
      sessionConfig.customer_email = customerEmail;
    } else if (userId) {
      // Existing user - check for existing subscription
      console.log('👤 Creating checkout session for existing user:', userId);
      sessionConfig.metadata.user_id = userId;
      
      const { data: existingSubscription } = await supabase
        .from('subscriptions')
        .select('stripe_customer_id, stripe_subscription_id, status')
        .eq('user_id', userId)
        .single();

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
        // For existing users without customer ID, use customer_email
        sessionConfig.customer_email = customerEmail;
      }

      // If user is currently on a trial, we need to handle the transition
      if (existingSubscription?.status === 'trialing') {
        console.log(`User ${userId} is converting from trial to paid subscription`);
        
        // Add metadata to indicate this is a trial conversion
        sessionConfig.metadata.trial_conversion = 'true';
        sessionConfig.metadata.original_trial_end = existingSubscription.current_period_end;
      }
    } else {
      return res.status(400).json({ success: false, error: 'Either userId or signupData is required' });
    }

    // Configure trial period only for starter plan
    if (planType === 'starter') {
      console.log('Creating starter plan subscription with trial period');
      // Set trial period at the subscription level
      sessionConfig.subscription_data = {
        trial_period_days: 7,
        metadata: {
          plan_type: planType,
          trial_plan: 'true'
        }
      };
    } else {
      console.log(`Creating ${planType} plan subscription - immediate billing`);
      // Professional and Enterprise plans start billing immediately
      // No trial period configured
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    res.json({ success: true, sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Webhook endpoint
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('🔔 Raw webhook request received');
  console.log('Headers:', req.headers);
  console.log('Body length:', req.body.length);
  console.log('🔐 Attempting to verify webhook signature...');

  try {
    console.log('📨 Webhook received:', event.type);
    console.log('Event ID:', event.id);
    console.log('Event data:', JSON.stringify(event.data, null, 2));

    switch (event.type) {
      case 'checkout.session.completed':
        console.log('🔄 Processing checkout.session.completed event...');
        const session = event.data.object;
        
        // Check if this is a new signup that needs account creation
        if (session.metadata?.needs_account_creation === 'true') {
          console.log('🆕 New signup detected - creating user account');
          
          try {
            // First check if user already exists by email
            const { data: existingUser, error: checkError } = await supabase.auth.admin.listUsers();
            const userExists = existingUser?.users?.find(u => u.email === session.metadata.signup_email);
            
            let newUserId;
            
            if (userExists) {
              console.log('✅ User already exists:', userExists.id);
              newUserId = userExists.id;
            } else {
              // Create the user account in Supabase Auth
              const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email: session.metadata.signup_email,
                password: session.metadata.signup_password,
                email_confirm: true, // Auto-confirm email since payment is complete
                user_metadata: {
                  name: session.metadata.signup_name
                }
              });

              if (authError) {
                console.error('❌ Error creating user account:', authError);
                break;
              }

              newUserId = authData.user.id;
              console.log('✅ User account created:', newUserId);
            }

            // Create user profile (use upsert to handle duplicates)
            const { error: profileError } = await supabase
              .from('users')
              .upsert({
                id: newUserId,
                email: session.metadata.signup_email,
                name: session.metadata.signup_name,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }, {
                onConflict: 'id'
              });

            if (profileError) {
              console.error('❌ Error creating user profile:', profileError);
            } else {
              console.log('✅ User profile created/updated');
            }

            // Create subscription record (use upsert to handle duplicates)
            const isStarterPlan = session.metadata.plan_type === 'starter';
            const subscriptionStatus = isStarterPlan ? 'trialing' : 'active';
            const periodEnd = isStarterPlan 
              ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days for trial
              : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days for paid plans

            const { error: subscriptionError } = await supabase
              .from('subscriptions')
              .upsert({
                user_id: newUserId,
                plan_type: session.metadata.plan_type,
                status: subscriptionStatus,
                current_period_start: new Date().toISOString(),
                current_period_end: periodEnd,
                cancel_at_period_end: false,
                stripe_subscription_id: null,
                stripe_customer_id: null
              }, {
                onConflict: 'user_id'
              });

            if (subscriptionError) {
              console.error('❌ Error creating subscription record:', subscriptionError);
            } else {
              console.log('✅ Subscription record created/updated');
            }

            // Update the session metadata with the new user ID for future webhook processing
            await stripe.checkout.sessions.update(session.id, {
              metadata: {
                ...session.metadata,
                user_id: newUserId,
                needs_account_creation: 'false'
              }
            });

            console.log('✅ Session metadata updated with new user ID');
          } catch (error) {
            console.error('❌ Error in account creation process:', error);
            break;
          }
        }

        // Extract user ID from metadata (check both possible keys)
        const userId = session.metadata?.user_id || session.metadata?.userId;
        if (!userId) {
          console.error('❌ No user ID found in session metadata');
          console.error('Available metadata:', session.metadata);
          break;
        }

        console.log('🔄 Processing checkout session for user:', userId);
        console.log('Session ID:', session.id);
        console.log('Subscription ID:', session.subscription);

        // If this is a trial subscription, update the database
        if (session.subscription) {
          try {
            // Get the subscription details from Stripe
            const subscription = await stripe.subscriptions.retrieve(session.subscription);
            console.log('📋 Stripe subscription details:', {
              id: subscription.id,
              status: subscription.status,
              trial_start: subscription.trial_start,
              trial_end: subscription.trial_end,
              current_period_start: subscription.current_period_start,
              current_period_end: subscription.current_period_end
            });

            // Update the database subscription with Stripe details
            const { data: updatedSub, error: updateError } = await supabase
              .from('subscriptions')
              .update({
                stripe_subscription_id: subscription.id,
                stripe_customer_id: subscription.customer,
                status: subscription.status,
                current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                cancel_at_period_end: subscription.cancel_at_period_end
              })
              .eq('user_id', userId)
              .select()
              .single();

            if (updateError) {
              console.error('❌ Error updating subscription:', updateError);
            } else {
              console.log('✅ Successfully linked Stripe subscription to database:', updatedSub);
            }
          } catch (stripeError) {
            console.error('❌ Error retrieving Stripe subscription:', stripeError);
          }
        }

        break;

      case 'customer.subscription.created':
        console.log('🔄 Processing customer.subscription.created event...');
        const newSubscription = event.data.object;
        
        // Find the user by customer ID
        const { data: userByCustomer, error: customerError } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', newSubscription.customer)
          .single();

        if (customerError) {
          console.error('❌ Error finding user by customer ID:', customerError);
          
          // If no user found by customer ID, try to find by subscription ID in metadata
          // This might happen if the checkout session was processed first
          try {
            const { data: sessions } = await stripe.checkout.sessions.list({
              subscription: newSubscription.id,
              limit: 1
            });
            
            if (sessions && sessions.data && sessions.data.length > 0) {
              const session = sessions.data[0];
              const userId = session.metadata?.user_id || session.metadata?.userId;
              
              if (userId) {
                console.log('🔄 Found user ID from session metadata:', userId);
                
                // Update the subscription with Stripe details
                const { data: updatedSub, error: updateError } = await supabase
                  .from('subscriptions')
                  .update({
                    stripe_subscription_id: newSubscription.id,
                    stripe_customer_id: newSubscription.customer,
                    status: newSubscription.status,
                    current_period_start: new Date(newSubscription.current_period_start * 1000).toISOString(),
                    current_period_end: new Date(newSubscription.current_period_end * 1000).toISOString(),
                    cancel_at_period_end: newSubscription.cancel_at_period_end
                  })
                  .eq('user_id', userId)
                  .select()
                  .single();

                if (updateError) {
                  console.error('❌ Error updating subscription:', updateError);
                } else {
                  console.log('✅ Successfully updated subscription:', updatedSub);
                }
              }
            } else {
              console.log('ℹ️ No checkout session found for subscription:', newSubscription.id);
            }
          } catch (stripeError) {
            console.error('❌ Error finding session by subscription ID:', stripeError);
          }
          break;
        }

        if (userByCustomer) {
          console.log('🔄 Updating subscription for user:', userByCustomer.user_id);
          
          const { data: updatedSub, error: updateError } = await supabase
            .from('subscriptions')
            .update({
              stripe_subscription_id: newSubscription.id,
              status: newSubscription.status,
              current_period_start: new Date(newSubscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(newSubscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: newSubscription.cancel_at_period_end
            })
            .eq('user_id', userByCustomer.user_id)
            .select()
            .single();

          if (updateError) {
            console.error('❌ Error updating subscription:', updateError);
          } else {
            console.log('✅ Successfully updated subscription:', updatedSub);
          }
        }
        break;

      case 'customer.subscription.updated':
        console.log('🔄 Processing customer.subscription.updated event...');
        const updatedSubscription = event.data.object;
        
        // Find the user by subscription ID
        const { data: userBySub, error: subError } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', updatedSubscription.id)
          .single();

        if (subError) {
          console.error('❌ Error finding user by subscription ID:', subError);
          break;
        }

        if (userBySub) {
          console.log('🔄 Updating subscription for user:', userBySub.user_id);
          
          const { data: updatedSub, error: updateError } = await supabase
            .from('subscriptions')
            .update({
              status: updatedSubscription.status,
              current_period_start: new Date(updatedSubscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(updatedSubscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: updatedSubscription.cancel_at_period_end
            })
            .eq('user_id', userBySub.user_id)
            .select()
            .single();

          if (updateError) {
            console.error('❌ Error updating subscription:', updateError);
          } else {
            console.log('✅ Successfully updated subscription:', updatedSub);
          }
        }
        break;

      default:
        console.log('⚠️ Unhandled event type:', event.type);
    }

    console.log('✅ Webhook processed successfully:', event.type);
    res.json({ received: true });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

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

    console.log(`🔍 Updating subscription ${subscriptionId} to price ${newPriceId}`);

    // Retrieve the subscription to find the subscription item ID
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const subscriptionItemId = subscription.items.data[0].id;

    console.log(`✅ Stripe subscription found: ${subscription.id}, customer: ${subscription.customer}`);

    // Determine the new plan type from the price ID
    let newPlanType = 'starter';
    if (newPriceId === process.env.STRIPE_PROFESSIONAL_PRICE_ID) {
      newPlanType = 'professional';
    } else if (newPriceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) {
      newPlanType = 'enterprise';
    }

    console.log(`📋 Plan type determined: ${newPlanType}`);

    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: subscriptionItemId,
        price: newPriceId,
      }],
      proration_behavior: 'create_prorations', // Prorate the changes
      metadata: {
        planType: newPlanType, // Add plan type to metadata for webhook
      }
    });

    console.log(`✅ Stripe subscription updated successfully: ${updatedSubscription.id}`);

    // Manually update the database since webhook might not fire immediately
    console.log(`🔍 Attempting to update database for subscription ${subscriptionId}...`);
    
    try {
      // First, check if the subscription exists in the database
      console.log(`🔍 Looking for subscription with stripe_subscription_id: ${subscriptionId}`);
      
      const { data: existingSub, error: checkError } = await supabase
        .from('subscriptions')
        .select('id, user_id, plan_type, stripe_subscription_id')
        .eq('stripe_subscription_id', subscriptionId)
        .single();

      if (checkError) {
        console.error('❌ Error checking existing subscription:', checkError);
        console.error('🔍 This might mean the subscription ID is not found in the database');
        
        // Let's also check what subscriptions exist in the database
        const { data: allSubs, error: listError } = await supabase
          .from('subscriptions')
          .select('id, user_id, plan_type, stripe_subscription_id')
          .limit(10);
        
        if (listError) {
          console.error('❌ Error listing subscriptions:', listError);
        } else {
          console.log('📋 Available subscriptions in database:', allSubs);
        }
        
        return res.status(404).json({ 
          success: false, 
          error: 'Subscription not found in database',
          stripeSuccess: true,
          databaseError: checkError.message,
          searchedFor: subscriptionId,
          availableSubscriptions: allSubs || []
        });
      }

      console.log(`✅ Found existing subscription in database:`, {
        id: existingSub.id,
        user_id: existingSub.user_id,
        current_plan: existingSub.plan_type,
        new_plan: newPlanType,
        stripe_subscription_id: existingSub.stripe_subscription_id
      });

      // Now attempt the update using user_id (which is unique)
      const { data: updateData, error: updateError } = await supabase
        .from('subscriptions')
        .update({
          plan_type: newPlanType,
          status: updatedSubscription.status,
          current_period_start: safeStripeTimestamp(updatedSubscription.current_period_start),
          current_period_end: safeStripeTimestamp(updatedSubscription.current_period_end),
          cancel_at_period_end: updatedSubscription.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', existingSub.user_id) // Use user_id since it's unique
        .select(); // Add select to see what was updated

      if (updateError) {
        console.error('❌ Database update failed:', updateError);
        console.error('Error details:', {
          code: updateError.code,
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint
        });
        
        // Return error to client so they know the database update failed
        return res.status(500).json({ 
          success: false, 
          error: 'Stripe updated but database sync failed',
          stripeSuccess: true,
          databaseError: updateError.message
        });
      } else {
        console.log(`✅ Database updated successfully for subscription ${subscriptionId}`);
        console.log('📋 Updated data:', updateData);
      }
    } catch (dbError) {
      console.error('❌ Database update exception:', dbError);
      console.error('Exception details:', {
        name: dbError.name,
        message: dbError.message,
        stack: dbError.stack
      });
      
      // Return error to client
      return res.status(500).json({ 
        success: false, 
        error: 'Database update failed',
        stripeSuccess: true,
        databaseError: dbError.message
      });
    }

    res.json({ 
      success: true, 
      subscription: updatedSubscription,
      planType: newPlanType,
      message: 'Subscription updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating subscription:', error);
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

    console.log(`Canceling subscription ${subscriptionId}`);

    const canceledSubscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    console.log(`Stripe subscription canceled successfully: ${canceledSubscription.id}`);

    // Manually update the database
    try {
      // First get the user_id from the subscription
      const { data: existingSub, error: checkError } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_subscription_id', subscriptionId)
        .single();

      if (checkError) {
        console.error('Error finding subscription for cancel:', checkError);
        return res.status(404).json({ 
          success: false, 
          error: 'Subscription not found in database',
          stripeSuccess: true,
          databaseError: checkError.message
        });
      }

      const { error } = await supabase
        .from('subscriptions')
        .update({
          cancel_at_period_end: true,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', existingSub.user_id); // Use user_id instead of stripe_subscription_id

      if (error) {
        console.error('Error updating subscription in database:', error);
        return res.status(500).json({ 
          success: false, 
          error: 'Database update failed',
          stripeSuccess: true,
          databaseError: error.message
        });
      } else {
        console.log(`Database updated successfully for canceled subscription ${subscriptionId}`);
      }
    } catch (dbError) {
      console.error('Database update failed:', dbError);
      return res.status(500).json({ 
        success: false, 
        error: 'Database update failed',
        stripeSuccess: true,
        databaseError: dbError.message
      });
    }

    res.json({ 
      success: true, 
      subscription: canceledSubscription,
      message: 'Subscription will be canceled at the end of the current period'
    });
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

    console.log(`Reactivating subscription ${subscriptionId}`);

    const reactivatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });

    console.log(`Stripe subscription reactivated successfully: ${reactivatedSubscription.id}`);

    // Manually update the database
    try {
      // First get the user_id from the subscription
      const { data: existingSub, error: checkError } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_subscription_id', subscriptionId)
        .single();

      if (checkError) {
        console.error('Error finding subscription for reactivate:', checkError);
        return res.status(404).json({ 
          success: false, 
          error: 'Subscription not found in database',
          stripeSuccess: true,
          databaseError: checkError.message
        });
      }

      const { error } = await supabase
        .from('subscriptions')
        .update({
          cancel_at_period_end: false,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', existingSub.user_id); // Use user_id instead of stripe_subscription_id

      if (error) {
        console.error('Error updating subscription in database:', error);
        return res.status(500).json({ 
          success: false, 
          error: 'Database update failed',
          stripeSuccess: true,
          databaseError: error.message
        });
      } else {
        console.log(`Database updated successfully for reactivated subscription ${subscriptionId}`);
      }
    } catch (dbError) {
      console.error('Database update failed:', dbError);
      return res.status(500).json({ 
        success: false, 
        error: 'Database update failed',
        stripeSuccess: true,
        databaseError: dbError.message
      });
    }

    res.json({ 
      success: true, 
      subscription: reactivatedSubscription,
      message: 'Subscription reactivated successfully'
    });
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

// Sync subscription data between Stripe and database
app.post('/api/sync-subscription', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    console.log(`🔄 Syncing subscription for user: ${userId}`);

    // Get subscription from database
    const { data: dbSubscription, error: dbError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({ success: false, error: 'Failed to get subscription from database' });
    }

    if (!dbSubscription) {
      return res.status(404).json({ success: false, error: 'No subscription found for user' });
    }

    console.log('Database subscription:', {
      id: dbSubscription.id,
      status: dbSubscription.status,
      plan_type: dbSubscription.plan_type,
      stripe_subscription_id: dbSubscription.stripe_subscription_id
    });

    // If no Stripe subscription ID, we can't sync
    if (!dbSubscription.stripe_subscription_id) {
      console.log('No Stripe subscription ID found, cannot sync');
      return res.json({ 
        success: true, 
        data: dbSubscription,
        message: 'No Stripe subscription to sync with'
      });
    }

    // Get subscription from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(dbSubscription.stripe_subscription_id);
    
    console.log('Stripe subscription:', {
      id: stripeSubscription.id,
      status: stripeSubscription.status,
      current_period_start: stripeSubscription.current_period_start,
      current_period_end: stripeSubscription.current_period_end
    });

    // Determine plan type from Stripe
    const priceId = stripeSubscription.items.data[0]?.price.id;
    let planType = 'starter';
    
    if (priceId === process.env.STRIPE_PROFESSIONAL_PRICE_ID) {
      planType = 'professional';
    } else if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) {
      planType = 'enterprise';
    }

    // Check if database needs updating
    const needsUpdate = 
      dbSubscription.status !== stripeSubscription.status ||
      dbSubscription.plan_type !== planType ||
      dbSubscription.current_period_start !== new Date(stripeSubscription.current_period_start * 1000).toISOString() ||
      dbSubscription.current_period_end !== new Date(stripeSubscription.current_period_end * 1000).toISOString() ||
      dbSubscription.cancel_at_period_end !== stripeSubscription.cancel_at_period_end;

    if (needsUpdate) {
      console.log('🔄 Database needs updating, syncing...');
      
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({
          status: stripeSubscription.status,
          plan_type: planType,
          current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: stripeSubscription.cancel_at_period_end,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId); // Use user_id instead of stripe_subscription_id

      if (updateError) {
        console.error('Error updating subscription:', updateError);
        return res.status(500).json({ success: false, error: 'Failed to update subscription' });
      }

      console.log('✅ Subscription synced successfully');
      
      // Get updated subscription
      const { data: updatedSubscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      return res.json({ 
        success: true, 
        data: updatedSubscription,
        message: 'Subscription synced successfully',
        changes: {
          status: { from: dbSubscription.status, to: stripeSubscription.status },
          plan_type: { from: dbSubscription.plan_type, to: planType }
        }
      });
    } else {
      console.log('✅ Database is already in sync');
      return res.json({ 
        success: true, 
        data: dbSubscription,
        message: 'Subscription is already in sync'
      });
    }

  } catch (error) {
    console.error('Error syncing subscription:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Comprehensive debug endpoint
app.get('/api/debug-subscription/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    console.log(`Debugging subscription for user: ${userId}`);

    // Get current subscription from database
    const { data: dbSubscription, error: dbError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({ success: false, error: 'Failed to get subscription from database' });
    }

    if (!dbSubscription) {
      return res.status(404).json({ success: false, error: 'No subscription found for user' });
    }

    let stripeData = null;
    let stripeError = null;

    // If there's a Stripe subscription ID, get the Stripe data
    if (dbSubscription.stripe_subscription_id) {
      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(dbSubscription.stripe_subscription_id);
        stripeData = {
          id: stripeSubscription.id,
          status: stripeSubscription.status,
          plan_type: stripeSubscription.items.data[0]?.price.id,
          current_period_start: stripeSubscription.current_period_start,
          current_period_end: stripeSubscription.current_period_end,
          cancel_at_period_end: stripeSubscription.cancel_at_period_end,
        };
      } catch (error) {
        stripeError = error.message;
      }
    }

    // Analyze the situation
    const analysis = {
      hasStripeId: !!dbSubscription.stripe_subscription_id,
      isTrial: dbSubscription.status === 'trialing',
      isActive: dbSubscription.status === 'active',
      stripeStatus: stripeData?.status,
      statusMismatch: dbSubscription.status !== stripeData?.status,
      needsConversion: dbSubscription.status === 'trialing' && stripeData?.status === 'active',
    };

    console.log('Debug analysis:', analysis);

    res.json({ 
      success: true, 
      database: dbSubscription,
      stripe: stripeData,
      stripeError,
      analysis,
      recommendations: getRecommendations(analysis, dbSubscription, stripeData)
    });

  } catch (error) {
    console.error('Error debugging subscription:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

function getRecommendations(analysis, dbSubscription, stripeData) {
  const recommendations = [];

  if (analysis.needsConversion) {
    recommendations.push('Run fix-trial-conversion endpoint to convert trial to active');
  }

  if (analysis.statusMismatch) {
    recommendations.push('Database and Stripe status are different - sync needed');
  }

  if (analysis.isTrial && !analysis.hasStripeId) {
    recommendations.push('Valid trial subscription - no action needed');
  }

  if (analysis.isActive) {
    recommendations.push('Subscription is already active - no action needed');
  }

  return recommendations;
}

// Test database connectivity and permissions
app.get('/api/test-db', async (req, res) => {
  try {
    console.log('Testing database connectivity...');
    
    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('subscriptions')
      .select('count(*)')
      .limit(1);
    
    if (testError) {
      console.error('Database connection test failed:', testError);
      return res.status(500).json({ 
        success: false, 
        error: 'Database connection failed',
        details: testError
      });
    }
    
    console.log('Database connection successful');
    
    // Test RLS policies by trying to read subscriptions
    const { data: subscriptions, error: rlsError } = await supabase
      .from('subscriptions')
      .select('id, user_id, plan_type, status')
      .limit(5);
    
    if (rlsError) {
      console.error('RLS test failed:', rlsError);
      return res.status(500).json({ 
        success: false, 
        error: 'RLS policy test failed',
        details: rlsError
      });
    }
    
    console.log('RLS test successful, found subscriptions:', subscriptions?.length || 0);
    
    res.json({ 
      success: true, 
      message: 'Database connectivity and permissions test passed',
      subscriptionCount: subscriptions?.length || 0,
      sampleData: subscriptions?.slice(0, 2) || []
    });
    
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Database test failed',
      details: error.message
    });
  }
});

// List all subscriptions in database (for debugging)
app.get('/api/list-subscriptions', async (req, res) => {
  try {
    console.log('Listing all subscriptions in database...');
    
    const { data: subscriptions, error } = await supabase
      .from('subscriptions')
      .select('id, user_id, plan_type, status, stripe_subscription_id, stripe_customer_id, created_at, updated_at')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error listing subscriptions:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to list subscriptions',
        details: error
      });
    }
    
    console.log(`Found ${subscriptions?.length || 0} subscriptions in database`);
    
    res.json({ 
      success: true, 
      count: subscriptions?.length || 0,
      subscriptions: subscriptions || []
    });
    
  } catch (error) {
    console.error('Error listing subscriptions:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to list subscriptions',
      details: error.message
    });
  }
});

// Fix trial conversion endpoint
app.post('/api/fix-trial-conversion', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    console.log(`🔧 Fixing trial conversion for user: ${userId}`);

    // Get current subscription
    const { data: subscription, error: dbError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({ success: false, error: 'Failed to get subscription' });
    }

    if (!subscription) {
      return res.status(404).json({ success: false, error: 'No subscription found' });
    }

    console.log('Current subscription:', {
      status: subscription.status,
      plan_type: subscription.plan_type,
      stripe_subscription_id: subscription.stripe_subscription_id
    });

    // If subscription is already active, no need to fix
    if (subscription.status === 'active') {
      return res.json({ 
        success: true, 
        message: 'Subscription is already active',
        subscription 
      });
    }

    // Update subscription status to active
    const { data: updatedSub, error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        cancel_at_period_end: false
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating subscription:', updateError);
      return res.status(500).json({ success: false, error: 'Failed to update subscription' });
    }

    console.log('✅ Trial conversion fixed successfully');
    res.json({ 
      success: true, 
      message: 'Trial conversion fixed successfully',
      subscription: updatedSub
    });

  } catch (error) {
    console.error('Error fixing trial conversion:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Manual upgrade endpoint
app.post('/api/manual-upgrade', async (req, res) => {
  try {
    const { userId, planType = 'starter' } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    console.log(`🔧 Manual upgrade requested for user: ${userId} to plan: ${planType}`);

    // Get current subscription
    const { data: subscription, error: dbError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({ success: false, error: 'Failed to get subscription' });
    }

    if (!subscription) {
      return res.status(404).json({ success: false, error: 'No subscription found' });
    }

    console.log('Current subscription:', {
      status: subscription.status,
      plan_type: subscription.plan_type,
      stripe_subscription_id: subscription.stripe_subscription_id
    });

    // Update subscription to active status and specified plan
    const { data: updatedSub, error: updateError } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        plan_type: planType,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        cancel_at_period_end: false
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating subscription:', updateError);
      return res.status(500).json({ success: false, error: 'Failed to update subscription' });
    }

    console.log('✅ Manual upgrade successful');
    res.json({ 
      success: true, 
      message: 'Manual upgrade successful',
      changes: {
        from: { status: subscription.status, plan_type: subscription.plan_type },
        to: { status: updatedSub.status, plan_type: updatedSub.plan_type }
      },
      subscription: updatedSub
    });

  } catch (error) {
    console.error('Error with manual upgrade:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create trial subscription endpoint
app.post('/api/create-stripe-trial', async (req, res) => {
  try {
    const { userId, email, name, planType = 'starter' } = req.body;
    
    if (!userId || !email) {
      return res.status(400).json({ success: false, error: 'User ID and email are required' });
    }

    console.log('🔄 Creating Stripe trial subscription for user:', userId);

    // Get the price ID for the plan
    const priceId = STRIPE_PRODUCTS[planType];
    if (!priceId) {
      return res.status(400).json({ success: false, error: 'Invalid plan type' });
    }

    // Create or get customer
    let customer;
    const { data: existingCustomers } = await stripe.customers.list({
      email: email,
      limit: 1
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
      console.log('✅ Found existing customer:', customer.id);
    } else {
      customer = await stripe.customers.create({
        email: email,
        name: name,
        metadata: {
          user_id: userId
        }
      });
      console.log('✅ Created new customer:', customer.id);
    }

    // Create subscription with trial
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      trial_period_days: 7,
      metadata: {
        user_id: userId,
        plan_type: planType,
        trial_plan: 'true'
      },
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    console.log('✅ Created trial subscription:', subscription.id);

    // Update database subscription with Stripe IDs
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        stripe_subscription_id: subscription.id,
        stripe_customer_id: customer.id,
        status: 'trialing',
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('❌ Error updating database subscription:', updateError);
      return res.status(500).json({ success: false, error: 'Failed to update database' });
    }

    console.log('✅ Database subscription updated with Stripe IDs');

    res.json({
      success: true,
      subscription: {
        id: subscription.id,
        customerId: customer.id,
        status: subscription.status,
        trialEnd: subscription.trial_end
      }
    });

  } catch (error) {
    console.error('❌ Error creating Stripe trial subscription:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to create trial subscription' 
    });
  }
});

// Fix billing dates endpoint
app.post('/api/fix-billing-dates', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    console.log('🔧 Fixing billing dates for user:', userId);

    // Get current subscription
    const { data: subscription, error: dbError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({ success: false, error: 'Failed to get subscription' });
    }

    if (!subscription) {
      return res.status(404).json({ success: false, error: 'No subscription found' });
    }

    // If there's a Stripe subscription ID, get the correct billing dates from Stripe
    if (subscription.stripe_subscription_id) {
      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);
        
        const { data: updatedSub, error: updateError } = await supabase
          .from('subscriptions')
          .update({
            current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString()
          })
          .eq('user_id', userId)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating billing dates:', updateError);
          return res.status(500).json({ success: false, error: 'Failed to update billing dates' });
        }

        console.log('✅ Billing dates fixed from Stripe data');
        res.json({ 
          success: true, 
          message: 'Billing dates fixed from Stripe data',
          subscription: updatedSub
        });
        return;
      } catch (stripeError) {
        console.error('Error retrieving Stripe subscription:', stripeError);
      }
    }

    // Fallback: calculate billing dates manually
    const now = new Date();
    const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    const { data: updatedSub, error: updateError } = await supabase
      .from('subscriptions')
      .update({
        current_period_start: now.toISOString(),
        current_period_end: endDate.toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating billing dates:', updateError);
      return res.status(500).json({ success: false, error: 'Failed to update billing dates' });
    }

    console.log('✅ Billing dates fixed manually');
    res.json({ 
      success: true, 
      message: 'Billing dates fixed manually',
      subscription: updatedSub
    });

  } catch (error) {
    console.error('Error fixing billing dates:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Change plan endpoint
app.post('/api/change-plan', async (req, res) => {
  try {
    const { userId, newPlanType } = req.body;
    
    if (!userId || !newPlanType) {
      return res.status(400).json({ success: false, error: 'User ID and new plan type are required' });
    }

    console.log(`🔄 Changing plan for user ${userId} to ${newPlanType}`);

    // Get current subscription
    const { data: subscription, error: dbError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({ success: false, error: 'Failed to get subscription' });
    }

    if (!subscription) {
      return res.status(404).json({ success: false, error: 'No subscription found' });
    }

    console.log('Current subscription:', {
      status: subscription.status,
      plan_type: subscription.plan_type,
      stripe_subscription_id: subscription.stripe_subscription_id
    });

    // If user has a Stripe subscription, update it there too
    if (subscription.stripe_subscription_id) {
      try {
        // Determine the new price ID
        let newPriceId;
        switch (newPlanType) {
          case 'starter':
            newPriceId = process.env.STRIPE_STARTER_PRICE_ID;
            break;
          case 'professional':
            newPriceId = process.env.STRIPE_PROFESSIONAL_PRICE_ID;
            break;
          case 'enterprise':
            newPriceId = process.env.STRIPE_ENTERPRISE_PRICE_ID;
            break;
          default:
            return res.status(400).json({ success: false, error: 'Invalid plan type' });
        }

        // Update the Stripe subscription
        const updatedStripeSub = await stripe.subscriptions.update(subscription.stripe_subscription_id, {
          items: [{
            id: (await stripe.subscriptions.retrieve(subscription.stripe_subscription_id)).items.data[0].id,
            price: newPriceId,
          }],
          proration_behavior: 'create_prorations',
          metadata: {
            planType: newPlanType,
          }
        });

        console.log('✅ Stripe subscription updated');
      } catch (stripeError) {
        console.error('Error updating Stripe subscription:', stripeError);
        // Continue with database update even if Stripe fails
      }
    } else {
      console.log('Trial user - updating database only...');
    }

    // Update the database
    const { data: updatedSub, error: updateError } = await supabase
      .from('subscriptions')
      .update({
        plan_type: newPlanType
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating database:', updateError);
      return res.status(500).json({ success: false, error: 'Failed to update database' });
    }

    console.log('✅ Plan change successful');
    res.json({ 
      success: true, 
      message: 'Plan changed successfully',
      changes: {
        from: subscription.plan_type,
        to: newPlanType
      },
      subscription: updatedSub
    });

  } catch (error) {
    console.error('Error changing plan:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get subscription endpoint
app.post('/api/get-subscription', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }

    console.log('🔍 Getting subscription for user:', userId);

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No subscription found
        return res.json({ success: true, subscription: null });
      }
      console.error('❌ Database error:', error);
      return res.status(500).json({ success: false, error: 'Database error' });
    }

    console.log('✅ Found subscription:', subscription);

    res.json({
      success: true,
      subscription: subscription
    });

  } catch (error) {
    console.error('❌ Error getting subscription:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to get subscription' 
    });
  }
});

// Get session data endpoint
app.get('/api/get-session', async (req, res) => {
  try {
    const { session_id } = req.query;
    
    if (!session_id) {
      return res.status(400).json({ success: false, error: 'Session ID is required' });
    }

    console.log('🔍 Getting session data for:', session_id);

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    const sessionData = {
      customer_email: session.customer_details?.email || session.customer_email,
      plan_type: session.metadata?.plan_type || 'starter',
      amount_total: session.amount_total || 0,
      currency: session.currency || 'gbp',
      subscription_status: session.payment_status === 'paid' ? 'active' : 'pending'
    };

    console.log('✅ Session data retrieved:', sessionData);

    res.json({
      success: true,
      session: sessionData
    });

  } catch (error) {
    console.error('❌ Error getting session data:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to get session data' 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Webhook endpoint: http://localhost:${PORT}/api/webhook`);
});