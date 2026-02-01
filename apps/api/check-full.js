const fs = require('fs');
const path = require('path');

console.log('=== FULL BACKEND ARCHITECTURE CHECK ===\n');

// 1. Gateway Routes
console.log('📍 GATEWAY ROUTES:');
const gatewayPath = 'gateway/index.js';
if (fs.existsSync(gatewayPath)) {
  const content = fs.readFileSync(gatewayPath, 'utf8');
  const routes = content.match(/router\.use\(['"]\/[^'"]+['"]/g) || [];
  routes.forEach(r => console.log('  ✅ ' + r));
} else {
  console.log('  ❌ Gateway not found');
}

// 2. Src Routes
console.log('\n📂 SRC ROUTES:');
const srcRoutesDir = 'src/routes';
if (fs.existsSync(srcRoutesDir)) {
  const files = fs.readdirSync(srcRoutesDir).filter(f => f.endsWith('.js'));
  files.forEach(f => console.log('  ✅ ' + f));
} else {
  console.log('  ❌ src/routes not found');
}

// 3. i18n Check
console.log('\n🌍 i18n:');
const i18nCheck = [
  'middleware/i18n.js',
  'locales/en.json',
  'locales/tr.json'
];
i18nCheck.forEach(p => {
  console.log('  ' + (fs.existsSync(p) ? '✅' : '❌') + ' ' + p);
});

// 4. Middleware
console.log('\n🔧 MIDDLEWARE:');
const middlewareDir = 'middleware';
if (fs.existsSync(middlewareDir)) {
  const files = fs.readdirSync(middlewareDir).filter(f => f.endsWith('.js'));
  files.forEach(f => console.log('  ✅ ' + f));
}

// 5. Controllers/Services/Repositories (Legacy check)
console.log('\n⚠️  LEGACY STRUCTURE:');
['controllers', 'services', 'repositories'].forEach(dir => {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
    console.log('  ' + dir + ': ' + files.length + ' files (should be unused)');
  }
});

// 6. Main Entry Points
console.log('\n🚀 ENTRY POINTS:');
['index.js', 'src/index.js', 'src/server.js'].forEach(f => {
  console.log('  ' + (fs.existsSync(f) ? '✅' : '❌') + ' ' + f);
});

console.log('\n=== END CHECK ===');
