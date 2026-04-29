import { createClient } from '@supabase/supabase-js';

const URL = 'https://hhoqyjwbfszckhmgvpqb.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhob3F5andiZnN6Y2tobWd2cHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczNzY3MDcsImV4cCI6MjA5Mjk1MjcwN30.xZJ0yUkrnnVeaP5Df2g1PfeD4jIIVBJxU5OR8ZCrXTE';

const supabase = createClient(URL, KEY);

let receivedEvent = false;

const channel = supabase
  .channel('test-realtime-insert')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bookings' }, (payload) => {
    console.log('RECEIVED REALTIME INSERT:', JSON.stringify(payload.new).substring(0, 200));
    receivedEvent = true;
  })
  .subscribe(async (status) => {
    console.log('Status:', status);
    if (status === 'SUBSCRIBED') {
      console.log('Subscribed! Now inserting a test record...');
      
      // Insert via REST API
      const { data, error } = await supabase.from('bookings').insert({
        vehicle_id: 'REALTIME-TEST',
        test_type: '其他',
        shift: '白班',
        tester: '实时测试',
        start_date: '2026-04-29',
        end_date: '2026-04-29',
        notes: '自动测试-可删除'
      }).select().single();
      
      if (error) {
        console.log('Insert error:', error.message);
      } else {
        console.log('Inserted record:', data.id);
      }
    }
  });

// Wait for event or timeout
setTimeout(async () => {
  if (receivedEvent) {
    console.log('\nSUCCESS: Realtime is working!');
  } else {
    console.log('\nFAILED: Did not receive realtime event in 8 seconds');
    console.log('Realtime might not be enabled for the bookings table in Supabase Dashboard');
  }
  
  // Cleanup: delete test records
  await supabase.from('bookings').delete().eq('vehicle_id', 'REALTIME-TEST');
  supabase.removeChannel(channel);
  process.exit(0);
}, 8000);
