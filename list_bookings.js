const URL = 'https://hhoqyjwbfszckhmgvpqb.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhob3F5andiZnN6Y2tobWd2cHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczNzY3MDcsImV4cCI6MjA5Mjk1MjcwN30.xZJ0yUkrnnVeaP5Df2g1PfeD4jIIVBJxU5OR8ZCrXTE';
const headers = { 'apikey': KEY, 'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json' };

// Get all bookings
fetch(URL + '/rest/v1/bookings?select=id,vehicle_id,test_type,tester,created_at&order=created_at.desc', { headers })
  .then(r => r.json())
  .then(data => {
    console.log('Total bookings:', data.length);
    data.forEach(d => {
      console.log(`${d.id} | ${d.vehicle_id} | ${d.test_type} | ${d.tester} | ${d.created_at}`);
    });
  })
  .catch(e => console.error(e));
