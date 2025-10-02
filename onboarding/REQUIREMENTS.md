# CPN v2 Onboarding Flow Requirements

## Overview
The onboarding flow is a critical conversion funnel for first-time users who land on the app from TikTok/Instagram traffic via a separate landing page. Users click "Start for Free" and are redirected to the onboarding experience, which is completely separate from the main app UI and only seen once per user.

## User Journey Flow

### Entry Point
- **Source**: TikTok/Instagram → Landing Page (different domain) → "Start for Free" button
- **Redirect**: Landing page redirects to `/onboarding/step-1` in the main app
- **Session Management**: All onboarding data stored in sessionStorage until account creation

### Step-by-Step Flow

#### Step 1: Add Girl Profile
- **Route**: `/onboarding/step-1`
- **UI**: Clean, minimal page with no navigation/menu elements
- **Form Fields**:
  - Name (required)
  - Age (required, 18+ validation)
  - Hair Color (optional dropdown, for visual appeal)
  - Hotness Rating (required, 5.0-10.0 tile-based system)
- **CTA Button**: "Add Expenses" (not generic "Continue")
- **Data Storage**: Save girl data to sessionStorage
- **Validation**: Same as existing AddGirlModal but simplified fields

#### Step 2: Add Expense Entry
- **Route**: `/onboarding/step-2`
- **UI**: Clean form page matching Step 1 styling
- **Form Fields**:
  - Date (default to today)
  - Amount Spent ($)
  - Time Spent (hours/minutes)
  - Number of Nuts
- **CTA Button**: "Calculate CPN"
- **Data Storage**: Save expense data to sessionStorage
- **Validation**: Same as existing data entry form

#### Step 3: Email Collection & Account Creation
- **Route**: `/onboarding/step-3`
- **UI**: Email collection form with CPN calculation preview
- **Content**: "Provide your email address to be logged in and get your CPN result"
- **Authentication**: Clerk integration for email verification
- **Method**: 6-digit verification code (higher conversion than magic link)
- **Process**:
  1. User enters email
  2. Click "Get Verification Code"
  3. Clerk sends 6-digit code to email
  4. User enters code for verification
  5. Account created instantly upon verification
  6. SessionStorage data migrated to user's Supabase profile
- **Redirect**: Immediate redirect to CPN presentation page

#### Step 4: CPN Results Presentation
- **Route**: `/onboarding/results`
- **UI**: Prominent CPN display with no navigation elements
- **Content**: 
  - Large, visually appealing CPN result
  - User's calculated metrics from onboarding data
- **Subscription Options**:
  - **Player Mode**: $1.99/week (Stripe checkout)
  - **Lifetime Access**: $27 one-time payment
  - **Boyfriend Mode**: Stay free (limited to 1 girl)
- **Actions**: Three buttons for each subscription tier

#### Step 5A: Payment Success (Premium Users)
- **Route**: `/onboarding/welcome-premium`
- **Trigger**: Successful Stripe payment completion
- **UI**: Welcome message for premium users
- **Content**:
  - "Welcome! Payment success!"
  - "You can now use all features of Mastering Your Dating Efficiency"
  - Next steps: Add more girls, add more data, check Data Vault
  - Referral promotion: "Share with friends for 50% off"
- **Actions**: Buttons to main app features
- **Redirect**: Access to full dashboard

#### Step 5B: Free Tier Welcome (Boyfriend Mode)
- **Route**: `/onboarding/welcome-free`
- **Trigger**: User chooses "Boyfriend Mode"
- **UI**: Welcome message with feature limitations
- **Content**:
  - "Welcome to CPN! You're in boyfriend mode"
  - "You can only upload one entry per girl"
  - Visual presentation of premium features
- **Paywall Strategy**: All premium pages show blur overlay with upgrade CTA
- **Actions**: Link to upgrade to Player Mode

## Technical Requirements

### Session Management
- **Storage**: sessionStorage for all onboarding data
- **Data Structure**:
  ```typescript
  interface OnboardingSession {
    girl: {
      name: string;
      age: number;
      hairColor?: string;
      rating: number;
    };
    expense: {
      date: Date;
      amountSpent: number;
      durationMinutes: number;
      numberOfNuts: number;
    };
    step: number;
    startedAt: Date;
  }
  ```
