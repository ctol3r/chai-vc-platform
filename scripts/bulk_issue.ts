#!/usr/bin/env ts-node

// bulk_issue.ts - placeholder CLI script for generating test credential issue data for chai-vc-platform

interface Credential {
  id: number;
  name: string;
}

function generateCredentials(count: number): Credential[] {
  const creds: Credential[] = [];
  for (let i = 0; i < count; i++) {
    creds.push({
      id: i + 1,
      name: `Test Credential ${i + 1}`,
    });
  }
  return creds;
}

const arg = process.argv[2];
const count = arg ? parseInt(arg, 10) : 10;
const data = generateCredentials(count);
console.log(JSON.stringify(data, null, 2));

