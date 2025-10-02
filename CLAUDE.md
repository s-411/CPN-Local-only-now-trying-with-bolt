# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
CPN (Cost Per Nut) v3 is a complete Next.js 15.5 web application for tracking and analyzing personal relationship metrics. This version includes a comprehensive onboarding flow, affiliate system architecture, and is prepared for future authentication (Clerk) and payment (Stripe) integration. Built with React 19, TypeScript 5.6.2, and Tailwind CSS 4.1.

## Development Commands

### Local Development
```bash
npm run dev        # Start development server at http://localhost:3000
npm run build      # Build for production (standalone output)
npm run start      # Start production server on port ${PORT:-3000}
npm run lint       # Run Next.js ESLint
npm run type-check # Run TypeScript type checking without compilation

# Test data generation
node scripts/add-test-data.js  # Generate test profiles and entries
```

**MVP Development Focus**: All development is done locally with hot reloading for rapid iteration. Keep browser open at `http://localhost:3000` - changes reflect immediately.

## Architecture Overview

### State Management Architecture
The application uses React Context with useReducer for centralized state management:

- **AppProvider** (`lib/context.tsx`): Wraps entire app in root layout
- **State Management**: useReducer pattern with actions for CRUD operations
- **Data Persistence**: localStorage with automatic sync via storage.ts
- **Real-time Calculations**: Derived state automatically recalculated on data changes
- **Custom Hooks**: `useGirls()`, `useDataEntries()`, `useGlobalStats()` for component access

### Data Flow Pattern
1. **Storage Layer** (`lib/storage.ts`): localStorage CRUD with UUID generation
2. **Context Layer** (`lib/context.tsx`): Global state with real-time metric calculation
3. **Component Layer**: Hooks provide reactive data access
4. **UI Updates**: Automatic re-renders when underlying data changes

### Key Architectural Patterns
- **Modal-based UI**: AddGirlModal, EditGirlModal, EditEntryModal for consistent UX
- **Calculated Metrics**: Real-time computation via `lib/calculations.ts`
- **Responsive Navigation**: Sidebar (desktop) + MobileNav (mobile) with shared navigation items
- **Form Patterns**: Controlled inputs with validation and error states
- **Sharing System**: Canvas-based image generation with privacy-first architecture via `lib/share/`
- **Progressive Disclosure**: Mobile-responsive patterns with expandable content sections

## File Structure & Key Components

### Layout Structure
- **Root Layout** (`app/layout.tsx`): AppProvider + Sidebar + MobileNav wrapper
- **Navigation**: Responsive with active states, Share and Overview pages now active
- **Pages**: Follow Next.js 15 App Router with dynamic routes

### Onboarding Flow Architecture
- **5-Step Funnel** (`app/onboarding/`): Complete user acquisition flow
  - Step 1: Add first girl profile
  - Step 2: Add expense data entry
  - Step 3: Email collection (prepared for Clerk verification)
  - Results: CPN calculation with subscription upsell
  - Welcome pages: Different paths for free/premium users
- **SessionStorage State**: Onboarding progress tracked via `lib/onboarding/context.tsx`
- **Conversion Optimization**: Strategic paywall placement after value demonstration

### Sharing System Architecture
- **ShareService** (`lib/share/ShareService.ts`): Core sharing logic with privacy filtering
- **ShareContext** (`lib/share/ShareContext.tsx`): React context for sharing state management
- **Card Generation** (`lib/share/generators/`): Canvas-based image generation for shareable content
- **Privacy Controls** (`lib/share/privacy.ts`): Data anonymization and filtering system
- **Share Components** (`components/sharing/`): Reusable sharing UI components

### New Page Components
- **Overview Page** (`app/overview/page.tsx`): Comprehensive tabular data view with mobile-responsive cards
- **Share Dashboard** (`app/share/page.tsx`): Social sharing hub with achievement badges and stat cards

### Core Data Models
```typescript
// Girl Profile (lib/types.ts)
interface Girl {
  id: string;           // UUID
  name: string;
  age: number;          // 18+ validation
  nationality: string;  // Now "Ethnicity (Optional)" in UI
  rating: number;       // 5.0-10.0 in 0.5 increments, tile-based UI
  createdAt: Date;
  updatedAt: Date;
}

// Data Entry
interface DataEntry {
  id: string;           // UUID
  girlId: string;       // Foreign key
  date: Date;
  amountSpent: number;
  durationMinutes: number;
  numberOfNuts: number;
  createdAt: Date;
  updatedAt: Date;
}

// Calculated metrics are derived in real-time
interface GirlWithMetrics extends Girl {
  metrics: CalculatedMetrics;
  totalEntries: number;
}
```

### Critical Business Logic
- **Cost per Nut** = Total Spent / Total Nuts
- **Time per Nut** = Total Time / Total Nuts (in minutes)
- **Cost per Hour** = Total Spent / (Total Time in hours)
- **Nuts per Hour** = Total Nuts / (Total Time in hours) - Added to Overview page
- **Sharing Privacy** = Client-side data filtering with configurable anonymization

## Design System Implementation

