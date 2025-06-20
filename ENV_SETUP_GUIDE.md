# Environment Variables Setup Guide

You need to set up your `.env.local` file for the Stripe integration to work. Here's what you need:

## 📝 **Create/Update `.env.local`**

Add these variables to your `.env.local` file in your project root:

```env
# Supabase Configuration (you probably already have these)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Stripe Configuration (NEW - you need to add these)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
VITE_STRIPE_STARTER_PRICE_ID=price_your_starter_price_id_here
VITE_STRIPE_PROFESSIONAL_PRICE_ID=price_your_professional_price_id_here
VITE_STRIPE_ENTERPRISE_PRICE_ID=price_your_enterprise_price_id_here

# Optional
VITE_APP_URL=http://localhost:5173
```

## 🔑 **Where to Get These Values**

### **Supabase Values** (if you don't have them):
1. Go to your **Supabase Dashboard**
2. Click on your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

### **Stripe Values** (you need to get these):

#### 1. **Publishable Key**:
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to **Developers** → **API Keys**
3. Copy the **Publishable key** (starts with `pk_test_` or `pk_live_`)
4. Add to `VITE_STRIPE_PUBLISHABLE_KEY`

#### 2. **Price IDs**:
1. Go to **Products** in Stripe Dashboard
2. Create your products (if you haven't already):

**Starter Plan:**
- Name: Starter Plan
- Price: $29/month
- Copy the Price ID (starts with `price_`)
- Add to `VITE_STRIPE_STARTER_PRICE_ID`

**Professional Plan:**
- Name: Professional Plan  
- Price: $79/month
- Copy the Price ID (starts with `price_`)
- Add to `VITE_STRIPE_PROFESSIONAL_PRICE_ID`

**Enterprise Plan:**
- Name: Enterprise Plan
- Price: Custom
- Copy the Price ID (starts with `price_`)
- Add to `VITE_STRIPE_ENTERPRISE_PRICE_ID`

## 🚨 **Important Notes**

### **Test vs Live Mode:**
- Use `pk_test_` keys for development
- Use `pk_live_` keys for production
- Never commit your `.env.local` file to git

### **File Location:**
- Create `.env.local` in your project root (same level as `package.json`)
- Make sure it's in your `.gitignore` file

### **Restart Required:**
- After adding environment variables, restart your development server:
  ```bash
  npm run dev
  ```

## ✅ **Verification**

To verify your environment variables are working:

1. **Check in your code:**
   ```typescript
   console.log('Stripe Key:', import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
   console.log('Starter Price:', import.meta.env.VITE_STRIPE_STARTER_PRICE_ID);
   ```

2. **Test the integration:**
   - Go to your Pricing page
   - Click "Subscribe" on a plan
   - You should be redirected to Stripe Checkout

## 🔧 **Troubleshooting**

### **"Environment variable not found" error:**
- Make sure the file is named `.env.local` (not `.env`)
- Make sure you're using `VITE_` prefix
- Restart your development server

### **"Stripe failed to initialize" error:**
- Check that your `VITE_STRIPE_PUBLISHABLE_KEY` is correct
- Make sure you're using the right key (test vs live)

### **"Invalid price ID" error:**
- Verify your price IDs are correct
- Make sure you're using test price IDs with test keys

## 📋 **Complete Example**

Here's what your `.env.local` should look like:

```env
# Supabase
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567BCD890EFG
VITE_STRIPE_STARTER_PRICE_ID=price_1ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567BCD890EFG
VITE_STRIPE_PROFESSIONAL_PRICE_ID=price_1DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567BCD890EFG123ABC
VITE_STRIPE_ENTERPRISE_PRICE_ID=price_1GHI789JKL012MNO345PQR678STU901VWX234YZA567BCD890EFG123ABC456DEF
```

Once you have these set up, your Stripe integration will work! 🎉 