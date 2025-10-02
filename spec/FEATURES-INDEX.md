# CPN (Cost Per Nut) v3 - Complete Features Index

This document lists every feature found in the CPN v3 codebase with one-line summaries. Each feature links to a detailed specification in the `features/` folder.

## Core Data Management Features

1. **[Girl Profile Management](features/girl-profile-management.md)** - Create, edit, and delete girl profiles with ratings, demographics, and personal details
2. **[Data Entry Tracking](features/data-entry-tracking.md)** - Record dating expenses, time spent, and "nuts" count for each girl
3. **[Expense and Time Calculations](features/expense-time-calculations.md)** - Real-time calculation of cost-per-nut, time-per-nut, and other dating metrics
4. **[Girls Dashboard](features/girls-dashboard.md)** - Main dashboard showing all girl profiles with cards and quick-add functionality
5. **[Overview Table](features/overview-table.md)** - Spreadsheet-style view of all data with sortable columns and mobile-responsive cards

## Navigation and Layout

6. **[Responsive Navigation](features/responsive-navigation.md)** - Sidebar for desktop, bottom navigation for mobile with active states
7. **[Layout System](features/layout-system.md)** - App-wide layout wrapper with consistent styling and responsive breakpoints

## Analytics and Reporting

8. **[Analytics Dashboard](features/analytics-dashboard.md)** - Charts and graphs showing spending patterns, efficiency metrics, and trends
9. **[Data Vault](features/data-vault.md)** - Advanced analytics with demographic comparisons and user behavior insights
10. **[Global Statistics](features/global-statistics.md)** - Aggregate statistics across all girls and data entries

## Sharing and Social

11. **[Share System](features/share-system.md)** - Generate and share stat cards, achievement badges, and reports with privacy controls
12. **[Achievement System](features/achievement-system.md)** - Unlockable achievements with tiers (bronze, silver, gold, platinum) and point tracking
13. **[Leaderboards](features/leaderboards.md)** - Private group competitions with invite tokens and ranking systems

## User Experience

14. **[Onboarding Flow](features/onboarding-flow.md)** - 5-step funnel for new users with email collection and subscription upsell
15. **[Settings Management](features/settings-management.md)** - User profile, preferences, notifications, privacy, and data management settings
16. **[Modal System](features/modal-system.md)** - Consistent modal dialogs for adding, editing, and deleting data

## Business Features

17. **[Affiliate System](features/affiliate-system.md)** - Rewardful-powered referral tracking with join links and commission tracking
18. **[Subscription Tiers](features/subscription-tiers.md)** - Free (Boyfriend Mode) vs Premium (Player Mode) with strategic paywalls
19. **[Paywall System](features/paywall-system.md)** - Conversion-focused upgrade prompts throughout the app

## Data Management

20. **[Local Storage System](features/local-storage-system.md)** - Complete localStorage-based data persistence with migration support
21. **[Template Data](features/template-data.md)** - Demo data for new users and live deployment showcase
22. **[Data Export/Import](features/data-export-import.md)** - Backup and restore user data with JSON export/import

## Supporting Features

23. **[Referral Tracking](features/referral-tracking.md)** - Track affiliate referrals through join links using sessionStorage
24. **[Share Context](features/share-context.md)** - React context for managing sharing state and preferences
25. **[Calculation Engine](features/calculation-engine.md)** - Core mathematical functions for all dating metrics and statistics

## Planned Features (Pages Exist)

26. **[Subscription Management](features/subscription-management.md)** - Billing, plan changes, and subscription lifecycle (UI only)
27. **[Profile System](features/profile-system.md)** - User account management and profile customization (placeholder)

## Technical Infrastructure

28. **[Migration System](features/migration-system.md)** - Automatic data migrations for localStorage schema changes
29. **[Type Safety](features/type-safety.md)** - Comprehensive TypeScript interfaces for all data structures
30. **[Context Management](features/context-management.md)** - React Context with useReducer for global state management

---

**Total Features Identified: 30**

**localStorage Keys Used: 12**
- `cpn_girls` - Girl profiles
- `cpn_data_entries` - Dating data entries
- `cpn-user-achievements` - Achievement progress
- `cpn-share-preferences` - Sharing preferences
- `cpn_user_profile` - User profile settings
- `cpn_datetime_settings` - Date/time preferences
- `cpn_notification_settings` - Notification preferences
- `cpn_privacy_settings` - Privacy settings
- `cpn-leaderboard-groups` - Leaderboard groups
- `cpn-leaderboard-members` - Leaderboard memberships
- `cpn-share-history` - Share history tracking
- `cpn-sort-preferences` - Table sorting preferences

**sessionStorage Keys Used: 4**
- `onboarding_girl_data` - First girl profile in onboarding
- `onboarding_expense_data` - First expense data in onboarding
- `onboarding_email_data` - Email collection in onboarding
- `cpn-referral-tracking` - Affiliate referral tracking

