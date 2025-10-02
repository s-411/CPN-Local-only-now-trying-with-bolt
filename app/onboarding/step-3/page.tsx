'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface CPNPreview {
  costPerNut: number;
  timePerNut: number;
  costPerHour: number;
}

export default function OnboardingStep3() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [cpnPreview, setCpnPreview] = useState<CPNPreview | null>(null);
  
  useEffect(() => {
    // Calculate CPN preview from sessionStorage data
    try {
      const expenseData = sessionStorage.getItem('onboarding_expense_data');
      if (expenseData) {
        const expense = JSON.parse(expenseData);
        const costPerNut = expense.amountSpent / expense.numberOfNuts;
        const timePerNut = expense.durationMinutes / expense.numberOfNuts;
        const costPerHour = expense.amountSpent / (expense.durationMinutes / 60);
        
        setCpnPreview({
          costPerNut: parseFloat(costPerNut.toFixed(2)),
          timePerNut: parseFloat(timePerNut.toFixed(1)),
          costPerHour: parseFloat(costPerHour.toFixed(2))
        });
      }
    } catch (error) {
      console.error('Error calculating CPN preview:', error);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      alert('Please enter your email address');
      return;
    }

    setIsSubmitting(true);

    try {
      // For now, just save email to sessionStorage and navigate to results
      // TODO: Integrate Clerk authentication later
      const emailData = {
        email: email.trim(),
        step: 3,
        createdAt: new Date().toISOString()
      };

      sessionStorage.setItem('onboarding_email_data', JSON.stringify(emailData));

      // Navigate to results page
      router.push('/onboarding/results');
    } catch (error) {
      console.error('Error saving email data:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading text-cpn-white mb-2">
            Get Your CPN Result
          </h1>
          <p className="text-cpn-gray">
            Provide your email address to be logged in and get your CPN result
          </p>
        </div>

        {/* CPN Preview Card */}
        {cpnPreview && (
          <div className="bg-cpn-dark2 border border-cpn-yellow/30 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-heading text-cpn-yellow mb-3">Your CPN Preview</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-cpn-gray">Cost per Nut:</span>
                <span className="text-cpn-white font-medium">${cpnPreview.costPerNut}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cpn-gray">Time per Nut:</span>
                <span className="text-cpn-white font-medium">{cpnPreview.timePerNut} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cpn-gray">Cost per Hour:</span>
                <span className="text-cpn-white font-medium">${cpnPreview.costPerHour}</span>
              </div>
            </div>
            <p className="text-xs text-cpn-gray mt-3">
              Enter your email to see detailed analysis and save your data
            </p>
          </div>
        )}

        <div className="bg-cpn-dark2 border border-cpn-gray/20 rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-cpn-white mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-cpn"
                placeholder="your@email.com"
                required
              />
              <p className="text-xs text-cpn-gray mt-1">
                We'll send you a verification code to create your account
              </p>
            </div>

            <div className="bg-cpn-dark border border-cpn-gray/10 rounded-lg p-4">
              <h4 className="text-sm font-medium text-cpn-white mb-2">What happens next:</h4>
              <ol className="text-sm text-cpn-gray space-y-1 list-decimal list-inside">
                <li>Enter your email above</li>
                <li>Get a 6-digit verification code</li>
                <li>Verify your account instantly</li>
                <li>Access your detailed CPN analysis</li>
              </ol>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-cpn disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processing...' : 'Get Verification Code'}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-cpn-gray/10">
            <p className="text-xs text-cpn-gray text-center">
              By continuing, you agree to create an account and receive email updates about your CPN metrics
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}