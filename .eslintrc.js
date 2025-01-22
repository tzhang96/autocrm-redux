module.exports = {
  root: true,
  extends: [
    'next/core-web-vitals',
    'prettier',
    'plugin:@typescript-eslint/recommended'
  ],
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'react/display-name': 'off'
  },
  settings: {
    next: {
      rootDir: ['apps/*/', 'packages/*/']
    }
  },
  overrides: [
    {
      files: ['packages/**/*.ts'],
      rules: {
        'no-console': 'error'
      }
    }
  ]
} 