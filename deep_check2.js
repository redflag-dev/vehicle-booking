fetch('https://haotian042491.github.io/vehicle-booking/assets/index-tJEFgEFx.js')
  .then(r => r.text())
  .then(js => {
    // Find the supabase URL and key assignment
    const idx = js.indexOf('hhoqyjwb');
    const context = js.substring(idx - 100, idx + 300);
    console.log('Context around Supabase URL:\n', context);
    
    // Also search for the config check - what variable decides if supabase is used
    const configIdx = js.indexOf('Bv="https://hhoqyjwb');
    if (configIdx > 0) {
      const configContext = js.substring(configIdx - 50, configIdx + 200);
      console.log('\nConfig context:\n', configContext);
    }

    // Check if the key "Fv" is being used properly
    const keyIdx = js.indexOf('Fv="eyJhbGciOi');
    if (keyIdx > 0) {
      const keyContext = js.substring(keyIdx - 20, keyIdx + 200);
      console.log('\nKey context:\n', keyContext);
    }
  })
  .catch(e => console.error(e));
