/**
 * @deprecated This file is deprecated. All data operations now use the database.
 * This file is kept only for backward compatibility with migration utilities.
 *
 * For data operations, use:
 * - lib/database/girls.ts
 * - lib/database/dataEntries.ts
 * - lib/database/session.ts
 */

// Re-export storage keys for migration utility only
export const GIRLS_STORAGE_KEY = 'cpn_girls';
export const DATA_ENTRIES_STORAGE_KEY = 'cpn_data_entries';

// Note: All girlsStorage and dataEntriesStorage functions have been removed.
// The app now uses database operations exclusively via API routes.
