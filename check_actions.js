fetch('https://api.github.com/repos/haotian042491/vehicle-booking/actions/runs?per_page=3', {
  headers: { 'Accept': 'application/vnd.github+json' }
})
  .then(r => r.json())
  .then(data => {
    if (data.workflow_runs) {
      data.workflow_runs.forEach(run => {
        console.log(`${run.status} | ${run.conclusion || 'running'} | ${run.created_at} | ${run.head_commit.message}`);
      });
    } else {
      console.log(JSON.stringify(data).substring(0, 500));
    }
  })
  .catch(e => console.error(e));
