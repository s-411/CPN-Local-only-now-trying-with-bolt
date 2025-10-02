# CPN v2 Onboarding Implementation Checklist

## Pre-Development Setup

### Dependencies & Configuration
- [ ] Install Clerk authentication packages: `@clerk/nextjs`
- [ ] Configure Clerk environment variables (publishable key, secret key, URLs)
- [ ] Setup Stripe subscription products and pricing (Player Mode: $1.99/week, Lifetime: $27)
- [ ] Configure Stripe webhooks for payment processing
- [ ] Add Supabase schema extensions for user subscriptions and usage tracking

### Environment Variables Required
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/onboarding/step-3
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding/results

# Stripe Payment Processing  
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PLAYER_MODE_PRICE_ID=price_xxxxx
STRIPE_LIFETIME_PRICE_ID=price_yyyyy

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_LANDING_PAGE_URL=https://landing.cpnapp.com
```

## Phase 1: Core Architecture (Week 1)

### Onboarding Directory Structure
- [ ] Create `/onboarding` folder in project root
- [ ] Create subdirectories:
  - [ ] `/onboarding/components` - Onboarding-specific components
  - [ ] `/onboarding/context` - State management for onboarding flow
  - [ ] `/onboarding/lib` - Utilities and helper functions
  - [ ] `/onboarding/types` - TypeScript interfaces for onboarding

### Session Storage Management
- [ ] **File**: `/onboarding/lib/sessionStorage.ts`
  - [ ] Create session storage utilities for onboarding data
  - [ ] Implement auto-save functionality
  - [ ] Add session recovery on page refresh
  - [ ] Build data migration helpers

- [ ] **File**: `/onboarding/context/OnboardingContext.tsx`
  - [ ] Create OnboardingProvider with useReducer pattern
  - [ ] Define OnboardingState interface
  - [ ] Implement OnboardingActions (SET_GIRL_DATA, SET_EXPENSE_DATA, etc.)
  - [ ] Add session persistence integration
  - [ ] Create custom hooks: useOnboarding(), useOnboardingProgress()

- [ ] **File**: `/onboarding/types/index.ts`
  - [ ] Define OnboardingState interface
  - [ ] Define OnboardingSession interface for storage
  - [ ] Define subscription tier types
  - [ ] Export all onboarding-specific types

### Layout and Navigation
- [ ] **File**: `/onboarding/components/OnboardingLayout.tsx`
  - [ ] Create clean layout with no navigation/sidebar
  - [ ] Add step progression indicator (optional)
  - [ ] Implement consistent spacing and typography
  - [ ] Add error boundary for onboarding flow

### Step 1: Girl Profile Form
- [ ] **File**: `/app/onboarding/step-1/page.tsx`
  - [ ] Create step 1 page component
  - [ ] Add OnboardingProvider wrapper
  - [ ] Implement form submission and validation
  - [ ] Add navigation to step 2

- [ ] **File**: `/onboarding/components/OnboardingGirlForm.tsx`
  - [ ] Adapt AddGirlModal form structure (simplified fields)
  - [ ] Include: Name, Age, Hair Color (optional), Rating (tile-based)
  - [ ] Implement real-time validation
  - [ ] Add session storage integration
  - [ ] Style with existing design system (input-cpn, btn-cpn)

### Step 2: Expense Entry Form  
- [ ] **File**: `/app/onboarding/step-2/page.tsx`
  - [ ] Create step 2 page component
  - [ ] Load girl data from session storage
  - [ ] Implement form submission and validation
  - [ ] Add navigation to step 3

- [ ] **File**: `/onboarding/components/OnboardingExpenseForm.tsx`
  - [ ] Adapt expense form from `/girls/[id]/add-data/page.tsx`
  - [ ] Include: Date, Amount Spent, Time (hours/minutes), Number of Nuts
  - [ ] Implement form validation matching main app
  - [ ] Add session storage integration
  - [ ] Style consistently with step 1

### Shared Components
- [ ] **File**: `/onboarding/components/StepIndicator.tsx` (optional)
  - [ ] Create visual step progression indicator
  - [ ] Show current step and completed steps
  - [ ] Match app design system

## Phase 2: Authentication & Account Creation (Week 2)

### Email Collection & Verification
- [ ] **File**: `/app/onboarding/step-3/page.tsx`
  - [ ] Create email collection page
  - [ ] Integrate with Clerk useSignUp hook
  - [ ] Implement 6-digit verification code flow
  - [ ] Handle verification success/failure states

- [ ] **File**: `/onboarding/components/EmailVerification.tsx`
  - [ ] Create email input component
  - [ ] Add "Get Verification Code" functionality
  - [ ] Create 6-digit code input component
  - [ ] Handle Clerk verification API calls
  - [ ] Add loading and error states

### Data Migration System
- [ ] **File**: `/onboarding/lib/migration.ts`
  - [ ] Create migrateOnboardingData function
  - [ ] Implement Supabase user profile creation
  - [ ] Add girl profile creation with user association
  - [ ] Add data entry creation with user association
  - [ ] Implement session storage cleanup
  - [ ] Add error handling and rollback logic

### User Profile Integration
- [ ] **File**: `/lib/auth.ts` (modify existing or create new)
  - [ ] Add Clerk user management utilities
  - [ ] Create getUserSubscriptionTier function
  - [ ] Add subscription status checking
  - [ ] Implement user creation webhooks

## Phase 3: CPN Results & Payment (Week 3)

### CPN Presentation Page
- [ ] **File**: `/app/onboarding/results/page.tsx`
  - [ ] Create CPN results display page
  - [ ] Calculate CPN from onboarding data
  - [ ] Display metrics prominently
  - [ ] Add subscription plan selection
  - [ ] Handle authenticated user state

- [ ] **File**: `/onboarding/components/CPNPresentation.tsx`
  - [ ] Create large, visual CPN display
  - [ ] Add calculated metrics summary
  - [ ] Implement engaging animations for results reveal
  - [ ] Style with brand colors and typography

- [ ] **File**: `/onboarding/components/SubscriptionPlans.tsx`
  - [ ] Create three-tier subscription display
  - [ ] Player Mode ($1.99/week) with features list
  - [ ] Lifetime Access ($27) with premium features
  - [ ] Boyfriend Mode (Free) with limitations
  - [ ] Add social proof elements and testimonials
  - [ ] Implement plan selection handling

### Stripe Payment Integration
- [ ] **File**: `/lib/stripe.ts` (modify existing or create new)
  - [ ] Configure Stripe with subscription products
  - [ ] Create checkout session functionality
  - [ ] Add success/cancel URL handling
  - [ ] Implement webhook processing for payments

- [ ] **File**: `/api/stripe/checkout/route.ts`
  - [ ] Create API route for Stripe checkout sessions
  - [ ] Handle subscription plan selection
  - [ ] Add user authentication validation
  - [ ] Return checkout session URLs

- [ ] **File**: `/api/stripe/webhooks/route.ts`
  - [ ] Process payment success webhooks
  - [ ] Update user subscription status in Supabase
  - [ ] Handle payment failures and retries
  - [ ] Add webhook signature verification

## Phase 4: Welcome Pages & Paywall System (Week 4)

### Premium User Welcome
- [ ] **File**: `/app/onboarding/welcome-premium/page.tsx`
  - [ ] Create premium user welcome page
  - [ ] Display payment success confirmation
  - [ ] Show next steps and feature highlights
  - [ ] Add referral program promotion
  - [ ] Redirect to main dashboard

### Free Tier Welcome  
- [ ] **File**: `/app/onboarding/welcome-free/page.tsx`
  - [ ] Create free tier welcome page
  - [ ] Explain boyfriend mode limitations
  - [ ] Visual presentation of premium features
  - [ ] Add upgrade CTA with benefits
  - [ ] Redirect to limited dashboard

### Paywall System Implementation
- [ ] **File**: `/lib/paywall.ts`
  - [ ] Create withPaywall higher-order component
  - [ ] Implement subscription tier checking
  - [ ] Add usage limit validation for free tier
  - [ ] Create paywall redirect logic

- [ ] **File**: `/components/PaywallOverlay.tsx`
  - [ ] Create blur overlay component
  - [ ] Add upgrade CTA with feature benefits
  - [ ] Style with design system
  - [ ] Implement conversion-focused messaging

- [ ] **Modify existing pages** to add paywall protection:
  - [ ] `/app/leaderboards/page.tsx` - Add withPaywall wrapper
  - [ ] `/app/analytics/page.tsx` - Add withPaywall wrapper
  - [ ] `/app/data-vault/page.tsx` - Add withPaywall wrapper
  - [ ] `/app/share/page.tsx` - Add withPaywall wrapper

### Usage Limits for Free Tier
- [ ] **File**: `/lib/usageLimits.ts`
  - [ ] Create free tier usage checking functions
  - [ ] Implement 1 girl maximum validation
  - [ ] Add 1 entry per girl limitation
  - [ ] Create usage tracking utilities

## Phase 5: Polish & Testing (Week 5)

### UX Enhancements
- [ ] Add loading states to all form submissions
- [ ] Implement smooth page transitions between steps
- [ ] Add form auto-focus and keyboard navigation
- [ ] Create error recovery mechanisms for failed submissions
- [ ] Add mobile-responsive design optimization

### Analytics & Conversion Tracking
- [ ] **File**: `/lib/analytics.ts`
  - [ ] Add onboarding funnel tracking
  - [ ] Implement conversion event logging
  - [ ] Track step completion rates
  - [ ] Add payment conversion metrics

- [ ] **Integration with existing analytics**:
  - [ ] Track onboarding start events
  - [ ] Log step progression events
  - [ ] Record subscription conversion events
  - [ ] Monitor drop-off points

### Error Handling & Edge Cases
- [ ] Handle sessionStorage unavailable (private browsing)
- [ ] Add network failure recovery
- [ ] Implement email delivery failure handling
- [ ] Create alternative verification methods
- [ ] Add graceful payment failure recovery

### Testing & Quality Assurance
- [ ] **Unit Tests**:
  - [ ] Test onboarding context and reducers
  - [ ] Test session storage utilities
  - [ ] Test form validation functions
  - [ ] Test migration and cleanup functions

- [ ] **Integration Tests**:
  - [ ] Test complete onboarding flow
  - [ ] Test email verification process
  - [ ] Test payment processing integration
  - [ ] Test data migration accuracy

- [ ] **User Experience Testing**:
  - [ ] Mobile responsiveness testing
  - [ ] Cross-browser compatibility
  - [ ] Accessibility compliance (WCAG)
  - [ ] Performance optimization (loading times)

## Database Schema Changes

### User Table Extensions
```sql
-- Add subscription management fields
ALTER TABLE users ADD COLUMN subscription_tier VARCHAR(20) DEFAULT 'free';
ALTER TABLE users ADD COLUMN subscription_status VARCHAR(20) DEFAULT 'active';
ALTER TABLE users ADD COLUMN stripe_customer_id VARCHAR(255);
ALTER TABLE users ADD COLUMN trial_ends_at TIMESTAMP;
ALTER TABLE users ADD COLUMN onboarding_completed_at TIMESTAMP;
ALTER TABLE users ADD COLUMN referred_by UUID REFERENCES users(id);
```

### Usage Tracking Table
```sql
-- Track usage limits for free tier users
CREATE TABLE user_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  girls_count INTEGER DEFAULT 0,
  entries_count INTEGER DEFAULT 0,
  last_activity_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for efficient user lookups
