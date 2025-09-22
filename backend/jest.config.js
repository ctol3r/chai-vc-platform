module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^\.\./blockchain/blockchain_integration$': '<rootDir>/src/blockchain/blockchain_integration.ts',
  },
};
