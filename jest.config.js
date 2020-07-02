'use strict'

const { pathsToModuleNameMapper } = require('ts-jest/utils');
const { compilerOptions } = require('./tsconfig');

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
      statements: 10,
      functions: 10,
      branches: 10,
      lines: 10,
    },
  },
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
  reporters: ['jest-junit', 'default'],
}