### Custom CSS Classes (app/globals.css)
```css
.btn-cpn          # Primary yellow buttons with 100px border radius
.input-cpn        # Form inputs with dark theme and yellow focus states
.card-cpn         # Container cards with proper borders and padding
.sidebar-item     # Navigation items with active yellow highlighting
.mobile-nav-item  # Bottom navigation with active states
.table-cpn        # Data tables with hover effects and proper borders
```

### Brand Colors (CSS Variables)
- `--color-cpn-yellow`: #f2f661 (Primary brand color)
- `--color-cpn-dark`: #1f1f1f (Main background)
- `--color-cpn-dark2`: #2a2a2a (Elevated surfaces, cards)
- `--color-cpn-white`: #ffffff (Primary text)
- `--color-cpn-gray`: #ababab (Secondary text, borders)

### Typography
- **Headings**: National2Condensed font (`font-heading`)
- **Body**: ESKlarheit font (`font-body`)
- **Font files**: Located in both `/design/fonts/` and `/public/fonts/`

## Special Implementation Details

### Hotness Rating System
- **UI**: Tile-based selection (5.0-10.0 in 0.5 increments)
- **Layout**: Two rows - 5.0-7.5 (6 tiles), 8.0-10.0 (5 tiles)
- **Labels**: "5.0-6.0: Below Average" and "8.5-10.0: Exceptional"
- **Default**: 6.0 rating for new profiles

### Form Patterns
- **Ethnicity Field**: Dropdown with "Prefer not to say" default, optional analytics
- **Validation**: Real-time with error states
- **Modals**: Consistent patterns across Add/Edit operations

### Navigation Behavior
- **Active States**: Yellow highlighting for current page
- **Route Matching**: Special handling for `/girls` route (dashboard)
- **Active Features**: Overview (TableCellsIcon), Share (ShareIcon), Analytics, Data Vault all functional
- **Disabled Items**: Grayed out "coming soon" features (Leaderboards, Subscription)

## Next.js 15 Specific Notes

### Params Handling
Dynamic routes use `params` which is now a Promise in Next.js 15. Current implementation acknowledges the warning but remains functional:
```typescript
// TODO: Next.js 15 - params is now a Promise, will be fixed in future version
const id = params.id; // Shows warning but app functions correctly
```

### App Router Structure
- Uses new App Router with proper TypeScript integration
- Server/Client components properly separated with 'use client' directives
- Metadata API used in layout.tsx for SEO

## Development Roadmap Strategy

**Current Strategy**: Complete local feature set before design perfection (see Roadmap.md)

### Phase-Based Development Approach
1. **Phase 1**: Complete Feature Set - Local Implementation (ROUGH but functional)
2. **Phase 2**: Design System Perfection (with full system context)
3. **Phase 3**: UX Flow Enhancement (across complete application)
4. **Phases 4-8**: Advanced features, optimization, and Supabase migration

### Subscription Tier Implementation
- **Free Tier ("Boyfriend Mode")**: 1 girl max, dashboard access with strategic paywalls
- **Premium Tier ("Player Mode")**: 50 girls max (hidden limit), full features, $1.99/week
- **Lifetime Access**: Everything plus API access and priority support

### Paywall Strategy
- **Free users can navigate and click** throughout the app
- **Strategic paywalls** appear when accessing premium features (Leaderboards, Analytics, etc.)
- **Beautiful conversion-focused paywalls** with testimonials, feature lists, and upgrade CTAs
- **Dashboard remains accessible** to demonstrate core value proposition

### Development Workflow

#### Phase 1 - Feature Implementation (Current)
1. Build rough but complete versions of all features
2. Focus on functionality over visual polish
3. ✅ **Completed**: Overview page (1.45), Share dashboard with full functionality (1.6)
4. ✅ **Completed**: Canvas-based sharing system with privacy controls
5. Create placeholder pages for: Leaderboards, Profile, Settings, Billing
6. Implement mock multi-user data for testing complete feature set

#### Post-Phase 1 - System-Wide Polish
1. Design system perfection with full feature context
2. Component consistency across entire application
3. UX flow enhancement with complete user journeys

### Mock Data Strategy
- Create realistic multi-user datasets for testing
- Simulate leaderboard competition and rankings
- Generate data vault aggregate statistics
- Test all features with varied data scenarios

### Data Management
- All data persists to localStorage during local development
- State changes trigger real-time metric recalculation
- CRUD operations available via custom hooks
- Supabase migration planned after complete local feature set

## Tech Stack
- **Framework**: Next.js 15.5 with App Router
- **UI**: React 19.0.0 with TypeScript 5.6.2
- **Styling**: Tailwind CSS 4.1.0 with custom theme
- **Icons**: Heroicons 2.2.0
- **Charts**: Recharts 3.1.2 (for analytics)
- **Node**: 22.x (DigitalOcean deployment ready)

## Configuration Files
- **next.config.js**: Standalone output for deployment + image domains
- **postcss.config.mjs**: Tailwind CSS 4.0 PostCSS plugin
- **tsconfig.json**: Strict TypeScript with path aliases (@/)
- **.gitignore**: Excludes node_modules, .next, .env.local

