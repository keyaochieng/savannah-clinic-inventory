import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      // Turns off ESLint rules that would conflict with Prettier's formatting.
      // Must stay LAST in this list so it can override the sets above.
      prettier,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // Warn (not error) on stray console statements: allowed while developing,
      // but flagged so they get cleaned up before a commit. Not build-blocking.
      'no-console': 'warn',
      // Base recommended already catches unused vars; this tunes it so an
      // intentionally-ignored argument prefixed with `_` is allowed.
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
]);