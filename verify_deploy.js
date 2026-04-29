// Wait 30s then check
setTimeout(async () => {
  try {
    const r = await fetch('https://haotian042491.github.io/vehicle-booking/');
    const t = await r.text();
    const m = t.match(/src="([^"]+\.js)"/);
    if (m) {
      console.log('JS file:', m[1]);
      const jr = await fetch('https://haotian042491.github.io/vehicle-booking' + m[1].replace(/^\./, ''));
      const js = await jr.text();
      if (js.includes('hhoqyjwbfszckhmgvpqb')) {
        console.log('OK: New Supabase key deployed successfully!');
      } else {
        console.log('STILL OLD: Supabase URL not found');
      }
    }
  } catch(e) { console.error(e); }
}, 30000);
