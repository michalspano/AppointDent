module.exports = {
  "extends": "standard-with-typescript",
  "parserOptions": {
      "ecmaVersion": "latest",
      "sourceType": "module"
  },
  "ignorePatterns": ["*.js","*.json","*.md","*.d.ts"],
  "env": {
    "es2021": true,
    "node": true
  },
  "rules": {
    '@typescript-eslint/semi': ['error', 'always'],
    'no-var': 'error'
  }
};