## Recently Implemented Features

### 1.45 Overview Page Implementation (Completed)
- **Spreadsheet-style interface** with comprehensive tabular data view
- **All core metrics displayed**: Name, Rating, Total Nuts, Total Spent, Cost per Nut, Total Time, Time per Nut, Cost per Hour, **Nuts per Hour** (newly added)
- **Row-level actions**: Add Data (direct navigation), Edit Profile (modal), Delete Profile (confirmation)
- **Advanced sorting**: All columns sortable with visual indicators and persistent preferences
- **Mobile responsive design**: Card-based layout with progressive disclosure pattern
- **Enhanced mobile UX**: 3-column metric grid, expandable details, touch-optimized actions
- **Location**: `app/overview/page.tsx` with TableCellsIcon in navigation

### 1.6 Sharing Feature Implementation (Completed)
- **Comprehensive sharing system** with privacy-first architecture
- **Canvas-based image generation** for shareable statistics and achievement cards
- **ShareService architecture**: Core sharing logic with format conversion (image, HTML, markdown, JSON)
- **Privacy controls**: Configurable data anonymization and filtering via `lib/share/privacy.ts`
- **ShareButton components**: Multiple variants (primary, secondary, icon-only) with convenience wrappers
- **SharePreviewModal**: Live preview with format selection and privacy controls
- **Achievement badge system**: Tier-based unlockables with visual badge generation
- **File structure**: Complete `/lib/share/` directory with modular architecture
  - `ShareService.ts`: Core sharing functionality
  - `ShareContext.tsx`: React context for state management
  - `types.ts`: Comprehensive TypeScript interfaces
  - `privacy.ts`: Data filtering and anonymization
  - `generators/CardGenerator.ts`: Canvas-based image generation
- **Component integration**: ShareButtons added to Girls, Analytics, and Data Vault pages
- **Location**: `app/share/page.tsx` with ShareIcon activated in navigation

### Mobile Responsiveness Enhancements
- **Overview page mobile optimization**: Transformed desktop table into intuitive card system
- **Progressive disclosure pattern**: "More metrics" expandable section to reduce cognitive load
- **Touch-optimized interactions**: Larger tap targets, improved spacing, visual feedback
- **Responsive breakpoints**: Clean transitions between desktop table and mobile cards
- **Action button optimization**: Prominent "Add Data" CTA with compact edit/delete actions

### Navigation System Updates
- **Overview navigation**: Added TableCellsIcon to both Sidebar and MobileNav
- **Share activation**: Enabled Share navigation item across all breakpoints
- **Route handling**: Proper active state management for new pages
- **Consistency**: Maintained design patterns across existing and new navigation items

### Affiliate System Architecture
- **Rewardful Integration** (`app/api/webhooks/rewardful/`): Webhook handler for affiliate events
- **Referral Tracking**: Join links via `app/join/[token]/page.tsx`
- **Referrals Dashboard** (`app/referrals/page.tsx`): Affiliate performance tracking
- **Environment Variables**:
  ```bash
  NEXT_PUBLIC_REWARDFUL_API_KEY=2dfb17
  REWARDFUL_SECRET_KEY=your_secret_key
  REWARDFUL_WEBHOOK_SECRET=your_webhook_secret
  ```

### API Routes
- `/api/global-stats`: Aggregated statistics endpoint
- `/api/webhooks/rewardful`: Affiliate system webhook handler

### Development Infrastructure
- **TodoWrite integration**: Systematic progress tracking for complex multi-step implementations
- **Type safety**: Added SortConfig and other missing TypeScript interfaces to `lib/types.ts`
- **Context integration**: New features properly integrated with existing useGirls and useDataEntries hooks
- **Error handling**: Proper validation and error states for new components

### Roadmap Documentation Updates
- **1.45 Overview Page**: Added between existing features with comprehensive mobile UX documentation
- **1.7 Onboarding Flow**: Complete 5-step user acquisition funnel (authentication and payment prepared but not active)
- **1.8 Affiliate Integration**: Rewardful-powered affiliate system with zero-friction activation and built-in viral sharing

## Important Implementation Notes

### Current Authentication/Payment Status
- **NO active authentication**: This version excludes Clerk integration (see "No-Auth" in repo name)
- **NO active payment processing**: This version excludes Stripe (see "no-Stripe" in repo name)
- **Prepared for integration**: UI and flows designed for future Clerk + Stripe implementation
- **All data is local**: Using localStorage, no backend database currently active

### Component Organization
```
/components/
├── cards/          # Profile and statistics cards
├── modals/         # All modal components (Add, Edit, Delete, Paywall)
├── sharing/        # Share functionality components
├── tables/         # Data display tables
├── navigation/     # Sidebar and MobileNav
└── ui/            # Reusable UI components
```

### Key Files to Know
- `lib/context.tsx`: Main app state management
- `lib/storage.ts`: localStorage CRUD operations
- `lib/calculations.ts`: All metric calculations
- `lib/onboarding/context.tsx`: Onboarding flow state
- `lib/share/ShareService.ts`: Sharing functionality core