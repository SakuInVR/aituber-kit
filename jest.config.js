const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^canvas$': '<rootDir>/src/__mocks__/node-canvas.js',
    '^three/examples/jsm/(.*)$':
      '<rootDir>/src/__mocks__/three/examples/jsm/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  modulePathIgnorePatterns: [
    'node_modules/canvas',
    'node_modules/@ffmpeg-installer',
    'node_modules/fluent-ffmpeg',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(@pixiv/three-vrm|three/examples/jsm))',
  ],
  moduleDirectories: ['node_modules', '<rootDir>/src/__mocks__'],
  testPathIgnorePatterns: ['/node_modules/', '/\\.next/'],
  setupFiles: ['<rootDir>/jest.setup.canvas.js'],
}

module.exports = createJestConfig(customJestConfig)
