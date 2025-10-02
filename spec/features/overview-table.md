# Overview Table

## 1) Context (why this exists)
Users need a comprehensive spreadsheet-style view of all their dating data to analyze patterns, compare metrics across different people, and perform bulk actions efficiently. The tabular format allows for better data analysis than individual profile cards.

## 2) User Journey (step-by-step)
- User clicks "Overview" in the navigation menu
- A table displays all girl profiles with key metrics in sortable columns
- User can click any column header to sort by that field (name, rating, spending, etc.)
- Clicking the same header twice reverses the sort direction
- User can click "Add Data" for any row to quickly add new data entries
- User can click "Edit" to modify profile details in a modal
- User can click "Delete" to remove profiles with confirmation dialog
- On mobile, the table transforms into card-based layout with expandable details
- Mobile cards show core metrics with "More metrics" expansion for additional data
- Sort preferences persist between browser sessions

## 3) Technology (what it looks/feels like)
Uses React state management with localStorage persistence for sort preferences. Core implementation is in:
- `app/overview/page.tsx` - Main overview table with sorting and responsive design (~1-200+)
- `lib/calculations.ts: sortGirlsByField()` - Sorting logic for different data types
- `lib/types.ts: SortConfig` - Sort configuration interface (~90-93)

The table displays calculated metrics from the main app context and uses the same modal components as the girls dashboard for consistency. Mobile responsive design transforms the desktop table into an intuitive card system.

## 4) Design Directions (what it looks/feels like)
Desktop shows a professional data table with hover effects, sortable headers with directional arrows, and action buttons on each row. Mobile transforms into cards with profile photos, names, key metrics, and expandable "More metrics" sections. Sort headers show visual indicators (up/down arrows) for current sort direction. Action buttons use icons for space efficiency. Loading states show skeleton placeholders. Empty states guide users to add their first profile.

## Data We Store (plain-English "table idea")
No additional data storage - the overview table displays existing girl profiles and calculated metrics. Sort preferences are stored in localStorage:
- `cpn-sort-preferences` (field name and direction for persistent sorting)

The table shows these calculated fields:
- `name` (girl's display name)
- `rating` (hotness rating 5.0-10.0)
- `totalNuts` (sum of all nuts from data entries)
- `totalSpent` (sum of all money spent)
- `costPerNut` (total spent divided by total nuts)
- `totalTime` (sum of all duration from data entries)
- `timePerNut` (total time divided by total nuts)
- `costPerHour` (total spent divided by total hours)
- `nutsPerHour` (total nuts divided by total hours)

## Who Can See What (safety/permissions in plain words)
All data displayed is from the user's local storage only. No data is shared with other users. The overview table respects the same privacy rules as other parts of the app - all data stays in the user's browser.

## Acceptance Criteria (done = true)
- Table displays all girl profiles with calculated metrics
- All columns are sortable with visual indicators
- Sort direction toggles between ascending and descending
- Sort preferences persist when browser is refreshed
- "Add Data" buttons navigate to correct profile data entry pages
- Edit buttons open profile edit modals with pre-filled data
- Delete buttons show confirmation dialogs before removing profiles
- Mobile responsive design transforms table into card layout
- Mobile cards show core metrics with expandable details section
- "More metrics" expansion works correctly on mobile
- Loading states display while data is being calculated
- Empty state guides users when no profiles exist

## Open Questions / Assumptions
Sort preference storage could conflict with other sorting throughout the app. Mobile card layout may not scale well with many profiles. Column selection/hiding functionality could be added for customization. Bulk actions (like deleting multiple profiles) are not currently supported.

## Code References
- `app/overview/page.tsx: 1-200+` - Complete overview table implementation
- `lib/calculations.ts: sortGirlsByField()` - Sorting logic for different data types
- `lib/types.ts: 90-93` - SortConfig interface for sort state
- `components/modals/EditGirlModal.tsx` - Profile editing modal integration
- `components/modals/DeleteWarningModal.tsx` - Delete confirmation dialog