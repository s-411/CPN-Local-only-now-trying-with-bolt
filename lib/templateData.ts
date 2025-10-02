/**
 * Template Data for Live MVP Deployment
 *
 * This file contains realistic sample data for demonstration purposes.
 * Represents various dating scenarios from casual dates to longer relationships.
 *
 * Usage: This data will be loaded automatically in production when no user data exists.
 * Future: Remove this file when implementing Supabase authentication and user profiles.
 */

import { Girl, DataEntry } from './types';

// Template Girls - 5 realistic dating scenarios
export const TEMPLATE_GIRLS: Girl[] = [
  {
    id: 'girl-1-sarah',
    name: 'Sarah',
    age: 26,
    nationality: 'American',
    rating: 8.5,
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-03-10')
  },
  {
    id: 'girl-2-emma',
    name: 'Emma',
    age: 24,
    nationality: 'British',
    rating: 7.0,
    isActive: true,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-03-15')
  },
  {
    id: 'girl-3-maria',
    name: 'Maria',
    age: 28,
    nationality: 'Spanish',
    rating: 9.0,
    isActive: true,
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-03-01')
  },
  {
    id: 'girl-4-jessica',
    name: 'Jessica',
    age: 23,
    nationality: 'Canadian',
    rating: 6.5,
    isActive: false, // Make one inactive for demo
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01')
  },
  {
    id: 'girl-5-sofia',
    name: 'Sofia',
    age: 27,
    nationality: 'Italian',
    rating: 8.0,
    isActive: true,
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-03-12')
  }
];

