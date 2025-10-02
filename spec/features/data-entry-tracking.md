# Data Entry Tracking

## 1) Context (why this exists)
Users need to track dating expenses, time spent, and intimacy outcomes for each person they're dating. This data is used to calculate cost-per-nut, time efficiency, and other relationship metrics for data-driven dating decisions.

## 2) User Journey (step-by-step)
- User navigates to a girl's profile or clicks "Add Data" button
- A form opens asking for date, amount spent, duration (hours/minutes), and number of nuts
- User selects or types the date of the encounter
- User enters amount spent in dollars (accepts decimals like $45.50)
- User enters duration using separate hours and minutes fields
- User enters number of nuts (intimacy events) as a whole number
- User saves and the entry appears in their data history
- User can later edit any entry by clicking on it in tables/lists
- User can delete entries with confirmation dialogs
- All metrics (cost-per-nut, etc.) recalculate automatically when data changes

## 3) Technology (what it uses today)
Uses React Context with useReducer for global state management. All data entries are stored in localStorage with the key `cpn_data_entries`. Core functionality is in:
- `lib/storage.ts: dataEntriesStorage` - CRUD operations for data entries (~93-167)
- `lib/context.tsx: useDataEntries()` - React hooks for managing entry data (~235-273)
- `components/modals/EditEntryModal.tsx` - Form for editing entries
- `app/girls/[id]/add-data/page.tsx` - Page for adding new data entries
- `lib/types.ts: DataEntry interface` - Data structure definition (~48-57)

The system links each entry to a girl profile via `girlId` foreign key. Automatic timestamps track when entries are created and modified. Real-time calculations happen in `lib/calculations.ts` whenever data changes.

## 4) Design Directions (what it looks/feels like)
Forms use the dark theme with yellow accent colors matching the app design. Date picker integrates with the form fields. Hours and minutes are separate input fields for easier entry. Amount spent accepts dollar formatting. The number of nuts field includes helpful validation. Data entries appear in reverse chronological order (newest first) in tables and lists. Edit/delete buttons appear on hover in data tables. Mobile responsive design adapts forms for touch input.

## Data We Store (plain-English "table idea")
- `id` (unique identifier generated automatically)
- `girlId` (links to which girl profile this data belongs to)
- `date` (when the encounter happened)
- `amountSpent` (money spent in dollars, stored as decimal number)
- `durationMinutes` (total time spent converted to minutes)
- `numberOfNuts` (count of intimacy events, whole number)
- `createdAt`, `updatedAt` (automatic timestamps)

## Who Can See What (safety/permissions in plain words)
All data entries are stored locally in the user's browser only. No other user can access this intimate data. The app has no multi-user system - each browser is completely private. When sharing features are used, the actual data can be anonymized or aggregated based on privacy settings.

## Acceptance Criteria (done = true)
- User can create new data entries for any girl profile
- User can edit existing entries and changes save immediately
- User can delete entries with confirmation dialog
- Date field accepts calendar input and manual typing
- Amount spent accepts decimal values and dollar formatting
- Duration splits between hours and minutes for easy entry
- Number of nuts validates as positive whole numbers
- Data entries persist after browser refresh
- Deleting a girl profile removes all associated data entries
- Metrics recalculate automatically when entries change
- Data entries sort by date (newest first) in all views

## Open Questions / Assumptions
The system assumes "nuts" is an appropriate term for intimacy tracking. Duration is stored internally as total minutes but displayed as hours/minutes for user convenience. Amount validation may need currency formatting improvements. The relationship between date of entry vs date of encounter could be clearer in the UI.

## Code References
- `lib/storage.ts: 93-167` - Core CRUD operations for data entries
- `lib/context.tsx: 235-273` - React hooks and state management
- `lib/types.ts: 48-57` - DataEntry interface definition
- `app/girls/[id]/add-data/page.tsx` - Add data entry page
- `components/modals/EditEntryModal.tsx` - Edit entry modal form
- `lib/calculations.ts` - Real-time metric calculations
- `components/tables/DataHistoryTable.tsx` - Table display component