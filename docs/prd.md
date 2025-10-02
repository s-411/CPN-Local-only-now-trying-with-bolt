# Product Requirements Document (PRD) - CPN v1.0
## Cost Per Nut Calculator App - MVP

---

## 1. Executive Summary

CPN (Cost Per Nut) is a calculator-style web application that enables users to track and analyze personal relationship metrics. The MVP focuses on core data entry, calculation, and visualization features without authentication, allowing users to manage profiles ("girls"), log interactions, and view comprehensive analytics.

### Key Objectives
- Enable quick and accurate data entry for multiple profiles
- Provide real-time calculation of key metrics (cost per nut, time per nut, cost per hour)
- Display comprehensive analytics and trends
- Maintain a simple, calculator-like user experience

---

## 2. Core User Flow

### 2.1 Primary User Journey
1. **View Dashboard** → User lands on Girls page showing all profiles
2. **Add New Girl** → Modal appears for profile creation
3. **Auto-redirect to Add Data** → User immediately enters first data entry
4. **View Real-time Updates** → Statistics update instantly as data is entered
5. **Access Overview** → Table view of all girls with comprehensive metrics
6. **Review Analytics** → Visual insights and trends across all profiles

---

## 3. Feature Requirements

### 3.1 Girls Page (Dashboard)
**Purpose**: Central hub for managing all profiles

#### Components:
- **Profile Tiles Grid**
  - Display all existing girls as cards/tiles
  - Show key metrics per girl on each tile
  - Quick actions: Edit and Add Data buttons per tile
  
- **Add New Girl Button**
  - Prominent placement (e.g., floating action button or header)
  - Triggers modal overlay

#### Add New Girl Modal:
- **Fields** (all required):
  - Name (text input)
  - Age (number input, 18+ validation)
  - Nationality (text input or dropdown)
  - Rating (slider/selector, 5.0-10.0 in 0.5 increments)
- **Actions**:
  - Save button (bottom right)
  - Cancel/close option
- **Post-Save Behavior**: Auto-redirect to Add Data page for that specific girl

---

### 3.2 Add Data Page (Individual Girl)
**Purpose**: Data entry and statistics view for a specific girl

#### Layout: Two-column design

**Left Column - Data Entry Form:**
- **Fields**:
  - Date (date picker, defaults to today)
  - Amount Spent (currency input with $ prefix)
  - Duration (split fields):
    - Hours (number, 0-23)
    - Minutes (number, 0-59)
  - Number of Nuts (number input, minimum 0)
- **Submit Button**: "Add Entry" (prominent placement)

**Right Column - Statistics:**
- **Girl Summary Card**:
  - Name and rating display
  - Age and nationality
- **Overall Statistics Card** (updates in real-time):
  - Total Spent
  - Total Nuts
  - Average Cost per Nut
  - Total Time
  - Average Time per Nut
  - Cost per Hour

**Bottom Section - History Table:**
- **Columns**:
  - Date
  - Amount
  - Duration
  - Nuts
  - Cost/Nut
  - Actions (Edit icon, Delete icon)
- **Features**:
  - Sortable by date (default: newest first)
  - Edit triggers inline editing or modal
  - Delete shows confirmation dialog
  - Real-time update of statistics when history is modified

---

### 3.3 Overview Page
**Purpose**: Comprehensive table view of all girls with key metrics

#### Table Structure:
- **Columns**:
  1. Name (sortable)
  2. Rating (sortable)
  3. Total Nuts (sortable)
  4. Total Spent (sortable)
  5. Cost per Nut (calculated, sortable)
  6. Total Time (sortable)
  7. Time per Nut (calculated, sortable)
  8. Cost per Hour (calculated, sortable)
  9. Add Data (button per row → redirects to Add Data page)
  10. Actions (Edit icon, Delete icon)

#### Features:
- **Delete Confirmation**: Two-step confirmation with warning message
- **Edit Functionality**: Opens modal with girl's current details
- **Empty State**: Message when no girls exist with CTA to add first girl
- **Responsive Design**: Horizontal scroll on mobile for full table access

---

### 3.4 Analytics Page
**Purpose**: Account-wide metrics and visualizations

#### Top Section - Summary Cards:
- **Total Spent** (across all profiles)
- **Total Nuts** (across all profiles)
- **Total Time** (across all profiles)
- **Active Profiles** (count of girls with at least one entry)

