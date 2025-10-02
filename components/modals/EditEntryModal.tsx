'use client';

import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useDataEntries } from '@/lib/context';
import { DataEntry, FormData } from '@/lib/types';

interface EditEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: DataEntry | null;
}

export default function EditEntryModal({ isOpen, onClose, entry }: EditEntryModalProps) {
  const { updateDataEntry } = useDataEntries();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    date: '',
    amountSpent: '',
    hours: '',
    minutes: '',
    numberOfNuts: ''
  });

  // Update form data when entry changes
  useEffect(() => {
    if (entry) {
      const entryDate = new Date(entry.date);
      const hours = Math.floor(entry.durationMinutes / 60);
      const minutes = entry.durationMinutes % 60;

      setFormData({
        date: entryDate.toISOString().split('T')[0],
        amountSpent: entry.amountSpent.toString(),
        hours: hours.toString(),
        minutes: minutes.toString(),
        numberOfNuts: entry.numberOfNuts.toString()
      });
    }
  }, [entry]);

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

    if (!entry) return;

    const error = validateForm();
    if (error) {
      alert(error);
      return;
    }

    setIsSubmitting(true);

    try {
      const durationMinutes = (parseInt(formData.hours) || 0) * 60 + (parseInt(formData.minutes) || 0);
      
      updateDataEntry(entry.id, {
        date: new Date(formData.date),
        amountSpent: parseFloat(formData.amountSpent),
        durationMinutes,
        numberOfNuts: parseInt(formData.numberOfNuts)
      });

      onClose();
    } catch (error) {
      console.error('Error updating entry:', error);
      alert('Error updating entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen || !entry) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-cpn-dark border border-cpn-gray/20 rounded-lg w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-cpn-gray/20">
          <h2 className="text-xl font-heading text-cpn-white">Edit Entry</h2>
          <button
            onClick={handleClose}
            className="text-cpn-gray hover:text-cpn-white transition-colors p-1 cursor-pointer"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-3 px-4 text-cpn-gray border border-cpn-gray/30 rounded-lg hover:text-cpn-white hover:border-cpn-gray transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 btn-cpn disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Updating...' : 'Update Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}