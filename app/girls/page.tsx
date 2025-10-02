'use client';

import React, { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useGirls, useGlobalStats } from '@/lib/context';
import GirlCard from '@/components/cards/GirlCard';
import AddGirlModal from '@/components/modals/AddGirlModal';
import EditGirlModal from '@/components/modals/EditGirlModal';
import { GirlWithMetrics } from '@/lib/types';
import { formatCurrency } from '@/lib/calculations';

export default function GirlsPage() {
  const { girlsWithMetrics } = useGirls();
  const { globalStats, isLoading } = useGlobalStats();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingGirl, setEditingGirl] = useState<GirlWithMetrics | null>(null);

  const handleEditGirl = (girl: GirlWithMetrics) => {
    setEditingGirl(girl);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-fade-in">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-cpn-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-cpn-gray">Loading your data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cpn-dark">
      {/* Header */}
      <div className="border-b border-cpn-gray/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-heading text-cpn-white">Girls Dashboard</h1>
              <p className="text-cpn-gray mt-1">
                Manage your profiles and track your metrics
              </p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn-cpn flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Add New Girl
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      {girlsWithMetrics.length > 0 && (
        <div className="border-b border-cpn-gray/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-cpn-gray">Total Girls</p>
                <p className="text-2xl font-bold text-cpn-white">
                  {globalStats.totalGirls}
                </p>
              </div>
              <div>
                <p className="text-sm text-cpn-gray">Active Girls</p>
                <p className="text-2xl font-bold text-cpn-white">
                  {globalStats.activeGirls}
                </p>
              </div>
              <div>
                <p className="text-sm text-cpn-gray">Total Spent</p>
                <p className="text-2xl font-bold text-cpn-yellow">
                  {formatCurrency(globalStats.totalSpent)}
                </p>
              </div>
              <div>
                <p className="text-sm text-cpn-gray">Total Nuts</p>
                <p className="text-2xl font-bold text-cpn-white">
                  {globalStats.totalNuts}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {girlsWithMetrics.length === 0 ? (
          // Empty State
          <div className="text-center py-16">
            <div className="animate-fade-in">
              <div className="w-16 h-16 bg-cpn-gray/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <PlusIcon className="w-8 h-8 text-cpn-gray" />
              </div>
              <h3 className="text-xl font-heading text-cpn-white mb-2">
                No girls added yet
              </h3>
              <p className="text-cpn-gray mb-6 max-w-md mx-auto">
                Get started by adding your first girl profile. You'll be able to track 
                metrics and analyze your data in real-time.
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="btn-cpn inline-flex items-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                Add Your First Girl
              </button>
            </div>
          </div>
        ) : (
          // Girls Grid
          <div className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {girlsWithMetrics.map((girl) => (
                <GirlCard
                  key={girl.id}
                  girl={girl}
                  onEdit={handleEditGirl}
                />
              ))}
            </div>

            {/* Quick Add Card */}
            <div className="mt-6">
              <div className="card-cpn border-dashed border-cpn-yellow/30 hover:border-cpn-yellow transition-all duration-200">
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="w-full h-full flex flex-col items-center justify-center py-8 text-cpn-gray hover:text-cpn-yellow transition-colors cursor-pointer"
                >
                  <div className="w-12 h-12 border-2 border-current rounded-full flex items-center justify-center mb-3">
                    <PlusIcon className="w-6 h-6" />
                  </div>
                  <span className="font-medium">Add Another Girl</span>
                  <span className="text-sm mt-1">Create a new profile</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Girl Modal */}
      <AddGirlModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Edit Girl Modal */}
      <EditGirlModal
        isOpen={!!editingGirl}
        onClose={() => setEditingGirl(null)}
        girl={editingGirl}
      />
    </div>
  );
}