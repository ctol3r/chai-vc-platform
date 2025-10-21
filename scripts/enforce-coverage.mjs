import fs from 'fs';

const path = 'coverage/coverage-summary.json';
if (!fs.existsSync(path)) {
  console.error(`Coverage summary not found at ${path}`);
  process.exit(2);
}

const lines = fs.readFileSync(path, 'utf8');
let j;
try {
  j = JSON.parse(lines);
} catch (e) {
  console.error('Invalid coverage JSON');
  process.exit(2);
}

const pct = Number(j?.total?.statements?.pct ?? 0);
const min = parseInt(process.argv[2] || '80', 10);
console.log(`Statements coverage: ${pct}% (min ${min}%)`);
process.exit(pct < min ? 1 : 0);

