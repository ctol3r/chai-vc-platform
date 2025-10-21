module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(nanoid)/)'
  ],
  moduleNameMapper: {
    '^nanoid$': 'nanoid/non-secure'
  }
};
