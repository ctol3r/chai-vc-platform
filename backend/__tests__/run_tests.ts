import { testRevocationList2024I } from './revocation_list_2024I.test';

function main() {
  try {
    testRevocationList2024I();
    console.log('All tests passed.');
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
}

main();
