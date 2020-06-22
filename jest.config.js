'use strict'

module.exports = {
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: ['./src/**/*.ts'],
  coverageReporters: ['json', 'lcov', 'text'],
  clearMocks: false,
  coverageThreshold: {
    global: {
      statements: 80,
      functions: 80,
      branches: 80,
      lines: 80,
    },
  },
  reporters: ['jest-junit', 'default'],
}
