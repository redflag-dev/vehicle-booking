fetch('https://haotian042491.github.io/vehicle-booking/assets/index-tJEFgEFx.js')
  .then(r => r.text())
  .then(js => {
    // Search for supabase related strings
    const patterns = ['supabase', 'hhoqyjwb', 'VITE_', 'isConfigured', 'localStorage', 'createClient', 'notice-bar'];
    patterns.forEach(p => {
      const idx = js.indexOf(p);
      if (idx >= 0) {
        console.log(`FOUND "${p}" at index ${idx}: ...${js.substring(Math.max(0, idx - 30), idx + 50)}...`);
      } else {
        console.log(`NOT FOUND: "${p}"`);
      }
    });
  })
  .catch(e => console.error(e));
