fetch('https://haotian042491.github.io/vehicle-booking/')
  .then(r => r.text())
  .then(t => {
    const m = t.match(/src="([^"]+\.js)"/);
    if (m) {
      console.log('JS file:', m[1]);
      return fetch('https://haotian042491.github.io/vehicle-booking' + m[1].replace(/^\./, ''));
    }
    console.log('no js found, html:', t.substring(0, 500));
    return null;
  })
  .then(r => r ? r.text() : '')
  .then(js => {
    if (js.includes('hhoqyjwbfszckhmgvpqb')) {
      console.log('OK: Supabase URL found in deployed JS');
    } else if (js) {
      console.log('PROBLEM: Supabase URL NOT found in deployed JS');
      // check for old ref
      const oldMatch = js.match(/supabase\.co[^"]*/);
      console.log('Found supabase ref:', oldMatch ? oldMatch[0] : 'none');
    }
  })
  .catch(e => console.error(e));
