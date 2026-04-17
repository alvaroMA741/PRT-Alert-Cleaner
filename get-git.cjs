const { execSync } = require('child_process');
try {
  console.log(execSync('git log -n 5 -p server.ts').toString());
} catch (e) {
  console.error(e.message);
}
