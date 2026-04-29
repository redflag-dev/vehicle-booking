const URL = 'https://hhoqyjwbfszckhmgvpqb.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhob3F5andiZnN6Y2tobWd2cHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczNzY3MDcsImV4cCI6MjA5Mjk1MjcwN30.xZJ0yUkrnnVeaP5Df2g1PfeD4jIIVBJxU5OR8ZCrXTE';
const headers = { 'apikey': KEY, 'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json' };

async function test() {
  // 1. Read all bookings
  console.log('=== READ TEST ===');
  const readRes = await fetch(URL + '/rest/v1/bookings?select=*&limit=5', { headers });
  console.log('Status:', readRes.status);
  const readData = await readRes.json();
  console.log('Data:', JSON.stringify(readData).substring(0, 500));

  // 2. Try to insert a test booking
  console.log('\n=== INSERT TEST ===');
  const testBooking = {
    vehicle_id: 'TEST-001',
    test_type: '其他',
    shift: '白班',
    tester: '验证测试',
    start_date: '2026-04-29',
    end_date: '2026-04-29',
    notes: '自动验证-可删除'
  };
  const insertRes = await fetch(URL + '/rest/v1/bookings', {
    method: 'POST',
    headers: { ...headers, 'Prefer': 'return=representation' },
    body: JSON.stringify(testBooking)
  });
  console.log('Status:', insertRes.status);
  const insertData = await insertRes.json();
  console.log('Data:', JSON.stringify(insertData).substring(0, 500));

  // 3. Clean up - delete the test record
  if (insertData && insertData[0] && insertData[0].id) {
    console.log('\n=== CLEANUP ===');
    const delRes = await fetch(URL + '/rest/v1/bookings?id=eq.' + insertData[0].id, {
      method: 'DELETE',
      headers
    });
    console.log('Delete status:', delRes.status);
  }
}

test().catch(e => console.error(e));
