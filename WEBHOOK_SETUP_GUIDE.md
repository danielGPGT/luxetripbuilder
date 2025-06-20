# Stripe Webhook Setup Guide

## 🎯 Complete Webhook Integration

Your webhook is now fully configured to handle all Stripe subscription events and automatically update your database!

## 📋 What the Webhook Handles

### ✅ **Supported Events**
- `checkout.session.completed` - New subscription created
- `customer.subscription.created` - Subscription activated
- `customer.subscription.updated` - Plan changes, status updates
- `customer.subscription.deleted` - Subscription canceled
- `invoice.payment_succeeded` - Payment successful, reactivate if needed
- `invoice.payment_failed` - Payment failed, mark as past_due

### 🔄 **Database Updates**
- Creates/updates subscription records
- Tracks subscription status changes
- Updates billing periods
- Handles plan upgrades/downgrades
- Manages payment failures

## 🚀 Setup Instructions

### 1. Configure Environment Variables

**Update `server.env`:**
```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Stripe Price IDs (for plan type detection)
STRIPE_STARTER_PRICE_ID=price_starter_id_here
STRIPE_PROFESSIONAL_PRICE_ID=price_professional_id_here
STRIPE_ENTERPRISE_PRICE_ID=price_enterprise_id_here

# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Server Configuration
PORT=3001
```

### 2. Get Your Supabase Service Role Key

1. **Go to Supabase Dashboard** → Settings → API
2. **Copy the Service Role Key** (not the anon key)
3. **Add it to `server.env`**

### 3. Set Up Stripe Webhook Endpoint

#### Option A: Local Testing with ngrok
```bash
# Install ngrok
npm install -g ngrok

# Start your server
npm run server

# In another terminal, expose your webhook
ngrok http 3001

# Copy the ngrok URL (e.g., https://abc123.ngrok.io)
```

#### Option B: Production Deployment
Deploy your server to Vercel/Railway and use the production URL.

### 4. Configure Stripe Webhook

1. **Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)**
2. **Click "Add endpoint"**
3. **Enter your webhook URL:**
   - Local: `https://your-ngrok-url.ngrok.io/api/webhook`
   - Production: `https://your-domain.com/api/webhook`
4. **Select these events:**
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. **Copy the webhook secret** and add to `server.env`

## 🧪 Testing Your Webhook

### Method 1: Use the Test Script
```bash
# Start your server first
npm run server

# In another terminal, run the test
node test-webhook.js
```

### Method 2: Test with Real Stripe Events
1. **Go to Stripe Dashboard** → Webhooks
2. **Click on your webhook endpoint**
3. **Click "Send test webhook"**
4. **Select an event type** and send it
5. **Check your server logs** for processing

### Method 3: Test Complete Flow
1. **Start both servers:** `npm run dev:full`
2. **Go to Pricing page** and subscribe
3. **Complete payment** with test card
4. **Check database** for subscription record
5. **Verify tier restrictions** work properly

## 🔍 Monitoring Webhook Events

### Server Logs
Your server will log all webhook events:
```
Received webhook event: checkout.session.completed
Processing checkout session completed: cs_test_...
Subscription created/updated for user test-user-123
```

### Database Verification
Check your `subscriptions` table after events:
```sql
SELECT * FROM subscriptions ORDER BY updated_at DESC LIMIT 5;
```

### Stripe Dashboard
- **Webhooks** → View event history
- **Subscriptions** → See subscription status
- **Logs** → Check for any errors

## 🛠️ Webhook Event Handlers

### `handleCheckoutSessionCompleted`
- Extracts user_id and plan_type from metadata
- Retrieves full subscription details from Stripe
- Creates/updates subscription in database

### `handleSubscriptionCreated`
- Determines plan type from price ID
- Creates subscription record with full details
- Handles metadata extraction from customer

### `handleSubscriptionUpdated`
- Updates existing subscription in database
- Handles plan changes and status updates
- Maintains billing period information

### `handleSubscriptionDeleted`
- Marks subscription as canceled
- Sets cancel_at_period_end flag
- Preserves subscription history

### `handleInvoicePaymentSucceeded`
- Reactivates subscriptions if they were past_due
- Updates subscription status to active
- Handles successful payment recovery

### `handleInvoicePaymentFailed`
- Marks subscription as past_due
- Triggers payment failure handling
- Maintains subscription for retry

## 🔒 Security Features

- ✅ **Signature verification** - Validates webhook authenticity
- ✅ **Error handling** - Graceful failure recovery
- ✅ **Database transactions** - Atomic updates
- ✅ **Logging** - Complete audit trail
- ✅ **Service role key** - Secure database access

## 🚨 Troubleshooting

### "Webhook signature verification failed"
- Check your webhook secret in `server.env`
- Ensure you're using the correct secret from Stripe

### "Subscription not found in database"
- Check if subscription was created properly
- Verify user_id mapping in metadata

### "Error updating subscription in database"
- Check Supabase service role key
- Verify database permissions
- Check subscription table schema

### "CORS error"
- Ensure server is running on correct port
- Check CORS configuration in server.js

## 🎯 Production Checklist

- [ ] **Environment variables** configured
- [ ] **Webhook endpoint** deployed and accessible
- [ ] **Stripe webhook** configured with correct URL
- [ ] **Database permissions** set up correctly
- [ ] **Error monitoring** in place
- [ ] **Logs** being collected
- [ ] **Test events** processed successfully

Your webhook is now production-ready! 🎉 