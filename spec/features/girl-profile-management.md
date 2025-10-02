# Girl Profile Management

## 1) Context (why this exists)
Users need to track multiple dating relationships by creating detailed profiles for each person they're dating. This allows them to organize their dating expenses and calculate metrics per person.

## 2) User Journey (step-by-step)
- User clicks "Add Girl" button on the Girls Dashboard
- A modal form opens with fields for name, age, ethnicity, hair color, hotness rating, and active status
- User fills out required fields (name, age, rating) and optionally demographic details
- User selects hotness rating from 5.0-10.0 using a tile-based selector (0.5 increments)
- User saves and the new profile appears immediately in their dashboard
- User can later click "Edit" on any profile to modify details
- User can click "Delete" with a confirmation dialog to remove profiles
- User can mark profiles as inactive to hide them from main views while keeping data

## 3) Technology (what it uses today)
Uses React Context with useReducer for state management. All profile data is stored in localStorage with the key `cpn_girls`. The main functions are in:
- `lib/storage.ts: girlsStorage` - CRUD operations for girl profiles (~29-90)
- `lib/context.tsx: useGirls()` - React hooks for managing girl data (~191-233)
- `components/modals/AddGirlModal.tsx` - Form for creating new profiles
- `components/modals/EditGirlModal.tsx` - Form for editing existing profiles
- `lib/types.ts: Girl interface` - Data structure definition (~30-43)

The system automatically generates UUIDs for each profile using `crypto.randomUUID()` and tracks creation/update timestamps. When profiles are deleted, all associated data entries are also removed via `dataEntriesStorage.deleteByGirlId()`.

## 4) Design Directions (what it looks/feels like)
Modal forms use the custom design system with yellow accent colors and dark theme. The hotness rating selector displays as two rows of tiles - first row has ratings 5.0-7.5 (6 tiles), second row has 8.0-10.0 (5 tiles). Forms include real-time validation with error messages. The ethnicity dropdown defaults to "Prefer not to say" and is optional for privacy. Profile cards on the dashboard show profile pictures (emoji avatars), names, ratings, and key metrics. Edit and delete buttons appear on hover with icon-based actions.

## Data We Store (plain-English "table idea")
- `id` (unique identifier generated automatically)
- `name` (display name for the person)
- `age` (age in years, must be 18 or older)
- `nationality` (legacy field, now used as free-text ethnicity)
- `ethnicity` (structured dropdown with options like Asian, Black, Latina, White, etc.)
- `hairColor` (dropdown with options like Blonde, Brunette, Black, Red, etc.)
- `rating` (hotness score from 5.0-10.0 in 0.5 increments)
- `isActive` (boolean flag to show/hide profiles)
- `location` (optional city and country data)
- `createdAt`, `updatedAt` (automatic timestamps)

## Who Can See What (safety/permissions in plain words)
All profile data is stored locally in the user's browser only. No other user can see this data. The app has no multi-user system currently - each browser installation is completely isolated. When sharing features are used, profile names can be anonymized (like "Girl A", "Girl B") based on privacy settings.

## Acceptance Criteria (done = true)
- User can create a new girl profile with required fields (name, age, rating)
- User can edit any existing profile and changes are saved immediately
- User can delete a profile and it disappears from all views
- When a profile is deleted, all associated data entries are also removed
- Rating selector works correctly with tile-based UI from 5.0-10.0
- Age validation prevents entries under 18
- Ethnicity field is optional and defaults to "Prefer not to say"
- Profile data persists when browser is refreshed
- Active/inactive status correctly shows/hides profiles
- Real-time validation shows errors before submission

## Open Questions / Assumptions
The code uses both `nationality` (legacy) and `ethnicity` (new) fields, which could be confusing. The rating system assumes 5.0 is the minimum but UI labels suggest "Below Average" starts at 5.0-6.0. Location data structure exists but may not be fully implemented in the UI forms.

## Code References
- `lib/storage.ts: 29-90` - Core CRUD operations for girl profiles
- `lib/context.tsx: 191-233` - React hooks and state management
- `lib/types.ts: 30-43` - Girl interface definition
- `components/modals/AddGirlModal.tsx` - Profile creation form
- `components/modals/EditGirlModal.tsx` - Profile editing form
- `app/girls/page.tsx` - Main dashboard displaying profiles
- `components/cards/GirlCard.tsx` - Individual profile card component