- **Migration**: On account creation, migrate sessionStorage data to user's Supabase profile
- **Cleanup**: Clear sessionStorage after successful migration

### Authentication Integration
- **Provider**: Clerk for email verification
- **Flow**: Email → 6-digit code → Account creation
- **User Creation**: Automatic Supabase user profile creation on Clerk verification
- **Data Sync**: Immediate migration of onboarding data to user profile

### Payment Integration
- **Provider**: Stripe for subscription management
- **Plans**:
  - Player Mode: $1.99/week recurring subscription
  - Lifetime Access: $27 one-time payment
- **Webhooks**: Handle payment success/failure, subscription status changes
- **Redirect**: Back to onboarding welcome page with payment confirmation

### Routing Structure
```
/onboarding/
├── step-1/          # Add girl profile
├── step-2/          # Add expense data  
├── step-3/          # Email collection & verification
├── results/         # CPN presentation & subscription options
├── welcome-premium/ # Premium user welcome (post-payment)
└── welcome-free/    # Free tier welcome (boyfriend mode)
```

### State Management
- **Onboarding Context**: Separate from main app context
- **Session Persistence**: Survive page refreshes during flow
- **Progress Tracking**: Current step, completion status
- **Data Validation**: Real-time form validation with error states

### Paywall Implementation
- **Free Tier Limits**:
  - Maximum 1 girl profile
  - Maximum 1 data entry per girl
  - Dashboard access (with strategic upgrade prompts)
- **Paywall Pages**:
  - Leaderboards (blur overlay + upgrade CTA)
  - Analytics (blur overlay + upgrade CTA)
  - Data Vault (blur overlay + upgrade CTA)
  - Share features (blur overlay + upgrade CTA)
- **Conversion Strategy**: Beautiful, benefit-focused upgrade CTAs

## Design & UX Requirements

### Visual Consistency
- **Theme**: Match main app's dark theme and brand colors
- **Typography**: National2Condensed for headings, ESKlarheit for body
- **Colors**: CPN Yellow (#f2f661) for CTAs, dark theme throughout
- **Components**: Reuse existing form styles (input-cpn, btn-cpn)

### Mobile Optimization
- **Responsive**: Mobile-first design for TikTok/Instagram traffic
- **Touch-friendly**: Large tap targets, easy form completion
- **Fast Loading**: Minimal JavaScript, optimized assets

### Animation & Transitions
- **Page Transitions**: Smooth fade-in/slide-up animations
- **Progress Indication**: Subtle step indicators or progress bar
- **CPN Reveal**: Engaging animation for results presentation

### Conversion Optimization
- **Social Proof**: Testimonials on payment pages
- **Urgency**: Limited-time offers, scarcity messaging
- **Benefits Focus**: Feature comparisons, value propositions
- **Friction Reduction**: Minimal form fields, auto-focus, validation

## Analytics & Tracking

### Conversion Funnel Metrics
- Step completion rates
- Drop-off points identification
- Payment conversion rates
- Time spent per step
- Device/source attribution

### A/B Testing Opportunities
- CTA button text variations
- Subscription pricing presentation
- Form field requirements
- Payment plan positioning

## Error Handling & Edge Cases

### Session Recovery
- Handle browser refresh during flow
- Session timeout handling
- Data loss prevention
- Network connectivity issues

### Payment Failures
- Graceful payment failure handling
- Retry mechanisms
- Alternative payment methods
- Customer support escalation

### Account Creation Issues
- Email verification failures
- Duplicate account handling
- Clerk integration error states
- Data migration failures

## Success Metrics

### Primary KPIs
- **Conversion Rate**: Landing page → Account creation
- **Payment Conversion**: Account creation → Paid subscription
- **Retention**: Day 1, 7, 30 user retention
- **Revenue per User**: Average subscription value

### Secondary Metrics
- Time to completion
- Step abandonment rates
- Support ticket volume
- User satisfaction scores

## Future Enhancements

### Advanced Features
- Social login options (Google, Apple)
- Referral program integration
- Progressive profiling
- Personalized pricing

### Optimization Opportunities
- Machine learning for pricing optimization
- Dynamic form fields based on user behavior
- Advanced analytics integration
- Internationalization support