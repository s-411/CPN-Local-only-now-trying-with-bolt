CPN Calculator App - Implementation Plan

    📋 Analysis Summary

    After reviewing the PRD, design system, and UI screenshots, I've identified the 
    core requirements:
    - MVP Focus: Calculator-style app for tracking personal metrics with localStorage
     (no backend)
    - Key Flow: Add Girl → Auto-redirect to Add Data → Real-time statistics
    - Design: Dark theme with CPN Yellow accent (#f2f661), professional c2alculator 
    aesthetic
    - Performance: Real-time updates (<100ms), instant calculations
    - Navigation: Sidebar for desktop, bottom tabs for mobile

    🏗️ Implementation Strategy

    Phase 1: Project Foundation (Setup & Core Infrastructure)

    1. Initialize Next.js 15.5 project with TypeScript and App Router
    2. Configure Tailwind CSS 4.1 with custom design tokens (colors, fonts, 
    rounded-cpn button)
    3. Set up custom fonts (National 2 Condensed Bold, ES Klarheit Grotesk)
    4. Create localStorage service layer with TypeScript interfaces for data models
    5. Build responsive navigation (sidebar + mobile bottom tabs)
    6. Implement global state management using React Context for real-time updates

    Phase 2: Core Data Flow

    1. Girls Page (Dashboard)
      - Profile tiles grid with key metrics
      - Add New Girl modal with form validation
      - Auto-redirect to Add Data page after creation
    2. Add Data Page (Individual)
      - Two-column layout (form left, statistics right)
      - Real-time calculation updates
      - History table with edit/delete capabilities
      - Girls Summary card with ratings

    Phase 3: Analytics & Views

    1. Overview Page
      - Comprehensive data table with sorting
      - All metrics per girl
      - Quick "Add Data" buttons per row
    2. Analytics Page
      - Summary cards (Total Spent, Total Nuts, etc.)
      - Interactive charts (spending trends, comparisons)
      - Time range selector
    3. Data Entry Page
      - Quick general entry with girl selector
      - Clean centered form
      - Success notifications

    Phase 4: Polish & Optimization

    1. Mobile responsiveness fine-tuning
    2. Loading states and skeleton screens
    3. Error handling with user-friendly messages
    4. Performance optimization (memoization, virtual scrolling)
    5. Animations (fade-in, slide-up transitions)

    🛠️ Technical Architecture

    Data Models

    interface Girl {
      id: string;
      name: string;
      age: number;
      nationality: string;
      rating: number; // 5.0-10.0, 0.5 increments
      createdAt: Date;
      updatedAt: Date;
    }

    interface DataEntry {
      id: string;
      girlId: string;
      date: Date;
      amountSpent: number;
      durationMinutes: number;
      numberOfNuts: number;
      createdAt: Date;
      updatedAt: Date;
    }

    Folder Structure

    /app
      /layout.tsx (root layout with navigation)
      /page.tsx (redirects to /girls)
      /girls/page.tsx
      /girls/[id]/add-data/page.tsx
      /overview/page.tsx
      /analytics/page.tsx
      /data-entry/page.tsx
    /components
      /navigation/Sidebar.tsx
      /navigation/MobileNav.tsx
      /modals/AddGirlModal.tsx
      /cards/StatisticsCard.tsx
      /tables/DataHistoryTable.tsx
    /lib
      /storage.ts (localStorage service)
      /calculations.ts (metric calculations)
      /types.ts (TypeScript interfaces)
    /hooks
      /useGirls.ts
      /useDataEntries.ts
      /useRealTimeStats.ts
    /public/fonts (custom font files)

    Key Implementation Details

    - State Management: React Context for global state with localStorage sync
    - Real-time Updates: useEffect hooks + context updates for instant calculations
    - Responsive Design: Tailwind breakpoints (sm/md/lg) for adaptive layouts
    - Form Validation: Zod schemas with React Hook Form
    - Charts: Recharts library for analytics visualizations
    - Date Handling: date-fns for formatting and calculations

    📝 Implementation Order

    1. Setup → Project init, Tailwind config, fonts, localStorage service
    2. Navigation → Layout with sidebar/mobile nav
    3. Girls Page → CRUD operations with modal
    4. Add Data Page → Form + real-time stats + auto-redirect flow
    5. Overview Page → Data table with sorting
    6. Analytics Page → Charts and insights
    7. Data Entry Page → Quick entry form
    8. Polish → Animations, error handling, performance

    ✅ Success Metrics

    - All calculations update in <100ms
    - Data persists across sessions
    - Smooth auto-redirect after adding girls
    - Mobile-responsive on all devices
    - Matches screenshot UI/UX exactly
    - Clean, professional calculator aesthetic