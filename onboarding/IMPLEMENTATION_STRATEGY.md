# CPN v2 Onboarding Implementation Strategy

## Architecture Analysis

### Current App Architecture Review

**State Management**
- **Pattern**: React Context + useReducer for global state
- **Storage**: localStorage with automatic sync via storage.ts
- **Hooks**: `useGirls()`, `useDataEntries()`, `useGlobalStats()` for component access
- **Real-time Calculations**: Derived state automatically recalculated on data changes

**Reusable Components for Onboarding**
- **AddGirlModal**: Form structure, validation, and tile-based rating system
- **Data Entry Form**: From `/girls/[id]/add-data/page.tsx` - complete form pattern
- **Custom CSS Classes**: `.btn-cpn`, `.input-cpn`, `.card-cpn` for consistent styling
- **Validation Patterns**: Real-time form validation with error states

**Design System Elements**
- **Colors**: CPN Yellow (#f2f661), dark theme (#1f1f1f, #2a2a2a)
- **Fonts**: National2Condensed (headings), ESKlarheit (body text)
- **Animations**: Existing `animate-slide-up` for modal transitions

## Implementation Approach

### 1. Separate Onboarding Architecture

**Rationale**: Keep onboarding completely isolated from main app to avoid complexity and ensure clean user experience.

**Structure**:
```
/onboarding/
├── components/           # Onboarding-specific components
│   ├── OnboardingLayout.tsx
│   ├── StepIndicator.tsx
│   ├── OnboardingGirlForm.tsx
│   ├── OnboardingExpenseForm.tsx
│   ├── EmailVerification.tsx
│   ├── CPNPresentation.tsx
│   └── SubscriptionPlans.tsx
├── context/              # Onboarding-specific state management
│   ├── OnboardingContext.tsx
│   └── types.ts
├── lib/                  # Onboarding utilities
│   ├── sessionStorage.ts
│   ├── validation.ts
│   └── calculations.ts
└── pages/                # Next.js pages for onboarding flow
    ├── step-1/
    ├── step-2/
    ├── step-3/
    ├── results/
    ├── welcome-premium/
    └── welcome-free/
```

### 2. Session Storage Management

**OnboardingContext Pattern**:
```typescript
interface OnboardingState {
  girl: Partial<Girl> | null;
  expense: Partial<DataEntry> | null;
  currentStep: number;
  isComplete: boolean;
  userEmail: string | null;
  subscriptionTier: 'free' | 'premium' | 'lifetime' | null;
}

// Actions for session management
type OnboardingAction = 
  | { type: 'SET_GIRL_DATA'; payload: Partial<Girl> }
  | { type: 'SET_EXPENSE_DATA'; payload: Partial<DataEntry> }
  | { type: 'NEXT_STEP' }
  | { type: 'SET_EMAIL'; payload: string }
  | { type: 'SET_SUBSCRIPTION'; payload: string }
  | { type: 'COMPLETE_ONBOARDING' };
```

**Session Persistence**:
- Auto-save to sessionStorage on every state change
- Load from sessionStorage on page refresh/reload
- Clear sessionStorage after successful account creation + data migration

### 3. Component Reusability Strategy

**Reuse Existing Patterns**:

**Girl Form Component** (adapted from AddGirlModal):
```typescript
// Simplified version focusing on core fields
interface OnboardingGirlFormProps {
  initialData?: Partial<Girl>;
  onSubmit: (data: Partial<Girl>) => void;
  onBack?: () => void;
}

// Reuse: tile-based rating system, validation logic, styling classes
```

**Expense Form Component** (adapted from add-data page):
```typescript
// Simplified version of expense tracking
interface OnboardingExpenseFormProps {
  initialData?: Partial<DataEntry>;
  onSubmit: (data: Partial<DataEntry>) => void;
  onBack: () => void;
}

// Reuse: form validation, time input pattern, styling
```

### 4. Authentication Integration

**Clerk Setup** (new integration needed):
```typescript
// Install Clerk packages
npm install @clerk/nextjs

// Environment variables needed:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/onboarding/step-3
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding/results
```

**Email Verification Flow**:
```typescript
// Use Clerk's email verification with custom UI
import { useSignUp } from '@clerk/nextjs';

const EmailVerificationComponent = () => {
  const { signUp, setActive } = useSignUp();
  
  // 6-digit code verification process
  // On success: create Supabase user + migrate session data
};
```

### 5. Data Migration Strategy

**Migration Function**:
```typescript
const migrateOnboardingData = async (clerkUser: User, sessionData: OnboardingState) => {
  // 1. Create Supabase user profile
  const userProfile = await createUserProfile(clerkUser);
  
  // 2. Create girl record
  const girl = await girlsStorage.create({
    ...sessionData.girl,
    userId: userProfile.id
  });
  
  // 3. Create data entry
  const entry = await dataEntriesStorage.create({
    ...sessionData.expense,
    girlId: girl.id,
    userId: userProfile.id
  });
  
  // 4. Clear session storage
  sessionStorage.clear();
  
  return { girl, entry };
};
```

### 6. Payment Integration

**Stripe Setup** (assuming existing Stripe integration):
```typescript
// Payment plans configuration
const subscriptionPlans = [
  {
    id: 'player-mode',
    name: 'Player Mode',
    price: '$1.99/week',
    stripePriceId: 'price_xxxxx',
    features: ['50 girls max', 'Full analytics', 'Leaderboards', 'Data export']
  },
  {
    id: 'lifetime',
    name: 'Lifetime Access', 
    price: '$27 one-time',
    stripePriceId: 'price_yyyyy',
    features: ['Unlimited girls', 'Priority support', 'API access', 'All future features']
  }
];

// Checkout redirect
const handleSubscribe = async (planId: string) => {
  const session = await stripe.checkout.sessions.create({
    success_url: `${window.location.origin}/onboarding/welcome-premium`,
    cancel_url: `${window.location.origin}/onboarding/results`,
    // ... other Stripe config
  });
};
```

### 7. Paywall Implementation

**Route Protection Pattern**:
```typescript
// Higher-order component for paywall protection
const withPaywall = (Component: React.ComponentType, requiredTier: 'premium' | 'lifetime') => {
  return (props: any) => {
    const { user } = useAuth();
    const userTier = user?.subscriptionTier;
    
    if (userTier === 'free' && requiredTier !== 'free') {
      return <PaywallOverlay requiredTier={requiredTier} />;
    }
    
    return <Component {...props} />;
  };
};

// Apply to protected pages
export default withPaywall(LeaderboardsPage, 'premium');
```

**Paywall Overlay Component**:
```typescript
const PaywallOverlay = ({ requiredTier }: { requiredTier: string }) => (
  <div className="relative">
    {/* Blurred content */}
    <div className="blur-sm opacity-30">
      {/* Preview of locked content */}
    </div>
    
    {/* Upgrade CTA overlay */}
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="bg-cpn-dark2 p-8 rounded-lg border border-cpn-yellow">
        <h3>Unlock {requiredTier} Features</h3>
        {/* Feature list, pricing, upgrade button */}
      </div>
    </div>
  </div>
);
```

## Implementation Phases

### Phase 1: Core Onboarding Structure (Week 1)
1. **Setup Onboarding Architecture**
   - Create `/onboarding` directory structure
   - Setup OnboardingContext with sessionStorage
   - Create OnboardingLayout component
   - Setup basic routing structure

2. **Step 1 & 2: Form Pages**
   - Adapt AddGirlModal into OnboardingGirlForm
   - Adapt expense form into OnboardingExpenseForm
   - Implement session storage persistence
   - Add step progression logic

### Phase 2: Authentication & Migration (Week 2)
3. **Clerk Integration**
   - Install and configure Clerk
   - Create email verification component
   - Implement 6-digit code flow
   - Setup user creation webhooks

4. **Data Migration System**
   - Build session → Supabase migration function
   - Add error handling and rollback
   - Test data integrity during migration
   - Implement cleanup procedures

### Phase 3: CPN Results & Payments (Week 3)
5. **CPN Presentation Page**
   - Create results presentation component
   - Add CPN calculation display
   - Design subscription plan selection UI
   - Add social proof elements

6. **Stripe Integration**
   - Setup subscription plans in Stripe
   - Create checkout flow integration
   - Implement success/failure handling
   - Add webhook processing for payments

### Phase 4: Welcome Pages & Paywalls (Week 4)
7. **Welcome Pages**
   - Premium user welcome page
   - Free tier welcome page  
   - Add feature showcases and next steps
   - Implement referral promotion messaging

8. **Paywall System**
   - Create paywall overlay component
   - Implement route protection HOC
   - Add blur effects and upgrade CTAs
   - Test all protected pages

### Phase 5: Polish & Optimization (Week 5)
9. **UX Enhancements**
   - Add loading states and animations
   - Implement progress indicators
   - Add error recovery mechanisms
   - Mobile responsiveness testing

10. **Analytics & Testing**
    - Add conversion tracking
    - Implement A/B testing framework
    - Setup funnel analytics
    - Performance optimization

## Technical Considerations

### Database Schema Changes

**User Table Extensions**:
```sql
-- Add subscription fields to user profiles
ALTER TABLE users ADD COLUMN subscription_tier VARCHAR(20) DEFAULT 'free';
ALTER TABLE users ADD COLUMN subscription_status VARCHAR(20);
ALTER TABLE users ADD COLUMN stripe_customer_id VARCHAR(255);
ALTER TABLE users ADD COLUMN trial_ends_at TIMESTAMP;
ALTER TABLE users ADD COLUMN onboarding_completed_at TIMESTAMP;
```

**Usage Tracking**:
```sql
-- Track usage limits for free tier
CREATE TABLE user_usage (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  girls_count INTEGER DEFAULT 0,
  entries_count INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Performance Optimization

**Code Splitting**:
```typescript
// Lazy load onboarding components to reduce main bundle size
const OnboardingStep1 = lazy(() => import('./step-1/page'));
const OnboardingStep2 = lazy(() => import('./step-2/page'));
// etc.
```

**Session Storage Optimization**:
```typescript
// Compress session data for mobile users
const saveToSession = (key: string, data: any) => {
  const compressed = LZString.compress(JSON.stringify(data));
  sessionStorage.setItem(key, compressed);
};
```

### Error Handling Strategy

**Graceful Degradation**:
- Handle sessionStorage unavailable (private browsing)
- Network failure recovery during verification
- Payment processing failures
- Email delivery issues

**User Feedback**:
- Clear error messages with actionable steps
- Progress preservation during errors
- Support contact integration
- Alternative verification methods

### Security Considerations

**Data Protection**:
- Encrypt sensitive session data
- Implement rate limiting on verification attempts
- Validate all form inputs server-side
- Secure payment processing with Stripe

**Privacy Compliance**:
- Clear data handling disclosure
- GDPR-compliant data collection
- Optional demographic fields
- Data deletion procedures

## Success Metrics & Monitoring

### Key Performance Indicators
- **Conversion Rate**: Landing → Account creation (target: 15%+)
- **Payment Conversion**: Account → Paid (target: 8%+)
- **Step Completion**: Each onboarding step (target: 80%+)
- **Time to Complete**: Full flow duration (target: <5 minutes)

### Monitoring Setup
- Real-time analytics dashboard
- Funnel drop-off alerts
- Payment failure notifications
- User support escalation triggers

### A/B Testing Framework
- CTA button variations
- Subscription pricing display
- Form field requirements
- Social proof placement

This implementation strategy provides a comprehensive approach to building the onboarding flow while leveraging existing app patterns and maintaining clean separation of concerns.