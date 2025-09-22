module.exports = {
  testPathIgnorePatterns: ['__tests__/token_priority_queue.test.js','__tests__/key_rotation_policy.test.js'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: __dirname,
  moduleFileExtensions: ['ts','tsx','js','jsx','json','node'],
  moduleNameMapper: {
    '^node:test$': '<rootDir>/__mocks__/node_test.js',
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
    '^.+\\.jsx?$': ['babel-jest']
  },
  setupFiles: ['<rootDir>/jest.setup.js'],
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)', '**/__tests__/**/*.spec.[jt]s?(x)'],
  transformIgnorePatterns: ['/node_modules/']
};
