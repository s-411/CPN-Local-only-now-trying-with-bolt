// Script to add test data to localStorage for development testing
// Run this in the browser console at http://localhost:3000

const testGirls = [
  {
    id: crypto.randomUUID(),
    name: "Emma",
    age: 24,
    nationality: "American",
    rating: 8.5,
    ethnicity: "caucasian",
    hairColor: "blonde",
    location: { city: "Los Angeles", country: "USA" },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: crypto.randomUUID(),
    name: "Sofia",
    age: 26,
    nationality: "Brazilian",
    rating: 9.0,
    ethnicity: "latina",
    hairColor: "brunette",
    location: { city: "Miami", country: "USA" },
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  },
  {
    id: crypto.randomUUID(),
    name: "Yuki",
    age: 23,
    nationality: "Japanese",
    rating: 7.5,
    ethnicity: "asian",
    hairColor: "black",
    location: { city: "New York", country: "USA" },
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-02-20')
  },
  {
    id: crypto.randomUUID(),
    name: "Isabella",
    age: 25,
    nationality: "Italian",
    rating: 8.0,
    ethnicity: "mediterranean",
    hairColor: "brunette",
    location: { city: "Chicago", country: "USA" },
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-03-10')
  },
  {
    id: crypto.randomUUID(),
    name: "Chloe",
    age: 22,
    nationality: "French",
    rating: 7.0,
    ethnicity: "caucasian",
    hairColor: "red",
    location: { city: "San Francisco", country: "USA" },
    createdAt: new Date('2024-03-25'),
    updatedAt: new Date('2024-03-25')
  }
];

// Generate data entries for each girl
const testDataEntries = [];
const activities = [
  { durationMinutes: 30, numberOfNuts: 1, amountSpent: 150 },
  { durationMinutes: 45, numberOfNuts: 2, amountSpent: 200 },
  { durationMinutes: 60, numberOfNuts: 2, amountSpent: 250 },
  { durationMinutes: 60, numberOfNuts: 3, amountSpent: 300 },
  { durationMinutes: 90, numberOfNuts: 3, amountSpent: 400 },
  { durationMinutes: 120, numberOfNuts: 4, amountSpent: 500 }
];

testGirls.forEach(girl => {
  // Generate 3-8 entries per girl
  const numEntries = Math.floor(Math.random() * 6) + 3;

  for (let i = 0; i < numEntries; i++) {
    const activity = activities[Math.floor(Math.random() * activities.length)];
    const daysAgo = Math.floor(Math.random() * 60) + 1;
    const entryDate = new Date();
    entryDate.setDate(entryDate.getDate() - daysAgo);

    testDataEntries.push({
      id: crypto.randomUUID(),
      girlId: girl.id,
      date: entryDate,
      amountSpent: activity.amountSpent + Math.floor(Math.random() * 100) - 50,
      durationMinutes: activity.durationMinutes + Math.floor(Math.random() * 30) - 15,
      numberOfNuts: activity.numberOfNuts,
      createdAt: entryDate,
      updatedAt: entryDate
    });
  }
});

// Function to add test data
function addTestData() {
  try {
    // Check if data already exists
    const existingGirls = localStorage.getItem('cpn_girls');
    if (existingGirls && JSON.parse(existingGirls).length > 0) {
      const confirmOverwrite = confirm('Data already exists. Do you want to overwrite it with test data?');
      if (!confirmOverwrite) {
        console.log('Test data addition cancelled.');
        return;
      }
    }

    // Save to localStorage
    localStorage.setItem('cpn_girls', JSON.stringify(testGirls));
    localStorage.setItem('cpn_data_entries', JSON.stringify(testDataEntries));

    console.log(`✅ Successfully added ${testGirls.length} girls and ${testDataEntries.length} data entries!`);
    console.log('Girls added:', testGirls.map(g => g.name).join(', '));
    console.log('\n🔄 Refreshing page to load new data...');

    // Refresh the page to load the new data
    setTimeout(() => {
      window.location.reload();
    }, 1000);

  } catch (error) {
    console.error('❌ Error adding test data:', error);
  }
}

// Run the function
addTestData();