CREATE INDEX idx_user_usage_user_id ON user_usage(user_id);
```

### Subscription History Table
```sql
-- Track subscription changes and payments
CREATE TABLE subscription_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255),
  tier VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,
  amount_cents INTEGER,
  billing_cycle VARCHAR(20), -- 'weekly', 'one_time'
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Deployment & Production Readiness

### Environment Configuration
- [ ] Setup production Clerk application
- [ ] Configure production Stripe account
- [ ] Add production environment variables
- [ ] Setup Supabase production database migrations

### Security & Performance
- [ ] Implement rate limiting on verification endpoints
- [ ] Add CSRF protection for payment endpoints
- [ ] Configure CDN for static assets
- [ ] Setup monitoring and alerting for conversion funnel

### Launch Preparation
- [ ] Create launch checklist with rollback plan
- [ ] Setup A/B testing framework for optimization
- [ ] Prepare customer support documentation
- [ ] Configure analytics dashboards for monitoring

## Success Metrics & KPIs

### Tracking Implementation
- [ ] **Conversion Funnel Metrics**:
  - [ ] Landing page → Step 1 (Entry rate)
  - [ ] Step 1 → Step 2 (Girl form completion)
  - [ ] Step 2 → Step 3 (Expense form completion)  
  - [ ] Step 3 → Results (Email verification completion)
  - [ ] Results → Payment (Subscription conversion)

