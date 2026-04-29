// Test if Supabase Realtime is enabled for the bookings table
// By checking the publication
const URL = 'https://hhoqyjwbfszckhmgvpqb.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhob3F5andiZnN6Y2tobWd2cHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczNzY3MDcsImV4cCI6MjA5Mjk1MjcwN30.xZJ0yUkrnnVeaP5Df2g1PfeD4jIIVBJxU5OR8ZCrXTE';

// Try to connect to realtime and subscribe
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(URL, KEY);

console.log('Connecting to realtime channel...');

const channel = supabase
  .channel('test-realtime')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, (payload) => {
    console.log('REALTIME EVENT:', payload.eventType, payload.new || payload.old);
  })
  .subscribe((status) => {
    console.log('Channel status:', status);
    if (status === 'SUBSCRIBED') {
      console.log('Successfully subscribed to realtime!');
    } else if (status === 'CHANNEL_ERROR') {
      console.log('Channel error - Realtime may not be enabled');
    } else if (status === 'TIMED_OUT') {
      console.log('Connection timed out');
    }
  });

// Wait 5 seconds to see the subscription result
setTimeout(() => {
  console.log('Removing channel and exiting...');
  supabase.removeChannel(channel);
  process.exit(0);
}, 5000);
