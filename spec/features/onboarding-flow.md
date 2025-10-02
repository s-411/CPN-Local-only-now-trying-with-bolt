# Onboarding Flow

## 1) Context (why this exists)
New users need a guided introduction to understand the app's value before making a commitment. The onboarding flow demonstrates core features by having users input real data, then shows calculated results and conversion opportunities for premium subscriptions.

## 2) User Journey (step-by-step)
- User visits the app and is directed to onboarding (Step 1)
- Step 1: User creates their first girl profile with name, age, rating, and demographics
- Data is temporarily saved to sessionStorage for the onboarding flow
- Step 2: User adds their first expense data entry (date, amount, duration, nuts)
- Step 3: User enters their email address for account creation (prepared for Clerk)
- Results page: App calculates and displays their first cost-per-nut with visual results
- Results page shows subscription upgrade options with pricing and feature comparison
- Premium path: User sees welcome page for paid tier with advanced features
- Free path: User sees welcome page for free tier with usage limitations
- User is then redirected to the main app with their onboarding data converted to real data

## 3) Technology (what it uses today)
Uses sessionStorage to temporarily hold onboarding data before converting to localStorage. The flow spans multiple pages:
- `app/onboarding/step-1/page.tsx` - First girl profile creation (~1-150+)
- `app/onboarding/step-2/page.tsx` - First expense data entry
- `app/onboarding/step-3/page.tsx` - Email collection with CPN preview
- `app/onboarding/results/page.tsx` - Results display with subscription upsell
- `app/onboarding/welcome-premium/page.tsx` - Premium welcome page
- `app/onboarding/welcome-free/page.tsx` - Free tier welcome page

sessionStorage keys used:
- `onboarding_girl_data` - Temporary girl profile data
- `onboarding_expense_data` - Temporary expense data
- `onboarding_email_data` - Email for account creation

## 4) Design Directions (what it looks/feels like)
Multi-step wizard with progress indicators and consistent branding. Each step focuses on one task with clear next/back navigation. Forms use the same validation and styling as the main app. Results page has celebratory design with large metrics display. Subscription comparison uses clear pricing tables with feature lists. Welcome pages are differentiated by tier with appropriate messaging and next steps.

## Data We Store (plain-English "table idea")
Temporary onboarding data stored in sessionStorage:
- `onboarding_girl_data` (name, age, rating, ethnicity, hair color from step 1)
- `onboarding_expense_data` (date, amount spent, duration, number of nuts from step 2)
- `onboarding_email_data` (email address and marketing preferences from step 3)

This data gets converted to permanent localStorage records when onboarding completes.

## Who Can See What (safety/permissions in plain words)
Onboarding data is temporarily stored in the user's browser session only. Email addresses are collected but not currently sent anywhere (prepared for future Clerk integration). No data is shared with other users. The conversion to permanent storage happens locally in the browser.

## Acceptance Criteria (done = true)
- Step 1 successfully creates and saves girl profile data to sessionStorage
- Step 2 successfully creates and saves expense data to sessionStorage
- Step 3 collects email and shows CPN preview calculation
- Results page correctly calculates cost-per-nut from onboarding data
- Subscription upgrade options display with correct pricing
- Premium welcome path works for paid users
- Free welcome path works for free users
- Onboarding data converts to permanent localStorage when flow completes
- User can navigate back/forward through steps without losing data
- Form validation works consistently across all steps
- Mobile responsive design works throughout the flow

## Open Questions / Assumptions
Email collection is prepared for Clerk authentication but not currently active. Subscription pricing and payment processing are prepared but not implemented. The conversion from sessionStorage to localStorage may need better error handling. Back navigation between steps could be improved.

## Code References
- `app/onboarding/step-1/page.tsx` - Girl profile creation step
- `app/onboarding/step-2/page.tsx` - Expense data entry step
- `app/onboarding/step-3/page.tsx` - Email collection step
- `app/onboarding/results/page.tsx` - Results and subscription upsell
- `app/onboarding/welcome-premium/page.tsx` - Premium tier welcome
- `app/onboarding/welcome-free/page.tsx` - Free tier welcome
- `lib/hooks/useReferralTracking.tsx` - Referral tracking through onboarding