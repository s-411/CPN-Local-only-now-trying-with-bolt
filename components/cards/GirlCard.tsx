'use client';

import React from 'react';
import Link from 'next/link';
import { PencilIcon, PlusIcon } from '@heroicons/react/24/outline';
import { GirlWithMetrics } from '@/lib/types';
import { formatCurrency, formatTime, formatRating } from '@/lib/calculations';
import { useGirls } from '@/lib/context';

interface GirlCardProps {
  girl: GirlWithMetrics;
  onEdit: (girl: GirlWithMetrics) => void;
}

export default function GirlCard({ girl, onEdit }: GirlCardProps) {
  const hasData = girl.totalEntries > 0;
  const { updateGirl } = useGirls();

  const toggleStatus = () => {
    updateGirl(girl.id, { isActive: !girl.isActive });
  };

  return (
    <div className="card-cpn bg-gradient-to-br from-cpn-dark2 to-cpn-dark hover:border-cpn-yellow/30 transition-all duration-200 group">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-2xl font-heading text-cpn-white group-hover:text-cpn-yellow transition-colors">
            {girl.name}
          </h3>
          <p className="text-sm text-cpn-gray">
            {girl.age} • {girl.nationality}
          </p>
          <div className="mt-1">
            <span className="text-sm font-medium text-cpn-yellow">
              {formatRating(girl.rating)}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => onEdit(girl)}
            className="text-cpn-gray hover:text-cpn-white transition-colors p-1 cursor-pointer"
            title="Edit profile"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
          
          {/* Active/Inactive Toggle */}
          <button
            onClick={toggleStatus}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
              girl.isActive ? 'bg-green-500' : 'bg-cpn-gray'
            }`}
            title={girl.isActive ? 'Active - Click to deactivate' : 'Inactive - Click to activate'}
          >
            <span
              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                girl.isActive ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {hasData ? (
        <div className="space-y-3 mb-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-cpn-gray">Total Spent</p>
              <p className="font-medium text-cpn-white">
                {formatCurrency(girl.metrics.totalSpent)}
              </p>
            </div>
            <div>
              <p className="text-cpn-gray">Total Nuts</p>
              <p className="font-medium text-cpn-white">
                {girl.metrics.totalNuts}
              </p>
            </div>
            <div>
              <p className="text-cpn-gray">Cost/Nut</p>
              <p className="font-medium text-cpn-yellow">
                {formatCurrency(girl.metrics.costPerNut)}
              </p>
            </div>
            <div>
              <p className="text-cpn-gray">Total Time</p>
              <p className="font-medium text-cpn-white">
                {formatTime(girl.metrics.totalTime)}
              </p>
            </div>
          </div>

          <div className="text-xs text-cpn-gray pt-2 border-t border-cpn-gray/10">
            {girl.totalEntries} {girl.totalEntries === 1 ? 'entry' : 'entries'}
          </div>
        </div>
      ) : (
        <div className="space-y-3 mb-4">
          <div className="text-center py-6">
            <p className="text-cpn-gray text-sm">No data entries yet</p>
            <p className="text-cpn-gray/70 text-xs mt-1">Add your first entry to see metrics</p>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Link
          href={`/girls/${girl.id}/add-data`}
          className="flex-1 btn-cpn text-center flex items-center justify-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          Add Data
        </Link>
      </div>
    </div>
  );
}