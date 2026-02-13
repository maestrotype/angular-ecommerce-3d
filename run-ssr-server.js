const { spawn } = require('child_process');

console.log('🚀 Starting SSR server...\n');

// Launching simplified server (uses already compiled bundles)
const serverProcess = spawn('node', ['server-simple.mjs'], {
    stdio: 'inherit',
    cwd: process.cwd()
});

serverProcess.on('error', (err) => {
    console.error('❌ Server startup error:', err);
    process.exit(1);
});

serverProcess.on('exit', (code) => {
    if (code !== null && code !== 0) {
        console.error(`\n❌ Server exited with code ${code}`);
        process.exit(code);
    }
});

// Signal handling for graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Stopping server...');
    serverProcess.kill('SIGINT');
    process.exit(0);
});

process.on('SIGTERM', () => {
    serverProcess.kill('SIGTERM');
    process.exit(0);
});
