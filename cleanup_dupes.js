const URL = 'https://hhoqyjwbfszckhmgvpqb.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhob3F5andiZnN6Y2tobWd2cHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczNzY3MDcsImV4cCI6MjA5Mjk1MjcwN30.xZJ0yUkrnnVeaP5Df2g1PfeD4jIIVBJxU5OR8ZCrXTE';
const headers = { 'apikey': KEY, 'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json' };

// Duplicate IDs to remove (keeping the first/older one of each pair)
const dupIds = [
  '103eb2f4-45e9-4f5e-a283-9e995c0b609a', // E001-客户WH2596 duplicate (tester: 999, keep 9999)
  '7887f30b-a4a2-42b6-ab7e-af07e5edf92d'   // E009-客户2371 duplicate (older one)
];

async function cleanup() {
  for (const id of dupIds) {
    const res = await fetch(URL + '/rest/v1/bookings?id=eq.' + id, {
      method: 'DELETE',
      headers
    });
    console.log(`Delete ${id}: status ${res.status}`);
  }
  console.log('Cleanup done!');
}

cleanup().catch(e => console.error(e));
