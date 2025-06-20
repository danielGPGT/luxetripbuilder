import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.0.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, ...data } = await req.json()

    switch (action) {
      case 'create-customer':
        return await handleCreateCustomer(data)
      case 'create-checkout-session':
        return await handleCreateCheckoutSession(data)
      case 'update-subscription':
        return await handleUpdateSubscription(data)
      case 'cancel-subscription':
        return await handleCancelSubscription(data)
      case 'reactivate-subscription':
        return await handleReactivateSubscription(data)
      case 'billing-portal':
        return await handleBillingPortal(data)
      case 'webhook':
        return await handleWebhook(req)
      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid action' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function handleCreateCustomer({ userId, email, name }: any) {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        userId,
      },
    })

    return new Response(
      JSON.stringify({ success: true, customerId: customer.id }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Error creating customer:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to create customer' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}

async function handleCreateCheckoutSession({ 
  userId, 
  priceId, 
  planType, 
  customerEmail, 
  customerName,
  successUrl,
  cancelUrl 
}: any) {
  try {
    // Create or get customer
    let customer
    const existingCustomers = await stripe.customers.list({
      email: customerEmail,
      limit: 1,
    })

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0]
    } else {
      customer = await stripe.customers.create({
        email: customerEmail,
        name: customerName,
        metadata: { userId },
      })
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
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
        userId,
        planType,
      },
      subscription_data: {
        metadata: {
          userId,
          planType,
        },
      },
    })

    return new Response(
      JSON.stringify({ success: true, sessionId: session.id }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to create checkout session' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}

async function handleUpdateSubscription({ 
  subscriptionId, 
  newPriceId, 
  userId, 
  newPlanType 
}: any) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    
    // Update the subscription with the new price
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      metadata: {
        userId,
        planType: newPlanType,
      },
    })

    return new Response(
      JSON.stringify({ success: true, subscription: updatedSubscription }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Error updating subscription:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to update subscription' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}

async function handleCancelSubscription({ subscriptionId }: any) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    })

    return new Response(
      JSON.stringify({ success: true, subscription }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Error canceling subscription:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to cancel subscription' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}

async function handleReactivateSubscription({ subscriptionId }: any) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    })

    return new Response(
      JSON.stringify({ success: true, subscription }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Error reactivating subscription:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to reactivate subscription' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}

async function handleBillingPortal({ customerId, returnUrl }: any) {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })

    return new Response(
      JSON.stringify({ success: true, url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Error creating billing portal session:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to create billing portal session' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}

async function handleWebhook(req: Request) {
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()
  
  if (!signature) {
    return new Response(
      JSON.stringify({ success: false, error: 'No signature provided' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''
    )

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionCancellation(event.data.object)
        break
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object)
        break
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Webhook signature verification failed' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}

async function handleSubscriptionChange(subscription: any) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    // Use upsert since user_id is unique in the subscriptions table
    const { error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: subscription.metadata.userId,
        stripe_subscription_id: subscription.id,
        plan_type: subscription.metadata.planType,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        stripe_customer_id: subscription.customer,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      })

    if (error) {
      console.error('Error updating subscription in database:', error)
    }
  } catch (error) {
    console.error('Error handling subscription change:', error)
  }
}

async function handleSubscriptionCancellation(subscription: any) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id)

    if (error) {
      console.error('Error updating subscription in database:', error)
    }
  } catch (error) {
    console.error('Error handling subscription cancellation:', error)
  }
}

async function handlePaymentSucceeded(invoice: any) {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    // Get subscription for this invoice
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('id, user_id')
      .eq('stripe_subscription_id', invoice.subscription)
      .single()

    if (subscription) {
      // Record payment in billing history
      const { error } = await supabase
        .from('billing_history')
        .insert({
          user_id: subscription.user_id,
          subscription_id: subscription.id,
          stripe_invoice_id: invoice.id,
          amount: invoice.amount_paid,
          currency: invoice.currency,
          status: invoice.status,
          billing_reason: invoice.billing_reason,
        })

      if (error) {
        console.error('Error recording payment:', error)
      }
    }
  } catch (error) {
    console.error('Error handling payment succeeded:', error)
  }
}

async function handlePaymentFailed(invoice: any) {
  console.log('Payment failed:', invoice.id)
  // Handle failed payment logic here
} 