// Template Data Entries - Realistic dating scenarios
export const TEMPLATE_DATA_ENTRIES: DataEntry[] = [
  // Sarah - Long-term relationship (2 months, multiple dates, intimate)
  // Date 1: Nice dinner
  {
    id: 'entry-sarah-1',
    girlId: 'girl-1-sarah',
    date: new Date('2024-01-20'),
    amountSpent: 85,
    durationMinutes: 180, // 3 hours
    numberOfNuts: 0, // First date
    createdAt: new Date('2024-01-21'),
    updatedAt: new Date('2024-01-21')
  },
  // Date 2: Coffee and walk
  {
    id: 'entry-sarah-2',
    girlId: 'girl-1-sarah',
    date: new Date('2024-01-25'),
    amountSpent: 25,
    durationMinutes: 120, // 2 hours
    numberOfNuts: 0,
    createdAt: new Date('2024-01-26'),
    updatedAt: new Date('2024-01-26')
  },
  // Date 3: Movie night at her place
  {
    id: 'entry-sarah-3',
    girlId: 'girl-1-sarah',
    date: new Date('2024-02-02'),
    amountSpent: 45, // Pizza and wine
    durationMinutes: 300, // 5 hours
    numberOfNuts: 2,
    createdAt: new Date('2024-02-03'),
    updatedAt: new Date('2024-02-03')
  },
  // Date 4: Weekend getaway
  {
    id: 'entry-sarah-4',
    girlId: 'girl-1-sarah',
    date: new Date('2024-02-14'),
    amountSpent: 320, // Hotel + dinner
    durationMinutes: 1200, // 20 hours (overnight)
    numberOfNuts: 4,
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-15')
  },
  // Date 5: Regular evening
  {
    id: 'entry-sarah-5',
    girlId: 'girl-1-sarah',
    date: new Date('2024-02-28'),
    amountSpent: 65,
    durationMinutes: 240, // 4 hours
    numberOfNuts: 1,
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01')
  },
  // Date 6: Casual hangout
  {
    id: 'entry-sarah-6',
    girlId: 'girl-1-sarah',
    date: new Date('2024-03-08'),
    amountSpent: 35,
    durationMinutes: 180,
    numberOfNuts: 2,
    createdAt: new Date('2024-03-09'),
    updatedAt: new Date('2024-03-09')
  },

  // Emma - Medium relationship (6 weeks, several dates)
  // Date 1: Dinner date
  {
    id: 'entry-emma-1',
    girlId: 'girl-2-emma',
    date: new Date('2024-02-03'),
    amountSpent: 95,
    durationMinutes: 150,
    numberOfNuts: 0,
    createdAt: new Date('2024-02-04'),
    updatedAt: new Date('2024-02-04')
  },
  // Date 2: Activity date
  {
    id: 'entry-emma-2',
    girlId: 'girl-2-emma',
    date: new Date('2024-02-10'),
    amountSpent: 55, // Mini golf + drinks
    durationMinutes: 180,
    numberOfNuts: 0,
    createdAt: new Date('2024-02-11'),
    updatedAt: new Date('2024-02-11')
  },
  // Date 3: Her place
  {
    id: 'entry-emma-3',
    girlId: 'girl-2-emma',
    date: new Date('2024-02-17'),
    amountSpent: 30, // Groceries for cooking
    durationMinutes: 360, // 6 hours
    numberOfNuts: 1,
    createdAt: new Date('2024-02-18'),
    updatedAt: new Date('2024-02-18')
  },
  // Date 4: Concert
  {
    id: 'entry-emma-4',
    girlId: 'girl-2-emma',
    date: new Date('2024-03-02'),
    amountSpent: 140, // Concert tickets + dinner
    durationMinutes: 300,
    numberOfNuts: 1,
    createdAt: new Date('2024-03-03'),
    updatedAt: new Date('2024-03-03')
  },

  // Maria - Short but intense (3 weeks, premium dates)
  // Date 1: Upscale dinner
  {
    id: 'entry-maria-1',
    girlId: 'girl-3-maria',
    date: new Date('2024-02-22'),
    amountSpent: 180,
    durationMinutes: 210,
    numberOfNuts: 0,
    createdAt: new Date('2024-02-23'),
    updatedAt: new Date('2024-02-23')
  },
  // Date 2: Wine tasting + hotel
  {
    id: 'entry-maria-2',
    girlId: 'girl-3-maria',
    date: new Date('2024-02-28'),
    amountSpent: 285, // Wine tasting + hotel
    durationMinutes: 480, // 8 hours
    numberOfNuts: 3,
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01')
  },

  // Jessica - One date only (went nowhere)
  {
    id: 'entry-jessica-1',
    girlId: 'girl-4-jessica',
    date: new Date('2024-03-01'),
    amountSpent: 75, // Dinner
    durationMinutes: 120, // 2 hours
    numberOfNuts: 0,
    createdAt: new Date('2024-03-02'),
    updatedAt: new Date('2024-03-02')
  },

  // Sofia - Casual dating (3 dates, moderate spending)
  // Date 1: Coffee date
  {
    id: 'entry-sofia-1',
    girlId: 'girl-5-sofia',
    date: new Date('2024-03-07'),
    amountSpent: 18,
    durationMinutes: 90,
    numberOfNuts: 0,
    createdAt: new Date('2024-03-08'),
    updatedAt: new Date('2024-03-08')
  },
  // Date 2: Lunch and museum
  {
    id: 'entry-sofia-2',
    girlId: 'girl-5-sofia',
    date: new Date('2024-03-10'),
    amountSpent: 65,
    durationMinutes: 240,
    numberOfNuts: 0,
    createdAt: new Date('2024-03-11'),
    updatedAt: new Date('2024-03-11')
  },
  // Date 3: Evening at her place
  {
    id: 'entry-sofia-3',
    girlId: 'girl-5-sofia',
    date: new Date('2024-03-12'),
    amountSpent: 40, // Wine and takeout
    durationMinutes: 280,
    numberOfNuts: 2,
    createdAt: new Date('2024-03-13'),
    updatedAt: new Date('2024-03-13')
  }
];

/**
 * Template Data Summary:
 *
 * Sarah (8.5/10) - Long-term: $575 total, 9 nuts, 42.5 hours
 * Emma (7.0/10) - Medium-term: $320 total, 2 nuts, 16.5 hours
 * Maria (9.0/10) - Short premium: $465 total, 3 nuts, 11.5 hours
 * Jessica (6.5/10) - One date: $75 total, 0 nuts, 2 hours
 * Sofia (8.0/10) - Casual: $123 total, 2 nuts, 10.2 hours
 *
 * Total: $1,558 spent, 16 nuts, 82.7 hours across 5 girls
 * Demonstrates realistic range of dating scenarios and metrics
 */

// Export flag to identify if template data is being used
export const IS_TEMPLATE_DATA = true;