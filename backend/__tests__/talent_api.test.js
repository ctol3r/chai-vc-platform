const { resolvers, talents } = require('../src/graphql/talent_api');

test('filters by specialty', () => {
  const result = resolvers.Query.talents(null, { specialty: 'Cardiology' });
  expect(result.length).toBe(2);
  expect(result.every(t => t.specialty === 'Cardiology')).toBe(true);
});

test('filters by availability', () => {
  const result = resolvers.Query.talents(null, { availability: 'FRI' });
  expect(result.length).toBe(2);
  expect(result.every(t => t.availability.includes('FRI'))).toBe(true);
});

test('filters by radius', () => {
  const from = { lat: 37.7749, lon: -122.4194 };
  const result = resolvers.Query.talents(null, { radiusKm: 20, from });
  expect(result.length).toBe(2);
});
