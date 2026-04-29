// Check the gh-pages branch index.html for the JS filename
fetch('https://haotian042491.github.io/vehicle-booking/')
  .then(r => r.text())
  .then(t => {
    console.log('HTML length:', t.length);
    const jsMatch = t.match(/src="([^"]+\.js)"/g);
    console.log('JS refs:', jsMatch);
    const cssMatch = t.match(/href="([^"]+\.css)"/g);
    console.log('CSS refs:', cssMatch);
    // Check if there's a notice-bar about Supabase not being configured
    if (t.includes('supabase') || t.includes('Supabase')) {
      console.log('HTML contains supabase reference');
    }
    console.log('HTML snippet:', t.substring(0, 1000));
  })
  .catch(e => console.error(e));
