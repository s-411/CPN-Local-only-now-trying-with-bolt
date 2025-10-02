import { Girl, EthnicityOption } from './types';
import { girlsStorage } from './storage';

/**
 * Migration utility for updating existing girl profiles with new demographic structure
 */

// Mapping from old nationality text values to new EthnicityOption values
const NATIONALITY_TO_ETHNICITY_MAP: Record<string, EthnicityOption> = {
  'Asian': 'Asian',
  'Black/African American': 'Black',
  'Black': 'Black',
  'Hispanic/Latino': 'Latina',
  'Hispanic': 'Latina',
  'Latino': 'Latina',
  'Latina': 'Latina',
  'White/Caucasian': 'White',
  'White': 'White',
  'Caucasian': 'White',
  'Middle Eastern': 'Middle Eastern',
  'Indian': 'Indian',
  'Native American': 'Native American',
  'Pacific Islander': 'Pacific Islander',
  'Mixed/Multiracial': 'Mixed',
  'Mixed': 'Mixed',
  'Multiracial': 'Mixed',
  'Other': 'Other'
};

/**
 * Migrates existing girl profiles to include structured demographic fields
 * Maps old nationality text values to new ethnicity enum values
 * Adds empty hair color and location fields for future completion
 */
export function migrateGirlProfiles(): {
  migrated: number;
  skipped: number;
  errors: string[];
} {
  const results = {
    migrated: 0,
    skipped: 0,
    errors: [] as string[]
  };

  try {
    const girls = girlsStorage.getAll();
    
    girls.forEach(girl => {
      try {
        // Skip if already migrated (has ethnicity field AND isActive field)
        if (girl.ethnicity !== undefined && girl.isActive !== undefined) {
          results.skipped++;
          return;
        }

        // Map old nationality to new ethnicity structure
        let ethnicity: EthnicityOption | undefined = undefined;
        
        if (girl.nationality) {
          const normalizedNationality = girl.nationality.trim();
          ethnicity = NATIONALITY_TO_ETHNICITY_MAP[normalizedNationality];
          
          // If no direct match found, try fuzzy matching
          if (!ethnicity) {
            const lowerNationality = normalizedNationality.toLowerCase();
            for (const [key, value] of Object.entries(NATIONALITY_TO_ETHNICITY_MAP)) {
              if (key.toLowerCase().includes(lowerNationality) || 
                  lowerNationality.includes(key.toLowerCase())) {
                ethnicity = value;
                break;
              }
            }
          }
        }

        // Update the girl with new demographic fields
        const updatedGirl: Girl = {
          ...girl,
          ethnicity,
          hairColor: undefined, // User will need to fill this in
          location: undefined,  // User will need to fill this in
          isActive: girl.isActive ?? true, // Default to active for existing girls
          updatedAt: new Date()
        };

        // Save updated girl
        girlsStorage.update(girl.id, {
          ethnicity: updatedGirl.ethnicity,
          hairColor: updatedGirl.hairColor,
          location: updatedGirl.location,
          isActive: updatedGirl.isActive
        });

        results.migrated++;
      } catch (error) {
        results.errors.push(`Error migrating girl ${girl.name} (${girl.id}): ${error}`);
      }
    });

  } catch (error) {
    results.errors.push(`General migration error: ${error}`);
  }

  return results;
}

/**
 * Checks if migration is needed by looking for girls without ethnicity field
 */
export function needsMigration(): boolean {
  try {
    const girls = girlsStorage.getAll();
    return girls.some(girl => girl.ethnicity === undefined || girl.isActive === undefined);
  } catch (error) {
    console.error('Error checking migration status:', error);
    return false;
  }
}

/**
 * Gets migration statistics without performing the migration
 */
export function getMigrationStats(): {
  total: number;
  needsMigration: number;
  alreadyMigrated: number;
} {
  try {
    const girls = girlsStorage.getAll();
    const needsMigration = girls.filter(girl => girl.ethnicity === undefined || girl.isActive === undefined);
    const alreadyMigrated = girls.filter(girl => girl.ethnicity !== undefined && girl.isActive !== undefined);

    return {
      total: girls.length,
      needsMigration: needsMigration.length,
      alreadyMigrated: alreadyMigrated.length
    };
  } catch (error) {
    console.error('Error getting migration stats:', error);
    return {
      total: 0,
      needsMigration: 0,
      alreadyMigrated: 0
    };
  }
}

/**
 * Auto-migration function that runs on app startup
 * Only migrates if needed and logs results
 */
export function autoMigrateIfNeeded(): void {
  try {
    if (!needsMigration()) {
      console.log('✅ Girl profiles migration: No migration needed');
      return;
    }

    const stats = getMigrationStats();
    console.log(`🔄 Starting girl profiles migration for ${stats.needsMigration} profiles...`);

    const results = migrateGirlProfiles();
    
    console.log(`✅ Girl profiles migration completed:
      - Migrated: ${results.migrated}
      - Skipped: ${results.skipped}
      - Errors: ${results.errors.length}`);

    if (results.errors.length > 0) {
      console.warn('Migration errors:', results.errors);
    }
  } catch (error) {
    console.error('Auto-migration failed:', error);
  }
}