#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating project setup...\n');

const checks = [
  // Root files
  { path: 'package.json', type: 'file', description: 'Root package.json' },
  { path: 'README.md', type: 'file', description: 'README documentation' },
  { path: 'docker-compose.yml', type: 'file', description: 'Docker Compose config' },
  
  // Backend files
  { path: 'backend/package.json', type: 'file', description: 'Backend package.json' },
  { path: 'backend/tsconfig.json', type: 'file', description: 'Backend TypeScript config' },
  { path: 'backend/jest.config.js', type: 'file', description: 'Backend Jest config' },
  { path: 'backend/.env.example', type: 'file', description: 'Backend env example' },
  { path: 'backend/src/index.ts', type: 'file', description: 'Backend entry point' },
  { path: 'backend/src/config/index.ts', type: 'file', description: 'Backend config' },
  { path: 'backend/src/config/database.ts', type: 'file', description: 'Database config' },
  { path: 'backend/src/config/redis.ts', type: 'file', description: 'Redis config' },
  
  // Backend directories
  { path: 'backend/src/models', type: 'dir', description: 'Models directory' },
  { path: 'backend/src/services', type: 'dir', description: 'Services directory' },
  { path: 'backend/src/middleware', type: 'dir', description: 'Middleware directory' },
  { path: 'backend/src/routes', type: 'dir', description: 'Routes directory' },
  { path: 'backend/src/db/migrations', type: 'dir', description: 'Migrations directory' },
  
  // Frontend files
  { path: 'frontend/package.json', type: 'file', description: 'Frontend package.json' },
  { path: 'frontend/tsconfig.json', type: 'file', description: 'Frontend TypeScript config' },
  { path: 'frontend/jest.config.js', type: 'file', description: 'Frontend Jest config' },
  { path: 'frontend/vite.config.ts', type: 'file', description: 'Vite config' },
  { path: 'frontend/tailwind.config.js', type: 'file', description: 'Tailwind config' },
  { path: 'frontend/.env.example', type: 'file', description: 'Frontend env example' },
  { path: 'frontend/index.html', type: 'file', description: 'HTML entry point' },
  { path: 'frontend/src/main.tsx', type: 'file', description: 'Frontend entry point' },
  { path: 'frontend/src/App.tsx', type: 'file', description: 'App component' },
  { path: 'frontend/src/store/index.ts', type: 'file', description: 'Redux store' },
  
  // Frontend directories
  { path: 'frontend/src/components', type: 'dir', description: 'Components directory' },
  { path: 'frontend/src/pages', type: 'dir', description: 'Pages directory' },
];

let passed = 0;
let failed = 0;

checks.forEach(check => {
  const fullPath = path.join(process.cwd(), check.path);
  let exists = false;
  
  try {
    const stats = fs.statSync(fullPath);
    if (check.type === 'file' && stats.isFile()) {
      exists = true;
    } else if (check.type === 'dir' && stats.isDirectory()) {
      exists = true;
    }
  } catch (err) {
    exists = false;
  }
  
  if (exists) {
    console.log(`✅ ${check.description}`);
    passed++;
  } else {
    console.log(`❌ ${check.description} (${check.path})`);
    failed++;
  }
});

console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

if (failed === 0) {
  console.log('✨ Project structure is valid!\n');
  console.log('Next steps:');
  console.log('1. Install dependencies: npm install');
  console.log('2. Set up environment files: cp backend/.env.example backend/.env');
  console.log('3. Start services: docker-compose up -d (or install PostgreSQL and Redis manually)');
  console.log('4. Start development: npm run dev\n');
  process.exit(0);
} else {
  console.log('⚠️  Some files or directories are missing. Please review the setup.\n');
  process.exit(1);
}