**Next.js 15 App Router Pages: 24**
- All pages use new App Router with proper TypeScript integration
- Dynamic routes for girl profiles and leaderboard groups
- Server/Client components properly separated

**React 19 + TypeScript 5.6.2**
- Full type safety across all features
- Custom hooks for data access patterns
- React Context for state management

## Suggested Rebuild Order

1. **Type Safety** — Foundation for all other development with comprehensive interfaces
   - **Depends on:** None

2. **Migration System** — Database schema setup and evolution before any data operations
   - **Depends on:** None

3. **Context Management** — Global state management pattern needed throughout the app
   - **Depends on:** Type Safety

4. **Layout System** — App-wide responsive foundation required by all pages
   - **Depends on:** Type Safety

5. **Modal System** — Reusable dialog pattern used extensively for forms and confirmations
   - **Depends on:** Layout System

6. **Girl Profile Management** — Core entity that all other features reference
   - **Depends on:** Type Safety, Migration System, Context Management, Modal System

7. **Data Entry Tracking** — Core functionality that depends on girl profiles existing
   - **Depends on:** Girl Profile Management

8. **Calculation Engine** — Mathematical functions needed by all analytics and display features
   - **Depends on:** Girl Profile Management, Data Entry Tracking

9. **Responsive Navigation** — App navigation system needed by all user-facing pages
   - **Depends on:** Layout System

10. **Girls Dashboard** — Primary user interface showing profiles and quick actions
    - **Depends on:** Girl Profile Management, Data Entry Tracking, Responsive Navigation

11. **Overview Table** — Comprehensive data view with sorting and bulk operations
    - **Depends on:** Girls Dashboard, Calculation Engine

12. **Global Statistics** — Aggregate metrics displayed throughout the app
    - **Depends on:** Calculation Engine

13. **Analytics Dashboard** — Charts and visualizations for user insights
    - **Depends on:** Global Statistics

14. **Data Vault** — Advanced analytics with demographic breakdowns
    - **Depends on:** Analytics Dashboard

15. **Settings Management** — User preferences and configuration options
    - **Depends on:** Context Management, Modal System

16. **Achievement System** — Gamification based on user data and behavior
    - **Depends on:** Global Statistics, Data Entry Tracking

17. **Template Data** — Demo data system for new users and showcasing
    - **Depends on:** Girl Profile Management, Data Entry Tracking

18. **Share System** — Social sharing with privacy controls and image generation
    - **Depends on:** Achievement System, Analytics Dashboard

19. **Share Context** — State management specifically for sharing workflows
    - **Depends on:** Share System, Context Management

20. **Data Export/Import** — Backup and restore functionality for user data
    - **Depends on:** Girl Profile Management, Data Entry Tracking, Settings Management

21. **Onboarding Flow** — New user acquisition funnel with guided setup
    - **Depends on:** Girl Profile Management, Data Entry Tracking, Template Data

22. **Subscription Tiers** — Business model with free and premium feature gating
    - **Depends on:** Settings Management

23. **Paywall System** — Conversion optimization for premium subscriptions
    - **Depends on:** Subscription Tiers

24. **Affiliate System** — Referral tracking and commission management
    - **Depends on:** Subscription Tiers

25. **Referral Tracking** — Session-based tracking supporting affiliate system
    - **Depends on:** Affiliate System

26. **Leaderboards** — Social competition features with private groups
    - **Depends on:** Achievement System, Share System

27. **Subscription Management** — Billing and plan management interface
    - **Depends on:** Subscription Tiers, Paywall System

28. **Profile System** — User account management and customization
    - **Depends on:** Settings Management, Subscription Management

### Shared Building Blocks (build these first)
- **Database setup with migrations** — PostgreSQL schema with automatic migration system and seed data
- **Authentication and session management** — User registration, login, and secure session handling with proper isolation
- **Generic CRUD patterns** — Reusable form + list + edit components with validation and error handling
- **Error/loading/empty states** — Consistent UI patterns for async operations and data states
- **Multi-user data isolation** — Ensure users can only access their own data with proper database row-level security
- **API route patterns** — Standardized Next.js API routes with error handling and validation
- **Form validation utilities** — Shared validation logic and error message patterns
- **Responsive design system** — Mobile-first CSS utility classes and breakpoint management

### Assumptions & Notes
- localStorage will be completely replaced with database-backed API calls
- Authentication system (Clerk) will be implemented before user-specific features
- Payment processing (Stripe) integration will be added after core subscription logic is stable
- Canvas-based image generation may need server-side alternatives for sharing features
- Achievement definitions will remain hardcoded initially but should be designed for future flexibility
- Onboarding flow sessionStorage will be replaced with temporary database records or API state
- Mobile responsive patterns should be tested early since the original codebase has extensive mobile optimization