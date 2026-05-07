
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function countLines() {
  let files;
  try {
    files = execSync('git ls-files', { encoding: 'utf-8' }).split('\n').filter(Boolean);
  } catch (e) {
    console.error('Error running git:', e);
    return;
  }

  const extensions = {
    '.py': 'Python',
    '.ts': 'TypeScript',
    '.tsx': 'TypeScript (React)',
    '.js': 'JavaScript',
    '.jsx': 'JavaScript (React)',
    '.css': 'CSS',
    '.less': 'Less',
    '.html': 'HTML',
    '.md': 'Markdown',
    '.yml': 'YAML',
    '.yaml': 'YAML',
    '.sql': 'SQL',
    '.json': 'JSON'
  };

  const stats = {};
  Object.values(extensions).forEach(lang => {
    stats[lang] = { files: 0, lines: 0 };
  });
  stats['Other'] = { files: 0, lines: 0 };

  let totalLines = 0;
  let totalFiles = 0;

  files.forEach(f => {
    if (!fs.existsSync(f)) return;
    try {
      if (fs.lstatSync(f).isDirectory()) return;
    } catch (e) { return; }
    
    if (f.includes('node_modules')) return;

    const ext = path.extname(f);
    const lang = extensions[ext] || 'Other';

    try {
      // Using readFileSync with encoding might fail for binary files, so we handle it
      const content = fs.readFileSync(f, 'utf-8');
      const lines = content.split('\n').length;
      stats[lang].lines += lines;
      stats[lang].files += 1;
      totalLines += lines;
      totalFiles += 1;
    } catch (e) {
      // Probably a binary file or too large, skip
    }
  });

  console.log(`${'Language'.padEnd(25)} | ${'Files'.padEnd(10)} | ${'Lines'.padEnd(10)}`);
  console.log('-'.repeat(50));
  Object.entries(stats)
    .sort((a, b) => b[1].lines - a[1].lines)
    .forEach(([lang, data]) => {
      if (data.lines > 0) {
        console.log(`${lang.padEnd(25)} | ${String(data.files).padEnd(10)} | ${String(data.lines).padEnd(10)}`);
      }
    });

  console.log('-'.repeat(50));
  console.log(`${'Total'.padEnd(25)} | ${String(totalFiles).padEnd(10)} | ${String(totalLines).padEnd(10)}`);
}

countLines();
