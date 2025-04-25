
let debounceTimeout;

function autoCommit() {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    const timestamp = new Date().toISOString();
    const commitMessage = `Auto-commit: Code updates at ${timestamp}`;
    
    const commitCommand = `git add . && git commit -m "${commitMessage}" && git push`;
    const exec = require('child_process').exec;
    
    exec(commitCommand, (error, stdout, stderr) => {
      if (error) console.error('Error:', error);
      if (stdout) console.log('Output:', stdout);
      if (stderr) console.error('Stderr:', stderr);
    });
  }, 5000); // Wait 5 seconds after last change before committing
}

// Watch for file changes
if (process.env.NODE_ENV !== 'production') {
  require('fs').watch('.', { recursive: true }, (eventType, filename) => {
    if (filename && !filename.startsWith('.git')) {
      autoCommit();
    }
  });
}
