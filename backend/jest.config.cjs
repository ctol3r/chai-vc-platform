module.exports = {
  testPathIgnorePatterns: [
    "/node_modules/",
    "/__tests__/helpers/",
    "/test/helpers/__snapshots__/"
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  testEnvironment: 'node',
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(ts|tsx|js)$'
};
