# ConvertKit Email Marketing Integration

## Overview
Integrate ConvertKit to capture email addresses during onboarding for abandoned cart recovery and ongoing email marketing campaigns. This creates a powerful funnel to recover users who don't immediately convert to paid subscriptions.

## Integration Strategy

### Trigger Points
1. **Email Verification Success** → Add to ConvertKit with "signed up - free" tag
2. **Player Mode Upgrade** → Add "signed up - monthly" tag  
3. **Lifetime Upgrade** → Add "signed up - lifetime" tag

### ConvertKit Tags System
```typescript
const CONVERTKIT_TAGS = {
  FREE_SIGNUP: 'signed up - free',
  MONTHLY_PAID: 'signed up - monthly', 
  LIFETIME_PAID: 'signed up - lifetime'
} as const;
```

## Implementation Plan

### 1. ConvertKit API Setup

**Environment Variables**:
```env
# ConvertKit Configuration
CONVERTKIT_API_KEY=your_api_key
CONVERTKIT_API_SECRET=your_api_secret
CONVERTKIT_FORM_ID=your_form_id
```

**API Utility** (`/lib/convertkit.ts`):
```typescript
interface ConvertKitSubscriber {
  email: string;
  tags?: string[];
  custom_fields?: Record<string, string>;
}

export class ConvertKitAPI {
  private apiKey: string;
  private apiSecret: string;
  
  constructor() {
    this.apiKey = process.env.CONVERTKIT_API_KEY!;
    this.apiSecret = process.env.CONVERTKIT_API_SECRET!;
  }

  async addSubscriber(data: ConvertKitSubscriber): Promise<boolean> {
    try {
      const response = await fetch('https://api.convertkit.com/v3/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: this.apiKey,
          email: data.email,
          tags: data.tags,
          custom_fields: data.custom_fields
        })
      });
      
      return response.ok;
    } catch (error) {
      console.error('ConvertKit API error:', error);
      return false;
    }
  }

  async addTag(email: string, tag: string): Promise<boolean> {
    try {
      // First get subscriber ID
      const subscriber = await this.getSubscriber(email);
      if (!subscriber) return false;
      
      const response = await fetch(`https://api.convertkit.com/v3/subscribers/${subscriber.id}/tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: this.apiKey,
          tag: tag
        })
      });
      
      return response.ok;
    } catch (error) {
      console.error('ConvertKit tag error:', error);
      return false;
    }
  }

  private async getSubscriber(email: string) {
    try {
      const response = await fetch(
        `https://api.convertkit.com/v3/subscribers?api_key=${this.apiKey}&email_address=${email}`
      );
      const data = await response.json();
      return data.subscribers?.[0] || null;
    } catch {
      return null;
    }
  }
}
```

### 2. Integration Points

#### A. Email Verification Success Hook
**Location**: `/onboarding/lib/migration.ts` (modify existing)

```typescript
import { ConvertKitAPI } from '@/lib/convertkit';

const migrateOnboardingData = async (clerkUser: User, sessionData: OnboardingState) => {
  // Existing migration logic...
  const userProfile = await createUserProfile(clerkUser);
  const girl = await girlsStorage.create({ ...sessionData.girl, userId: userProfile.id });
  const entry = await dataEntriesStorage.create({ ...sessionData.expense, girlId: girl.id, userId: userProfile.id });
  
  // NEW: Add to ConvertKit with free signup tag
  try {
    const convertKit = new ConvertKitAPI();
    await convertKit.addSubscriber({
      email: clerkUser.emailAddresses[0].emailAddress,
      tags: [CONVERTKIT_TAGS.FREE_SIGNUP],
      custom_fields: {
        signup_source: 'onboarding',
        signup_date: new Date().toISOString(),
        user_id: userProfile.id
      }
    });
  } catch (error) {
    // Log but don't fail migration
    console.error('ConvertKit signup failed:', error);
  }
  
  sessionStorage.clear();
  return { girl, entry };
};
```

#### B. Payment Success Webhooks
**Location**: `/api/stripe/webhooks/route.ts` (modify existing)

```typescript
import { ConvertKitAPI } from '@/lib/convertkit';

export async function POST(request: Request) {
  // Existing Stripe webhook logic...
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userEmail = session.customer_email;
    const priceId = session.line_items.data[0].price.id;
    
    // Existing user update logic...
    
    // NEW: Add ConvertKit tag based on subscription type
    try {
      const convertKit = new ConvertKitAPI();
      
      let tag: string;
      if (priceId === process.env.STRIPE_PLAYER_MODE_PRICE_ID) {
        tag = CONVERTKIT_TAGS.MONTHLY_PAID;
      } else if (priceId === process.env.STRIPE_LIFETIME_PRICE_ID) {
        tag = CONVERTKIT_TAGS.LIFETIME_PAID;
      }
      
      if (tag) {
        await convertKit.addTag(userEmail, tag);
      }
    } catch (error) {
      console.error('ConvertKit upgrade tag failed:', error);
    }
  }
  
  return new Response('OK', { status: 200 });
}
```

### 3. Abandoned Cart Email Automation

#### ConvertKit Automation Setup
1. **Trigger**: Tag added "signed up - free"
2. **Delay**: 15 minutes (immediate abandoned cart)
3. **Condition**: Does NOT have "signed up - monthly" OR "signed up - lifetime" tags
4. **Action**: Send abandoned cart email

#### Email Sequence Strategy
```
Sequence Timeline:
- 15 minutes: "You're so close to unlocking Player Mode..."
- 1 day: "Your CPN results are waiting" (social proof)  
- 3 days: "Limited time: 50% off Player Mode" (urgency)
- 7 days: "Last chance - expires tonight" (final push)
- 14 days: "New feature alert" (re-engagement)
```

#### Email Content Ideas
**15-Minute Email**:
```
Subject: Your CPN calculation is ready 🔢

