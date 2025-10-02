# Local Storage System

## 1) Context (why this exists)
The app needs to persist user data locally in the browser without requiring a backend database. This allows users to track their dating data privately while keeping the app simple and avoiding server costs during development.

## 2) User Journey (step-by-step)
- User opens the app for the first time and sees demo data automatically loaded
- User creates profiles and data entries which save immediately to browser storage
- User closes browser and returns later - all their data is still there
- User can export their data as a JSON file for backup purposes
- User can import previously exported data to restore their information
- User can clear all data if they want to start fresh
- System automatically migrates data structure when app updates are deployed

## 3) Technology (what it uses today)
Uses browser localStorage API with JSON serialization for all data persistence. No backend database is involved. Core functionality is in:
- `lib/storage.ts` - Complete CRUD operations for girls and data entries (~1-216)
- `lib/context.tsx` - Loads data on app startup (~157-173)
- `lib/migrations.ts` - Automatic data structure migrations
- `lib/templateData.ts` - Demo data for new users

The system uses these localStorage keys:
- `cpn_girls` - All girl profiles
- `cpn_data_entries` - All dating data entries
- `cpn-user-achievements` - Achievement progress
- `cpn-share-preferences` - Sharing preferences
- `cpn_user_profile` - User profile settings
- `cpn_datetime_settings` - Date/time preferences
- `cpn_notification_settings` - Notification preferences
- `cpn_privacy_settings` - Privacy settings
- Additional keys for leaderboards, share history, and sort preferences

## 4) Design Directions (what it looks/feels like)
Storage operations happen invisibly - users don't see loading states for local data. Error handling shows user-friendly messages when localStorage is full or unavailable. Export creates downloadable JSON files with proper filename timestamps. Import accepts drag-and-drop or file selection. Data size is displayed in settings. Clear data requires confirmation dialogs. Template data provides realistic examples for new users.

## Data We Store (plain-English "table idea")
All data is stored as JSON strings in browser localStorage. Each piece of data includes:
- `metadata` (creation/update timestamps, app version info)
- `girls` (array of all girl profiles with UUIDs)
- `dataEntries` (array of all dating data linked to girls)
- `userPreferences` (settings, privacy options, UI preferences)
- `achievements` (unlocked achievements and progress tracking)
- `shareHistory` (history of shared content and preferences)

## Who Can See What (safety/permissions in plain words)
Data is completely private to the individual browser installation. No data is sent to servers. Other users on the same computer would need to use the same browser profile to access the data. Incognito/private browsing modes don't persist data. Browser storage can be cleared by browser settings or privacy tools.

## Acceptance Criteria (done = true)
- All user data saves automatically when created or modified
- Data persists when browser is closed and reopened
- Demo data loads for first-time users
- Export creates downloadable JSON backup files
- Import correctly restores data from exported files
- Data migrations run automatically when app version changes
- Clear data function removes all stored information
- Storage size tracking works correctly
- Error handling gracefully manages localStorage failures
- Server-side rendering doesn't break due to localStorage access
- Template data clears when user creates their first real data

## Open Questions / Assumptions
The system assumes localStorage will always be available and won't hit browser storage limits. Migration strategy may need improvement for major data structure changes. Backup/restore doesn't include user preferences beyond the core data. Browser compatibility with localStorage is assumed to be universal.

## Code References
- `lib/storage.ts: 1-216` - Complete localStorage CRUD system
- `lib/context.tsx: 157-173` - Data loading on app startup
- `lib/migrations.ts` - Automatic migration system
- `lib/templateData.ts` - Demo data for new users
- `app/settings/page.tsx: 122-149` - Settings localStorage usage
- `lib/share/ShareContext.tsx: 175-193` - Share preferences storage
- `lib/achievements/AchievementService.ts: 366-397` - Achievement storage