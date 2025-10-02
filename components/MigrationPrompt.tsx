'use client';

import React, { useState, useEffect } from 'react';
import { ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { checkMigrationStatus, migrateLocalStorageToDatabase, clearLocalStorageData } from '@/lib/storage-migration';

export default function MigrationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState({
    hasLocalData: false,
    isMigrated: false,
    girlsCount: 0,
    entriesCount: 0,
  });
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationComplete, setMigrationComplete] = useState(false);
  const [migrationError, setMigrationError] = useState<string | null>(null);

  useEffect(() => {
    const status = checkMigrationStatus();
    setMigrationStatus(status);

    if (status.hasLocalData && !status.isMigrated) {
      setShowPrompt(true);
    }
  }, []);

  const handleMigrate = async () => {
    setIsMigrating(true);
    setMigrationError(null);

    const result = await migrateLocalStorageToDatabase();

    if (result.success) {
      setMigrationComplete(true);
      setTimeout(() => {
        setShowPrompt(false);
        window.location.reload();
      }, 2000);
    } else {
      setMigrationError(result.error || 'Migration failed. Please try again.');
      setIsMigrating(false);
    }
  };

  const handleSkip = () => {
    clearLocalStorageData();
    setShowPrompt(false);
    window.location.reload();
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-cpn-dark2 rounded-lg max-w-md w-full p-6 border border-cpn-gray/20">
        {!migrationComplete ? (
          <>
            <div className="flex items-start gap-4 mb-4">
              <ExclamationTriangleIcon className="w-8 h-8 text-cpn-yellow flex-shrink-0" />
              <div>
                <h2 className="text-xl font-heading text-white mb-2">
                  Local Data Found
                </h2>
                <p className="text-cpn-gray text-sm mb-4">
                  We found {migrationStatus.girlsCount} profile{migrationStatus.girlsCount !== 1 ? 's' : ''} and{' '}
                  {migrationStatus.entriesCount} entr{migrationStatus.entriesCount !== 1 ? 'ies' : 'y'} in your browser.
                  Would you like to migrate this data to the cloud?
                </p>
                <div className="space-y-3">
                  <button
                    onClick={handleMigrate}
                    disabled={isMigrating}
                    className="w-full btn-cpn flex items-center justify-center gap-2"
                  >
                    {isMigrating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-cpn-dark border-t-transparent rounded-full animate-spin" />
                        Migrating...
                      </>
                    ) : (
                      'Migrate to Cloud'
                    )}
                  </button>
                  <button
                    onClick={handleSkip}
                    disabled={isMigrating}
                    className="w-full py-2 px-4 rounded-full border border-cpn-gray/30 text-cpn-gray hover:border-cpn-gray hover:text-white transition-colors"
                  >
                    Start Fresh
                  </button>
                </div>
                {migrationError && (
                  <div className="mt-3 text-sm text-red-400">
                    {migrationError}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-4">
            <CheckCircleIcon className="w-8 h-8 text-green-500 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-heading text-white mb-1">
                Migration Complete!
              </h2>
              <p className="text-cpn-gray text-sm">
                Your data has been successfully migrated to the cloud. Refreshing...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
