module.exports ={
    verbose: true,
    moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
    preset:  "solid-jest/preset/browser",
    testEnvironment: 'jsdom',
    transform: {
      "^.+\\.[t|j]sx?$": "babel-jest",
    },
  }