#### Graphs Section:
1. **Total Spent per Girl** (bar chart)
2. **Cost per Nut Comparison** (bar or line chart)
3. **Time Spent per Girl** (bar chart)
4. **Monthly Spending Trends** (line chart over time)
5. **Cost Efficiency Trends** (line chart showing cost/nut over time)
6. **Performance Insights** (optional: correlation charts)

#### Features:
- Interactive charts (hover for details)
- Time range selector (Last 7 days, 30 days, 90 days, All time)
- Export capability (future enhancement)

---

### 3.5 Data Entry Page (General)
**Purpose**: Quick data entry without navigating to specific girl page

#### Components:
- **Girl Selector Dropdown** (required, at top of form)
  - Lists all existing girls
  - Shows name and rating for easy identification
  
- **Centered Form** (same fields as Add Data page):
  - Date
  - Amount Spent
  - Hours and Minutes
  - Number of Nuts
  
- **Submit Button**: "Add Entry"
- **Success Feedback**: Toast notification or inline message
- **No Statistics Display** (differentiator from individual Add Data page)

---

## 4. Data Model


### 4.1 Calculated Metrics
- **Cost per Nut** = Total Spent / Total Nuts
- **Time per Nut** = Total Time / Total Nuts
- **Cost per Hour** = Total Spent / (Total Time in hours)

---

## 5. Technical Requirements

### 5.1 Core Functionality
- **Real-time Updates**: All statistics update immediately upon data entry/modification
- **Data Persistence**: Local storage initially (no auth/backend in MVP - will eventually use Supabase Postgres)
- **Validation**: Form validation for all inputs
- **Error Handling**: User-friendly error messages
- **Responsive Design**: PWA Mobile-first approach

### 5.2 Performance
- **Instant Calculations**: < 100ms for statistic updates
- **Smooth Transitions**: Page navigation and modal animations
- **Optimized Rendering**: Virtual scrolling for large history tables

---

## 6. UI/UX Principles
### 6.1 Design System
- 100% adhearance to global.css
- **Typography**: 
  - Headers: National-2-Condensed-Bold
  - Body: ESKlarheitGrotesk-Rg
- **Color Palette**: As defined in globals.css
- **Component Library**: Tailwind CSS configuration
- **Layout**: Clean, calculator-like interface with clear data hierarchy

### 6.2 Interaction Patterns
- **Modals**: For add/edit operations
- **Inline Editing**: Where appropriate in tables
- **Toast Notifications**: For success/error feedback
- **Loading States**: Skeleton screens or spinners
- **Empty States**: Helpful messages and CTAs

---

## 7. Navigation Structure

### Primary Navigation (Left Sidebar)
1. **Girls** (Dashboard - default view)
2. **Overview** (Table view)
3. **Analytics** (Charts and insights)
4. **Data Entry** (Quick entry form)
5. **Settings** (Future - greyed out in MVP)
6. **Profile** (Future - greyed out in MVP)

---

## 8. Success Criteria

### MVP Launch Requirements
- [ ] Users can create and manage multiple girl profiles
- [ ] Data entry is quick and intuitive
- [ ] All calculations are accurate and update in real-time
- [ ] History is editable and deletable with proper confirmations
- [ ] Overview table provides comprehensive at-a-glance metrics
- [ ] Analytics page shows meaningful visualizations
- [ ] Data persists between sessions (local storage)
- [ ] Mobile-responsive design works on all devices

---

## 9. Out of Scope for v1.0
- User authentication/accounts
- Cloud data sync
- Social features (leaderboards, sharing)
- Data export functionality
- Advanced filtering and search
- Notifications/reminders
- Multi-currency support
- Light mode toggle
- Settings page functionality
- Profile management

---

## 10. Implementation Priority

### Phase 1 - Core Data Flow
1. Girls page with add/edit functionality
2. Add Data page with real-time calculations
3. Data persistence in local storage

### Phase 2 - Views and Analytics
1. Overview table with full metrics
2. Analytics page with charts
3. General Data Entry page

### Phase 3 - Polish
1. Animations and transitions
2. Error handling improvements
3. Mobile optimization
4. Performance enhancements

---

*Document Version: 1.0*  
*Last Updated: [Current Date]*  
*Status: Ready for Development*