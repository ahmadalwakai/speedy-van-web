module.exports = {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    moduleNameMapper: {
      '^@/(.+)$': '<rootDir>/$1',
    },
    transform: {
      '^.+\\.(tsx|ts|jsx|js)$': 'babel-jest',
    },
  };