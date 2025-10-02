'use client';

import React, { useState } from 'react';
import { CheckIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useGirls, useDataEntries } from '@/lib/context';
import { FormData } from '@/lib/types';
import { formatRating } from '@/lib/calculations';

export default function DataEntryPage() {
  const { girls } = useGirls();
  const { addDataEntry } = useDataEntries();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedGirlId, setSelectedGirlId] = useState('');
  
  const [formData, setFormData] = useState<FormData>({
    date: new Date().toISOString().split('T')[0],
    amountSpent: '',
    hours: '',
    minutes: '',
    numberOfNuts: ''
  });

  const validateForm = (): string | null => {
    if (!selectedGirlId) return 'Please select a girl';
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
      
      addDataEntry({
        girlId: selectedGirlId,
        date: new Date(formData.date),
        amountSpent: parseFloat(formData.amountSpent),
        durationMinutes,
        numberOfNuts: parseInt(formData.numberOfNuts)
      });

      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        amountSpent: '',
        hours: '',
        minutes: '',
        numberOfNuts: ''
      });
      setSelectedGirlId('');

      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

    } catch (error) {
      console.error('Error saving entry:', error);
      alert('Error saving entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cpn-dark">
      {/* Header */}
      <div className="border-b border-cpn-gray/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-heading text-cpn-white">Data Entry</h1>
            <p className="text-cpn-gray mt-1">
              Quick entry form for adding data to any girl profile
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {girls.length === 0 ? (
          // Empty State
          <div className="text-center py-16">
            <div className="animate-fade-in">
              <div className="w-16 h-16 bg-cpn-gray/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <PlusIcon className="w-8 h-8 text-cpn-gray" />
              </div>
              <h3 className="text-xl font-heading text-cpn-white mb-2">
                No girls available
              </h3>
              <p className="text-cpn-gray mb-6 max-w-md mx-auto">
                You need to add at least one girl profile before you can enter data.
              </p>
              <a href="/girls" className="btn-cpn inline-flex items-center gap-2">
                <PlusIcon className="w-5 h-5" />
                Add Your First Girl
              </a>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            <div className="card-cpn-form">
              <div className="mb-6">
                <h2 className="text-xl font-heading text-cpn-white flex items-center gap-2 mb-2">
                  <span>➕</span>
                  Add New Entry
                </h2>
                <p className="text-sm text-cpn-gray">
                  Enter data for any of your profiles. Statistics will update automatically.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Girl Selector */}
                <div>
                  <label className="block text-sm font-medium text-cpn-white mb-3">
                    Select Girl *
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {girls.map((girl) => (
                      <label
                        key={girl.id}
                        className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                          selectedGirlId === girl.id
                            ? 'border-cpn-yellow bg-cpn-yellow/10'
                            : 'border-cpn-gray/20 hover:border-cpn-gray/40'
                        }`}
                      >
                        <input
                          type="radio"
                          name="girlId"
                          value={girl.id}
                          checked={selectedGirlId === girl.id}
                          onChange={(e) => setSelectedGirlId(e.target.value)}
                          className="sr-only"
                        />
                        <div className="flex items-center justify-between w-full">
                          <div>
                            <p className="font-medium text-cpn-white">{girl.name}</p>
                            <p className="text-sm text-cpn-gray">
                              {girl.age} • {girl.nationality}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-cpn-yellow font-medium">
                              {formatRating(girl.rating)}
                            </p>
                            {selectedGirlId === girl.id && (
                              <CheckIcon className="w-5 h-5 text-cpn-yellow mt-1" />
                            )}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {selectedGirlId && (
                  <div className="space-y-4 animate-slide-up">
                    <div className="border-t border-cpn-gray/20 pt-6">
                      <h3 className="text-lg font-heading text-cpn-white mb-4">Entry Details</h3>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-cpn-white mb-2">
                        Date *
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
                        Amount Spent ($) *
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
                          Hours *
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
                        Nuts *
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
                      {isSubmitting ? 'Adding...' : '➕ Add Entry'}
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Success Message */}
            {showSuccess && (
              <div className="fixed bottom-4 left-4 right-4 md:left-auto md:w-96 md:right-4 bg-cpn-yellow/10 border border-cpn-yellow/20 rounded-lg p-4 z-40 animate-slide-up">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-cpn-yellow rounded-full flex items-center justify-center">
                    <CheckIcon className="w-5 h-5 text-cpn-dark" />
                  </div>
                  <div>
                    <p className="text-cpn-yellow font-medium">Entry Added!</p>
                    <p className="text-cpn-white text-sm">Data has been saved successfully.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}