# 🚀 MVP Launch Plan - CPN v4 by 5pm Today

## Overview
Transform CPN v3 (localStorage-only) into CPN v4 (production-ready with Supabase + Stripe) and deploy live by 5pm.

## Step-by-Step Execution Plan

### Phase 1: Repository Setup (15 mins)
1. **Clone to v4**
   - `cp -r CPN-V3-Onboarding-Flow-No-Auth-no-Stripe CPN-v4-Production`
   - Update package.json name to "cpn-v4"
   - Initialize new git repo or branch

### Phase 2: Quick Deploy (30 mins)
2. **Deploy to Vercel immediately**
   - Push to GitHub
   - Connect Vercel to repo
   - Get live URL working (even with localStorage)
   - This gives us a live site to iterate on

### Phase 3: Supabase Setup (1 hour)
3. **Database & Auth**
   - Create Supabase project
   - Set up database schema:
     - `users` table (id, email, created_at, subscription_status)
     - `girls` table (id, user_id, name, age, nationality, rating)
     - `data_entries` table (id, girl_id, date, amount_spent, duration, nuts)
   - Enable Auth with email/magic link
   - Get API keys and connection string

4. **Connect via MCP**
   - Install Supabase MCP server locally
   - Configure connection
   - Test database operations

### Phase 4: Code Integration (2-3 hours)
5. **Auth Integration**
   - Add Supabase client setup (`lib/supabase.ts`)
   - Replace localStorage with Supabase calls
   - Update context.tsx to use Supabase
   - Add auth wrapper to layout
   - Update onboarding step 3 to use real email auth

6. **Data Migration**
   - Update storage.ts to use Supabase
   - Migrate CRUD operations
   - Keep localStorage as fallback for anonymous users
   - Test data persistence

### Phase 5: Payments (1-2 hours)
7. **Stripe Integration**
   - Set up Stripe account & get keys
   - Add Stripe checkout to subscription page
   - Create webhook endpoint for subscription status
   - Update paywall modals with real checkout
   - Test payment flow

### Phase 6: Testing & Polish (1 hour)
8. **End-to-end Testing**
   - New user signup flow
   - Add girl → Add data → View metrics
   - Hit paywall → Subscribe → Access premium
   - Verify data persists across sessions
   - Quick mobile UI fixes if time

## Environment Variables Needed
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Existing
NEXT_PUBLIC_REWARDFUL_API_KEY=2dfb17
REWARDFUL_SECRET_KEY=
```

## Quick Wins Strategy
- **Deploy first, enhance live** - Get it on Vercel ASAP
- **Hack together** - Don't refactor, just make it work
- **Use Supabase RLS** - Let Supabase handle security
- **Stripe Checkout** - Use hosted checkout, not custom forms
- **Skip perfection** - Focus on working MVP
- **Test with real money** - Use Stripe test mode but real flow

## Fallback Options
- If Stripe takes too long → Launch with "Contact for Premium"
- If Supabase auth complex → Start with anonymous + email collection
- If time runs out → Deploy what works, iterate after

## Success Metrics
✅ Live URL accepting real users
✅ Users can sign up and log in
✅ Data persists in Supabase
✅ Payment flow works (even if test mode)
✅ Core features functional on mobile

## Todo List for Tracking
1. Clone repository to CPN-v4
2. Deploy to Vercel for immediate live access
3. Set up Supabase database and authentication
4. Integrate Stripe payment processing
5. Connect Supabase to app via MCP
6. Migrate localStorage to Supabase
7. Test end-to-end customer flow
8. Quick mobile design fixes if time permits

Ready to start hacking! 🔨