- [ ] **Revenue Metrics**:
  - [ ] Payment conversion rate by plan
  - [ ] Average revenue per user (ARPU)
  - [ ] Customer lifetime value (CLV)
  - [ ] Churn rate by subscription tier

- [ ] **User Experience Metrics**:
  - [ ] Time to complete onboarding
  - [ ] Mobile vs desktop completion rates
  - [ ] Support ticket volume during onboarding
  - [ ] User satisfaction scores (post-onboarding survey)

### Target KPIs
- [ ] **Primary Goals**:
  - Landing → Account Creation: 15% conversion rate
  - Account Creation → Paid Subscription: 8% conversion rate
  - Step Completion Rate: 80% for each step
  - Time to Complete: Under 5 minutes average

- [ ] **Secondary Goals**:
  - Mobile conversion rate: 12%+
  - Email verification success: 95%+
  - Payment success rate: 98%+
  - 7-day retention: 70%+

---

## Implementation Timeline

| Week | Phase | Key Deliverables | Success Criteria |
|------|-------|-----------------|------------------|
| 1 | Core Architecture | Session management, Steps 1-2 | Forms work, data persists |
| 2 | Authentication | Email verification, data migration | Users can create accounts |
| 3 | Payments | CPN results, Stripe integration | Payment processing works |
| 4 | Paywalls | Welcome pages, usage limits | Free/premium features separated |
| 5 | Polish | UX improvements, testing | Production-ready onboarding |

This checklist provides a comprehensive roadmap for implementing the CPN v2 onboarding flow while maintaining code quality and user experience standards.