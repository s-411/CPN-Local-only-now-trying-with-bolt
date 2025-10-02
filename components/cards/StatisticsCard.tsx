'use client';

import React from 'react';
import { CalculatedMetrics } from '@/lib/types';
import { formatCurrency, formatTime, formatTimeDetailed } from '@/lib/calculations';

interface StatisticsCardProps {
  metrics: CalculatedMetrics;
  className?: string;
}

export default function StatisticsCard({ metrics, className = '' }: StatisticsCardProps) {
  return (
    <div className={`card-cpn ${className}`}>
      <h3 className="text-lg font-heading text-cpn-white mb-4">Overall Statistics</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Row 1 */}
        <div>
          <p className="text-sm text-cpn-gray mb-1">Total Spent</p>
          <p className="text-xl font-bold text-cpn-white">
            {formatCurrency(metrics.totalSpent)}
          </p>
        </div>
        <div>
          <p className="text-sm text-cpn-gray mb-1">Total Nuts</p>
          <p className="text-xl font-bold text-cpn-white">
            {metrics.totalNuts}
          </p>
        </div>

        {/* Row 2 */}
        <div>
          <p className="text-sm text-cpn-gray mb-1">Total Time</p>
          <p className="text-xl font-bold text-cpn-white">
            {formatTimeDetailed(metrics.totalTime)}
          </p>
        </div>
        <div>
          <p className="text-sm text-cpn-gray mb-1">Time Per Nut</p>
          <p className="text-xl font-bold text-cpn-white">
            {metrics.timePerNut > 0 ? `${Math.round(metrics.timePerNut)} mins` : '0 mins'}
          </p>
        </div>

        {/* Row 3 - Highlighted metrics */}
        <div className="col-span-2 pt-2 border-t border-cpn-gray/10">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-cpn-gray mb-1">Cost Per Nut</p>
              <p className="text-2xl font-bold text-cpn-yellow">
                {formatCurrency(metrics.costPerNut)}
              </p>
            </div>
            <div>
              <p className="text-sm text-cpn-gray mb-1">Cost Per Hour</p>
              <p className="text-2xl font-bold text-cpn-yellow">
                {formatCurrency(metrics.costPerHour)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}