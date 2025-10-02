'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface OnboardingExpenseData {
  date: string;
  amountSpent: string;
  hours: string;
  minutes: string;
  numberOfNuts: string;
}

export default function OnboardingStep2() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<OnboardingExpenseData>({
    date: new Date().toISOString().split('T')[0], // Default to today
    amountSpent: '',
    hours: '',
    minutes: '',
    numberOfNuts: ''
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    const amount = parseFloat(formData.amountSpent);
    if (!formData.amountSpent || isNaN(amount) || amount < 0) {
      newErrors.amountSpent = 'Please enter a valid amount';
    }

    const hours = parseInt(formData.hours) || 0;
    const minutes = parseInt(formData.minutes) || 0;
    if (hours < 0 || minutes < 0 || minutes >= 60) {
      newErrors.time = 'Please enter valid time';
    }
    if (hours === 0 && minutes === 0) {
      newErrors.time = 'Duration must be greater than 0';
    }

    const nuts = parseInt(formData.numberOfNuts);
    if (!formData.numberOfNuts || isNaN(nuts) || nuts < 0) {
      newErrors.numberOfNuts = 'Please enter a valid number of nuts';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Calculate total duration in minutes
      const durationMinutes = (parseInt(formData.hours) || 0) * 60 + (parseInt(formData.minutes) || 0);
      
      // Create expense data
      const expenseData = {
        date: formData.date,
        amountSpent: parseFloat(formData.amountSpent),
        durationMinutes,
        numberOfNuts: parseInt(formData.numberOfNuts),
        step: 2,
        createdAt: new Date().toISOString()
      };

      // Save to sessionStorage for onboarding flow
      sessionStorage.setItem('onboarding_expense_data', JSON.stringify(expenseData));

      // Navigate to next step (step-3 for CPN calculation/summary)
      router.push('/onboarding/step-3');
    } catch (error) {
      console.error('Error saving expense data:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading text-cpn-white mb-2">
            Add Expense Entry
          </h1>
          <p className="text-cpn-gray">
            Track your first expense to calculate your CPN
          </p>
        </div>

        <div className="bg-cpn-dark2 border border-cpn-gray/20 rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
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
              {errors.date && (
                <p className="text-red-400 text-sm mt-1">{errors.date}</p>
              )}
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
              {errors.amountSpent && (
                <p className="text-red-400 text-sm mt-1">{errors.amountSpent}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-cpn-white mb-2">
                Time Spent *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={formData.hours}
                    onChange={(e) => setFormData(prev => ({ ...prev, hours: e.target.value }))}
                    className="input-cpn"
                    placeholder="Hours"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={formData.minutes}
                    onChange={(e) => setFormData(prev => ({ ...prev, minutes: e.target.value }))}
                    className="input-cpn"
                    placeholder="Minutes"
                  />
                </div>
              </div>
              <p className="text-xs text-cpn-gray mt-1">
                Enter hours and/or minutes (at least 1 minute total required)
              </p>
              {errors.time && (
                <p className="text-red-400 text-sm mt-1">{errors.time}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-cpn-white mb-2">
                Number of Nuts *
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
              {errors.numberOfNuts && (
                <p className="text-red-400 text-sm mt-1">{errors.numberOfNuts}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-cpn disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Calculating...' : 'Calculate CPN'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}