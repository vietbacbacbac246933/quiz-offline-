'use strict';
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const source = path.join(root, 'public');
const output = path.join(root, 'dist');
const files = ['teacher.html', 'quiz-core.js', 'mammoth.browser.min.js', 'xlsx.full.min.js'];
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
for (const file of files) {
  const from = path.join(source, file);
  if (!fs.existsSync(from)) throw new Error('Missing deploy asset: ' + file);
  const to = file === 'teacher.html' ? 'index.html' : file;
  fs.copyFileSync(from, path.join(output, to));
}
console.log('Static site built in dist/');
