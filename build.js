const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');
const compact = fs.readFileSync(path.join(__dirname, 'data/compact.json'), 'utf-8');
const allDonations = fs.readFileSync(path.join(__dirname, 'data/all-donations.json'), 'utf-8');

const output = html
  .replace('COMPACT_DATA_PLACEHOLDER', compact)
  .replace('ALL_DONATIONS_PLACEHOLDER', allDonations);

fs.writeFileSync(path.join(__dirname, 'index.html'), output);
console.log('Built! Size:', (Buffer.byteLength(output) / 1024).toFixed(0), 'KB');