Hey [first_name],

You calculated your Cost Per Nut but didn't unlock the full power of Player Mode yet...

Your CPN: $X.XX
Global Average: $12.50

You're performing [better/worse] than 80% of guys tracking their dating efficiency.

Ready to see how you stack up in leaderboards and unlock advanced analytics?

[Upgrade to Player Mode - $1.99/week]

Don't let your dating data go to waste,
The CPN Team
```

**1-Day Follow-up**:
```
Subject: 847 guys joined Player Mode yesterday 📈

[first_name],

While you were thinking about it, 847 other guys upgraded to Player Mode and are now:
- Competing in private leaderboards
- Sharing results with friends  
- Getting deep demographic insights
- Tracking unlimited girls and data

Your spot in the top 80% is still available...

[Join Player Mode Now]

Plus: Everyone who signs up from your link gets 50% off 👥
```

### 4. Custom Fields for Enhanced Targeting

**Additional Data Points**:
```typescript
const customFields = {
  signup_source: 'onboarding', // vs 'organic', 'referral'
  calculated_cpn: sessionData.calculatedCPN?.toString(),
  user_efficiency_percentile: '80', // "top 80%"
  girls_added_count: '1',
  onboarding_completion_date: new Date().toISOString(),
  user_id: userProfile.id,
  last_app_activity: new Date().toISOString()
};
```

**Segmentation Opportunities**:
- High performers (top 20%) get different messaging
- Low CPN users get efficiency-focused emails
- Users with multiple girls get expansion messaging
- Geographic segmentation based on location data

### 5. A/B Testing Framework

**Email Variations to Test**:
1. **Subject Lines**:
   - "Your CPN results are ready" vs "You're in the top 80%" vs "847 guys upgraded yesterday"
2. **CTA Buttons**:
   - "Upgrade to Player Mode" vs "Unlock Full Results" vs "Join the Leaderboard"
3. **Social Proof**:
   - User count vs percentile vs testimonials
4. **Pricing Presentation**:
   - "$1.99/week" vs "$0.28/day" vs "Less than a coffee"

**Testing Strategy**:
```typescript
// A/B test configuration in ConvertKit
const emailVariants = {
  subject_line_test: {
    variant_a: "Your CPN results are ready 🔢",
    variant_b: "You're in the top 80% 🏆", 
    split_percent: 50
  },
  cta_test: {
    variant_a: "Upgrade to Player Mode",
    variant_b: "Unlock Full Analytics",
    split_percent: 50  
  }
};
```

## Implementation Checklist

### Phase 1: Basic Integration
- [ ] Install ConvertKit API credentials
- [ ] Create ConvertKitAPI utility class
- [ ] Add subscriber on email verification
- [ ] Add tags on payment success
- [ ] Test API integration with sandbox

### Phase 2: Email Automation
- [ ] Setup ConvertKit automation sequences
- [ ] Create abandoned cart email templates
- [ ] Configure tag-based triggers
- [ ] Test email delivery and timing
- [ ] Setup unsubscribe handling

### Phase 3: Advanced Segmentation  
- [ ] Add custom fields for user data
- [ ] Create demographic-based segments
- [ ] Setup performance-based messaging
- [ ] Implement geographic targeting
- [ ] Add behavioral triggers

### Phase 4: A/B Testing & Optimization
- [ ] Create email variant templates
- [ ] Setup split testing framework
- [ ] Configure conversion tracking
- [ ] Analyze email performance metrics
- [ ] Iterate based on results

## Success Metrics

### Email Performance KPIs
- **Capture Rate**: % of verified users added to ConvertKit
- **Open Rate**: Email open rate (target: 25%+)
- **Click Rate**: Email click-through rate (target: 5%+)
- **Conversion Rate**: Email → Paid subscription (target: 3%+)
- **Revenue Recovery**: Revenue from email-driven conversions

### Funnel Optimization
- **Immediate Conversion**: Direct signup → paid (baseline)
- **15-Minute Recovery**: Abandoned cart → email → paid
- **Multi-Touch Attribution**: Email sequence → paid conversion
- **Lifetime Value**: Email subscribers vs direct conversions

## Technical Considerations

### Error Handling
```typescript
// Graceful failure - don't block user flow
const addToConvertKit = async (email: string, tag: string) => {
  try {
    await convertKit.addSubscriber({ email, tags: [tag] });
    console.log(`Added ${email} to ConvertKit with tag: ${tag}`);
  } catch (error) {
    // Log for monitoring but don't throw
    console.error('ConvertKit failed:', error);
    // Could queue for retry later
    await queueConvertKitRetry(email, tag);
  }
};
```

### Privacy Compliance
- Add email consent checkbox during verification
- Include unsubscribe links in all emails
- Honor unsubscribe requests immediately
- GDPR-compliant data handling

### Rate Limiting & Queuing
```typescript
// Queue system for API failures
interface ConvertKitQueue {
  email: string;
  action: 'add_subscriber' | 'add_tag';
  data: any;
  retries: number;
  created_at: Date;
}

// Retry failed requests with exponential backoff
const processConvertKitQueue = async () => {
  // Implementation for background job processing
};
```

This ConvertKit integration will significantly improve your conversion rates by capturing users who don't immediately upgrade and nurturing them through targeted email sequences. The abandoned cart recovery alone typically adds 15-20% additional conversions to SaaS funnels.