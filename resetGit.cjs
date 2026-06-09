const { execSync } = require('child_process');
try {
  execSync('git checkout src/components/sepse/SepseConfigModal.tsx');
  console.log('Reset successful');
} catch (e) {
  console.error(e.toString());
}
