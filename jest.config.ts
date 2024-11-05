module.exports = {
  testEnvironment: 'node',
  preset: 'ts-jest',
  rootDir: './',
  modulePaths: ['<rootDir>'],
  testRegex: '.*\\.spec\\.ts$',
  moduleNameMapper: {
    '^src/(.+)$': '<rootDir>/src/$1',
  },
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/(coverage|dist|lib|tmp)/',
  ],
};
