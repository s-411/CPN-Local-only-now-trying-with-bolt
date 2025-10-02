'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  TableCellsIcon
} from '@heroicons/react/24/outline';
import { useGirls, useDataEntries } from '@/lib/context';
import { GirlWithMetrics, SortConfig } from '@/lib/types';
import { formatCurrency, formatTime, formatRating, sortGirlsByField } from '@/lib/calculations';
import EditGirlModal from '@/components/modals/EditGirlModal';
import AddGirlModal from '@/components/modals/AddGirlModal';
import DeleteWarningModal from '@/components/modals/DeleteWarningModal';

export default function OverviewPage() {
  const { girlsWithMetrics, updateGirl, deleteGirl } = useGirls();
  const { getEntriesByGirlId } = useDataEntries();
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'createdAt',
    direction: 'asc'
  });
  const [editingGirl, setEditingGirl] = useState<GirlWithMetrics | null>(null);
  const [deletingGirl, setDeletingGirl] = useState<GirlWithMetrics | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleSort = (field: string) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleDeleteClick = (girl: GirlWithMetrics) => {
    setDeletingGirl(girl);
  };

  const handleConfirmDelete = async () => {
    if (deletingGirl) {
      await deleteGirl(deletingGirl.id);
      setDeletingGirl(null);
    }
  };

  const handleMakeInactive = async () => {
    if (deletingGirl) {
      await updateGirl(deletingGirl.id, { isActive: false });
      setDeletingGirl(null);
    }
  };

  const sortedGirls = sortGirlsByField(girlsWithMetrics, sortConfig.field as any, sortConfig.direction);

  const SortButton = ({ field, children }: { field: string; children: React.ReactNode }) => {
    const isActive = sortConfig.field === field;
    const direction = sortConfig.direction;

    return (
      <button
        onClick={() => handleSort(field)}
        className="flex items-center gap-1 hover:text-cpn-yellow transition-colors"
      >
        {children}
        {isActive && (
          direction === 'asc' ? (
            <ChevronUpIcon className="w-4 h-4" />
          ) : (
            <ChevronDownIcon className="w-4 h-4" />
          )
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-cpn-dark">
      {/* Header */}
      <div className="border-b border-cpn-gray/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-3">
              <TableCellsIcon className="w-8 h-8 text-cpn-yellow" />
              <div>
                <h1 className="text-3xl font-heading text-cpn-white">Overview</h1>
                <p className="text-cpn-gray mt-1">
                  Comprehensive metrics for all your profiles
                </p>
              </div>
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
                No girls to display
              </h3>
              <p className="text-cpn-gray mb-6 max-w-md mx-auto">
                Add your first girl profile to start tracking and viewing comprehensive metrics.
              </p>
              <Link href="/girls" className="btn-cpn inline-flex items-center gap-2">
                <PlusIcon className="w-5 h-5" />
                Add Your First Girl
              </Link>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            {/* Desktop & Tablet Table */}
            <div className="hidden md:block">
              <div className="card-cpn overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="table-cpn">
                    <thead>
                      <tr>
                        <th>
                          <SortButton field="name">Name</SortButton>
                        </th>
                        <th>
                          <SortButton field="isActive">Status</SortButton>
                        </th>
                        <th>
                          <SortButton field="rating">Rating</SortButton>
                        </th>
                        <th>
                          <SortButton field="metrics.totalNuts">Total Nuts</SortButton>
                        </th>
                        <th>
                          <SortButton field="metrics.totalSpent">Total Spent</SortButton>
                        </th>
                        <th>
                          <SortButton field="metrics.costPerNut">Cost per Nut</SortButton>
                        </th>
                        <th>
                          <SortButton field="metrics.totalTime">Total Time</SortButton>
                        </th>
                        <th>
                          <SortButton field="metrics.timePerNut">Time per Nut</SortButton>
                        </th>
                        <th>
                          <SortButton field="metrics.costPerHour">Cost per Hour</SortButton>
                        </th>
                        <th>Nuts per Hour</th>
                        <th>Add Data</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedGirls.map((girl) => (
                        <tr key={girl.id} className="hover:bg-cpn-dark2 transition-colors duration-200">
                          <td>
                            <div>
                              <div className="font-medium text-cpn-white">{girl.name}</div>
                              <div className="text-sm text-cpn-gray">
                                {girl.age} • {girl.nationality}
                              </div>
                            </div>
                          </td>
                          <td>
                            {/* Status Toggle */}
                            <button
                              onClick={() => updateGirl(girl.id, { isActive: !girl.isActive })}
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
                          </td>
                          <td>
                            <span className="text-cpn-yellow font-medium">
                              {formatRating(girl.rating)}
                            </span>
                          </td>
                          <td className="text-center font-medium">
                            {girl.metrics.totalNuts}
                          </td>
                          <td className="text-cpn-yellow font-medium">
                            {formatCurrency(girl.metrics.totalSpent)}
                          </td>
                          <td className="text-cpn-yellow font-bold">
                            {formatCurrency(girl.metrics.costPerNut)}
                          </td>
                          <td>
                            {formatTime(girl.metrics.totalTime)}
                          </td>
                          <td>
                            {girl.metrics.timePerNut > 0 ? `${Math.round(girl.metrics.timePerNut)}m` : '0m'}
                          </td>
                          <td className="text-cpn-yellow font-medium">
                            {formatCurrency(girl.metrics.costPerHour)}
                          </td>
                          <td className="font-medium">
                            {girl.metrics.totalTime > 0 ? (girl.metrics.totalNuts / (girl.metrics.totalTime / 60)).toFixed(1) : '0'}
                          </td>
                          <td>
                            <Link
                              href={`/girls/${girl.id}/add-data`}
                              className="inline-flex items-center gap-1 text-sm bg-cpn-yellow text-cpn-dark px-3 py-1 rounded-cpn hover:opacity-90 transition-opacity"
                            >
                              <PlusIcon className="w-4 h-4" />
                              Add
                            </Link>
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setEditingGirl(girl)}
                                className="text-cpn-gray hover:text-cpn-yellow transition-colors p-1"
                                title="Edit girl"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(girl)}
                                className="text-cpn-gray hover:text-red-400 transition-colors p-1 cursor-pointer"
                                title="Delete girl"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Mobile Cards - Enhanced UX */}
            <div className="md:hidden space-y-3">
              {sortedGirls.map((girl) => (
                <div key={girl.id} className="card-cpn overflow-hidden">
                  {/* Header with key info */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-heading text-cpn-white">{girl.name}</h3>
                        <span className="text-xs bg-cpn-yellow/20 text-cpn-yellow px-2 py-0.5 rounded-full">
                          {formatRating(girl.rating)}
                        </span>
                      </div>
                      <p className="text-xs text-cpn-gray">{girl.age} • {girl.nationality}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-cpn-yellow">
                        {formatCurrency(girl.metrics.costPerNut)}
                      </p>
                      <p className="text-xs text-cpn-gray">per nut</p>
                    </div>
                  </div>

                  {/* Key metrics - 3 column grid on mobile */}
                  <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                    <div className="text-center p-2 bg-cpn-dark2/50 rounded">
                      <p className="text-cpn-gray">Nuts</p>
                      <p className="font-semibold text-cpn-white">{girl.metrics.totalNuts}</p>
                    </div>
                    <div className="text-center p-2 bg-cpn-dark2/50 rounded">
                      <p className="text-cpn-gray">Spent</p>
                      <p className="font-semibold text-cpn-yellow">{formatCurrency(girl.metrics.totalSpent)}</p>
                    </div>
                    <div className="text-center p-2 bg-cpn-dark2/50 rounded">
                      <p className="text-cpn-gray">Time</p>
                      <p className="font-semibold text-cpn-white">{formatTime(girl.metrics.totalTime)}</p>
                    </div>
                  </div>

                  {/* Additional metrics - expandable */}
                  <details className="group mb-3">
                    <summary className="flex items-center justify-between cursor-pointer text-xs text-cpn-gray hover:text-cpn-white transition-colors">
                      <span>More metrics</span>
                      <span className="group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-cpn-gray">Cost/Hour</p>
                        <p className="font-medium text-cpn-yellow">{formatCurrency(girl.metrics.costPerHour)}</p>
                      </div>
                      <div>
                        <p className="text-cpn-gray">Nuts/Hour</p>
                        <p className="font-medium text-cpn-white">
                          {girl.metrics.totalTime > 0 ? (girl.metrics.totalNuts / (girl.metrics.totalTime / 60)).toFixed(1) : '0'}
                        </p>
                      </div>
                      <div>
                        <p className="text-cpn-gray">Time/Nut</p>
                        <p className="font-medium text-cpn-white">
                          {girl.metrics.timePerNut > 0 ? `${Math.round(girl.metrics.timePerNut)}m` : '0m'}
                        </p>
                      </div>
                      <div>
                        <p className="text-cpn-gray">Entries</p>
                        <p className="font-medium text-cpn-white">{girl.totalEntries}</p>
                      </div>
                    </div>
                  </details>

                  {/* Action buttons - horizontal layout */}
                  <div className="flex items-center gap-2 pt-3 border-t border-cpn-gray/10">
                    <Link
                      href={`/girls/${girl.id}/add-data`}
                      className="flex-1 bg-cpn-yellow text-cpn-dark text-center py-2 px-3 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                      + Add Data
                    </Link>
                    <button
                      onClick={() => setEditingGirl(girl)}
                      className="p-2 text-cpn-gray hover:text-cpn-yellow transition-colors rounded-lg hover:bg-cpn-dark2/50"
                      title="Edit"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(girl)}
                      className="p-2 rounded-lg transition-colors text-cpn-gray hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
                      title="Delete"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
      </div>

      {/* Edit Girl Modal */}
      {editingGirl && (
        <EditGirlModal
          isOpen={!!editingGirl}
          onClose={() => setEditingGirl(null)}
          girl={editingGirl}
        />
      )}

      {/* Add Girl Modal */}
      <AddGirlModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Delete Warning Modal */}
      <DeleteWarningModal
        isOpen={!!deletingGirl}
        onClose={() => setDeletingGirl(null)}
        onConfirmDelete={handleConfirmDelete}
        onMakeInactive={handleMakeInactive}
        girl={deletingGirl}
      />
    </div>
  );
}