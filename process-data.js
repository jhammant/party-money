const fs = require('fs');
const path = require('path');

const csv = fs.readFileSync('/home/openclaw/.openclaw/workspace/shared/public/ec_donations.csv', 'utf-8');
const lines = csv.split('\n');
const header = lines[0].replace(/^\uFEFF/, '').split(',');

// Parse CSV properly handling quoted fields
function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current.trim());
  return fields;
}

const headerFields = parseCSVLine(lines[0].replace(/^\uFEFF/, ''));

const donations = [];
for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  const fields = parseCSVLine(line);
  const obj = {};
  headerFields.forEach((h, idx) => { obj[h] = fields[idx] || ''; });
  
  // Parse value
  const valStr = obj.Value.replace(/[£,]/g, '');
  const value = parseFloat(valStr);
  if (isNaN(value) || value <= 0) continue;
  
  // Parse date
  const dateParts = obj.AcceptedDate.split('/');
  let year = '';
  let date = obj.AcceptedDate;
  if (dateParts.length === 3) {
    year = dateParts[2];
    date = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
  }
  
  donations.push({
    party: obj.RegulatedEntityName,
    value: value,
    donor: obj.DonorName,
    donorStatus: obj.DonorStatus,
    date: date,
    year: parseInt(year) || 0,
    type: obj.DonationType,
    ref: obj.ECRef
  });
}

// Build aggregates
const partyMap = {};
const donorMap = {};
const yearSet = new Set();

donations.forEach(d => {
  // Party aggregates
  if (!partyMap[d.party]) partyMap[d.party] = { total: 0, count: 0, donors: {} };
  partyMap[d.party].total += d.value;
  partyMap[d.party].count++;
  if (!partyMap[d.party].donors[d.donor]) partyMap[d.party].donors[d.donor] = { total: 0, count: 0, status: d.donorStatus };
  partyMap[d.party].donors[d.donor].total += d.value;
  partyMap[d.party].donors[d.donor].count++;
  
  // Donor aggregates
  if (!donorMap[d.donor]) donorMap[d.donor] = { total: 0, count: 0, status: d.donorStatus, parties: {} };
  donorMap[d.donor].total += d.value;
  donorMap[d.donor].count++;
  if (!donorMap[d.donor].parties[d.party]) donorMap[d.donor].parties[d.party] = 0;
  donorMap[d.donor].parties[d.party] += d.value;
  
  if (d.year) yearSet.add(d.year);
});

// Sort parties by total
const parties = Object.entries(partyMap)
  .map(([name, data]) => ({
    name,
    total: Math.round(data.total * 100) / 100,
    count: data.count,
    donors: Object.entries(data.donors)
      .map(([dname, ddata]) => ({
        name: dname,
        total: Math.round(ddata.total * 100) / 100,
        count: ddata.count,
        status: ddata.status
      }))
      .sort((a, b) => b.total - a.total)
  }))
  .sort((a, b) => b.total - a.total);

// Top donors
const topDonors = Object.entries(donorMap)
  .map(([name, data]) => ({
    name,
    total: Math.round(data.total * 100) / 100,
    count: data.count,
    status: data.status,
    parties: data.parties
  }))
  .sort((a, b) => b.total - a.total)
  .slice(0, 100);

const years = Array.from(yearSet).sort();
const totalValue = Math.round(donations.reduce((s, d) => s + d.value, 0) * 100) / 100;

const output = {
  totalValue,
  totalDonations: donations.length,
  totalDonors: Object.keys(donorMap).length,
  years,
  parties,
  topDonors,
  donations: donations.map(d => ({
    p: d.party,
    v: d.value,
    d: d.donor,
    s: d.donorStatus,
    dt: d.date,
    y: d.year,
    t: d.type
  }))
};

// Print stats
console.log(`Total donations: ${donations.length}`);
console.log(`Total value: £${(totalValue/1e6).toFixed(1)}M`);
console.log(`Total donors: ${Object.keys(donorMap).length}`);
console.log(`Years: ${years.join(', ')}`);
console.log('\nTop 10 parties:');
parties.slice(0, 10).forEach(p => {
  console.log(`  ${p.name}: £${(p.total/1e6).toFixed(1)}M (${p.count} donations, ${p.donors.length} donors)`);
});
console.log('\nTop 10 donors:');
topDonors.slice(0, 10).forEach(d => {
  console.log(`  ${d.name}: £${(d.total/1e6).toFixed(1)}M (${d.count} donations) [${d.status}]`);
  Object.entries(d.parties).forEach(([p, v]) => {
    console.log(`    → ${p}: £${(v/1e6).toFixed(2)}M`);
  });
});

fs.writeFileSync(path.join(__dirname, 'data/donations.json'), JSON.stringify(output));
console.log('\nWrote data/donations.json');
console.log(`JSON size: ${(fs.statSync(path.join(__dirname, 'data/donations.json')).size / 1024 / 1024).toFixed(1)}MB`);
