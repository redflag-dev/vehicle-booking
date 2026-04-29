// Check if bookings table is in the supabase_realtime publication
// We need to use the service_role key for this, but let's try with anon first
const URL = 'https://hhoqyjwbfszckhmgvpqb.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhob3F5andiZnN6Y2tobWd2cHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczNzY3MDcsImV4cCI6MjA5Mjk1MjcwN30.xZJ0yUkrnnVeaP5Df2g1PfeD4jIIVBJxU5OR8ZCrXTE';
const headers = { 'apikey': KEY, 'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json' };

// Try to query pg_publication_tables via RPC or direct
// Actually, let's check using the Realtime Inspector endpoint
fetch(URL + '/realtime/v1/websocket?transport=websocket', {
  headers: { ...headers, 'Sec-WebSocket-Version': '13' }
}).then(r => {
  console.log('Realtime endpoint status:', r.status);
  return r.text();
}).then(t => {
  console.log('Response:', t.substring(0, 300));
}).catch(e => console.error('Fetch error:', e.message));

// Also test: subscribe to a specific realtime topic and see what happens
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(URL, KEY, {
  realtime: {
    params: { eventsPerSecond: 10 }
  }
});

// Try subscribing to the presence channel to verify WS works
const ch = supabase.channel('room1');
ch.on('presence', { event: 'sync' }, () => {
  console.log('Presence sync received');
});
ch.subscribe(async (status, err) => {
  console.log('Presence channel status:', status, err || '');
});

// Also try the postgres_changes with more explicit config
const ch2 = supabase.channel('bookings-test-2', {
  config: { broadcast: { self: true } }
});
ch2.on('postgres_changes', 
  { event: '*', schema: 'public', table: 'bookings' }, 
  (payload) => {
    console.log('GOT EVENT:', payload.eventType);
  }
);
ch2.subscribe(async (status, err) => {
  console.log('Bookings channel status:', status, err || '');
  
  if (status === 'SUBSCRIBED') {
    // Wait a bit then insert
    await new Promise(r => setTimeout(r, 1000));
    const { data, error } = await supabase.from('bookings').insert({
      vehicle_id: 'RT-TEST-2',
      test_type: '其他',
      shift: '白班',
      tester: '实时测试2',
      start_date: '2026-04-29',
      end_date: '2026-04-29'
    }).select().single();
    console.log('Insert result:', error ? error.message : data.id);
  }
});

setTimeout(async () => {
  await supabase.from('bookings').delete().eq('vehicle_id', 'RT-TEST-2');
  supabase.removeChannel(ch);
  supabase.removeChannel(ch2);
  process.exit(0);
}, 10000);
