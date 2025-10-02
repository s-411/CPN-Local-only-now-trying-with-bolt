'use client';

import React from 'react';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { GirlWithMetrics } from '@/lib/types';

interface DeleteWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => void;
  onMakeInactive: () => void;
  girl: GirlWithMetrics | null;
}

export default function DeleteWarningModal({ 
  isOpen, 
  onClose, 
  onConfirmDelete, 
  onMakeInactive, 
  girl 
}: DeleteWarningModalProps) {
  if (!isOpen || !girl) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-cpn-dark border border-red-500/30 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-red-500/20 bg-red-500/5">
          <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
            <h2 className="text-xl font-heading text-red-400">⚠️ Wait! Don't Delete</h2>
          </div>
          <button
            onClick={onClose}
            className="text-cpn-gray hover:text-cpn-white transition-colors p-1 cursor-pointer"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-cpn-white mb-2">
              You're about to delete {girl.name}
            </h3>
            <p className="text-red-400 font-medium">
              This will permanently destroy ALL data and cannot be undone!
            </p>
          </div>

          {/* Warning Box */}
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <h4 className="font-medium text-red-400 mb-2 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5" />
              What you'll lose forever:
            </h4>
            <ul className="text-sm text-cpn-gray space-y-1 ml-7">
              <li>• {girl.totalEntries} data {girl.totalEntries === 1 ? 'entry' : 'entries'}</li>
              <li>• All spending history ({girl.metrics.totalSpent > 0 ? `$${girl.metrics.totalSpent.toFixed(2)}` : '$0'} total)</li>
              <li>• All time tracking ({Math.round(girl.metrics.totalTime / 60)} hours total)</li>
              <li>• Profile information and ratings</li>
              <li>• Historical trends and analytics</li>
            </ul>
          </div>

          {/* Recommended Alternative */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
            <h4 className="font-medium text-green-400 mb-2 flex items-center gap-2">
              💡 Better Option: Make Inactive Instead
            </h4>
            <p className="text-sm text-cpn-gray mb-3">
              Making {girl.name} inactive removes her from your current statistics while preserving all historical data. You can:
            </p>
            <ul className="text-sm text-cpn-gray space-y-1 ml-4">
              <li>• Keep all data for future reference</li>
              <li>• Compare to future relationships</li>
              <li>• Reactivate anytime if needed</li>
              <li>• Clean stats without losing history</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            {/* Recommended Action */}
            <button
              onClick={onMakeInactive}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors cursor-pointer"
            >
              ✅ Make {girl.name} Inactive (Recommended)
            </button>

            {/* Secondary Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2 px-4 text-cpn-gray border border-cpn-gray/30 rounded-lg hover:text-cpn-white hover:border-cpn-gray transition-all duration-200 cursor-pointer"
              >
                Cancel
              </button>
              
              <button
                onClick={onConfirmDelete}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer"
              >
                ⚠️ Delete Forever
              </button>
            </div>
          </div>

          {/* Final Warning */}
          <div className="text-center">
            <p className="text-xs text-cpn-gray">
              Seriously, consider making inactive instead. Your future self will thank you! 📊
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}