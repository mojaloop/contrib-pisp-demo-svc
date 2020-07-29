'use strict'

const { pathsToModuleNameMapper } = require('ts-jest/utils')
const { compilerOptions } = require('./tsconfig')

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
      statements: 50,
      functions: 50,
      branches: 50,
      lines: 50,
    },
  },
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),
  reporters: ['jest-junit', 'default'],
}
