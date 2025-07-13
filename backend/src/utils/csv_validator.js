function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines.shift().split(',').map(h => h.trim());
  return lines.filter(l => l.trim()).map(line => {
    const values = line.split(',').map(v => v.trim());
    const record = {};
    headers.forEach((h, i) => { record[h] = values[i]; });
    return record;
  });
}

function validateRecord(record) {
  const required = ['id', 'name', 'issueDate', 'type'];
  for (const field of required) {
    if (!record[field]) {
      throw new Error(`Missing field ${field}`);
    }
  }
  if (isNaN(Date.parse(record.issueDate))) {
    throw new Error('Invalid issueDate');
  }
}

module.exports = { parseCSV, validateRecord };
