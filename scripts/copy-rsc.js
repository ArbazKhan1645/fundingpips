const fs = require('fs');
const path = require('path');

const outDir = path.resolve(__dirname, '..', 'out');
const enDir = path.join(outDir, 'en');

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

function copyRscFromLocale(localeDir, targetDir) {
  if (!fs.existsSync(localeDir)) return;

  for (const entry of fs.readdirSync(localeDir, { withFileTypes: true })) {
    const src = path.join(localeDir, entry.name);
    const dest = path.join(targetDir, entry.name);

    if (entry.isDirectory() && !entry.name.startsWith('__next')) {
      fs.mkdirSync(dest, { recursive: true });
      copyRscFromLocale(src, dest);
    } else if (entry.name.startsWith('__next')) {
      copyRecursive(src, dest);
      console.log(`Copied: ${dest.replace(outDir, '')}`);
    }
  }
}

copyRscFromLocale(enDir, outDir);
console.log('Done.');
