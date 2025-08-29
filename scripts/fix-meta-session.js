#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Pattern pour trouver les lignes à remplacer
const patterns = [
  {
    old: `const sessionCookie = cookieStore.get('meta_session');`,
    new: `const metaTokenCookie = cookieStore.get('meta_access_token');`
  },
  {
    old: `if (!sessionCookie || !selectedAccountCookie) {`,
    new: `if (!metaTokenCookie || !selectedAccountCookie) {`
  },
  {
    old: `const session = JSON.parse(sessionCookie.value);`,
    new: `// Session data not needed anymore`
  },
  {
    old: `const accessToken = session.accessToken;`,
    new: `const accessToken = metaTokenCookie.value;`
  },
  {
    old: `const userId = session.userId;`,
    new: `// userId needs to be extracted from JWT token`
  }
];

// Trouver tous les fichiers route.js dans /app/api/aids
const files = glob.sync('app/api/aids/**/route.js', { 
  cwd: path.join(__dirname, '..'),
  absolute: true 
});

console.log(`Found ${files.length} route files to check`);

let filesModified = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;

  // Vérifier si le fichier contient meta_session
  if (content.includes('meta_session')) {
    console.log(`\nProcessing: ${path.relative(process.cwd(), file)}`);
    
    patterns.forEach(pattern => {
      if (content.includes(pattern.old)) {
        content = content.replace(new RegExp(pattern.old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), pattern.new);
        modified = true;
        console.log(`  - Replaced: ${pattern.old.substring(0, 50)}...`);
      }
    });

    if (modified) {
      fs.writeFileSync(file, content);
      filesModified++;
      console.log(`  ✓ File updated`);
    }
  }
});

console.log(`\n✅ Modified ${filesModified} files`);
console.log('\nNote: You may need to manually review and adjust:');
console.log('1. userId extraction from JWT tokens');
console.log('2. Any custom logic that used session data');
console.log('3. Import statements for JWT if needed');