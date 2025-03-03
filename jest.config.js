module.exports = {
  roots: ['<rootDir>/__tests__'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/src/renderer/src/$1',
    '^@components/(.*)$': '<rootDir>/src/renderer/src/components/$1',
    '^@hooks/(.*)$': '<rootDir>/src/renderer/src/hooks/$1',
    '^@services/(.*)$': '<rootDir>/src/renderer/src/lib/utilities/services/$1',
    '^@lib/(.*)$': '<rootDir>/src/renderer/src/lib/$1',
    '^@screens/(.*)$': '<rootDir>/src/renderer/src/screens/$1',
    // Handle static assets
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
    '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js'
  },
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
  testMatch: ['**/__tests__/**/*.test.js?(x)'],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  moduleFileExtensions: ['js', 'jsx', 'json'],
  testEnvironmentOptions: {
    url: 'http://localhost'
  }
};
