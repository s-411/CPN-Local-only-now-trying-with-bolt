'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HairColorOption, EthnicityOption } from '@/lib/types';

interface OnboardingFormData {
  name: string;
  age: string;
  ethnicity: EthnicityOption | '';
  hairColor: HairColorOption | '';
  rating: number;
}

export default function OnboardingStep1() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<OnboardingFormData>({
    name: '',
    age: '',
    ethnicity: '',
    hairColor: '',
    rating: 6.0
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    const age = parseInt(formData.age);
    if (!formData.age || isNaN(age) || age < 18) {
      newErrors.age = 'Age must be 18 or older';
    }

    if (formData.rating < 5.0 || formData.rating > 10.0) {
      newErrors.rating = 'Rating must be between 5.0 and 10.0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Save to sessionStorage for onboarding flow
      const onboardingData = {
        name: formData.name.trim(),
        age: parseInt(formData.age),
        ethnicity: formData.ethnicity || undefined,
        hairColor: formData.hairColor || undefined,
        rating: formData.rating,
        step: 1,
        createdAt: new Date().toISOString()
      };

      sessionStorage.setItem('onboarding_girl_data', JSON.stringify(onboardingData));

      // Navigate to next step (step-2 for expenses)
      router.push('/onboarding/step-2');
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingChange = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading text-cpn-white mb-2">
            Add Girl Profile
          </h1>
          <p className="text-cpn-gray">
            Let's start by adding your first girl profile
          </p>
        </div>

        <div className="bg-cpn-dark2 border border-cpn-gray/20 rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-cpn-white mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="input-cpn"
                placeholder="Enter name..."
              />
              {errors.name && (
                <p className="text-red-400 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-cpn-white mb-2">
                Age *
              </label>
              <input
                type="number"
                min="18"
                max="99"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                className="input-cpn"
                placeholder="18"
              />
              {errors.age && (
                <p className="text-red-400 text-sm mt-1">{errors.age}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-cpn-white mb-2">
                Ethnicity (Optional)
              </label>
              <select
                value={formData.ethnicity}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  ethnicity: e.target.value as EthnicityOption || ''
                }))}
                className="input-cpn"
              >
                <option value="">Prefer not to say</option>
                <option value="Asian">Asian</option>
                <option value="Black">Black</option>
                <option value="Latina">Latina</option>
                <option value="White">White</option>
                <option value="Middle Eastern">Middle Eastern</option>
                <option value="Indian">Indian</option>
                <option value="Mixed">Mixed</option>
                <option value="Native American">Native American</option>
                <option value="Pacific Islander">Pacific Islander</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-cpn-white mb-2">
                Hair Color (Optional)
              </label>
              <select
                value={formData.hairColor}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  hairColor: e.target.value as HairColorOption || ''
                }))}
                className="input-cpn"
              >
                <option value="">Select hair color...</option>
                <option value="Blonde">Blonde</option>
                <option value="Brunette">Brunette</option>
                <option value="Black">Black</option>
                <option value="Red">Red</option>
                <option value="Auburn">Auburn</option>
                <option value="Gray/Silver">Gray/Silver</option>
                <option value="Dyed/Colorful">Dyed/Colorful</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-cpn-white mb-4">
                Hotness Rating *
              </label>
              
              <div className="grid grid-cols-6 gap-2 mb-4">
                {[5.0, 5.5, 6.0, 6.5, 7.0, 7.5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => handleRatingChange(rating)}
                    className={`py-3 px-2 text-sm font-medium rounded-lg border transition-all ${
                      formData.rating === rating
                        ? 'bg-cpn-yellow text-cpn-dark border-cpn-yellow'
                        : 'bg-transparent text-cpn-gray border-cpn-gray hover:border-cpn-white hover:text-cpn-white'
                    }`}
                  >
                    {rating.toFixed(1)}
                  </button>
                ))}
              </div>
              
              <div className="grid grid-cols-5 gap-2 mb-4">
                {[8.0, 8.5, 9.0, 9.5, 10.0].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => handleRatingChange(rating)}
                    className={`py-3 px-2 text-sm font-medium rounded-lg border transition-all ${
                      formData.rating === rating
                        ? 'bg-cpn-yellow text-cpn-dark border-cpn-yellow'
                        : 'bg-transparent text-cpn-gray border-cpn-gray hover:border-cpn-white hover:text-cpn-white'
                    }`}
                  >
                    {rating.toFixed(1)}
                  </button>
                ))}
              </div>
              
              <div className="flex justify-between text-sm text-cpn-gray">
                <span>5.0-6.0: Below Average</span>
                <span>8.5-10.0: Exceptional</span>
              </div>
              
              {errors.rating && (
                <p className="text-red-400 text-sm mt-1">{errors.rating}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-cpn disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : 'Add Expenses'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}