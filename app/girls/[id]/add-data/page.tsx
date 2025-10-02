'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useGirls, useDataEntries } from '@/lib/context';
import StatisticsCard from '@/components/cards/StatisticsCard';
import DataHistoryTable from '@/components/tables/DataHistoryTable';
import EditEntryModal from '@/components/modals/EditEntryModal';
import { FormData, DataEntry } from '@/lib/types';
import { calculateMetricsForGirl, formatRating } from '@/lib/calculations';

interface AddDataPageProps {
  params: Promise<{ id: string }>;
}

export default function AddDataPage({ params }: AddDataPageProps) {
  // TODO: Next.js 15 - params is now a Promise, will be fixed in future version
  // This currently shows a warning but the app functions correctly
  const id = (params as any).id;
  const { getGirlById, girls } = useGirls();
  const { addDataEntry, updateDataEntry, deleteDataEntry, getEntriesByGirlId } = useDataEntries();

  const girl = getGirlById(id);
  const entries = getEntriesByGirlId(id);
  const metrics = calculateMetricsForGirl(entries);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DataEntry | null>(null);
  const [formData, setFormData] = useState<FormData>({
    date: new Date().toISOString().split('T')[0],
    amountSpent: '',
    hours: '',
    minutes: '',
    numberOfNuts: ''
  });

  // Reset form to default state
  useEffect(() => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      amountSpent: '',
      hours: '',
      minutes: '',
      numberOfNuts: ''
    });
  }, []);

  const validateForm = (): string | null => {
    if (!formData.date) return 'Date is required';
    
    const amount = parseFloat(formData.amountSpent);
    if (!formData.amountSpent || isNaN(amount) || amount < 0) {
      return 'Please enter a valid amount';
    }

    const hours = parseInt(formData.hours) || 0;
    const minutes = parseInt(formData.minutes) || 0;
    if (hours < 0 || minutes < 0 || minutes >= 60) {
      return 'Please enter valid time';
    }
    if (hours === 0 && minutes === 0) {
      return 'Duration must be greater than 0';
    }

    const nuts = parseInt(formData.numberOfNuts);
    if (!formData.numberOfNuts || isNaN(nuts) || nuts < 0) {
      return 'Please enter a valid number of nuts';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }

    setIsSubmitting(true);

    try {
      const durationMinutes = (parseInt(formData.hours) || 0) * 60 + (parseInt(formData.minutes) || 0);
      const entryData = {
        girlId: id,
        date: new Date(formData.date),
        amountSpent: parseFloat(formData.amountSpent),
        durationMinutes,
        numberOfNuts: parseInt(formData.numberOfNuts)
      };

      addDataEntry(entryData);

      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        amountSpent: '',
        hours: '',
        minutes: '',
        numberOfNuts: ''
      });
    } catch (error) {
      console.error('Error saving entry:', error);
      alert('Error saving entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditEntry = (entry: DataEntry) => {
    setEditingEntry(entry);
  };

  const handleDeleteEntry = (entryId: string) => {
    if (editingEntry?.id === entryId) {
      setEditingEntry(null);
    }
    deleteDataEntry(entryId);
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
  };

  if (!girl) {
    return (
      <div className="min-h-screen bg-cpn-dark flex items-center justify-center">
        <div className="text-center">
          <p className="text-cpn-gray mb-4">Girl not found</p>
          <Link href="/girls" className="btn-cpn">
            Back to Girls
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cpn-dark">
      {/* Header */}
      <div className="border-b border-cpn-gray/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-6">
            <Link
              href="/girls"
              className="text-cpn-gray hover:text-cpn-white transition-colors p-1"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-heading text-cpn-white">Data for {girl.name}</h1>
              <p className="text-cpn-gray mt-1">
                {girl.age} • {girl.nationality} • {formatRating(girl.rating)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div className="space-y-6">
            <div className="card-cpn-form">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-heading text-cpn-white flex items-center gap-2">
                  <span>➕</span>
                  Add New Entry
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-cpn-white mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="input-cpn"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-cpn-white mb-2">
                    Amount Spent ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amountSpent}
                    onChange={(e) => setFormData(prev => ({ ...prev, amountSpent: e.target.value }))}
                    className="input-cpn"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-cpn-white mb-2">
                      Hours
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={formData.hours}
                      onChange={(e) => setFormData(prev => ({ ...prev, hours: e.target.value }))}
                      className="input-cpn"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-cpn-white mb-2">
                      Minutes <span className="text-cpn-gray text-xs">(optional)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={formData.minutes}
                      onChange={(e) => setFormData(prev => ({ ...prev, minutes: e.target.value }))}
                      className="input-cpn"
                      placeholder="0"
                    />
                  </div>
                </div>
                <p className="text-xs text-cpn-gray">
                  Leave empty for 0 minutes
                </p>

                <div>
                  <label className="block text-sm font-medium text-cpn-white mb-2">
                    Nuts
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.numberOfNuts}
                    onChange={(e) => setFormData(prev => ({ ...prev, numberOfNuts: e.target.value }))}
                    className="input-cpn"
                    placeholder="0"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-cpn disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Saving...' : '➕ Add Entry'}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column - Statistics & Summary */}
          <div className="space-y-6">
            <StatisticsCard metrics={metrics} />

            <div className="card-cpn">
              <h3 className="text-lg font-heading text-cpn-white mb-4">Girls Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-cpn-gray">Total Girls:</span>
                  <span className="text-cpn-white font-medium">{girls.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cpn-gray">Average Rating:</span>
                  <span className="text-cpn-white font-medium">
                    {girls.length > 0 
                      ? (girls.reduce((sum, g) => sum + g.rating, 0) / girls.length).toFixed(1)
                      : '0.0'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-cpn-gray">Active Girls:</span>
                  <span className="text-cpn-white font-medium">
                    {girls.filter(g => getEntriesByGirlId(g.id).length > 0).length}
                  </span>
                </div>
                <div className="pt-3 border-t border-cpn-gray/10">
                  <p className="text-sm text-cpn-gray mb-2">Recent Girls:</p>
                  <div className="space-y-1">
                    {girls.slice(0, 3).map(g => (
                      <p key={g.id} className="text-sm text-cpn-white">
                        {g.name} - {formatRating(g.rating)}
                      </p>
                    ))}
                    {girls.length === 0 && (
                      <p className="text-sm text-cpn-gray">No girls added yet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* History Table - Full Width */}
        <div className="mt-8">
          <DataHistoryTable
            entries={entries}
            onEdit={handleEditEntry}
            onDelete={handleDeleteEntry}
          />
        </div>
      </div>

      {/* Edit Entry Modal */}
      <EditEntryModal
        isOpen={!!editingEntry}
        onClose={() => setEditingEntry(null)}
        entry={editingEntry}
      />
    </div>
  );
}

