// Enable Realtime for the bookings table
const URL = 'https://hhoqyjwbfszckhmgvpqb.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhob3F5andiZnN6Y2tobWd2cHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczNzY3MDcsImV4cCI6MjA5Mjk1MjcwN30.xZJ0yUkrnnVeaP5Df2g1PfeD4jIIVBJxU5OR8ZCrXTE';

// We need the service_role key to run ALTER PUBLICATION
// The anon key can't do it. Let's try via REST/RPC or tell the user to do it in dashboard

// First check current publication state
const headers = {
  'apikey': KEY,
  'Authorization': 'Bearer ' + KEY,
  'Content-Type': 'application/json'
};

// Try using the RPC endpoint to check
fetch(URL + '/rest/v1/rpc/check_realtime', { headers })
  .then(r => {
    console.log('RPC check status:', r.status);
    return r.text();
  })
  .then(t => console.log(t))
  .catch(e => console.error(e));

// The real fix: need to run this SQL in Supabase Dashboard → SQL Editor:
// ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
console.log('\nTo enable realtime, run this SQL in Supabase Dashboard → SQL Editor:');
console.log('ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;');
